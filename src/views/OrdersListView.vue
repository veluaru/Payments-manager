<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const currentPage = ref(1)
const rowsPerPage = ref(5)
const listFirstIndex = ref(0)
const activeFilters = ref({ provider: null, status: null })

const loadServerData = () => {
  const apiParams = {
    // JSON Server API keys for pagination
    _page: currentPage.value,
    _limit: rowsPerPage.value
  }
  // Check if there are active filters
  if (activeFilters.value.provider) {
    apiParams.provider_like = activeFilters.value.provider
  }
  if (activeFilters.value.status) {
    apiParams.status = activeFilters.value.status
  }
  // Update the URL query parameters
  router.replace({
    query: {
      page: currentPage.value,
      limit: rowsPerPage.value,
      provider: activeFilters.value.provider || undefined,
      status: activeFilters.value.status || undefined
    }
  })
  // Load the server data
  orderStore.getOrders(apiParams)
}

const handlePageChange = (event) => {
  listFirstIndex.value = event.first
  currentPage.value = event.page + 1
  rowsPerPage.value = event.rows
  loadServerData()
}

const handleFilterChange = (incomingFilters) => {
  activeFilters.value = incomingFilters
  // Reset the pagination when filtering
  currentPage.value = 1
  listFirstIndex.value = 0
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

const getStatusClass = (status) => {
  const statusClasses = {
    BORRADOR: 'status-borrador',
    APROBADA: 'status-aprobada',
    RECHAZADA: 'status-rechazada',
    PAGADA: 'status-pagada'
  }

  return statusClasses[status] || 'status-default'
}

const goToDetail = (id) => {
  router.push({ name: 'order-detail', params: { id } })
}

onMounted(() => {
  // Get the current page, limit, provider and status from the URL query parameters
  currentPage.value = Number(route.query.page) || 1
  rowsPerPage.value = Number(route.query.limit) || 5
  activeFilters.value = {
    provider: route.query.provider || '',
    status: route.query.status || ''
  }
  // Load the server data
  if (orderStore.orders.length === 0) {
    loadServerData()
  }
})

</script>

<template>
  <div class="orders-container">
    <header class="view-header">
      <div>
        <h1 class="view-title">Gestión de Pagos</h1>
        <p class="view-subtitle">Listado de órdenes de pagos a proveedores.</p>
      </div>
      <Button label="Nueva Orden" icon="pi pi-plus" class="p-button-success"
        @click="$router.push({ name: 'order-create' })" />
    </header>
    <OrderFilters @filter="handleFilterChange" />
    <main class="content-area">

      <!-- Loading handling -->
      <div v-if="orderStore.loading" class="state-box">
        <ProgressSpinner class="state-spinner" />
        <p>Cargando información...</p>
      </div>

      <!-- Error handling -->
      <div v-else-if="orderStore.error" class="state-box error-box">
        <i class="pi pi-exclamation-triangle state-icon-error" />
        <p>{{ orderStore.error }}</p>
        <Button label="Reintentar" icon="pi pi-refresh" class="p-button-sm mt-2" @click="loadServerData" />
      </div>

      <!-- Success handling -->
      <div v-else>
        <!-- Desktop view -->
        <div class="desktop-view">
          <OrdersTable :orders="orderStore.orders" :format-currency="formatCurrency" :format-date="formatDate"
            :get-status-class="getStatusClass" @edit="goToDetail" />
        </div>

        <!-- Mobile view -->
        <div class="mobile-view">
          <OrdersCards :orders="orderStore.orders" :format-currency="formatCurrency" :format-date="formatDate"
            :get-status-class="getStatusClass" @select="goToDetail" />
        </div>

        <!-- Paginator -->
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
  animation: fadeInView 0.35s ease-out forwards;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.view-title {
  font-size: 1.75rem;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.view-subtitle {
  color: var(--color-text-muted);
  margin: 0;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.state-box {
  text-align: center;
  padding: 3rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-muted);
}

.state-icon-error {
  color: var(--color-warning-text);
  font-size: 2rem;
}

.state-spinner {
  width: 40px;
  height: 40px;
}

.error-box {
  background: var(--color-error-bg);
  border-color: var(--color-error-border);
  color: var(--color-error-text);
}

.paginator-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.shadow-sm {
  box-shadow: var(--shadow-sm);
}

.mt-3 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
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

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.25rem;
  }

  .orders-container {
    padding: 1rem 0.75rem;
  }
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