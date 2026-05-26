import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// JSON Server API URL
const API_URL = 'http://localhost:3000/orders'

export const useOrderStore = defineStore('order', () => {
  // --- STATE ---
  const orders = ref([])
  const currentOrder = ref(null)
  const totalOrders = ref(0)
  const loading = ref(false)
  const error = ref(null) // Para errores globales de red/servidor

  // --- ACTIONS ---
  const getOrders = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(API_URL, { params })
      orders.value = response.data
      const totalFromHeader = response.headers['x-total-count']
      totalOrders.value = totalFromHeader ? parseInt(totalFromHeader, 10) : response.data.length
      return true
    } catch (err) {
      error.value = 'Error al comunicar con el servidor financiero.'
      console.error(err)
      return false
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
      return true
    } catch (err) {
      error.value = `No se pudo encontrar la orden con ID: ${id}`
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (newOrder) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(API_URL, newOrder)
      orders.value.unshift(response.data)
      totalOrders.value++
      return true // Estructura unificada de retorno
    } catch (err) {
      error.value = 'No se pudo registrar la orden. Por favor intente nuevamente.'
      console.error(err)
      return false // Estructura unificada de retorno
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (id, updates) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.patch(`${API_URL}/${id}`, updates)
      
      // Sincroniza el detalle si corresponde a la orden actual en memoria
      if (currentOrder.value && currentOrder.value.id === id) {
        currentOrder.value = { ...currentOrder.value, ...response.data }
      }
      
      // Sincroniza la lista global de órdenes
      const index = orders.value.findIndex(ordersItem => ordersItem.id === id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...response.data }
      }
      
      return true // Estructura unificada de retorno
    } catch (err) {
      error.value = 'Hubo un error al intentar actualizar la orden.'
      console.error(err)
      return false // Estructura unificada de retorno
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
      totalOrders.value--
      return true
    } catch (err) {
      error.value = 'No se pudo eliminar la orden seleccionada.'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }
  
  return { 
    orders, 
    currentOrder, 
    loading, 
    error, 
    getOrders, 
    getOrderById, 
    createOrder,
    updateOrder, 
    deleteOrder, 
    totalOrders 
  }
})