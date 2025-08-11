import{_ as a,c as n,o as p,ae as e}from"./chunks/framework.CTSr6h5v.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"use-fetch-back.md","filePath":"use-fetch-back.md"}'),t={name:"use-fetch-back.md"};function l(o,s,c,i,r,u){return p(),n("div",null,s[0]||(s[0]=[e(`<ol><li><p>Profundizando en useFetch ¿Por qué empezar aquí?</p><p>Es la opción más usada en Nuxt.</p><p>Automáticamente maneja SSR, carga estados (pending), y errores.</p><p>Similar a axios.get pero con superpoderes de Nuxt.</p></li></ol><p>Ejemplo Práctico Completo</p><p>Vamos a fetch posts y usuarios de JSONPlaceholder, con manejo de errores y recarga. Código: vue</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;script setup&gt;</span></span>
<span class="line"><span>// Fetch básico con estados</span></span>
<span class="line"><span>const { </span></span>
<span class="line"><span>  data: posts, </span></span>
<span class="line"><span>  pending, </span></span>
<span class="line"><span>  error, </span></span>
<span class="line"><span>  refresh </span></span>
<span class="line"><span>} = await useFetch(&#39;https://jsonplaceholder.typicode.com/posts&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Con opciones avanzadas</span></span>
<span class="line"><span>const { data: users } = await useFetch(&#39;https://jsonplaceholder.typicode.com/users&#39;, {</span></span>
<span class="line"><span>  lazy: true,                  // Carga después de montar el componente</span></span>
<span class="line"><span>  transform: (users) =&gt; {      // Transforma la respuesta</span></span>
<span class="line"><span>    return users.map(user =&gt; ({ ...user, name: user.name.toUpperCase() }));</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  onResponse({ response }) {   // Interceptores</span></span>
<span class="line"><span>    console.log(&#39;Respuesta recibida:&#39;, response.status);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span>&lt;/script&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&lt;template&gt;</span></span>
<span class="line"><span>  &lt;div&gt;</span></span>
<span class="line"><span>    &lt;button @click=&quot;refresh&quot;&gt;Recargar Posts&lt;/button&gt;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    &lt;div v-if=&quot;pending&quot;&gt;Cargando posts...&lt;/div&gt;</span></span>
<span class="line"><span>    &lt;div v-else-if=&quot;error&quot;&gt;Error: {{ error.message }}&lt;/div&gt;</span></span>
<span class="line"><span>    &lt;ul v-else&gt;</span></span>
<span class="line"><span>      &lt;li v-for=&quot;post in posts&quot; :key=&quot;post.id&quot;&gt;{{ post.title }}&lt;/li&gt;</span></span>
<span class="line"><span>    &lt;/ul&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;h2&gt;Usuarios (transformados):&lt;/h2&gt;</span></span>
<span class="line"><span>    &lt;ul&gt;</span></span>
<span class="line"><span>      &lt;li v-for=&quot;user in users&quot; :key=&quot;user.id&quot;&gt;{{ user.name }}&lt;/li&gt;</span></span>
<span class="line"><span>    &lt;/ul&gt;</span></span>
<span class="line"><span>  &lt;/div&gt;</span></span>
<span class="line"><span>&lt;/template&gt;</span></span></code></pre></div><p>Key Points:</p><pre><code>pending: Útil para mostrar loaders.

refresh: Recarga los datos (equivalente a volver a llamar la API).

transform: Modifica la respuesta antes de asignarla a data.

lazy: Evita bloqueo de renderizado (como async setup en Vue).
</code></pre><ol start="2"><li><p>Dominando $fetch (ohmyfetch) ¿Por qué aprender esto?</p><p>Es la herramienta de bajo nivel que usa useFetch internamente.</p><p>Ideal para llamadas programáticas (ej: en stores, actions, o fuera de componentes).</p></li></ol><p>Ejemplo: CRUD con JSONPlaceholder vue</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;script setup&gt;</span></span>
<span class="line"><span>const newPost = ref({ title: &#39;&#39;, body: &#39;&#39; });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// CREATE</span></span>
<span class="line"><span>const createPost = async () =&gt; {</span></span>
<span class="line"><span>  await $fetch(&#39;https://jsonplaceholder.typicode.com/posts&#39;, {</span></span>
<span class="line"><span>    method: &#39;POST&#39;,</span></span>
<span class="line"><span>    body: newPost.value,</span></span>
<span class="line"><span>    onResponse({ response }) {</span></span>
<span class="line"><span>      if (response.status === 201) {</span></span>
<span class="line"><span>        alert(&#39;¡Post creado! (simulado)&#39;);</span></span>
<span class="line"><span>        newPost.value = { title: &#39;&#39;, body: &#39;&#39; };</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// DELETE</span></span>
<span class="line"><span>const deletePost = async (id) =&gt; {</span></span>
<span class="line"><span>  await $fetch(\`https://jsonplaceholder.typicode.com/posts/\${id}\`, {</span></span>
<span class="line"><span>    method: &#39;DELETE&#39;</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span>&lt;/script&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&lt;template&gt;</span></span>
<span class="line"><span>  &lt;form @submit.prevent=&quot;createPost&quot;&gt;</span></span>
<span class="line"><span>    &lt;input v-model=&quot;newPost.title&quot; placeholder=&quot;Título&quot;&gt;</span></span>
<span class="line"><span>    &lt;textarea v-model=&quot;newPost.body&quot; placeholder=&quot;Contenido&quot;&gt;&lt;/textarea&gt;</span></span>
<span class="line"><span>    &lt;button type=&quot;submit&quot;&gt;Crear Post&lt;/button&gt;</span></span>
<span class="line"><span>  &lt;/form&gt;</span></span>
<span class="line"><span>&lt;/template&gt;</span></span></code></pre></div><p>Diferencias Clave vs useFetch: Feature useFetch $fetch Uso Componentes (template) Cualquier lugar (JS/TS) SSR Automático Manual (usa useRequestFetch) Reactividad Sí (data, pending, etc.) No (promesa estándar) Caché Gestionado por Nuxt Sin caché automático 3. Combinando useAsyncData + $fetch ¿Cuándo usarlo?</p><pre><code>Cuando necesitas controlar manualmente la clave de caché.

Para recuperar datos cacheados en múltiples componentes.
</code></pre><p>Ejemplo: vue</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;script setup&gt;</span></span>
<span class="line"><span>const { data: posts, refresh } = await useAsyncData(&#39;unique-posts-key&#39;, () =&gt; </span></span>
<span class="line"><span>  $fetch(&#39;https://jsonplaceholder.typicode.com/posts&#39;)</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// En otro componente:</span></span>
<span class="line"><span>const { data: cachedPosts } = useNuxtData(&#39;unique-posts-key&#39;); // ¡Sin nueva llamada API!</span></span>
<span class="line"><span>&lt;/script&gt;</span></span></code></pre></div>`,13)]))}const g=a(t,[["render",l]]);export{m as __pageData,g as default};
