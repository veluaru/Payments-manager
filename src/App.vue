<template>
  <main class="app-container">
    <RouterView />
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: var(--font-family, sans-serif);
  background-color: #f8fafc;
  color: #334155;
}
.app-container {
  min-height: 100vh;
}
</style>