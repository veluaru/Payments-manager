import { config } from '@vue/test-utils'

config.global.stubs = {
  Button: {
    props: ['label', 'disabled'],
    emits: ['click'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}<slot /></button>'
  },
  ProgressSpinner: {
    template: '<div />'
  },
  Paginator: {
    name: 'Paginator',
    emits: ['page', 'update:first'],
    template: '<div data-test="paginator" />'
  },
  Card: {
    template: `
      <div>
        <slot name="title" />
        <slot name="content" />
      </div>
    `
  },
  Dialog: {
    props: ['visible'],
    template: `
      <div v-if="visible">
        <slot />
        <slot name="footer" />
      </div>
    `
  },
  InputText: {
    props: ['modelValue', 'id', 'placeholder'],
    emits: ['update:modelValue', 'input', 'keyup.enter'],
    template: `
      <input
        :id="id"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value); $emit('input', $event)"
        @keyup.enter="$emit('keyup.enter')"
      />
    `
  },
  InputNumber: {
    props: ['modelValue', 'id'],
    emits: ['update:modelValue', 'input'],
    template: `
      <input
        :id="id"
        :value="modelValue ?? ''"
        @input="$emit('update:modelValue', $event.target.value === '' ? null : Number($event.target.value)); $emit('input', $event)"
      />
    `
  },
  Textarea: {
    props: ['modelValue', 'id'],
    emits: ['update:modelValue', 'input'],
    template: `
      <textarea
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value); $emit('input', $event)"
      />
    `
  },
  Calendar: {
    props: ['modelValue', 'id'],
    emits: ['update:modelValue'],
    template: '<input :id="id" :value="modelValue" />'
  },
  Dropdown: {
    props: ['modelValue', 'options', 'id'],
    emits: ['update:modelValue'],
    template: `
      <select :id="id" :value="modelValue ?? ''" @change="$emit('update:modelValue', $event.target.value || null)">
        <option v-for="option in options" :key="option.value ?? 'null'" :value="option.value ?? ''">
          {{ option.label }}
        </option>
      </select>
    `
  }
}
