<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import OrderFilters from '@/views/OrderFilters.vue'

const orderStore = useOrderStore()

const currentPage = ref(1)
const rowsPerPage = ref(5)
const listFirstIndex = computed((() => (currentPage.value - 1) * rowsPerPage.value))
const activeFilters = ref({ provider: null, status: null })

const loadServerData = () => {
  const apiParams = {
    // JSON Server API keys for pagination
    _page: currentPage.value,
    _per_page: rowsPerPage.value
  }
  // Check if there are active filters
  if (activeFilters.value.provider) {
    apiParams.provider = activeFilters.value.provider
  }
  if (activeFilters.value.status) {
    apiParams.status = activeFilters.value.status
  }
  orderStore.getOrders(apiParams)
}

const handlePageChange = (event) => {
  currentPage.value = event.page + 1
  rowsPerPage.value = event.rows
  loadServerData()
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleFilterChange = (incomingFilters) => {
  activeFilters.value = incomingFilters
  // Reset the pagination when filtering
  currentPage.value = 1
  loadServerData()
}

onMounted(() => {
  loadServerData()
})

</script>

<template>
  <div class="orders-container">
    <header class="view-header">
      <div>
        <h1 class="view-title">Gestión de Pagos</h1>
        <p class="view-subtitle">Listado sincronizado desde el servidor (API).</p>
      </div>
    </header>
    <OrderFilters @filter="handleFilterChange" />
    <main class="content-area">
      <div v-if="orderStore.loading" class="state-box">
        <ProgressSpinner style="width:40px; height:40px" />
        <p>Cargando información...</p>
      </div>

      <div v-else-if="orderStore.error" class="state-box error-box">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #ef4444" />
        <p>{{ orderStore.error }}</p>
        <Button label="Reintentar" icon="pi pi-refresh" class="p-button-sm mt-2" @click="loadServerData" />
      </div>

      <div v-else>
        <div class="desktop-view">
          <DataTable :value="orderStore.orders" class="p-datatable-striped shadow-sm">
            <template #empty>
              <div class="empty-state-message">
                <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8; margin-bottom: 0.5rem;"></i>
                <p>No se encontraron órdenes de pago.</p>
              </div>
            </template>
            <Column field="id" header="ID Único" headerStyle="width: 15%"></Column>
            <Column field="provider" header="Proveedor" headerStyle="width: 35%"></Column>
            <Column field="amount" header="Monto (COP)">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.amount) }}
              </template>
            </Column>
            <Column field="createdAt" header="Fecha de Creación">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.createdAt) }}
              </template>
            </Column>
            <Column field="status" header="Estado"></Column>
          </DataTable>
        </div>

        <div class="mobile-view">
          <div v-if="orderStore.orders.length === 0" class="empty-state-message">
            <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8; margin-bottom: 0.5rem;"></i>
            <p>No se encontraron órdenes de pago.</p>
          </div>

          <div v-else class="cards-grid">
            <div v-for="order in orderStore.orders" :key="order.id" class="order-card shadow-sm">
              <div class="card-header">
                <span class="order-id">{{ order.id }}</span>
                <span class="order-status">{{ order.status }}</span>
              </div>
              <div class="card-body">
                <h3 class="order-provider">{{ order.provider }}</h3>
                <p class="order-amount">{{ formatCurrency(order.amount) }}</p>
              </div>
              <div class="card-footer">
                <span class="order-date">Creado: {{ formatDate(order.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="orderStore.totalOrders > 0" class="paginator-container shadow-sm mt-3">
          <Paginator v-model:first="listFirstIndex" :rows="rowsPerPage" :totalRecords="orderStore.totalOrders"
            @page="handlePageChange" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.view-header {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 1.75rem;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.view-subtitle {
  color: #64748b;
  margin: 0;
}

.state-box {
  text-align: center;
  padding: 3rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
}

.error-box {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.paginator-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.mt-3 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

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

/* --- MAIN RESPONSIVITY CONTROL --- */
.mobile-view {
  display: none;
  /* --- Hidden by default on large screens --- */
}

.desktop-view {
  display: block;
}

@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }
}

/* --- STYLES FOR THE CARDS (MOBILE) --- */
.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
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
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.order-provider {
  font-size: 1.1rem;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.order-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
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
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
</style>