<script setup>
defineProps({
  id: { type: String, required: true }
})
</script>
<template>
  <div class="p-4">
    <h1>Detalle de la Órden #{{ id }}</h1>
  </div>
</template>