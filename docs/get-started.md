# Manejo de Peticiones HTTP en Nuxt 4 

## Instalación de Nuxt 4

Primero, crea un proyecto nuevo (asegúrate de tener Node.js 18+):

```sh
npx nuxi@latest init nuxt4-fetch-tutorial
cd nuxt4-fetch-tutorial
npm install
```

## Conceptos Clave y Comparación con Axios

Nuxt 4 recomienda usar su propio sistema de fetching (basado en [ohmyfetch](https://github.com/unjs/ofetch)) por estas razones:

- **Isomorfismo**: Funciona en cliente y servidor sin configuración extra.
- **Integración con Nuxt**: Caché inteligente, estado compartido, y mejor manejo de SSR.
- **Ligero**: No necesitas añadir librerías externas como Axios.

## Métodos de Fetching en Nuxt 4

### `useFetch` (Recomendado para datos dinámicos)

Uso: Ideal para componentes que necesitan datos asíncronos (equivalente a `axios.get` + `ref` en Vue).

```vue
<script setup>
const { data: posts, pending, error } = await useFetch('https://jsonplaceholder.typicode.com/posts');
</script>

<template>
  <div v-if="pending">Cargando...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

Opciones útiles:

```ts
useFetch('/api/posts', {
  lazy: true,       // Load after mounting the component
  server: false,    // Only runs on client
  pick: ['title'],  // Only bring specific fields
});
```

### `$fetch` (Similar a Axios, bajo nivel)

Uso: Para llamadas programáticas (ej: en stores o acciones).

```ts
// In a component or composable
const posts = await $fetch('https://jsonplaceholder.typicode.com/posts');

// With options (POST, headers, etc.)
await $fetch('/api/posts', {
  method: 'POST',
  body: { title: 'Hola Nuxt' },
});
```

### `useAsyncData` + `$fetch` (Control avanzado)

Uso: Cuando necesitas más control que `useFetch`.

```ts
const { data, refresh } = await useAsyncData('posts-key', () => 
  $fetch('https://jsonplaceholder.typicode.com/posts')
);

// `refresh()` to reload data.
```

### `useNuxtData` (Acceso a caché existente)

Uso: Para reutilizar datos ya cargados.

```ts
// In another component
const { data: cachedPosts } = useNuxtData('posts-key');
```

### `useRequestFetch` (Solo en SSR)

Uso: Para manejar headers o contexto en SSR.

```ts
// In server routes or middleware
export default defineEventHandler(async (event) => {
  const data = await useRequestFetch(event)('https://api.example.com');
  return { data };
});
```

## Estado Global (State Management)

Nuxt 4 usa `useState` (similar a Pinia/Vuex pero más simple):

```ts
// composables/usePosts.js
export const usePosts = () => {
  const posts = useState('posts', () => []);

  const fetchPosts = async () => {
    posts.value = await $fetch('https://jsonplaceholder.typicode.com/posts');
  };

  return { posts, fetchPosts };
};
```

Uso en componente:

```vue
<script setup>
const { posts, fetchPosts } = usePosts();
</script>
```

## Ejemplo Práctico Completo

Página que lista posts y permite crear uno nuevo:

```vue
<script setup>
const { data: posts, refresh } = await useFetch('https://jsonplaceholder.typicode.com/posts');

const newPost = ref({ title: '', body: '' });

const createPost = async () => {
  await $fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: newPost.value,
  });
  refresh(); // Reload the posts
};
</script>

<template>
  <input v-model="newPost.title" placeholder="Título">
  <textarea v-model="newPost.body" placeholder="Contenido"></textarea>
  <button @click="createPost">Crear Post</button>

  <ul>
    <li v-for="post in posts" :key="post.id">
      <h3>{{ post.title }}</h3>
      <p>{{ post.body }}</p>
    </li>
  </ul>
</template>
```

## Diferencias Clave con Axios

|Feature|Nuxt (useFetch/$fetch)|Axios|
| --- | --- | --- |
|SSR Nativo|✅ Sí|⚠️ Necesita configuración|
|Caché Automático|✅ Sí|❌ No|
|Tamaño|🔹 Incluido en Nuxt|🔸 ~4KB extra|
|Interceptores|❌ No|✅ Sí|

## Consejos Profesionales

- Usa `useFetch`para datos en componentes.
- Usa `$fetch` en stores o lógica compleja.
- Evita `Axios` a menos que necesites interceptores específicos.
- Key única en `useAsyncData` para evitar duplicados.
- Desactiva server si los datos son solo para cliente.

## Ruta de Aprendizaje Recomendada

- useFetch → Ideal para componentes (simplicidad y SSR).
- $fetch → Entender el núcleo de las peticiones.
- useAsyncData → Control avanzado de datos asíncronos.
- useNuxtData → Manejo de caché.
- useRequestFetch → SSR profundo (para mentes avanzadas).
- useState → Nuxt 4 usa useState (similar a Pinia/Vuex pero más simple).


