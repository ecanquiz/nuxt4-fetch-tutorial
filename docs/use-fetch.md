# Dominando `useFetch`

>`useFetch` es el caballo de batalla para fetching de datos en Nuxt 4. Está diseñado para componentes, maneja SSR automáticamente y ofrece reactividad out-of-the-box. Vamos a explorarlo en detalle con ejemplos prácticos usando [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

## ¿Qué hace `useFetch`?

Es un composable que:

- **Hace peticiones HTTP** (GET por defecto).
- **Maneja SSR/SSG**: Funciona en servidor y cliente sin config.
- **Provee estados reactivos**: `data`, `pending`, `error`, `refresh`.
- **Optimiza caché**: Evita duplicar peticiones.

## Sintaxis Básica

```ts
const { 
  data,       // API response
  pending,    // State of charge (boolean)
  error,      // Error object (if it fails)
  refresh,    // Data reload function
  execute     // Similar to refresh, but allows parameters
} = await useFetch(url, options);
```

## Ejemplo Práctico: Fetching de Posts

```vue
<script setup>
const { data: posts, pending, error } = await useFetch(
  'https://jsonplaceholder.typicode.com/posts'
);
</script>

<template>
  <div v-if="pending">Cargando posts...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>
```

## Opciones Clave de `useFetch`

### `lazy` (Carga diferida)

Útil para evitar bloqueo de render inicial:

```ts
const { data } = await useFetch('/api/posts', { lazy: true });
```

### `transform` (Modificar respuesta)

```ts
const { data: users } = await useFetch('/api/users', {
  transform: (users) => users.map(user => ({ ...user, name: user.name.toUpperCase() }))
});
```

### `pick` (Filtrar campos)

```ts
// It only brings the 'id' and 'title' fields of each post
const { data } = await useFetch('/api/posts/1', { pick: ['id', 'title'] });
```

::: details
La opción `pick` en los componibles `useFetch` y `useAsyncData` de Nuxt permite minimizar el tamaño de la carga útil seleccionando solo los campos específicos de los datos obtenidos que se desean incluir en la carga útil enviada del servidor al cliente. Esto es especialmente útil para reducir la cantidad de datos transferidos y mejorar el rendimiento.

Sin embargo, al obtener un `array` de objetos, `pick` no funciona como una "selección profunda" (es decir, no selecciona campos de cada objeto del `array`). En estos casos, se debe usar la opción `transform` para mapear el `array` y devolver solo los campos deseados:

Tanto `pick` como `transform` no impiden que se obtengan inicialmente los datos no deseados, pero sí evitan que se añadan a la carga útil transferida del servidor al cliente. Esto ayuda a minimizar el tamaño de la carga útil y a optimizar el rendimiento de la aplicación Nuxt. Para obtener más información, consulte la documentación oficial sobre cómo minimizar el tamaño de la carga útil y las discusiones relacionadas: ["Minimizar el tamaño de la carga útil"](https://nuxt.com/docs/4.x/getting-started/data-fetching#minimize-payload-size) y la respuesta de [Stack Overflow](https://stackoverflow.com/questions/78161528/how-to-use-nuxtjs3-usefetch-pick-parameter-for-arrays-or-make-a-deep-pick).
:::




### `immediate` (Controlar ejecución)

```ts
const shouldFetch = ref(false);
const { data } = await useFetch('/api/posts', { immediate: shouldFetch.value });
```

## Manejo de Errores

```vue
<script setup>
const { data, error } = await useFetch('https://jsonplaceholder.typicode.com/posts/9999');

if (error.value) {
  console.error('Error:', error.value.statusMessage);
}
</script>
```

## Recarga de Datos (`refresh` y `execute`)

```vue
<script setup>
const { data, refresh } = await useFetch('/api/posts');

// Example with dynamic parameters
const postId = ref(1);
const { data: post, execute } = await useFetch(
  () => `https://jsonplaceholder.typicode.com/posts/${postId.value}`,
  { immediate: false }
);
</script>

<template>
  <button @click="refresh">Reload Posts</button>
  <button @click="execute({ dedupe: true })">Reload Current Post (without cache)</button>
</template>
```

## SSR y Key de Caché

Nuxt cachea respuestas por defecto usando la URL como clave. Puedes personalizarla:

```ts
const { data } = await useFetch('/api/posts', { key: 'posts-key' });

// In another component, reuse the cache:
const { data: cachedPosts } = useNuxtData('posts-key');
```

## Comparación con Axios

|Feature|useFetch|Axios|
|-|-|-
|SSR|✅ Automático|⚠️ Necesita adaptación|
|Caché|✅ Gestionado por Nuxt|❌ Manual|
|Reactividad|✅ data, pending, error|❌ Requiere ref/reactive|
|Interceptores|❌ Limitado (usar $fetch o plugins)|✅ Completo|

## Buenas Prácticas

1. Centraliza URLs: Usa `runtimeConfig` o composables.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: 'https://jsonplaceholder.typicode.com'
    }
  }
});
```

```vue
<script setup>
const { data } = await useFetch(`${useRuntimeConfig().public.apiBase}/posts`);
</script>
```

2. **Usa** `key` **única** si reutilizas datos en múltiples componentes.

3. **Prefiere** `transform` sobre manipulación manual de `data`.

4. **Desactiva** `immediate` si la llamada depende de una acción del usuario.

## Ejemplo Avanzado: Paginación

```vue
<script setup>
const page = ref(1);
const { data: posts } = await useFetch(
  () => `https://jsonplaceholder.typicode.com/posts?_page=${page.value}&_limit=10`,
  { watch: [page] } // Automatic reload when `page` changes
);
</script>

<template>
  <button @click="page--">Previous</button>
  <button @click="page++">Next</button>
  <ul>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

## Ejemplo Práctico Completo

Peticiones a posts y usuarios de JSONPlaceholder, con manejo de errores y recarga.

```vue
<script setup>
// Basic stateful fetch
const { 
  data: posts, 
  pending, 
  error, 
  refresh 
} = await useFetch('https://jsonplaceholder.typicode.com/posts');

// With advanced options
const { data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  lazy: true,                  // Load after mounting the component
  transform: (users) => {      // Transform the response
    return users.map(user => ({ ...user, name: user.name.toUpperCase() }));
  },
  onResponse({ response }) {   // Interceptors
    console.log('Respuesta recibida:', response.status);
  }
});
</script>

<template>
  <div>
    <button @click="refresh">Reload Posts</button>
    
    <div v-if="pending">Loading posts...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>

    <h2>Users (transformed):</h2>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>
```

### Puntos claves:

- `pending`: Útil para mostrar loaders.
- `refresh`: Recarga los datos (equivalente a volver a llamar la API).
- `transform`: Modifica la respuesta antes de asignarla a `data`.
- `lazy`: Evita bloqueo de renderizado (como `async setup` en Vue).

## Conclusión

`useFetch` es la opción más potente y sencilla para fetching en componentes Nuxt. Combina:

- SSR automático.
- Estados reactivos (`pending`, `error`).
- Optimización de caché.

¿Siguiente paso? [Aprender $fetch](./dolar-fetch.html) para entender el núcleo de las peticiones en Nuxt.