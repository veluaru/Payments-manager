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
        <Button label="Filtrar" icon="pi pi-filter" class="p-button-sm p-button-primary filter-btn" @click="applyFilters" />
        <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-secondary p-button-outlined"
          @click="clearFilters" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.shadow-sm {
  box-shadow: var(--shadow-sm);
}

.filters-grid {
  display: flex;
  align-items: flex-end;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.filter-field {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.filter-actions {
  display: flex;
  gap: 0.625rem;
  margin-top: auto;
}

.w-full {
  width: 100%;
}

@media (max-width: 640px) {
  .filters-card {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .filter-field {
    flex: auto;
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    justify-content: stretch;
  }

  .filter-actions :deep(.p-button) {
    flex: 1;
  }
}
</style>