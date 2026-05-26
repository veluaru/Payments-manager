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

const emit = defineEmits(['select'])
</script>

<template>
  <div v-if="orders.length === 0" class="empty-state-message">
    <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8; margin-bottom: 0.5rem;"></i>
    <p>No se encontraron órdenes de pago.</p>
  </div>

  <div v-else class="cards-grid">
    <div v-for="order in orders" :key="order.id" class="order-card shadow-sm" @click="emit('select', order.id)">
      <div class="card-header">
        <span class="order-id">{{ order.id }}</span>
        <span class="order-status" :class="getStatusClass(order.status)">{{ order.status }}</span>
      </div>
      <div class="card-body">
        <h3 class="order-provider">{{ order.provider }}</h3>
        <p class="order-amount">{{ formatCurrency(order.amount) }}</p>
        <p class="order-concept">{{ order.concept }}</p>
      </div>
      <div class="card-footer">
        <span class="order-date">Creado: {{ formatDate(order.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.order-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}

.order-id {
  font-weight: bold;
  color: #64748b;
  font-size: 0.85rem;
}

.order-status {
  font-size: 0.75rem;
  font-weight: 600;
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.order-concept {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
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

.order-provider {
  font-size: 1rem;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.order-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.card-footer {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.8rem;
  color: #94a3b8;
}

.empty-state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #64748b;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
</style>
