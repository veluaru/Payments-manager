<script setup>
import { ref, onMounted, watch } from 'vue'

const PRIME_LIGHT_THEME = '/node_modules/primevue/resources/themes/lara-light-blue/theme.css'
const PRIME_DARK_THEME = '/node_modules/primevue/resources/themes/lara-dark-blue/theme.css'
const isDarkMode = ref(false)

const ensurePrimeThemeLink = () => {
  // Create primevue theme link to apply the theme
  let link = document.getElementById('primevue-theme')
  if (!link) {
    link = document.createElement('link')
    link.id = 'primevue-theme'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  return link
}

const applyTheme = (isDark) => {
  // Apply the theme to the document
  document.documentElement.classList.toggle('app-dark', isDark)
  // Apply the theme to the primevue theme link
  const link = ensurePrimeThemeLink()
  link.setAttribute('href', isDark ? PRIME_DARK_THEME : PRIME_LIGHT_THEME)
}

onMounted(() => {
  // Get the saved theme from localStorage
  const savedTheme = localStorage.getItem('pm-theme')
  // Get the prefers dark media query
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  isDarkMode.value = savedTheme ? savedTheme === 'dark' : prefersDark
  // Apply the theme
  applyTheme(isDarkMode.value)
})

watch(isDarkMode, (isDark) => {
  applyTheme(isDark)
  localStorage.setItem('pm-theme', isDark ? 'dark' : 'light')
})
</script>

<template>
  <main class="app-container">
    <header class="app-header">
      <h1 class="app-title">Panel de Ordenes</h1>
      <label class="theme-toggle">
        <input v-model="isDarkMode" type="checkbox" />
        <span>{{ isDarkMode ? 'Dark' : 'Light' }}</span>
      </label>
    </header>
    <RouterView />
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: var(--font-family, sans-serif);
  background-color: var(--color-bg);
  color: var(--color-text);
}

.app-container {
  min-height: 100vh;
}

.app-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  user-select: none;
}

.theme-toggle input {
  margin: 0;
}
</style>