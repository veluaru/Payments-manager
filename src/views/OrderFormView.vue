<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = route.params.id
const isEditView = computed(() => !!orderId)

// Estados del componente
// NUEVO: Si es creación, se asigna automáticamente la fecha actual (new Date()) de forma nativa
const form = ref({
  provider: '',
  amount: null,
  concept: '',
  createdAt: isEditView.value ? null : new Date(),
  status: 'BORRADOR'
})

const errors = ref({ provider: '', amount: '', concept: '' })

// Errores de API debajo de los botones
const submitError = ref('')
const transitionError = ref('')

const showConfirm = ref(false)
const pendingStatus = ref('')

const statusOptions = [
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Aprobada', value: 'APROBADA' },
  { label: 'Rechazada', value: 'RECHAZADA' },
  { label: 'Pagada', value: 'PAGADA' }
]

const isInvalid = computed(() => !!(errors.value.provider || errors.value.amount || errors.value.concept))

const allowedTransitions = computed(() => {
  if (!isEditView.value || !orderStore.currentOrder) return []
  const current = orderStore.currentOrder.status
  if (current === 'BORRADOR') return ['APROBADA', 'RECHAZADA']
  if (current === 'APROBADA') return ['PAGADA']
  return []
})

const goBack = () => router.push({ name: 'orders-list' })

onMounted(async () => {
  if (isEditView.value) {
    const success = await orderStore.getOrderById(orderId)
    if (success && orderStore.currentOrder) {
      form.value = {
        ...orderStore.currentOrder,
        createdAt: orderStore.currentOrder.createdAt ? new Date(orderStore.currentOrder.createdAt) : null
      }
    }
  }
})

const validate = () => {
  errors.value.provider = !form.value.provider?.trim() ? 'El proveedor es obligatorio.' : ''
  errors.value.amount = !form.value.amount || Number(form.value.amount) <= 0 ? 'El monto debe ser mayor a cero.' : ''
  errors.value.concept = !form.value.concept?.trim() ? 'El concepto es obligatorio.' : form.value.concept.length > 250 ? 'Máximo 250 caracteres.' : ''

  return !errors.value.provider && !errors.value.amount && !errors.value.concept
}

// Guardar o Editar Orden
const handleSubmit = async () => {
  if (!validate()) return
  submitError.value = ''
  transitionError.value = ''

  // Formatea la fecha siempre a ISO String (ya viene llena por defecto)
  const formattedCreatedAt = form.value.createdAt instanceof Date
    ? form.value.createdAt.toISOString()
    : new Date().toISOString()

  const payload = {
    ...form.value,
    provider: form.value.provider.trim(),
    concept: form.value.concept.trim(),
    amount: Number(form.value.amount),
    createdAt: formattedCreatedAt
  }

  const success = isEditView.value
    ? await orderStore.updateOrder(orderId, payload)
    : await orderStore.createOrder({ ...payload, id: `ORD-${Math.floor(100000 + Math.random() * 900000)}` })

  if (success) {
    goBack()
  } else {
    submitError.value = orderStore.error || 'No se pudo guardar la orden financiera.'
  }
}

// Confirmar y aplicar cambio de estado
const confirmTransition = (status) => {
  pendingStatus.value = status
  showConfirm.value = true
}

const executeTransition = async () => {
  showConfirm.value = false
  submitError.value = ''
  transitionError.value = ''

  const success = await orderStore.updateOrder(orderId, { status: pendingStatus.value })

  if (success) {
    form.value.status = pendingStatus.value
  } else {
    transitionError.value = `No se pudo cambiar el estado a ${pendingStatus.value}.`
  }
}
</script>

<template>
  <div class="p-container m-4" style="max-width: 650px; margin: 0 auto;">

    <div class="mb-4">
      <Button label="Volver al Listado" icon="pi pi-arrow-left" class="p-button-text" @click="goBack" />
    </div>

    <Card>
      <template #title>
        <span class="text-xl font-bold">{{ isEditView ? `Orden: ${orderId}` : 'Crear Nueva Orden' }}</span>
      </template>

      <template #content>
        <div class="p-fluid">

          <div class="field mb-4">
            <label for="provider" class="font-bold block mb-2">Proveedor</label>
            <InputText id="provider" v-model="form.provider" :class="{ 'p-invalid': errors.provider }"
              @input="errors.provider = ''" />
            <small class="p-error block mt-1" v-if="errors.provider">{{ errors.provider }}</small>
          </div>

          <div class="field mb-4">
            <label for="amount" class="font-bold block mb-2">Monto (COP)</label>
            <InputNumber id="amount" v-model="form.amount" mode="currency" currency="COP" locale="es-CO"
              :class="{ 'p-invalid': errors.amount }" @input="errors.amount = ''" />
            <small class="p-error block mt-1" v-if="errors.amount">{{ errors.amount }}</small>
          </div>

          <div class="field mb-4">
            <div class="flex justify-content-between mb-2">
              <label for="concept" class="font-bold">Concepto</label>
              <span class="text-sm text-500">{{ form.concept?.length || 0 }}/250</span>
            </div>
            <Textarea id="concept" v-model="form.concept" rows="3" maxlength="250"
              :class="{ 'p-invalid': errors.concept }" @input="errors.concept = ''" />
            <small class="p-error block mt-1" v-if="errors.concept">{{ errors.concept }}</small>
          </div>

          <div class="field mb-4">
            <label for="createdAt" class="font-bold block mb-2">Fecha de Creación</label>
            <Calendar id="createdAt" v-model="form.createdAt" dateFormat="yy-mm-dd" showIcon disabled />
          </div>

          <template v-if="!isEditView">
            <div class="field mb-5">
              <label for="status" class="font-bold block mb-2">Estado Inicial</label>
              <Dropdown id="status" v-model="form.status" :options="statusOptions" optionLabel="label"
                optionValue="value" />
            </div>
          </template>

          <div v-if="isEditView && allowedTransitions.length > 0"
            class="field mb-5 p-3 bg-gray-50 border-round border-1 border-200">
            <span class="font-bold block mb-3 text-700 text-sm">Cambiar Estado de la Orden:</span>
            <div class="flex gap-3">
              <Button v-if="allowedTransitions.includes('APROBADA')" label="Aprobar" icon="pi pi-check"
                class="p-button-success p-button-sm flex-1" :loading="orderStore.loading"
                @click="confirmTransition('APROBADA')" />
              <Button v-if="allowedTransitions.includes('RECHAZADA')" label="Rechazar" icon="pi pi-ban"
                class="p-button-danger p-button-sm flex-1" :loading="orderStore.loading"
                @click="confirmTransition('RECHAZADA')" />
              <Button v-if="allowedTransitions.includes('PAGADA')" label="Pagar" icon="pi pi-wallet"
                class="p-button-info p-button-sm flex-1" :loading="orderStore.loading"
                @click="confirmTransition('PAGADA')" />
            </div>
          </div>

          <div>
            <div class="flex justify-content-end gap-3 border-top-1 border-200 pt-4">
              <Button label="Cancelar" class="p-button-outlined p-button-secondary" @click="goBack"
                :disabled="orderStore.loading" />
              <Button :label="isEditView ? 'Guardar Cambios' : 'Crear Orden'" class="p-button-primary"
                :loading="orderStore.loading" :disabled="isInvalid" @click="handleSubmit" />
            </div>

            <div v-if="submitError" class="p-error mt-3 text-right font-medium text-sm">
              <i class="pi pi-exclamation-triangle mr-2"></i>{{ submitError }}
            </div>

            <div v-if="transitionError" class="p-error mt-3 text-right font-medium text-sm">
              <i class="pi pi-exclamation-triangle mr-2"></i>{{ transitionError }}
            </div>
          </div>

        </div>
      </template>
    </Card>

    <Dialog v-model:visible="showConfirm" modal header="¿Confirmar acción?" :style="{ width: '400px' }">
      <p class="m-0 font-medium text-800">¿Está seguro de cambiar el estado de la orden a <b>{{ pendingStatus }}</b>?
      </p>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text p-button-secondary"
          @click="showConfirm = false" />
        <Button label="Confirmar" icon="pi pi-check" class="p-button-warning" @click="executeTransition"
          :loading="orderStore.loading" autoFocus />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.state-box {
  text-align: center;
  padding: 3rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  max-width: 650px;
  margin: 0 auto;
}

.style-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-box {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.success-box {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
</style>