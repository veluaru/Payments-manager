<script setup>
defineProps({
  orders: {
    type: Array,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getStatusClass: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['edit'])
</script>

<template>
  <DataTable :value="orders" class="p-datatable-striped shadow-sm">
    <template #empty>
      <div class="empty-state-message">
        <i class="pi pi-inbox empty-state-icon" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
        <p>No se encontraron órdenes de pago.</p>
      </div>
    </template>
    <Column field="id" header="ID Único" headerStyle="width: 10%"></Column>
    <Column field="provider" header="Proveedor" headerStyle="width: 22%"></Column>
    <Column field="amount" header="Monto (COP)" headerStyle="width: 16%">
      <template #body="slotProps">
        {{ formatCurrency(slotProps.data.amount) }}
      </template>
    </Column>
    <Column field="concept" header="Concepto" headerStyle="width: 27%"></Column>
    <Column field="createdAt" header="Fecha de Creación" headerStyle="width: 15%">
      <template #body="slotProps">
        {{ formatDate(slotProps.data.createdAt) }}
      </template>
    </Column>
    <Column field="status" header="Estado" headerStyle="width: 10%">
      <template #body="slotProps">
        <span class="status-badge" :class="getStatusClass(slotProps.data.status)">
          {{ slotProps.data.status }}
        </span>
      </template>
    </Column>
    <Column header="Acciones" headerStyle="width: 8%; text-align: center;" bodyStyle="text-align: center;">
      <template #body="slotProps">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm" @click="emit('edit', slotProps.data.id)" />
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.empty-state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.empty-state-icon {
  color: var(--color-text-soft);
}

.empty-state-message p {
  margin: 0;
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  background: var(--status-default-bg);
  color: var(--status-default-text);
}

.status-borrador {
  background: var(--status-draft-bg);
  color: var(--status-draft-text);
}

.status-aprobada {
  background: var(--status-approved-bg);
  color: var(--status-approved-text);
}

.status-rechazada {
  background: var(--status-rejected-bg);
  color: var(--status-rejected-text);
}

.status-pagada {
  background: var(--status-paid-bg);
  color: var(--status-paid-text);
}

.status-default {
  background: var(--status-default-bg);
  color: var(--status-default-text);
}
</style>
