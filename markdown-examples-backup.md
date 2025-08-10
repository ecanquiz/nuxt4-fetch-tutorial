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

`useFetch` (Recomendado para datos dinámicos)

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
  lazy: true,       // Carga después de montar el componente
  server: false,    // Solo ejecuta en cliente
  pick: ['title'],  // Solo trae campos específicos
});
```

# Markdown Extension Examples

This page demonstrates some of the built-in markdown extensions provided by VitePress.

## Syntax Highlighting

VitePress provides Syntax Highlighting powered by [Shiki](https://github.com/shikijs/shiki), with additional features like line-highlighting:

**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## More

Check out the documentation for the [full list of markdown extensions](https://vitepress.dev/guide/markdown).
