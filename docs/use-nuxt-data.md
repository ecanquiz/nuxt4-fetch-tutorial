# Dominando `useNuxtData`: Caché Inteligente y Reutilización Eficiente

## 1. ¿Qué es `useNuxtData`?

`useNuxtData` es un composable que te permite acceder y manipular datos cacheados previamente por `useAsyncData` o `useFetch`. Es la clave para optimizar tu aplicación evitando peticiones duplicadas.

### Características clave:

- ✅ **Acceso directo** al caché de Nuxt
- ✅ **Sin nuevas peticiones** HTTP
- ✅ **Datos reactivos** inmediatos
- ✅ **Gestión centralizada** del estado de datos

## 2. Sintaxis Básica

```ts
const { data, status, error, clear } = useNuxtData(cacheKey);
```

### Parámetros:

- `cacheKey`: La misma key usada en `useAsyncData` o `useFetch`

### Retorno:

- `data`: Ref con los datos cacheados
- `status`: 'idle' | 'pending' | 'success' | 'error'
- `error`: Ref con el error (si existe)
- `clear`: Función para limpiar el caché

### 3. Ejemplo Práctico Básico

```vue
<!-- components/PostsList.vue -->
<script setup>
// Primera carga - hace la petición HTTP
const { data: posts } = await useAsyncData(
  'featured-posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts')
);
</script>

<template>
  <div>
    <h2>Lista de Posts</h2>
    <ul>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>
```

```vue
<!-- components/PostStats.vue -->
<script setup>
// Reutiliza el caché - SIN nueva petición HTTP
const { data: cachedPosts } = useNuxtData('featured-posts');
</script>

<template>
  <div>
    <h3>Estadísticas</h3>
    <p>Total de posts: {{ cachedPosts?.length || 0 }}</p>
  </div>
</template>
```

