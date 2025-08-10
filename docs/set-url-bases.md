# Establecer bases URL

## Configuración Global con `$fetch` (ohmyfetch)

Nuxt usa [ohmyfetch](https://github.com/unjs/ofetch) (alias `$fetch`), que permite definir una `baseURL` global mediante opciones por defecto.

### En `nuxt.config.ts`
```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: { // Add this for external APIs
      extApiBase: 'https://jsonplaceholder.typicode.com', // Public variable (client + server)
      intApiBase: '/api' // Route for the internal API (Nitro)
    }
  },
  // Optional: Extend $fetch options globally
  hooks: {
    'nitro:config'(nitroConfig) {
      nitroConfig.runtimeConfig = nitroConfig.runtimeConfig || {};
      nitroConfig.runtimeConfig.apiBase = 'https://jsonplaceholder.typicode.com';
    }
  }
});
```

### Uso en Componentes

Ahora puedes usar `runtimeConfig` para evitar repetir URLs:

```vue
<script setup>
const config = useRuntimeConfig();

// External API
const { data: posts } = await useFetch(
  () => `${config.public.extApiBase}/posts`
);

// Internal API (Nitro)
const { data: internalData } = await useFetch(
  () => `${config.public.intApiBase}/hello`
);
</script>
```

## Crear un Composables Reusable

Para centralizar todas las llamadas a APIs (como una "capa de servicios"):

`composables/useApi.ts`
```ts
export const useApi = () => {
  const config = useRuntimeConfig();

  // External API
  const fetchPosts = () => $fetch(`${config.public.extApiBase}/posts`);

  // Internal API (Nitro)
  const fetchDynamicPath = (path: string) => $fetch(`${config.public.intApiBase}/${path}`);

  return { fetchPosts, fetchDynamicPath };
};
```

Uso en Componente

```vue
<script setup>
const { fetchPosts, fetchDynamicPath } = useApi();

const posts = await fetchPosts();
const DynamicPath = await fetchDynamicPath('hello');
</script>
```

## Configurar API Interna (Nitro)

Si necesitas rutas API propias en tu proyecto (ej: `http://localhost:3000/api/hello`):

### Crear un Endpoint Nitro

Crea el archivo:

```sh
mkdir -p server/api && touch server/api/hello.get.ts
```

### Definir la Ruta (`server/api/hello.get.ts`)

```ts
export default defineEventHandler(async (event) => {
  return { message: 'Hello from the internal API!' };
});
```

### Consumirla desde el Frontend

```ts
const { data } = await useFetch('/api/hello'); // Without baseURL, Nuxt resolves automatically.
```

## Opción Avanzada: Interceptores

Si extrañas los interceptores de Axios, puedes simularlos con `$fetch`:

`plugins/fetch.ts`
```ts
export default defineNuxtPlugin(() => {
  const $fetch = globalThis.$fetch.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    async onRequest({ request, options }) {
      // Add headers here (e.g. auth token)
      options.headers = { ...options.headers, Authorization: 'Bearer token' };
    },
    async onResponseError({ response }) {
      // Handling global errors
      console.error('Error in the response:', response.status);
    }
  });

  return { provide: { fetch: $fetch } };
});
```

### Uso en Componente

```ts
const { $fetch } = useNuxtApp();
const data = await $fetch('/posts'); // Use the custom instance.
```

## Resumen de Flujo

- **APIs Externas**: Usa `runtimeConfig.public.apiBase` + `useFetch`/`$fetch`.
- **API Interna (Nitro)**: Usa rutas en `server/api/` y consume con `/api/ruta`.
- **Composables**: Centraliza lógica de fetching para reutilización.
- **Interceptores**: Personaliza `$fetch.create()` si necesitas funcionalidad avanzada.

## Ejemplo Final: Consumo de 2 APIs

### Configuración (`nuxt.config.ts`)

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      jsonPlaceholder: 'https://jsonplaceholder.typicode.com',
      myApi: 'https://mi-api.com'
    }
  }
});
```

### Componente (`pages/posts.vue`)

```vue
<script setup>
const { fetchPosts } = useApi();
const { data: posts } = await useAsyncData('posts', fetchPosts);
</script>
```

### Composable (`composables/useApi.ts`)

```ts
export const useApi = () => {
  const config = useRuntimeConfig();

  const fetchPosts = () => $fetch(`${config.public.jsonPlaceholder}/posts`);
  const fetchUsers = () => $fetch(`${config.public.myApi}/users`);

  return { fetchPosts, fetchUsers };
};
```

