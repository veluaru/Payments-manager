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
    <i class="pi pi-inbox empty-state-icon" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.order-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-soft);
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
}

.order-id {
  font-weight: bold;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.order-status {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--status-default-bg);
  color: var(--status-default-text);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.order-concept {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
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

.order-provider {
  font-size: 1rem;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.order-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.card-footer {
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-soft);
  font-size: 0.8rem;
  color: var(--color-text-soft);
}

.empty-state-icon {
  color: var(--color-text-soft);
}

.empty-state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
</style>
