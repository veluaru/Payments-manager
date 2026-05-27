import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrderFilters from '../components/OrderFilters.vue'

const mountView = () => mount(OrderFilters)

describe('OrderFilters', () => {
  it('renders key fields and action buttons', () => {
    const wrapper = mountView()

    expect(wrapper.find('#provider-search').exists()).toBe(true)
    expect(wrapper.find('#status-select').exists()).toBe(true)
    expect(wrapper.text()).toContain('Filtrar')
    expect(wrapper.text()).toContain('Limpiar')
  })

  it('emits trimmed provider and selected status when applying filters', async () => {
    const wrapper = mountView()

    await wrapper.find('#provider-search').setValue('  Acme Corp  ')
    await wrapper.find('#status-select').setValue('APROBADA')
    await wrapper.findAll('button').find((button) => button.text() === 'Filtrar').trigger('click')
    await nextTick()

    expect(wrapper.emitted('filter')).toBeTruthy()
    expect(wrapper.emitted('filter')[0]).toEqual([{
      provider: 'Acme Corp',
      status: 'APROBADA'
    }])
  })

  it('emits null provider when provider input is blank spaces', async () => {
    const wrapper = mountView()

    await wrapper.find('#provider-search').setValue('   ')
    await wrapper.findAll('button').find((button) => button.text() === 'Filtrar').trigger('click')
    await nextTick()

    expect(wrapper.emitted('filter')[0]).toEqual([{
      provider: null,
      status: null
    }])
  })

  it('applies filters when pressing Enter in provider input', async () => {
    const wrapper = mountView()

    await wrapper.find('#provider-search').setValue('Globex')
    await wrapper.find('#provider-search').trigger('keyup.enter')
    await nextTick()

    expect(wrapper.emitted('filter')[0]).toEqual([{
      provider: 'Globex',
      status: null
    }])
  })

  it('clears filters and emits null values', async () => {
    const wrapper = mountView()

    await wrapper.find('#provider-search').setValue('Proveedor X')
    await wrapper.find('#status-select').setValue('PAGADA')
    await wrapper.findAll('button').find((button) => button.text() === 'Limpiar').trigger('click')
    await nextTick()

    const events = wrapper.emitted('filter')
    expect(events).toBeTruthy()
    expect(events[0]).toEqual([{
      provider: null,
      status: null
    }])
  })
})
