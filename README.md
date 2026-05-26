# Panel de Control de Órdenes Financieras

## Descripción del Proyecto
Esta aplicación es un panel de control interactivo desarrollado con **Vue 3 (Composition API)** y **PrimeVue** enfocado en la visualización, filtrado y administración de órdenes financieras. La solución se conecta a una API Mock configurada localmente para simular el intercambio de datos en tiempo real. 

Para garantizar un rendimiento óptimo ante cargas masivas de datos históricos, la arquitectura delega el procesamiento pesado (paginación, ordenamiento y filtrado) directamente al servidor (Server-Side Processing), optimizando el consumo de memoria en el navegador y reduciendo la transferencia de datos por red.

---

## Requisitos Previos
Asegúrate de tener instaladas las siguientes herramientas en tu entorno de desarrollo antes de iniciar el proyecto:
* **Node.js** (Versión compatible: `^20.19.0` o `>=22.12.0`)
* **npm** (Versión 9.x o superior)

---

## Instrucciones para Ejecutar la Aplicación y el Mock de API

### 1. Instalación de dependencias
Clona el repositorio, navega a la carpeta raíz del proyecto y ejecuta el comando de instalación de paquetes:
```bash
npm install
```

### 2. Lanzamiento del entorno de desarrollo completo
El proyecto cuenta con una arquitectura automatizada mediante la herramienta concurrently. No es necesario ejecutar el servidor de datos y el cliente de forma aislada. Para levantar tanto la interfaz de usuario (Vite) como el servidor de datos (json-server en el puerto 3000) simultáneamente en una sola terminal, ejecuta:
```bash
npm run dev
```
Una vez inicializado, abre el navegador en la dirección local provista por la consola (habitualmente `http://localhost:5173`).

---

## Instrucciones para Ejecutar las Pruebas

### Pruebas Unitarias y de Componentes
La validación de la lógica de los stores globales (Pinia) y el comportamiento aislado de los componentes se realiza mediante la suite de Vitest:
```bash
npm run test:unit
```

---

## Decisiones de Diseño con Justificación

### 1. Gestión de estado centralizada con Pinia (Setup Stores)
- **Decisión:** Encapsular los flujos de datos y operaciones de las órdenes en `src/stores/orderStore.js` utilizando la sintaxis de inicialización moderna basada en funciones de Vue 3.

- **Justificación:** Separa por completo las responsabilidades de infraestructura (peticiones HTTP vía Axios) de la capa de visualización (OrderListView.vue). Esto evita el acoplamiento de código, facilita el mantenimiento y prepara la aplicación para compartir el estado de los registros entre múltiples componentes sin duplicar llamadas a la red.

### 2. Procesamiento de paginación y filtros en el servidor
- **Decisión:** Consumir los parámetros de consulta nativos provistos por el backend (`?_page=1&_limit=5`) de manera dinámica en lugar de procesar arreglos globales en memoria.

- **Justificación:** Manipular o segmentar listados voluminosos del lado del cliente satura el hilo de ejecución del navegador. Al transferir el procesamiento al servidor, el cliente solo descarga e inicializa los registros requeridos para la página activa.

### 3. Continuidad con la versión estable de json-server (v0.17.x)
- **Decisión:** Mantener el entorno de desarrollo fijado en la versión estable tradicional (`^0.17.4`) provista en las dependencias de desarrollo, descartando migraciones a la rama 1.x.

- **Justificación:** Tras aislar el comportamiento de las solicitudes de red, se constató que la suite v0.17.x responde correctamente enviando estructuras limpias de arreglos planos. Mantener la consistencia con esta versión evitó reescrituras complejas en el mapeo de los métodos del store y estabilizó los parámetros de paginación tradicionales (`_limit`).

### 4. Normalización de cabeceras HTTP de Axios para el cálculo de totales
- **Decisión:** Acceder al conteo global de elementos usando de forma estricta la propiedad en minúsculas `response.headers['x-total-count']` y transformar el resultado con `parseInt(..., 10)`.

- **Justificación:** En la versión estable de json-server, el metadato del total de registros no viene incrustado en el cuerpo de la respuesta, sino en los headers. Dado que Axios convierte de forma obligatoria todas las llaves de las cabeceras de respuesta a minúsculas, la consulta con mayúsculas (X-Total-Count) retorna undefined. El casteo explícito a entero previene errores de tipado en las propiedades numéricas de PrimeVue.

### 5. Uso de ref reactivo plano para el índice del paginador (listFirstIndex)
- **Decisión:** Modificar la variable que controla el inicio del paginador visual de una propiedad computada (`computed`) a un `ref(0)` mutado manualmente en los disparadores de cambio.

- **Justificación:** El componente `<Paginator>` de PrimeVue modifica internamente los índices de forma bidireccional mediante `v-model:first`. Al proveer un `computed` tradicional (que es de solo lectura), Vue bloqueaba la mutación lanzando la advertencia Write operation failed: computed value is readonly. La sincronización manual en las funciones handlePageChange y handleFilterChange resolvió la advertencia sin corromper el flujo.

---

## Pendientes

### 1. Cobertura total de pruebas unitarias
- **Por qué quedó pendiente:** Siguiendo una metodología iterativa de desarrollo de software, se determinó finalizar el comportamiento visual y la reactividad real de la aplicación contra el servidor Mock antes de consolidar el código de los tests unitarios. Esto evita incurrir en reescrituras constantes de pruebas rotas por ajustes de tipado o cambios estructurales menores en la fase temprana de diseño. 