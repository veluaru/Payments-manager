<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const orderId = route.params.id
const isEditView = computed(() => !!orderId)
const form = ref({
  provider: '',
  amount: null,
  concept: '',
  createdAt: isEditView.value ? null : new Date(),
  status: 'BORRADOR'
})
const errors = ref({ provider: '', amount: '', concept: '' })

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

const validate = () => {
  errors.value.provider = !form.value.provider?.trim() ? 'El proveedor es obligatorio.' : ''
  errors.value.amount = !form.value.amount || Number(form.value.amount) <= 0 ? 'El monto debe ser mayor a cero.' : ''
  errors.value.concept = !form.value.concept?.trim() ? 'El concepto es obligatorio.' : form.value.concept.length > 250 ? 'Máximo 250 caracteres.' : ''

  return !errors.value.provider && !errors.value.amount && !errors.value.concept
}

const handleSubmit = async () => {
  // Validate form
  if (!validate()) return
  submitError.value = ''
  transitionError.value = ''

  // Format createdAt to ISO String
  const formattedCreatedAt = form.value.createdAt instanceof Date
    ? form.value.createdAt.toISOString()
    : new Date().toISOString()

  // Create payload
  const payload = {
    ...form.value,
    provider: form.value.provider.trim(),
    concept: form.value.concept.trim(),
    amount: Number(form.value.amount),
    createdAt: formattedCreatedAt
  }

  // Update or create order
  const success = isEditView.value
    ? await orderStore.updateOrder(orderId, payload)
    : await orderStore.createOrder({ ...payload, id: `ORD-${Math.floor(100000 + Math.random() * 900000)}` })

  if (success) {
    goBack()
  } else {
    submitError.value = orderStore.error || 'No se pudo guardar la orden financiera.'
  }
}

const confirmTransition = (status) => {
  pendingStatus.value = status
  showConfirm.value = true
}

const executeTransition = async () => {
  // Reset error messages
  showConfirm.value = false
  submitError.value = ''
  transitionError.value = ''

  // Update order status
  const success = await orderStore.updateOrder(orderId, { status: pendingStatus.value })

  if (success) {
    form.value.status = pendingStatus.value
  } else {
    transitionError.value = `No se pudo cambiar el estado a ${pendingStatus.value}.`
  }
}

const handleFormShortcuts = (event) => {
  // Escape key to close confirm dialog
  if (event.key === 'Escape' && showConfirm.value) {
    showConfirm.value = false
    return
  }

  // Ctrl + S to submit form
  const hasModifierKey = event.ctrlKey || event.metaKey
  if (hasModifierKey && event.key.toLowerCase() === 's') {
    event.preventDefault()
    if (!showConfirm.value && !orderStore.loading) {
      handleSubmit()
    }
    return
  }

  // Enter key to submit form
  if (event.key === 'Enter' && !showConfirm.value && !orderStore.loading) {
    const tagName = event.target?.tagName?.toLowerCase()
    if (tagName === 'input' || tagName === 'select') {
      event.preventDefault()
      handleSubmit()
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleFormShortcuts)
  if (isEditView.value) {
    // Get order by id when editing
    const success = await orderStore.getOrderById(orderId)
    if (success && orderStore.currentOrder) {
      form.value = {
        ...orderStore.currentOrder,
        createdAt: orderStore.currentOrder.createdAt ? new Date(orderStore.currentOrder.createdAt) : null
      }
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleFormShortcuts)
})
</script>

<template>
  <div class="form-page">
    <div class="form-header-actions">
      <Button label="Volver al Listado" icon="pi pi-arrow-left" class="p-button-text" @click="goBack" />
    </div>

    <Card class="form-card">
      <template #title>
        <div class="form-title-wrap">
          <h1 class="form-title">{{ isEditView ? `Orden: ${orderId}` : 'Crear Nueva Orden' }}</h1>
          <p class="form-subtitle">
            {{ isEditView ?
              'Actualiza la información de la orden.' :
              'Completa la información para crear una nueva orden.' }}
          </p>
        </div>
      </template>

      <template #content>
        <!-- Loading box -->
        <div v-if="isEditView && orderStore.loading" class="form-loading-box">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" animationDuration=".5s" />
          <p class="loading-text">Loading order data...</p>
        </div>
        <!-- Form content -->
        <div v-else class="form-content">
          <!-- Form fields -->
          <div class="form-field">
            <label for="provider" class="form-label">Proveedor</label>
            <InputText id="provider" v-model="form.provider" :class="{ 'p-invalid': errors.provider }"
              @input="errors.provider = ''" />
            <small class="p-error block mt-1" v-if="errors.provider">{{ errors.provider }}</small>
          </div>

          <div class="form-field">
            <label for="amount" class="form-label">Monto (COP)</label>
            <InputNumber id="amount" v-model="form.amount" mode="currency" currency="COP" locale="es-CO"
              :class="{ 'p-invalid': errors.amount }" @input="errors.amount = ''" />
            <small class="p-error block mt-1" v-if="errors.amount">{{ errors.amount }}</small>
          </div>

          <div class="form-field">
            <div class="form-field-header">
              <label for="concept" class="form-label">Concepto</label>
              <span class="input-counter">{{ form.concept?.length || 0 }}/250</span>
            </div>
            <Textarea id="concept" v-model="form.concept" rows="3" maxlength="250"
              :class="{ 'p-invalid': errors.concept }" @input="errors.concept = ''" />
            <small class="p-error block mt-1" v-if="errors.concept">{{ errors.concept }}</small>
          </div>

          <div class="form-field">
            <label for="createdAt" class="form-label">Fecha de Creación</label>
            <Calendar id="createdAt" v-model="form.createdAt" dateFormat="yy-mm-dd" showIcon disabled />
          </div>

          <template v-if="!isEditView">
            <div class="form-field">
              <label for="status" class="form-label">Estado Inicial</label>
              <Dropdown id="status" v-model="form.status" :options="statusOptions" optionLabel="label"
                optionValue="value" />
            </div>
          </template>

          <div v-if="isEditView && allowedTransitions.length > 0" class="transition-panel">
            <span class="transition-title">Cambiar Estado de la Orden</span>
            <div class="transition-actions">
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

          <div class="form-actions-wrap">
            <div class="form-actions">
              <Button label="Cancelar" class="p-button-outlined p-button-secondary" @click="goBack"
                :disabled="orderStore.loading" />
              <Button :label="isEditView ? 'Guardar Cambios' : 'Crear Orden'" class="p-button-primary"
                :loading="orderStore.loading" :disabled="isInvalid" @click="handleSubmit" />
            </div>

            <!-- Error messages -->
            <div v-if="submitError" class="p-error form-error-message">
              <i class="pi pi-exclamation-triangle mr-2"></i>{{ submitError }}
            </div>

            <div v-if="transitionError" class="p-error form-error-message">
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
.form-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.form-header-actions {
  margin-bottom: 1rem;
}

.form-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.06);
}

.form-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-title {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.form-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #334155;
}

.form-field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.form-loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.loading-text {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 500;
}

.input-counter {
  font-size: 0.8rem;
  color: #64748b;
}

.transition-panel {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.transition-title {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.transition-actions {
  display: flex;
  gap: 0.75rem;
}

.form-actions-wrap {
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.form-error-message {
  margin-top: 0.75rem;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .form-page {
    padding: 1rem 0.75rem;
  }

  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .transition-actions {
    flex-direction: column;
  }
}

.form-page,
.form-content {
  animation: fadeInView 0.4s ease-out forwards;
}

@keyframes fadeInView {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>