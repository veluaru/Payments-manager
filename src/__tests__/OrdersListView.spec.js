import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrdersListView from '../views/OrdersListView.vue'

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

const mountView = () => mount(OrdersListView, {
  global: {
    stubs: {
      OrderFilters: {
        name: 'OrderFilters',
        emits: ['filter'],
        template: '<div data-test="filters" />'
      },
      OrdersTable: {
        name: 'OrdersTable',
        emits: ['edit'],
        template: '<div data-test="orders-table" />'
      },
      OrdersCards: {
        name: 'OrdersCards',
        emits: ['select'],
        template: '<div data-test="orders-cards" />'
      }
    },
    mocks: {
      $router: {
        push: vi.fn()
      }
    }
  }
})

describe('OrdersListView', () => {
  beforeEach(() => {
    mockStore = {
      orders: [],
      loading: false,
      error: null,
      totalOrders: 0,
      getOrders: vi.fn()
    }
    mockRoute = { query: {} }
    mockRouter = {
      replace: vi.fn(),
      push: vi.fn()
    }
  })

  it('loads default first page on mount', async () => {
    mountView()
    await nextTick()

    expect(mockStore.getOrders).toHaveBeenCalledWith({
      _page: 1,
      _limit: 5
    })
    expect(mockRouter.replace).toHaveBeenCalledWith({
      query: {
        page: 1,
        limit: 5,
        provider: undefined,
        status: undefined
      }
    })
  })

  it('uses route query params when present', async () => {
    mockRoute = {
      query: {
        page: '3',
        limit: '10',
        provider: 'Acme',
        status: 'PAGADA'
      }
    }

    mountView()
    await nextTick()

    expect(mockStore.getOrders).toHaveBeenCalledWith({
      _page: 3,
      _limit: 10,
      provider_like: 'Acme',
      status: 'PAGADA'
    })
  })

  it('does not fetch on mount when orders are already loaded', async () => {
    mockStore.orders = [{ id: 'ORD-1' }]

    mountView()
    await nextTick()

    expect(mockStore.getOrders).not.toHaveBeenCalled()
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it('applies filters when OrderFilters emits filter event', async () => {
    const wrapper = mountView()
    await nextTick()

    mockStore.getOrders.mockClear()
    mockRouter.replace.mockClear()

    wrapper.findComponent({ name: 'OrderFilters' }).vm.$emit('filter', {
      provider: 'Globex',
      status: 'APROBADA'
    })
    await nextTick()

    expect(mockStore.getOrders).toHaveBeenCalledWith({
      _page: 1,
      _limit: 5,
      provider_like: 'Globex',
      status: 'APROBADA'
    })
  })

  it('requests new page when paginator emits page event', async () => {
    mockStore.totalOrders = 20
    const wrapper = mountView()
    await nextTick()

    mockStore.getOrders.mockClear()
    mockRouter.replace.mockClear()

    wrapper.findComponent({ name: 'Paginator' }).vm.$emit('page', {
      first: 10,
      page: 2,
      rows: 10
    })
    await nextTick()

    expect(mockStore.getOrders).toHaveBeenCalledWith({
      _page: 3,
      _limit: 10
    })
    expect(mockRouter.replace).toHaveBeenCalledWith({
      query: {
        page: 3,
        limit: 10,
        provider: undefined,
        status: undefined
      }
    })
  })

  it('navigates to detail when table or cards emit selection', async () => {
    const wrapper = mountView()
    await nextTick()

    wrapper.findComponent({ name: 'OrdersTable' }).vm.$emit('edit', 'ORD-777')
    wrapper.findComponent({ name: 'OrdersCards' }).vm.$emit('select', 'ORD-888')

    expect(mockRouter.push).toHaveBeenNthCalledWith(1, {
      name: 'order-detail',
      params: { id: 'ORD-777' }
    })
    expect(mockRouter.push).toHaveBeenNthCalledWith(2, {
      name: 'order-detail',
      params: { id: 'ORD-888' }
    })
  })
})
