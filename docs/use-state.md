# Dominando `useState` en Nuxt 4: Estado Global Reactivo y Simple

## ¿Qué es `useState` en Nuxt?

`useState` es el composable de Nuxt para manejar estado global y persistente entre componentes. Es la alternativa moderna y más simple a Pinia/Vuex, integrada directamente en Nuxt.

### Características clave:

- ✅ **Estado global** compartido entre componentes
- ✅ **Persistencia automática** entre renders (SSR/CSR)
- ✅ **Tipeo TypeScript** nativo
- ✅ **No requiere stores** adicionales
- ✅ **Integración perfecta** con el ecosistema Nuxt

## Sintaxis Básica

```ts
const state = useState<T>(key, initFn);
```

### Parámetros:

- `key`: String único para identificar el estado (obligatorio)
- `initFn`: Función que devuelve el valor inicial (opcional)

### Retorno:

- Ref reactivo con el valor del estado

## Diferencia: `useState` vs `ref` vs Pinia

|Característica|`useState`|`ref`|Pinia|
|-|-|-|-|
|**Alcance**|Global (app)|Local (componente)|Global|
|**Persistencia**|✅ Entre renders|❌ Solo en componente|✅|
|**SSR**|✅ Perfecto|⚠️ Necesita adaptación|⚠️ Necesita adaptación|
|**Complejidad**|Simple|Muy simple|Complejo|
|**DevTools**|❌ No|❌ No|✅ Sí|

## Ejemplos Prácticos
