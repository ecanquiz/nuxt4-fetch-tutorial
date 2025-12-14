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

### Estado Global Simple

```ts
// composables/useCounter.ts
export const useCounter = () => {
  const count = useState('counter', () => 0);
  
  const increment = () => {
    count.value++;
  };
  
  const decrement = () => {
    count.value--;
  };
  
  const reset = () => {
    count.value = 0;
  };
  
  return { count, increment, decrement, reset };
};
```

```vue
<!-- Componente A -->
<script setup>
const { count, increment } = useCounter();
</script>

<template>
  <div>
    <h2>Componente A</h2>
    <p>Contador: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

```vue
<!-- Componente B -->
<script setup>
const { count, decrement } = useCounter();
</script>

<template>
  <div>
    <h2>Componente B</h2>
    <p>Contador: {{ count }}</p>
    <button @click="decrement">-</button>
  </div>
</template>
```

### Estado de Autenticación

```ts
// composables/useAuth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export const useAuth = () => {
  // Estado global del usuario
  const user = useState<User | null>('auth-user', () => null);
  
  // Estado de autenticación
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  
  // Acciones
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      
      user.value = response.user;
      localStorage.setItem('token', response.token);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const logout = () => {
    user.value = null;
    localStorage.removeItem('token');
    navigateTo('/login');
  };
  
  // Cargar usuario al iniciar
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await $fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        user.value = userData;
      } catch {
        user.value = null;
      }
    }
  };
  
  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    loadUser
  };
};
```

## Patrones Avanzados con `useState`

### Estado Compartido con Tipos Complejos

```ts
// types/todo.ts
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// composables/useTodos.ts
export const useTodos = () => {
  const todos = useState<Todo[]>('todos', () => []);
  
  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date()
    };
    
    todos.value = [...todos.value, newTodo];
  };
  
  const removeTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };
  
  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };
  
  // Computed properties
  const completedTodos = computed(() =>
    todos.value.filter(todo => todo.completed)
  );
  
  const pendingTodos = computed(() =>
    todos.value.filter(todo => !todo.completed)
  );
  
  return {
    todos: readonly(todos),
    completedTodos,
    pendingTodos,
    addTodo,
    removeTodo,
    toggleTodo
  };
};
```

### Estado con Persistencia en LocalStorage

```ts
// composables/usePersistentState.ts
export const usePersistentState = <T>(key: string, defaultValue: T) => {
  // Crear estado global
  const state = useState<T>(key, () => {
    // Intentar cargar desde localStorage
    if (process.client) {
      const saved = localStorage.getItem(`nuxt-state-${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    }
    return defaultValue;
  });
  
  // Guardar cambios en localStorage
  watch(state, (newValue) => {
    if (process.client) {
      localStorage.setItem(`nuxt-state-${key}`, JSON.stringify(newValue));
    }
  }, { deep: true });
  
  // Limpiar localStorage
  const clear = () => {
    state.value = defaultValue;
    if (process.client) {
      localStorage.removeItem(`nuxt-state-${key}`);
    }
  };
  
  return { state, clear };
};

// Uso:
const { state: theme, clear: clearTheme } = usePersistentState<string>(
  'theme',
  'light'
);
```

### Estado de UI/Theme

```ts
// composables/useTheme.ts
type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'system');
  
  const isDark = computed(() => {
    if (theme.value === 'system') {
      return process.client && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.value === 'dark';
  });
  
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    
    // Aplicar clase al body
    if (process.client) {
      document.documentElement.classList.remove('light', 'dark');
      if (newTheme !== 'system') {
        document.documentElement.classList.add(newTheme);
      }
    }
  };
  
  // Inicializar tema
  onMounted(() => {
    setTheme(theme.value);
  });
  
  return { theme, isDark, setTheme };
};
```

## Gestión de Estado para Features Completas

### E-commerce: Carrito de Compras

```ts
// composables/useCart.ts
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export const useCart = () => {
  // Estado global del carrito
  const items = useState<CartItem[]>('cart-items', () => []);
  
  // Computed properties
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );
  
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );
  
  const isEmpty = computed(() => items.value.length === 0);
  
  // Acciones
  const addItem = (product: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) => {
    const existingItem = items.value.find(item => item.productId === product.productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        ...product,
        id: Date.now(),
        quantity
      };
      items.value.push(newItem);
    }
  };
  
  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        removeItem(productId);
      } else {
        item.quantity = quantity;
      }
    }
  };
  
  const removeItem = (productId: number) => {
    items.value = items.value.filter(item => item.productId !== productId);
  };
  
  const clearCart = () => {
    items.value = [];
  };
  
  // Persistencia
  const saveToStorage = () => {
    if (process.client) {
      localStorage.setItem('cart', JSON.stringify(items.value));
    }
  };
  
  const loadFromStorage = () => {
    if (process.client) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        items.value = JSON.parse(saved);
      }
    }
  };
  
  // Inicializar
  onMounted(loadFromStorage);
  watch(items, saveToStorage, { deep: true });
  
  return {
    items: readonly(items),
    totalItems,
    totalPrice,
    isEmpty,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  };
};
```

### Dashboard: Estado Complejo

```ts
// composables/useDashboard.ts
export const useDashboard = () => {
  // Estado principal
  const isLoading = useState('dashboard-loading', () => false);
  const lastUpdated = useState<Date | null>('dashboard-last-updated', () => null);
  const filters = useState<DashboardFilters>('dashboard-filters', () => ({
    dateRange: 'week',
    category: 'all',
    sortBy: 'date'
  }));
  
  // Datos del dashboard
  const stats = useState<DashboardStats>('dashboard-stats', () => ({
    visitors: 0,
    sales: 0,
    conversion: 0,
    revenue: 0
  }));
  
  const charts = useState<ChartData[]>('dashboard-charts', () => []);
  const recentActivities = useState<Activity[]>('dashboard-activities', () => []);
  
  // Acciones
  const fetchDashboardData = async (forceRefresh = false) => {
    isLoading.value = true;
    
    try {
      const [statsData, chartsData, activitiesData] = await Promise.all([
        $fetch('/api/dashboard/stats'),
        $fetch('/api/dashboard/charts'),
        $fetch('/api/dashboard/activities')
      ]);
      
      stats.value = statsData;
      charts.value = chartsData;
      recentActivities.value = activitiesData;
      lastUpdated.value = new Date();
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    filters.value = { ...filters.value, ...newFilters };
    fetchDashboardData(true);
  };
  
  // Computed
  const formattedLastUpdated = computed(() => {
    if (!lastUpdated.value) return 'Nunca';
    return lastUpdated.value.toLocaleTimeString();
  });
  
  // Inicialización
  onMounted(() => {
    if (!lastUpdated.value) {
      fetchDashboardData();
    }
  });
  
  return {
    isLoading: readonly(isLoading),
    filters: readonly(filters),
    stats: readonly(stats),
    charts: readonly(charts),
    recentActivities: readonly(recentActivities),
    formattedLastUpdated,
    fetchDashboardData,
    updateFilters
  };
};
```

## Mejores Prácticas con `useState`

### ✅ HACER:

```ts
// ✅ Keys únicas y descriptivas
useState('app-theme');
useState('user-cart-items');
useState('dashboard-stats');

// ✅ Tipado fuerte
useState<User | null>('auth-user');
useState<Todo[]>('todos', () => []);

// ✅ Readonly para estados públicos
const todos = readonly(useState('todos'));
```

### ❌ NO HACER:

```ts
// ❌ Keys genéricas
useState('data');
useState('state');

// ❌ Mutación directa sin funciones
// En lugar de esto:
state.value.property = 'new'; // ❌

// Mejor:
const updateProperty = (value) => {
  state.value = { ...state.value, property: value };
}; // ✅

// ❌ Estados gigantes
// Mejor separar en múltiples states
```

## Patrón Factory para Estados Dinámicos

```ts
// composables/useStateFactory.ts
export const useStateFactory = <T>(prefix: string) => {
  const states = new Map<string, Ref<T>>();
  
  const getState = (key: string, defaultValue: T) => {
    const fullKey = `${prefix}-${key}`;
    
    if (!states.has(fullKey)) {
      states.set(fullKey, useState<T>(fullKey, () => defaultValue));
    }
    
    return states.get(fullKey)!;
  };
  
  const clearState = (key: string) => {
    const fullKey = `${prefix}-${key}`;
    states.delete(fullKey);
    // Nota: useState no puede ser eliminado, pero podemos limpiar su valor
  };
  
  return { getState, clearState };
};

// Uso:
const modalFactory = useStateFactory<boolean>('modal');
const isLoginModalOpen = modalFactory.getState('login', false);
const isCartModalOpen = modalFactory.getState('cart', false);
```

## Testing con `useState`

```ts
// tests/composables/useCounter.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCounter } from '~/composables/useCounter';

describe('useCounter', () => {
  beforeEach(() => {
    // Limpiar estado global antes de cada test
    useState('counter').value = 0;
  });
  
  it('inicializa en 0', () => {
    const { count } = useCounter();
    expect(count.value).toBe(0);
  });
  
  it('incrementa el contador', () => {
    const { count, increment } = useCounter();
    increment();
    expect(count.value).toBe(1);
  });
});
```

## Migración desde Pinia a `useState`

### Pinia Store:

```ts
// stores/user.ts
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: ''
  }),
  actions: {
    async login(credentials) { /* ... */ },
    logout() { /* ... */ }
  }
});
```

### Equivalente con `useState`:

```ts
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>('auth-user');
  const token = useState<string>('auth-token');
  
  const login = async (credentials) => {
    // ... lógica de login
  };
  
  const logout = () => {
    // ... lógica de logout
  };
  
  return { user, token, login, logout };
};
```

## Conclusión

`useState` es tu herramienta todo-en-uno para:

- ✅ Estado global simple sin overhead
- ✅ Persistencia automática SSR/CSR
- ✅ Integración nativa con Nuxt
- ✅ Alternativa ligera a Pinia/Vuex
