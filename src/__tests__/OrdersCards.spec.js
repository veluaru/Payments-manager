import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrdersCards from '../components/OrdersCards.vue'

const formatCurrency = vi.fn((value) => `COP ${value}`)
const formatDate = vi.fn((value) => `DATE ${value}`)
const getStatusClass = vi.fn((status) => `status-${status.toLowerCase()}`)

const mountView = (orders = []) => mount(OrdersCards, {
  props: {
    orders,
    formatCurrency,
    formatDate,
    getStatusClass
  }
})

describe('OrdersCards', () => {
  it('renders empty state when there are no orders', () => {
    const wrapper = mountView([])

    expect(wrapper.text()).toContain('No se encontraron órdenes de pago.')
    expect(wrapper.find('.cards-grid').exists()).toBe(false)
  })

  it('renders order cards with formatted values', () => {
    const orders = [
      {
        id: 'ORD-101',
        provider: 'Proveedor Uno',
        amount: 25000,
        concept: 'Pago proveedor',
        createdAt: '2026-05-26',
        status: 'APROBADA'
      }
    ]

    const wrapper = mountView(orders)

    expect(wrapper.findAll('.order-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('ORD-101')
    expect(wrapper.text()).toContain('Proveedor Uno')
    expect(wrapper.text()).toContain('Pago proveedor')
    expect(wrapper.text()).toContain('COP 25000')
    expect(wrapper.text()).toContain('Creado: DATE 2026-05-26')
    expect(formatCurrency).toHaveBeenCalledWith(25000)
    expect(formatDate).toHaveBeenCalledWith('2026-05-26')
  })

  it('applies status class using getStatusClass result', () => {
    const orders = [{
      id: 'ORD-102',
      provider: 'Proveedor Dos',
      amount: 9000,
      concept: 'Pago',
      createdAt: '2026-05-20',
      status: 'RECHAZADA'
    }]

    const wrapper = mountView(orders)
    const status = wrapper.find('.order-status')

    expect(getStatusClass).toHaveBeenCalledWith('RECHAZADA')
    expect(status.classes()).toContain('status-rechazada')
    expect(status.text()).toBe('RECHAZADA')
  })

  it('emits select event with order id when card is clicked', async () => {
    const orders = [{
      id: 'ORD-500',
      provider: 'Proveedor',
      amount: 1000,
      concept: 'Concepto',
      createdAt: '2026-05-20',
      status: 'PAGADA'
    }]

    const wrapper = mountView(orders)
    await wrapper.find('.order-card').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual(['ORD-500'])
  })
})
