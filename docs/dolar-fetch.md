
# Dominando $fetch en Nuxt 4
>La Herramienta de Bajo Nivel

## Ejemplo básico
```ts
const posts = await $fetch('https://api.example.com/posts');
```

## ¿Qué es $fetch?

>[`$fetch`](https://nuxt.com/docs/4.x/api/utils/dollarfetch) es la función base de Nuxt para peticiones HTTP, basada en  [ofetch](https://github.com/unjs/ofetch). A diferencia de [useFetch](./use-fetch.html), es una función pura de JavaScript sin reactividad integrada.


### Características clave:

- ✅ Funciona en cliente y servidor (isomórfica)
- ✅ Sintaxis similar a [fetch nativo](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) pero con mejoras
- ✅ Sin estados reactivos (`pending`, `error` automáticos)
- ✅ Ideal para **lógica de negocio**, stores y acciones

:::tip
Usar `$fetch` en componentes sin encapsularlo con `useAsyncData` provoca la doble obtención de datos: primero en el servidor y luego en el cliente durante la hidratación, ya que `$fetch` no transfiere el estado del servidor al cliente. Por lo tanto, la obtención se ejecutará en ambos lados, ya que el cliente debe obtener los datos de nuevo.
:::

## Sintaxis Básica

```ts
const data = await $fetch(url, options);
```

### Ejemplo práctico

```ts
// In a component, composable or store
const posts = await $fetch('https://jsonplaceholder.typicode.com/posts');

// With error handling
try {
  const user = await $fetch('https://jsonplaceholder.typicode.com/users/1');
  console.log(user);
} catch (error) {
  console.error('Error fetching user:', error);
}
```

## Diferencias Clave: `$fetch` vs `useFetch`

- **Nivel más bajo**: No tiene estados reactivos (`pending`, `error`).
- **Flexible**: Útil en stores, middleware, o cualquier lógica JS/TS.
- **Interceptores**: Permite personalización global (como Axios).


|Característica|`$fetch`|`useFetch`|
|-|-|-|
|Reactividad|❌ No|✅ Sí (`data`, `pending`, `error`)|
|SSR Automático|✅ Sí|✅ Sí|
|Caché Automático|`❌ No`|✅ Sí|
|Uso Recomendado|Lógica programática|Componentes Vue|
|Interceptores|✅ Sí (globales)|❌ Limitado|

## Opciones de Configuración

### Métodos HTTP y Body

```ts
// POST request
const newPost = await $fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  body: {
    title: 'My new post',
    body: 'Post content',
    userId: 1
  }
});

// PUT request
const updatedPost = await $fetch('https://jsonplaceholder.typicode.com/posts/1', {
  method: 'PUT',
  body: {
    id: 1,
    title: 'Updated title',
    body: 'Updated content',
    userId: 1
  }
});

// DELETE request
await $fetch('https://jsonplaceholder.typicode.com/posts/1', {
  method: 'DELETE'
});
```

### Headers Personalizados

```ts
const data = await $fetch('https://api.example.com/protected', {
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Custom-Header': 'personalized value'
  }
});
```

### Tiempo de espera y reintentos

```ts
const data = await $fetch('https://api.example.com/data', {
  timeout: 5000, // 5 seconds
  retry: 3,      // 3 attempts in case of error
  retryDelay: 1000 // 1 second between attempts
});
```

## Patrones Avanzados con `$fetch`

### Crear Instancia Personalizada

```ts
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    headers: {
      'Content-Type': 'application/json'
    },
    async onRequest({ request, options }) {
      // Add authentication token
      const token = localStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        };
      }
    },
    async onResponseError({ response }) {
      // Global error handling
      if (response.status === 401) {
        // Redirect to login
        navigateTo('/login');
      }
    }
  });

  return { provide: { api } };
});
```

### Uso de la Instancia Personalizada:

```ts
const { $api } = useNuxtApp();

// In any component or composable
const posts = await $api('/posts');
const user = await $api('/users/1', {
  method: 'POST',
  body: { name: 'New user' }
});
```

### Combinar con [`useAsyncData`](./use-async-data.html) para Reactividad

```vue
<script setup>
const { data: posts, refresh } = await useAsyncData('posts', () => 
  $fetch('https://jsonplaceholder.typicode.com/posts')
);

const deletePost = async (id) => {
  await $fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'DELETE'
  });
  refresh(); // Refresh data after deletion
};
</script>
```

### Uso en Stores ([Pinia](https://ecanquiz.github.io/proven-pinia-patterns/))

```ts
// stores/posts.ts
export const usePostsStore = defineStore('posts', () => {
  const posts = ref([]);
  
  const fetchPosts = async () => {
    posts.value = await $fetch('https://jsonplaceholder.typicode.com/posts');
  };
  
  const createPost = async (postData) => {
    const newPost = await $fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: postData
    });
    posts.value.push(newPost);
  };
  
  return { posts, fetchPosts, createPost };
});
```

## Manejo de Errores Detallado

```ts
try {
  const data = await $fetch('https://jsonplaceholder.typicode.com/invalid-endpoint', {
    retry: 2,
    onRequestError({ error }) {
      console.error('Error in request:', error);
    },
    onResponseError({ response }) {
      console.error('Error in response:', response.status, response.statusText);
    }
  });
} catch (error) {
  if (error.statusCode === 404) {
    console.error('Resource not found');
  } else if (error.statusCode === 500) {
    console.error('Server error');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Migración desde [Axios](https://axios-http.com/)

Si vienes de Axios, aquí las equivalencias:

### Interceptores Axios → `$fetch`

```ts
// Axios
axios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// $fetch equivalent
const api = $fetch.create({
  async onRequest({ options }) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem('token')}`
    };
  }
});
```

### Métodos Comunes

```ts
// Axios
await axios.get('/posts');
await axios.post('/posts', data);
await axios.put('/posts/1', data);
await axios.delete('/posts/1');

// $fetch
await $fetch('/posts');
await $fetch('/posts', { method: 'POST', body: data });
await $fetch('/posts/1', { method: 'PUT', body: data });
await $fetch('/posts/1', { method: 'DELETE' });
```

## Mejores Prácticas con `$fetch`
- ✅ Centraliza la configuración con `$fetch.create()`
- ✅ Usa `try/catch` para manejo de errores explícito
- ✅ Combina con `useAsyncData` cuando necesites reactividad
- ✅ Usa en stores/composables para lógica reutilizable
- ❌ Evita usar directamente en `templates` (mejor usar `useFetch`)

## Ejemplo Completo: CRUD con `$fetch`

```ts
// composables/usePosts.ts
export const usePosts = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase;

  const fetchAll = () => $fetch(`${baseURL}/posts`);
  
  const fetchOne = (id: number) => $fetch(`${baseURL}/posts/${id}`);
  
  const create = (postData: any) => $fetch(`${baseURL}/posts`, {
    method: 'POST',
    body: postData
  });
  
  const update = (id: number, postData: any) => $fetch(`${baseURL}/posts/${id}`, {
    method: 'PUT',
    body: postData
  });
  
  const remove = (id: number) => $fetch(`${baseURL}/posts/${id}`, {
    method: 'DELETE'
  });

  return { fetchAll, fetchOne, create, update, remove };
};
```

## Conclusión

`$fetch` es tu herramienta de bajo nivel para:
- ✅ Lógica programática compleja
- ✅ Stores y composables
- ✅ Personalización avanzada (interceptores)
- ✅ Migración desde Axios

>¿Siguiente paso? [`useAsyncData`](./use-async-data.html) para combinar la potencia de `$fetch` con la reactividad de Nuxt.

