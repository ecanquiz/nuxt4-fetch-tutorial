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