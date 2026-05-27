<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <p class="status-code">404</p>
      <h1 class="title">Pagina no encontrada</h1>
      <p class="subtitle">
        La ruta que buscas no existe o fue movida.
      </p>
      <router-link to="/orders" class="back-link">
        Volver al listado
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.not-found-card {
  width: 100%;
  max-width: 520px;
  padding: 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.status-code {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-text);
}

.title {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.subtitle {
  margin: 0.75rem 0 1.5rem;
  color: var(--color-text-muted);
}

.back-link {
  display: inline-block;
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.18s ease;
}

.back-link:hover {
  background: var(--color-surface-muted);
  border-color: var(--color-border-strong);
}

@media (max-width: 640px) {
  .not-found-page {
    padding: 1rem 0.75rem;
  }

  .not-found-card {
    padding: 1.5rem 1rem;
  }
}
</style>