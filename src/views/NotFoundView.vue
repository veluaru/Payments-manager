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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.06);
  text-align: center;
}

.status-code {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: #0f172a;
}

.title {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.subtitle {
  margin: 0.75rem 0 1.5rem;
  color: #64748b;
}

.back-link {
  display: inline-block;
  padding: 0.6rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  transition: all 0.18s ease;
}

.back-link:hover {
  background: #f8fafc;
  border-color: #94a3b8;
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