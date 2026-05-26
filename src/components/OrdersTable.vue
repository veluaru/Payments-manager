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
        <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8; margin-bottom: 0.5rem;"></i>
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
  color: #64748b;
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
  background: #e2e8f0;
  color: #475569;
}

.status-borrador {
  background: #e5e7eb;
  color: #374151;
}

.status-aprobada {
  background: #fef08a;
  color: #854d0e;
}

.status-rechazada {
  background: #fecaca;
  color: #991b1b;
}

.status-pagada {
  background: #bbf7d0;
  color: #166534;
}

.status-default {
  background: #e2e8f0;
  color: #475569;
}
</style>
