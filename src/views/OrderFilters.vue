<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filter'])
const provider = ref('')
const status = ref(null)

const statusOptions = [
  { label: 'Todos los estados', value: null },
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Aprobada', value: 'APROBADA' },
  { label: 'Rechazada', value: 'RECHAZADA' },
  { label: 'Pagada', value: 'PAGADA' }
]

const applyFilters = () => {
  emit('filter', {
    provider: provider.value.trim() || null,
    status: status.value
  })
}

const clearFilters = () => {
  provider.value = ''
  status.value = null
  emit('filter', { provider: null, status: null })
}
</script>

<template>
  <div class="filters-card shadow-sm">
    <div class="filters-grid">
      <div class="filter-field">
        <label for="provider-search" class="filter-label">Buscar Proveedor</label>
        <InputText id="provider-search" v-model="provider" placeholder="Escribe el nombre..."
          class="w-full p-inputtext-sm" @keyup.enter="applyFilters" />
      </div>

      <div class="filter-field">
        <label for="status-select" class="filter-label">Estado</label>
        <Dropdown id="status-select" v-model="status" :options="statusOptions" optionLabel="label" optionValue="value"
          placeholder="Selecciona un estado" class="w-full p-dropdown-sm" />
      </div>

      <div class="filter-actions">
        <Button label="Filtrar" icon="pi pi-filter" class="p-button-sm p-button-primary" @click="applyFilters" />
        <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-secondary p-button-outlined"
          @click="clearFilters" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-field {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.w-full {
  width: 100%;
}

@media (max-width: 640px) {
  .filter-field {
    flex: auto;
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>