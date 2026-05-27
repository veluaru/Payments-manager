import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrderFormView from '../views/OrderFormView.vue'

let mockStore
let mockRoute
let mockRouter

vi.mock('@/stores/orderStore', () => ({
  useOrderStore: () => mockStore
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: () => mockRoute,
    useRouter: () => mockRouter
  }
})

const flush = async () => {
  await Promise.resolve()
  await nextTick()
}

const mountView = () => mount(OrderFormView)

describe('OrderFormView', () => {
  beforeEach(() => {
    mockStore = {
      currentOrder: null,
      loading: false,
      error: null,
      getOrderById: vi.fn().mockResolvedValue(true),
      createOrder: vi.fn().mockResolvedValue(true),
      updateOrder: vi.fn().mockResolvedValue(true)
    }
    mockRoute = { params: {} }
    mockRouter = { push: vi.fn() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a new order with normalized payload and redirects', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const wrapper = mountView()
    await flush()

    await wrapper.find('#provider').setValue('  ACME  ')
    await wrapper.find('#amount').setValue('125000')
    await wrapper.find('#concept').setValue('  Pago factura mayo  ')
    await wrapper.findAll('button').find((button) => button.text().includes('Crear Orden')).trigger('click')
    await flush()

    expect(mockStore.createOrder).toHaveBeenCalledTimes(1)
    expect(mockStore.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      id: 'ORD-100000',
      provider: 'ACME',
      amount: 125000,
      concept: 'Pago factura mayo',
      status: 'BORRADOR',
      createdAt: expect.any(String)
    }))
    expect(mockStore.updateOrder).not.toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'orders-list' })
  })

  it('loads existing order and saves changes in edit mode', async () => {
    mockRoute = { params: { id: 'ORD-1' } }
    mockStore.currentOrder = {
      id: 'ORD-1',
      provider: 'Proveedor Base',
      amount: 50000,
      concept: 'Concepto base',
      createdAt: '2026-05-20T00:00:00.000Z',
      status: 'APROBADA'
    }

    const wrapper = mountView()
    await flush()

    expect(mockStore.getOrderById).toHaveBeenCalledWith('ORD-1')
    expect(wrapper.text()).toContain('Orden: ORD-1')

    await wrapper.find('#provider').setValue('  Proveedor Editado  ')
    await wrapper.find('#concept').setValue('  Concepto editado  ')
    await wrapper.findAll('button').find((button) => button.text().includes('Guardar Cambios')).trigger('click')
    await flush()

    expect(mockStore.updateOrder).toHaveBeenCalledTimes(1)
    expect(mockStore.updateOrder).toHaveBeenCalledWith('ORD-1', expect.objectContaining({
      provider: 'Proveedor Editado',
      concept: 'Concepto editado',
      amount: 50000,
      status: 'APROBADA',
      createdAt: expect.any(String)
    }))
    expect(mockStore.createOrder).not.toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'orders-list' })
  })

  it('handles status transition with confirmation dialog', async () => {
    mockRoute = { params: { id: 'ORD-9' } }
    mockStore.currentOrder = {
      id: 'ORD-9',
      provider: 'Proveedor',
      amount: 1000,
      concept: 'Concepto',
      createdAt: '2026-05-20T00:00:00.000Z',
      status: 'BORRADOR'
    }

    const wrapper = mountView()
    await flush()

    expect(wrapper.text()).toContain('Aprobar')
    expect(wrapper.text()).toContain('Rechazar')
    expect(wrapper.text()).not.toContain('Pagar')

    await wrapper.findAll('button').find((button) => button.text().includes('Aprobar')).trigger('click')
    await flush()
    await wrapper.findAll('button').find((button) => button.text().includes('Confirmar')).trigger('click')
    await flush()

    expect(mockStore.updateOrder).toHaveBeenCalledWith('ORD-9', { status: 'APROBADA' })
  })
})
