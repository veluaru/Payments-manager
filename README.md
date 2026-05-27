# Panel de Control de Órdenes Financieras

## 📝 Descripción del Proyecto

Esta aplicación es un panel de control para la visualización, filtrado y administración del ciclo de vida de órdenes financieras. Desarrollada con **Vue 3**, **Pinia** y **PrimeVue**, la app controla los cambios de estado de cada orden y pasa el procesamiento pesado al servidor (Server-Side Processing) con **JSON-server**.

---

## 📂 Estructura de Componentes y Vistas

El proyecto separa limpiamente las responsabilidades visuales, lógicas y de estado:

* **`views/`**
* `OrdersListView.vue`: Controlador principal de la pantalla de listado. Administra parámetros de URL, llamadas a la store y reacciona a filtros o paginación.
* `OrderFormView.vue`: Vista unificada para la creación y edición de órdenes financieras. Gestiona validaciones locales y las de transiciones de estados.
* `NotFoundView.vue`: Renderizado amigable para el manejo de rutas inexistentes (Error 404).

* **`components/`**
* `OrderFilters.vue`: Componente aislado para la captura de filtros por proveedor y estado.
* `OrdersTable.vue`: Renderizado adaptativo en formato tabla para resoluciones de escritorio.
* `OrdersCards.vue`: Renderizado adaptativo en formato tarjetas para dispositivos móviles.

* **`stores/`**
* `orderStore.js`: Núcleo de estado global (Pinia) para la persistencia, carga de datos remotos y manejo centralizado de respuestas HTTP.

---

## 🚀 Requisitos e Instalación

### Requisitos Previos

* **Node.js** (Versión compatible: `^20.19.0` o `>=22.12.0`)
* **npm** (Versión 9.x o superior)

### Ejecución del Entorno Completo

El proyecto utiliza `concurrently` para orquestar tanto el servidor de desarrollo del frontend (Vite) como la API Mock local (`json-server` en el puerto 3000) mediante un único comando:

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar Frontend y API Mock simultáneamente
npm run dev
```

### Ejecución de Pruebas Unitarias

Para la validación de la lógica de la store y el comportamiento de los componentes de presentación aislados, se configuró la suite de pruebas mediante **Vitest**:

```bash
# Ejecutar las pruebas unitarias en modo interactivo (Watch mode)
npm run test:unit

```

---

## ⚙️ Decisiones Técnicas

### 1. Modularidad en Vistas mediante Sub-componentes de Presentación

* **Por qué:** Se aisló la lógica visual del listado en unidades independientes y puras (`OrdersTable`, `OrdersCards` y `OrderFilters`), las cuales se comunican con el padre únicamente mediante `props` y `emits`.
* **Beneficio:** Reduce drásticamente las líneas de código en `OrdersListView.vue`. Esto hace que el archivo sea mucho más legible, facilita el mantenimiento de los diseños adaptativos (escritorio vs. móvil) y prepara el terreno para añadir pruebas unitarias aisladas sin arrastrar dependencias complejas.

### 2. Simulación Eficaz con JSON Server

* **Por qué:** Se seleccionó `json-server` porque permite simular una API REST completa en cuestión de segundos utilizando un archivo JSON como base de datos, sin necesidad de configurar entornos de backend complejos.
* **Beneficio:** Soporta de forma nativa características avanzadas como filtrado por texto (`_like`) y paginación real basada en parámetros de URL. Esto permite validar la integración completa de red y los flujos asíncronos en el frontend de forma idéntica a un entorno de producción.

### 3. Orquestación del Entorno con Concurrently

* **Por qué:** En lugar de abrir varias pestañas de la terminal para levantar el frontend (Vite) y la API de pruebas por separado, se integró el paquete `concurrently`.
* **Beneficio:** Simplifica la experiencia de desarrollo al unificar ambos servicios bajo un único comando de arranque (`npm run dev`). Si uno de los procesos falla, la herramienta gestiona el cierre limpio del otro automáticamente.

### 4. Automatización con unplugin-vue-components

* **Por qué:** Se eligió este plugin para evitar la importación completa de la librería de PrimeVue, la cual es sumamente pesada en su totalidad. En su lugar, la herramienta detecta automáticamente qué componente se escribe en el template e importa únicamente lo que se necesita bajo demanda. Adicionalmente, se configuró para que también gestione de forma automática componentes propios de Vue.
* **Beneficio:** Elimina por completo la necesidad de escribir manualmente una lista larga y tediosa de `imports` dentro de la sección `<script>`. Esto mantiene los archivos limpios, ahorra tiempo de desarrollo y optimiza drásticamente el tamaño final del empaquetado de la aplicación al evitar código innecesario.

### 5. Interfaz de Usuario Consistente con PrimeVue

* **Por qué:** Se seleccionó PrimeVue por ser una librería altamente estable y popular dentro del ecosistema de Vue, la cual ofrece una amplia variedad de componentes preconstruidos y listos para usar.
* **Beneficio:** Facilita la construcción rápida de la aplicación al proveer elementos ya estructurados, lo que permite avanzar de forma ágil sin tener que centrar la atención ni invertir tiempo en el desarrollo de estilos desde cero.

### 6. Centralización del Estado Global con Pinia

* **Por qué:** Se incluyó inicialmente porque la prueba técnica lo solicitaba como requisito, aunque de igual forma constituye la herramienta más útil para gestionar el estado de la aplicación. Se implementó con el fin de manejar de manera sencilla todos los datos relacionados con la orden, facilitando su reutilización en diferentes componentes y centralizando la lógica de consumo de la API en un solo lugar.
* **Beneficio:** Evita la duplicación de funciones de red en las vistas y asegura que cualquier componente tenga acceso inmediato a la información actualizada de las órdenes de pago de forma fácil, sin necesidad de pasar datos manualmente a través de múltiples niveles.

### 7. Agilidad en el Prototipado (Exclusión de TypeScript)

* **Por qué:** Para el desarrollo de esta versión, se decidió prescindir de TypeScript y escribir el proyecto en JavaScript puro para priorizar la velocidad de iteración.
* **Beneficio:** Al tratarse de un MVP centrado en validar el comportamiento de la interfaz de usuario, las transiciones de estado y la reactividad, JavaScript permitió construir y refactorizar flujos rápidamente sin la sobrecarga de configurar tipos complejos o interfaces estrictas para una API simulada.

### 8. Implementación de Paginación en el Servidor (Server-Side Pagination)

* **Por qué:** En lugar de descargar todo el histórico de órdenes en el navegador y segmentarlo localmente, la paginación se procesa directamente en la API mediante parámetros de control.
* **Beneficio:** Optimiza el consumo de memoria en el cliente y reduce el uso de red. Al transferir únicamente bloques pequeños de datos, se garantiza que la aplicación siga siendo rápida y fluida sin importar que la base de datos crezca a miles de registros históricos. Además de hacer mas simple la implementación de la lógica de paginación al hacer la mayoria en el servidor.

---

## 📈 Próximos Pasos (Pendientes)

### 1. Manejo de Errores de Conectividad Inicial (Interceptores de Axios)
* **Descripción:** Implementar un interceptor global a través de Axios para capturar caídas drásticas de red o fallos inesperados del servidor antes de que afecten directamente los estados locales de los formularios o componentes.
* **Justificación de su exclusión actual:** Debido a que la API simulada y las peticiones requeridas para el alcance actual del proyecto son sumamente sencillas, se consideró innecesario añadir una capa global de interceptores, resolviendo el control de excepciones directamente en los puntos de consumo esenciales.

### 2. Abstracción de Red mediante Composable Propio (`useApi`)
* **Descripción:** Diseñar una función composable reactiva personalizada para centralizar las peticiones HTTP. Esta abstracción permitirá gestionar de forma genérica el ciclo de vida de las consultas, automatizando el control de los estados de carga (`loading`) y la captura unificada de errores de red sin duplicar lógica en las acciones de Pinia.
* **Justificación de su exclusión actual:** Al introducir una lógica más compleja para la gestión y abstracción del ciclo de vida de las consultas, se optó por dejarla fuera en esta etapa con el fin de priorizar un flujo de datos más directo, predecible y fácil de evaluar en las stores.