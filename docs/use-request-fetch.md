# Dominando `useRequestFetch`: El Poder del Fetching en SSR

## ¿Qué es useRequestFetch?

`useRequestFetch` es un composable de **Nitro (server-side)** que proporciona una instancia de fetching con el contexto HTTP actual. Es la herramienta para hacer peticiones HTTP **dentro de handlers, middleware o rutas API** con las credenciales correctas del request.

### Características clave:

- ✅ **Solo funciona en servidor** (runtime de Nitro)
- ✅ **Preserva cookies y headers** del request original
- ✅ **Ideal para server-side calls** entre APIs
- ✅ **Manipulación del contexto HTTP**

## ¿Cuándo usar `useRequestFetch`?

Úsalo cuando necesites hacer peticiones HTTP **desde el servidor** manteniendo el contexto del usuario:

1. `Proxy de APIs`: Hacer llamadas a APIs externas desde tu API
2. `BFF (Backend For Frontend)`: Agregar datos de múltiples fuentes
3. `Autenticación`: Mantener sesiones y cookies
4. `Rate limiting`: Controlar peticiones desde el servidor

## Sintaxis Básica

```ts
// Only available in server-side contexts
const data = await useRequestFetch(event)(url, options);
```

### Parámetros:

- `event`: El evento de Nitro (`H3Event`)
- `url`: URL a la que hacer fetch
- `options`: Opciones de fetch (igual que `$fetch`)

## Ejemplo Práctico Básico

```ts
// server/api/proxy/posts.get.ts
export default defineEventHandler(async (event) => {
  // Use useRequestFetch to maintain cookies and headers
  const posts = await useRequestFetch(event)(
    'https://jsonplaceholder.typicode.com/posts'
  );
  
  return { posts };
});
```

## Diferencia Crítica: `$fetch` vs `useRequestFetch`

```ts
// server/api/test.ts
export default defineEventHandler(async (event) => {
  // ❌ $fetch does NOT preserve the request context
  const with$fetch = await $fetch('https://api.example.com/data');
  // Original headers are NOT sent
  
  // ✅ useRequestFetch DOES preserve context
  const withUseRequestFetch = await useRequestFetch(event)(
    'https://api.example.com/data'
  );
  // Headers, cookies, etc. They are preserved
  
  return { with$fetch, withUseRequestFetch };
});
```

## Casos de Uso Avanzados

### Proxy con Autenticación

```ts
// server/api/proxy/secure-data.get.ts
export default defineEventHandler(async (event) => {
  // Verify authentication first
  const session = await getServerSession(event);
  if (!session) {
    throw createError({ statusCode: 401, message: 'No autorizado' });
  }
  
  // Make a request to an external API with authentication headers
  const secureData = await useRequestFetch(event)(
    'https://api.segura.com/data',
    {
      headers: {
        'X-Api-Key': process.env.EXTERNAL_API_KEY
      }
    }
  );
  
  return secureData;
});
```

### Agregación de Datos (BFF Pattern)

```ts
// server/api/dashboard.get.ts
export default defineEventHandler(async (event) => {
  const [posts, users, stats] = await Promise.all([
    // They all maintain the context of the original request
    useRequestFetch(event)('https://jsonplaceholder.typicode.com/posts'),
    useRequestFetch(event)('https://jsonplaceholder.typicode.com/users'),
    useRequestFetch(event)('/api/internal/stats') // API interna
  ]);
  
  return {
    posts: posts.slice(0, 5),
    users: users.slice(0, 3),
    stats
  };
});
```

### Rate Limiting y Cache en Servidor

```ts
// server/api/cached-posts.get.ts
import { createStorage } from 'unstorage';

const storage = createStorage();

export default defineEventHandler(async (event) => {
  const cacheKey = 'posts-cache';
  const cached = await storage.getItem(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  // Fetch with rate limiting
  const posts = await useRequestFetch(event)(
    'https://jsonplaceholder.typicode.com/posts',
    {
      // Custom rate limiting
      retry: 2,
      retryDelay: 1000
    }
  );
  
  // Caching for 5 minutes
  await storage.setItem(cacheKey, posts, { ttl: 300000 });
  
  return posts;
});
```

### Manipulación de Headers

```ts
// server/api/proxy-with-headers.get.ts
export default defineEventHandler(async (event) => {
  // Obtener headers del request original
  const originalHeaders = getHeaders(event);
  
  const response = await useRequestFetch(event)(
    'https://api.externa.com/data',
    {
      headers: {
        // Pass specific headers
        'Authorization': originalHeaders.authorization,
        'User-Agent': 'Nuxt-App/1.0',
        // Delete or modify headers
        'Cookie': undefined, // Do not pass cookies
        'X-Custom-Header': 'value-modified'
      }
    }
  );
  
  return response;
});
```

## Manejo de Errores en Servidor

```ts
// server/api/robust-proxy.get.ts
export default defineEventHandler(async (event) => {
  try {
    const data = await useRequestFetch(event)(
      'https://jsonplaceholder.typicode.com/posts/9999'
    );
    return data;
  } catch (error: any) {
    // Detailed server log
    console.error('Proxy error:', {
      url: error.url,
      status: error.statusCode,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Controlled error response
    throw createError({
      statusCode: error.statusCode || 502,
      message: `Service error: ${error.message}`
    });
  }
});
```

## `Middleware` con `useRequestFetch`

```ts
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Verify token on each request
  const authHeader = getHeader(event, 'authorization');
  
  if (authHeader) {
    try {
      // Validate token with authentication service
      const userData = await useRequestFetch(event)(
        `${process.env.AUTH_SERVICE}/validate-token`,
        {
          headers: { authorization: authHeader }
        }
      );
      
      // Add user data to context
      event.context.user = userData;
    } catch (error) {
      console.warn('Invalid token:', error);
    }
  }
});
```

## Testing y Mocking

```ts
// server/api/test-proxy.ts
import { defineEventHandler } from 'h3';

// Mock for development
const isDev = process.env.NODE_ENV === 'development';

export default defineEventHandler(async (event) => {
  if (isDev) {
    // Mock data for development
    return {
      mocked: true,
      data: [
        { id: 1, name: 'Mock Item 1' },
        { id: 2, name: 'Mock Item 2' }
      ]
    };
  }
  
  // Production: real call
  const realData = await useRequestFetch(event)(
    'https://api.real.com/data'
  );
  
  return realData;
});
```

## Configuración Global de Proxy

```ts
// server/utils/proxy.ts
export const createProxy = (baseURL: string) => {
  return defineEventHandler(async (event) => {
    const path = getRouterParam(event, 'path');
    const method = event.method;
    
    // Rebuild destination URL
    const targetURL = `${baseURL}/${path}`;
    
    // Get body if it's POST/PUT
    const body = method !== 'GET' && method !== 'HEAD' 
      ? await readBody(event) 
      : undefined;
    
    // Proxy request
    return useRequestFetch(event)(targetURL, {
      method,
      body,
      headers: getHeaders(event)
    });
  });
};

// Use on routes
// server/api/proxy/[...path].ts
export default createProxy('https://jsonplaceholder.typicode.com');
```

## Performance y Optimización

```ts
// server/api/optimized-posts.get.ts
export default defineEventHandler(async (event) => {
  // HTTP cache control
  const cached = await getCached(event, 'posts');
  if (cached) {
    setHeader(event, 'X-Cache', 'HIT');
    return cached;
  }
  
  // Optimized fetch
  const startTime = Date.now();
  const posts = await useRequestFetch(event)(
    'https://jsonplaceholder.typicode.com/posts',
    {
      // Aggressive timeout
      timeout: 3000,
      // Only required fields
      query: { _limit: '20', _fields: 'id,title,userId' }
    }
  );
  
  const duration = Date.now() - startTime;
  setHeader(event, 'X-Response-Time', `${duration}ms`);
  
  // Caching response
  await cacheResponse(event, 'posts', posts, 60000); // 1 minuto
  
  setHeader(event, 'X-Cache', 'MISS');
  return posts;
});
```

## Seguridad y Best Practices

```ts
// server/api/secure-proxy.get.ts
export default defineEventHandler(async (event) => {
  // Validate destination URL
  const target = getQuery(event).url as string;
  
  if (!target || !isAllowedDomain(target)) {
    throw createError({
      statusCode: 400,
      message: 'URL not allowed'
    });
  }
  
  // Limit response size
  const maxSize = 1024 * 1024; // 1MB
  const response = await useRequestFetch(event)(target, {
    onResponse({ response }) {
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > maxSize) {
        throw createError({
          statusCode: 413,
          message: 'Too big an answer'
        });
      }
    }
  });
  
  // Sanitize response
  return sanitizeResponse(response);
});
```

## Ejemplo Completo: API Gateway

```ts
// server/api/gateway/[...path].ts
export default defineEventHandler(async (event) => {
  const services = {
    posts: 'https://jsonplaceholder.typicode.com',
    users: 'https://reqres.in/api',
    internal: process.env.INTERNAL_API_URL
  };
  
  const path = getRouterParam(event, 'path')?.split('/') || [];
  const serviceName = path[0];
  const servicePath = path.slice(1).join('/');
  
  if (!services[serviceName]) {
    throw createError({
      statusCode: 404,
      message: `Service ${serviceName} not found`
    });
  }
  
  // Proxy to the corresponding service
  const targetURL = `${services[serviceName]}/${servicePath}`;
  const method = event.method;
  
  const response = await useRequestFetch(event)(targetURL, {
    method,
    headers: {
      // Pass necessary headers
      'Authorization': getHeader(event, 'authorization'),
      'Content-Type': getHeader(event, 'content-type'),
      // Do not pass cookies between services
      'Cookie': undefined
    },
    // Pass body to POST/PUT/PATCH
    body: ['POST', 'PUT', 'PATCH'].includes(method) 
      ? await readBody(event).catch(() => undefined)
      : undefined
  });
  
  // Add response headers
  setHeader(event, 'X-Service', serviceName);
  setHeader(event, 'X-Cached', 'false');
  
  return response;
});
```

## Conclusión

`useRequestFetch` es tu herramienta de servidor para:

- ✅ Proxy de APIs manteniendo contexto
- ✅ BFF Patterns agregando datos
- ✅ Autenticación preservando sesiones
- ✅ Rate limiting y control de peticiones
