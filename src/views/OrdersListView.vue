<script setup>
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import OrderFilters from '@/views/OrderFilters.vue'
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
        <ProgressSpinner style="width:40px; height:40px" />
        <p>Cargando información...</p>
      </div>

      <!-- Error handling -->
      <div v-else-if="orderStore.error" class="state-box error-box">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #ef4444" />
        <p>{{ orderStore.error }}</p>
        <Button label="Reintentar" icon="pi pi-refresh" class="p-button-sm mt-2" @click="loadServerData" />
      </div>

      <!-- Success handling -->
      <div v-else>
        <!-- Desktop view -->
        <div class="desktop-view">
          <DataTable :value="orderStore.orders" class="p-datatable-striped shadow-sm">
            <!-- Empty state message -->
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
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm"
                  @click="goToDetail(slotProps.data.id)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Mobile view -->
        <div class="mobile-view">
          <!-- Empty state message -->
          <div v-if="orderStore.orders.length === 0" class="empty-state-message">
            <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8; margin-bottom: 0.5rem;"></i>
            <p>No se encontraron órdenes de pago.</p>
          </div>

          <div v-else class="cards-grid">
            <div v-for="order in orderStore.orders" :key="order.id" class="order-card shadow-sm"
              @click="goToDetail(order.id)">
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
  cursor: pointer;
}

.order-card:hover {
  transform: scale(1.01);
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