import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// JSON Server API URL
const API_URL = 'http://localhost:3000/orders'

export const useOrderStore = defineStore('order', () => {
  // --- STATE ---
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // --- ACTIONS ---
  const getOrders = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(API_URL)
      orders.value = response.data
    } catch (err) {
      error.value = 'Error al cargar las órdenes de pago. Por favor, reintenta.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const getOrderById = async (id) => {
    loading.value = true
    error.value = null
    currentOrder.value = null
    try {
      const response = await axios.get(`${API_URL}/${id}`)
      currentOrder.value = response.data
    } catch (err) {
      error.value = `No se pudo encontrar la orden con ID: ${id}`
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (id, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.patch(`${API_URL}/${id}`, updates)
      
      // Update current order state if it matches the active one
      if (currentOrder.value && currentOrder.value.id === id) {
        currentOrder.value = { ...currentOrder.value, ...response.data }
      }
      
      // Update the order within the general list
      const index = orders.value.findIndex(ordersItem => ordersItem.id === id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...response.data }
      }
      
      return response.data
    } catch (err) {
      error.value = 'Hubo un error al intentar actualizar la orden.'
      console.error(err)
      throw err 
    } finally {
      loading.value = false
    }
  }

  const deleteOrder = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${API_URL}/${id}`)
      orders.value = orders.value.filter(ordersItem => ordersItem.id !== id)
    } catch (err) {
      error.value = 'No se pudo eliminar la orden seleccionada.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addOrder = (newOrder) => {
    orders.value.unshift(newOrder)
  }
  
  return { orders, currentOrder, loading, error, getOrders, getOrderById, updateOrder, deleteOrder, addOrder }
})
