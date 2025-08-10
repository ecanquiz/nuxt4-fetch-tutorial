1. Profundizando en useFetch
¿Por qué empezar aquí?

    Es la opción más usada en Nuxt.

    Automáticamente maneja SSR, carga estados (pending), y errores.

    Similar a axios.get pero con superpoderes de Nuxt.

Ejemplo Práctico Completo

Vamos a fetch posts y usuarios de JSONPlaceholder, con manejo de errores y recarga.
Código:
vue

```
<script setup>
// Fetch básico con estados
const { 
  data: posts, 
  pending, 
  error, 
  refresh 
} = await useFetch('https://jsonplaceholder.typicode.com/posts');

// Con opciones avanzadas
const { data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  lazy: true,                  // Carga después de montar el componente
  transform: (users) => {      // Transforma la respuesta
    return users.map(user => ({ ...user, name: user.name.toUpperCase() }));
  },
  onResponse({ response }) {   // Interceptores
    console.log('Respuesta recibida:', response.status);
  }
});
</script>

<template>
  <div>
    <button @click="refresh">Recargar Posts</button>
    
    <div v-if="pending">Cargando posts...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>

    <h2>Usuarios (transformados):</h2>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
  </div>
</template>
```

Key Points:

    pending: Útil para mostrar loaders.

    refresh: Recarga los datos (equivalente a volver a llamar la API).

    transform: Modifica la respuesta antes de asignarla a data.

    lazy: Evita bloqueo de renderizado (como async setup en Vue).

2. Dominando $fetch (ohmyfetch)
¿Por qué aprender esto?

    Es la herramienta de bajo nivel que usa useFetch internamente.

    Ideal para llamadas programáticas (ej: en stores, actions, o fuera de componentes).

Ejemplo: CRUD con JSONPlaceholder
vue

```
<script setup>
const newPost = ref({ title: '', body: '' });

// CREATE
const createPost = async () => {
  await $fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: newPost.value,
    onResponse({ response }) {
      if (response.status === 201) {
        alert('¡Post creado! (simulado)');
        newPost.value = { title: '', body: '' };
      }
    }
  });
};

// DELETE
const deletePost = async (id) => {
  await $fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'DELETE'
  });
};
</script>

<template>
  <form @submit.prevent="createPost">
    <input v-model="newPost.title" placeholder="Título">
    <textarea v-model="newPost.body" placeholder="Contenido"></textarea>
    <button type="submit">Crear Post</button>
  </form>
</template>
```

Diferencias Clave vs useFetch:
Feature	useFetch	$fetch
Uso	Componentes (template)	Cualquier lugar (JS/TS)
SSR	Automático	Manual (usa useRequestFetch)
Reactividad	Sí (data, pending, etc.)	No (promesa estándar)
Caché	Gestionado por Nuxt	Sin caché automático
3. Combinando useAsyncData + $fetch
¿Cuándo usarlo?

    Cuando necesitas controlar manualmente la clave de caché.

    Para recuperar datos cacheados en múltiples componentes.

Ejemplo:
vue

```
<script setup>
const { data: posts, refresh } = await useAsyncData('unique-posts-key', () => 
  $fetch('https://jsonplaceholder.typicode.com/posts')
);

// En otro componente:
const { data: cachedPosts } = useNuxtData('unique-posts-key'); // ¡Sin nueva llamada API!
</script>
```