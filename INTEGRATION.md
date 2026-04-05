# 🔌 Integración Frontend ↔ API

## Estado: ✅ CONECTADO

---

## URLs

| Servicio | URL |
|----------|-----|
| **API** | https://ergonomia-api-production.up.railway.app |
| **Web** | file:// (local) → Próximamente GitHub Pages |

---

## Configuración

### API (Railway)
```bash
# Variables configuradas:
DATABASE_URL=postgresql://...
JWT_SECRET=***
ENV=production
ALLOWED_ORIGINS=*   # Permite CORS desde cualquier origen
```

### Frontend (main.js)
```javascript
const API_CONFIG = {
    baseUrl: 'https://ergonomia-api-production.up.railway.app',
    endpoints: {
        products: '/api/v1/products',
        auth: { login: '/api/v1/auth/login', register: '/api/v1/auth/register' },
        favorites: '/api/v1/favorites',
        me: '/api/v1/me'
    }
};
```

---

## Funcionalidades Implementadas

### ✅ Carga Dinámica de Productos
- Los productos se cargan desde `/api/v1/products`
- Se muestra indicador de carga mientras se obtienen datos
- Formato de precios en euros (€)
- Emojis según categoría/subcategoría

### ✅ Sistema de Autenticación
- Login con JWT
- Registro de usuarios
- Token almacenado en localStorage
- Perfil de usuario cargado al iniciar

### ✅ UI/UX
- Animaciones de carga
- Notificaciones toast
- Mensajes de error con botón de reintentar
- Animaciones en tarjetas de productos

---

## Próximos Pasos

1. 🚀 **Deploy frontend** en GitHub Pages / Netlify / Vercel
2. 🎨 **Páginas de auth**: Crear login.html y registro.html
3. ⭐ **Favoritos**: Agregar/quitar productos de favoritos
4. 👤 **Perfil**: Página de perfil de usuario
5. 🛒 **Comparador**: Usar el endpoint de comparaciones

---

## Test Manual

Abrir `index.html` en el navegador. Los productos deberían cargar automáticamente desde la API.

Si hay errores, revisar:
1. Consola del navegador (F12)
2. Que la API esté respondiendo: https://ergonomia-api-production.up.railway.app/health
