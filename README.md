# Panel de Control de Órdenes Financieras

## Descripción del Proyecto
Esta aplicación es un panel de control interactivo desarrollado con **Vue 3 (Composition API)** y **PrimeVue** enfocado en la visualización, filtrado y administración de órdenes financieras. La solución se conecta a una API Mock configurada localmente para simular el intercambio de datos en tiempo real. 

Para garantizar un rendimiento óptimo ante cargas masivas de datos históricos, la arquitectura delega el procesamiento pesado (paginación, ordenamiento y filtrado) directamente al servidor (Server-Side Processing), optimizando el consumo de memoria en el navegador y reduciendo la transferencia de datos por red.

---

## Requisitos Previos
Asegúrate de tener instaladas las siguientes herramientas en tu entorno de desarrollo antes de iniciar el proyecto:
* **Node.js** (Versión 18.x o superior recomendada)
* **npm** (Versión 9.x o superior) o gestores alternativos similares (*yarn* o *pnpm*)

---

## Instrucciones para Ejecutar la Aplicación y el Mock de API

### 1. Instalación de dependencias
Clona el repositorio, navega a la carpeta raíz del proyecto y ejecuta el comando de instalación:
```bash
npm install
```

### 2. Inicialización de la API Mock
El backend simulado utiliza json-server y debe ejecutarse en el puerto 3000 para que el cliente HTTP pueda interceptar los endpoints:
```bash
npm run mock
```
*(Nota: Si el script no está configurado en tu package.json, puedes levantarlo ejecutando de forma directa: npx json-server --watch db.json --port 3000)*

### 3. Lanzamiento del Frontend
En una ventana o pestaña independiente de la terminal, arranca el servidor de desarrollo de Vite:
```bash
npm run dev
```
Una vez inicializado, abre el navegador en la dirección local suministrada por la consola (comúnmente http://localhost:5173).

## Instrucciones para Ejecutar las Pruebas

### Pruebas Unitarias y de Componentes
La lógica de los stores globales y el correcto comportamiento de los componentes se validan mediante la suite de Vitest:
```bash
npm run test:unit
```

## Decisiones de Diseño con Justificación

### 1. Gestión de estado centralizada con Pinia (Setup Stores)
- **Decisión:** Encapsular los flujos de datos y operaciones de las órdenes en `src/stores/orderStore.js` utilizando la sintaxis de inicialización moderna basada en funciones de Vue 3.

- **Justificación:** Separa por completo las responsabilidades de infraestructura (peticiones HTTP vía Axios) de la capa de visualización (OrderListView.vue). Esto evita el acoplamiento de código, facilita el mantenimiento y prepara la aplicación para compartir el estado de los registros entre múltiples componentes sin duplicar llamadas a la red.

### 2. Procesamiento de paginación y filtros en el servidor
- **Decisión:** Consumir los parámetros de consulta nativos provistos por el backend (`?_page=1&_limit=5`) de manera dinámica en lugar de procesar arreglos globales en memoria.

- **Justificación:** Manipular o segmentar listados voluminosos del lado del cliente satura el hilo de ejecución del navegador. Al transferir el procesamiento al servidor, el cliente solo descarga e inicializa los registros requeridos para la página activa.

### 3. Continuidad con la versión estable de json-server (v0.17.x)
- **Decisión:** Mantener el entorno de desarrollo sobre la versión estable tradicional en lugar de forzar actualizaciones hacia ramas en fase de desarrollo o pre-lanzamientos (v1.0.0).

- **Justificación:** Tras aislar el comportamiento de las solicitudes de red, se constató que la suite v0.17.x responde correctamente enviando estructuras limpias de arreglos planos. Mantener la consistencia con esta versión evitó reescrituras complejas en el mapeo de los métodos del store y estabilizó los parámetros de paginación tradicionales (_limit).

### 4. Normalización de cabeceras HTTP de Axios para el cálculo de totales
- **Decisión:** Acceder al conteo global de elementos usando de forma estricta la propiedad en minúsculas `response.headers['x-total-count']` y transformar el resultado con `parseInt(..., 10)`.

- **Justificación:** En la versión estable de json-server, el metadato del total de registros no viene incrustado en el cuerpo de la respuesta, sino en los headers. Dado que Axios convierte de forma obligatoria todas las llaves de las cabeceras de respuesta a minúsculas, la consulta con mayúsculas (X-Total-Count) retorna undefined. El casteo explícito a entero previene errores de tipado en las propiedades numéricas de PrimeVue.

### 5. Uso de ref reactivo plano para el índice del paginador (listFirstIndex)
- **Decisión:** Modificar la variable que controla el inicio del paginador visual de una propiedad computada (`computed`) a un `ref(0)` mutado manualmente en los disparadores de cambio.

- **Justificación:** El componente `<Paginator>` de PrimeVue modifica internamente los índices de forma bidireccional mediante `v-model:first`. Al proveer un `computed` tradicional (que es de solo lectura), Vue bloqueaba la mutación lanzando la advertencia Write operation failed: computed value is readonly. La sincronización manual en las funciones handlePageChange y handleFilterChange resolvió la advertencia sin corromper el flujo.

## Pendientes