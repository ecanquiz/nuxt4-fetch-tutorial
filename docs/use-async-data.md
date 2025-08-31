# Dominando `useAsyncData` en Nuxt 4
>Control Avanzado de Datos Asíncronos

## ¿Qué es `useAsyncData`?

>[`useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data) es un composable de Nuxt que proporciona control granular sobre la carga de datos asíncronos. A diferencia de [`useFetch`](./use-fetch.html) que es más opiniado, `useAsyncData` te da más flexibilidad para personalizar cómo se obtienen y gestionan los datos.

### Características clave:
- ✅ **Control manual** sobre la función de fetching
- ✅ **Gestión de caché** con keys personalizadas
- ✅ **Reactividad** integrada con estados de carga y error
- ✅ **Reejecución** programática de peticiones

## Sintaxis Básica

```ts
const { data, pending, error, refresh, execute } = await useAsyncData(
  key,           // Unique identifier for cache
  handler,       // Function that returns the data
  options        // Configuration options
);
```

## Ejemplo práctico
```vue
<script setup>
const { data: posts, pending, error } = await useAsyncData(
  'posts', // Unique key for cache
  () => $fetch('https://jsonplaceholder.typicode.com/posts')
);
</script>

<template>
  <div v-if="pending">Cargando posts...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

## Diferencias Clave: `useAsyncData` vs `useFetch`

|Característica|`useAsyncData`|`useFetch`|
|-|-|-|
|**Flexibilidad**|✅ Alta (control manual)|❌ Media (opinión de Nuxt)|
|**Sintaxis**|Más verbosa|Más concisa|
|**Key de caché**|Requerida|Automática (basada en URL)|
|**Función handler**|Requerida|Implícita|
|**Uso recomendado**|Lógica compleja de fetching|Casos simples y rápidos|

## Opciones de Configuración Avanzadas

### `lazy` - Carga diferida

```ts
const { data, pending } = await useAsyncData(
  'posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts'),
  { lazy: true } // Does not block navigation
);
```

### `default` - Valor por defecto

```ts
const { data: user } = await useAsyncData(
  'user',
  () => $fetch('https://jsonplaceholder.typicode.com/users/1'),
  { default: () => ({ name: 'Usuario por defecto' }) }
);
```

### `transform` - Transformar datos

```ts
const { data: posts } = await useAsyncData(
  'formatted-posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts'),
  {
    transform: (posts) => posts.map(post => ({
      ...post,
      title: post.title.toUpperCase(),
      createdAt: new Date().toISOString()
    }))
  }
);
```

### `watch` - Reacción a cambios

```ts
const userId = ref(1);

const { data: user } = await useAsyncData(
  'user',
  () => $fetch(`https://jsonplaceholder.typicode.com/users/${userId.value}`),
  { watch: [userId] } // Reruns when userId changes
);
```

## Patrones Avanzados con `useAsyncData`
### Combinación con `$fetch` para máximo control
```vue
<script setup>
const page = ref(1);
const limit = ref(10);

const { data: posts, pending, refresh } = await useAsyncData(
  `posts-page-${page.value}`,
  async () => {
    const response = await $fetch('https://jsonplaceholder.typicode.com/posts', {
      params: { _page: page.value, _limit: limit.value }
    });
    
    // Complex additional logic
    const transformedPosts = response.map(post => ({
      ...post,
      excerpt: post.body.substring(0, 100) + '...',
      isFeatured: post.id % 5 === 0
    }));
    
    return transformedPosts;
  },
  { watch: [page, limit] } // Reacts to changes
);
</script>
```

### Paginación con `refresh` y `execute`
```vue
<script setup>
const page = ref(1);
const perPage = 10;

const { data: posts, execute } = await useAsyncData(
  'paginated-posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts', {
    params: { _page: page.value, _limit: perPage }
  }),
  { immediate: false } // It does not run automatically
);

// Change page
const goToPage = (newPage) => {
  page.value = newPage;
  execute(); // Rerun with new parameters
};
</script>
```

### Manejo de errores granular

```vue
<script setup>
const { data: posts, error } = await useAsyncData(
  'posts-with-error-handling',
  async () => {
    try {
      const data = await $fetch('https://jsonplaceholder.typicode.com/posts');
      return data;
    } catch (err) {
      // Custom error handling
      console.error('Error fetching posts:', err);
      throw createError({
        statusCode: 500,
        message: 'No se pudieron cargar los posts'
      });
    }
  }
);
</script>
```

### Múltiples solicitudes paralelas

```vue
<script setup>
const { data: combinedData } = await useAsyncData(
  'dashboard-data',
  async () => {
    const [posts, users, comments] = await Promise.all([
      $fetch('https://jsonplaceholder.typicode.com/posts'),
      $fetch('https://jsonplaceholder.typicode.com/users'),
      $fetch('https://jsonplaceholder.typicode.com/comments')
    ]);
    
    return { posts, users, comments };
  }
);
</script>
```

## Integración con Estado Global

```ts
// composables/useAuthData.ts
export const useAuthData = () => {
  const auth = useAuthStore();
  
  const { data: userProfile, refresh } = await useAsyncData(
    `user-profile-${auth.userId}`,
    () => $fetch(`/api/users/${auth.userId}/profile`),
    { server: false } // Only runs on client
  );
  
  return { userProfile, refresh };
};
```

## Optimización de Rendimiento

### Deduplicación de peticiones

```ts
// Same key = same cache
const { data: post1 } = await useAsyncData('post-1', () => 
  $fetch('https://jsonplaceholder.typicode.com/posts/1')
);

// In another component - use cache instead of new request
const { data: cachedPost } = useNuxtData('post-1');
```

### Prefetching de datos

```ts
// Pre-load data for navigation
const prefetchPosts = async () => {
  await useAsyncData('prefetched-posts', 
    () => $fetch('https://jsonplaceholder.typicode.com/posts'),
    { immediate: false }
  );
};

// Use in hover or anticipation
onMounted(() => {
  const link = document.querySelector('#posts-link');
  link.addEventListener('mouseenter', prefetchPosts);
});
```

## Migración desde `useFetch` a `useAsyncData`

De esto:
```ts
const { data: posts } = await useFetch(
  'https://jsonplaceholder.typicode.com/posts'
);
```

A esto:
```ts
const { data: posts } = await useAsyncData(
  'posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts')
);
```

## Ejemplo Completo: Dashboard con Múltiples Datos

```vue
<script setup>
const filters = reactive({
  category: 'all',
  sortBy: 'date',
  search: ''
});

const { data: dashboardData, pending, refresh } = await useAsyncData(
  'dashboard',
  async () => {
    const [posts, stats, notifications] = await Promise.all([
      $fetch('https://jsonplaceholder.typicode.com/posts'),
      $fetch('/api/stats'),
      $fetch('/api/notifications')
    ]);
    
    // Complex filtering logic
    const filteredPosts = posts.filter(post => {
      if (filters.category !== 'all' && post.category !== filters.category) {
        return false;
      }
      if (filters.search && !post.title.includes(filters.search)) {
        return false;
      }
      return true;
    });
    
    return { posts: filteredPosts, stats, notifications };
  },
  { watch: [() => filters.category, () => filters.search] }
);
</script>
```

## Evita keys genéricas como `data` o `response`

### ¿Por qué?

>Las keys en `useAsyncData` son identificadores únicos para el **sistema de caché de Nuxt**. Si usas keys genéricas, puedes tener conflictos y sobrescribir datos accidentalmente.

### Ejemplo de lo que NO debes hacer
```ts
// ❌ BAD - Key too generic
const { data: posts } = await useAsyncData(
  'data', // Too generic
  () => $fetch('/api/posts')
);

const { data: users } = await useAsyncData(
  'data', // Same key! Overwrites the post cache.
  () => $fetch('/api/users')
);
```

### Ejemplo de lo que SÍ debes hacer

```ts
// ✅ GOOD - Specific and descriptive keys
const { data: posts } = await useAsyncData(
  'posts-list', // Specific for posts
  () => $fetch('/api/posts')
);

const { data: users } = await useAsyncData(
  'active-users', // Specific for users
  () => $fetch('/api/users')
);
```

### Buenas prácticas para naming de keys
```ts
// ✅ Use descriptive and unique names
'user-profile-123'
'blog-posts-page-2'
'dashboard-stats-2024'
'products-category-electronics'

// ✅ Include unique identifiers where necessary
const userId = 123;
await useAsyncData(`user-${userId}-posts`, () => fetchUserPosts(userId));

// ✅ Use consistent naming
'posts-recent'    // For recent posts
'posts-popular'   // For popular posts
'posts-by-category-tech' // For tech category posts
```

### Ventajas de usar keys específicas
1. ✅ **Evita conflictos de caché**
2. ✅ **Permite reutilizar datos** con `useNuxtData()`
3. ✅ **Mejora la depuración** (sabes qué datos estás viendo)
4. ✅ **Facilita el mantenimiento** del código

### Ejemplo de reutilización con keys específicas

```ts
// In a component
const { data: posts } = await useAsyncData(
  'featured-posts',
  () => $fetch('/api/posts/featured')
);

// In another component - Reuses existing cache
const { data: cachedPosts } = useNuxtData('featured-posts');
```

## Mejores Prácticas con `useAsyncData`

1. ✅ **Usa keys descriptivas** para el caché
2. ✅ **Combina con `$fetch`** para máximo control
3. ✅ **Usa `watch`** para reactividad avanzada
4. ✅ `Maneja errores` dentro del handler
5. ✅ **Prefiere `useAsyncData` sobre `useFetch`** cuando necesites lógica compleja
6. ❌ Evita keys genéricas como `data` o `response`


## Conclusión

`useAsyncData` es tu herramienta de nivel intermedio para:

- ✅ **Control granular** sobre el fetching de datos
- ✅ **Lógica compleja** de transformación y combinación
- ✅ **Gestión avanzada** de caché con keys personalizadas
- ✅ **Integración** con estado global y stores


>¿Siguiente paso? [`useNuxtData`](./use-nuxt-data.html) para aprender a manejar y reutilizar el caché de forma eficiente.

