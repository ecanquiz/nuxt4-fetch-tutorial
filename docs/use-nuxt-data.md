# Dominando `useNuxtData`: Caché Inteligente y Reutilización Eficiente

## ¿Qué es `useNuxtData`?

`useNuxtData` es un composable que te permite acceder y manipular datos cacheados previamente por `useAsyncData` o `useFetch`. Es la clave para optimizar tu aplicación evitando peticiones duplicadas.

### Características clave:

- ✅ **Acceso directo** al caché de Nuxt
- ✅ **Sin nuevas peticiones** HTTP
- ✅ **Datos reactivos** inmediatos
- ✅ **Gestión centralizada** del estado de datos

## Sintaxis Básica

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

## Ejemplo Práctico Básico

```vue
<!-- components/PostsList.vue -->
<script setup>
// First load - makes the HTTP request
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
// Reuse the cache - NO new HTTP request
const { data: cachedPosts } = useNuxtData('featured-posts');
</script>

<template>
  <div>
    <h3>Estadísticas</h3>
    <p>Total de posts: {{ cachedPosts?.length || 0 }}</p>
  </div>
</template>
```

## Patrones Avanzados con `useNuxtData`

### Preload Pattern - Carga anticipada

```vue
<!-- pages/posts/index.vue -->
<script setup>
// Initial post load
const { data: posts } = await useAsyncData(
  'all-posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts')
);
</script>

<template>
  <div>
    <PostsList />
    <PostStats />
    <!-- More components that use the same posts -->
  </div>
</template>
```

### Conditional Cache Access - Acceso condicional

```vue
<script setup>
const route = useRoute();

// Try using the cache first; if it doesn't exist, load it
const { data: cachedPosts } = useNuxtData('all-posts');

const { data: posts } = await useAsyncData(
  'all-posts',
  () => $fetch('https://jsonplaceholder.typicode.com/posts'),
  {
    immediate: !cachedPosts.value // Only load if there is no cache
  }
);
</script>
```

### Cache Invalidation - Invalidación manual

```vue
<script setup>
const { data: posts, refresh } = await useAsyncData(
  'user-posts',
  () => $fetch('/api/posts')
);

const { clear: clearCache } = useNuxtData('user-posts');

const forceRefresh = async () => {
  // Option 1: Clear cache and reload
  clearCache();
  await refresh();
  
  // Opción 2: Just reload (automatically updates cache)
  // await refresh();
};
</script>
```

## Gestión de Estado de Caché

```vue
<script setup>
const { data: posts, status, error } = useNuxtData('featured-posts');

// Cache status
const cacheStatus = computed(() => {
  switch (status.value) {
    case 'idle': return 'No cargado';
    case 'pending': return 'Cargando...';
    case 'success': return `Cargado (${posts.value?.length} items)`;
    case 'error': return `Error: ${error.value?.message}`;
    default: return 'Desconocido';
  }
});
</script>

<template>
  <div>
    <p>Estado del caché: {{ cacheStatus }}</p>
    <div v-if="status === 'success'">
      <!-- Show cached data -->
    </div>
  </div>
</template>
```

## Estrategias de Revalidación de Caché

### Time-based Revalidation

```ts
// composables/useCachedData.ts
export const useCachedData = (key: string, fetcher: Function, ttl: number = 30000) => {
  const { data, clear } = useNuxtData(key);
  
  const loadData = async () => {
    const lastUpdated = useState(`${key}-last-updated`, () => 0);
    const now = Date.now();
    
    if (!data.value || (now - lastUpdated.value) > ttl) {
      // Load new data if the cache has expired
      const result = await useAsyncData(key, fetcher);
      lastUpdated.value = now;
      return result;
    }
    
    // Use existing cache
    return { data };
  };
  
  return { loadData, clear };
};
```

### Event-based Revalidation

```ts
// Composable for event-reactive caching
export const useReactiveCache = (key: string, fetcher: Function) => {
  const { data, clear } = useNuxtData(key);
  
  // Listen for global events to invalidate cache
  const nuxtApp = useNuxtApp();
  
  nuxtApp.hook('app:mounted', () => {
    // Revalidate when the app is mounted
  });
  
  // Invalidate when certain actions occur
  const invalidateOnAction = () => {
    clear();
    // Optional: recharge immediately
    useAsyncData(key, fetcher);
  };
  
  return { data, invalidateOnAction };
};
```

## Ejemplo Completo: Dashboard con Caché Optimizado

### Estructura del proyecto:

```text
composables/
  ├── useDashboardCache.ts
  ├── usePostsCache.ts
components/
  ├── Dashboard.vue
  ├── PostList.vue
  ├── UserStats.vue
```

### `composables/usePostsCache.ts`

```ts
export const usePostsCache = () => {
  const postsKey = 'all-posts';
  
  // Load posts (with cache)
  const loadPosts = async (forceRefresh = false) => {
    const { data: cachedPosts, clear } = useNuxtData(postsKey);
    
    if (forceRefresh) {
      clear();
    }
    
    const { data: posts } = await useAsyncData(
      postsKey,
      () => $fetch('https://jsonplaceholder.typicode.com/posts'),
      {
        immediate: !cachedPosts.value || forceRefresh
      }
    );
    
    return posts;
  };
  
  // Access cached posts
  const getCachedPosts = () => {
    const { data: posts } = useNuxtData(postsKey);
    return posts;
  };
  
  // Clear post cache
  const clearPostsCache = () => {
    const { clear } = useNuxtData(postsKey);
    clear();
  };
  
  return { loadPosts, getCachedPosts, clearPostsCache };
};
```

### `components/Dashboard.vue`

```vue
<script setup>
const { loadPosts, getCachedPosts, clearPostsCache } = usePostsCache();

// Load posts on mount (only if there is no cache)
onMounted(async () => {
  await loadPosts();
});

const posts = getCachedPosts();

const handleRefresh = async () => {
  await loadPosts(true); // Forces recharging
};
</script>

<template>
  <div>
    <div class="controls">
      <button @click="handleRefresh">🔄 Actualizar Posts</button>
      <button @click="clearPostsCache">🗑️ Limpiar Caché</button>
    </div>
    
    <PostList :posts="posts" />
    <UserStats :posts="posts" />
  </div>
</template>
```

## Patrones Avanzados de Composición

### Cache Manager Global

```ts
// composables/useCacheManager.ts
export const useCacheManager = () => {
  const cacheRegistry = ref(new Set<string>());
  
  const registerCache = (key: string) => {
    cacheRegistry.value.add(key);
  };
  
  const clearAllCache = () => {
    cacheRegistry.value.forEach(key => {
      const { clear } = useNuxtData(key);
      clear();
    });
  };
  
  const clearByPattern = (pattern: RegExp) => {
    cacheRegistry.value.forEach(key => {
      if (pattern.test(key)) {
        const { clear } = useNuxtData(key);
        clear();
      }
    });
  };
  
  return { registerCache, clearAllCache, clearByPattern };
};
```

### Uso del Cache Manager

```ts
// In any component
const cacheManager = useCacheManager();

// Register cache
cacheManager.registerCache('user-posts');
cacheManager.registerCache('user-profile');

// Clear all cache
const clearAll = () => {
  cacheManager.clearAllCache();
};

// Clear user cache
const clearUserCache = () => {
  cacheManager.clearByPattern(/^user-/);
};
```

## Mejores Prácticas con `useNuxtData`

✅ **HACER:**
```ts
// ✅ Specific and descriptive keys
useNuxtData('user-123-posts');

// ✅ Reuse across multiple components
const { data: posts } = useNuxtData('featured-posts');

// ✅ Check existence before use
if (cachedData.value) {
  // Usar datos cacheados
}

// ✅ Clear cache when no longer needed
onUnmounted(() => {
  clearCache();
});
```

❌ **NO HACER:**
```ts
// ❌ Generic keys
useNuxtData('data');

// ❌ Assuming there is always data
console.log(cachedData.value.length); // It can be undefined

// ❌ Modify the cache directly
cachedData.value[0].title = 'Modificado'; // It's best to use update features
```

## Métricas y Debugging

```vue
<script setup>
// Debug component for monitoring cache
const cacheKeys = ['featured-posts', 'user-profile', 'dashboard-stats'];

const cacheInfo = computed(() => {
  return cacheKeys.map(key => {
    const { data, status } = useNuxtData(key);
    return {
      key,
      status: status.value,
      itemCount: data.value?.length || 0,
      hasData: !!data.value
    };
  });
});
</script>

<template>
  <div class="cache-debug">
    <h4>Estado del Caché</h4>
    <div v-for="info in cacheInfo" :key="info.key" class="cache-item">
      <span>{{ info.key }}</span>
      <span :class="info.status">{{ info.status }}</span>
      <span>{{ info.itemCount }} items</span>
    </div>
  </div>
</template>
```

## Conclusión

`useNuxtData` es tu arma secreta para:
- ✅ Optimizar rendimiento evitando peticiones duplicadas
- ✅ Compartir estado entre componentes sin prop drilling
- ✅ Gestionar memoria limpiando caché cuando no se necesita
- ✅ Mejorar UX con carga instantánea de datos cacheados

¿Siguiente paso? `useRequestFetch` para el manejo avanzado en SSR.