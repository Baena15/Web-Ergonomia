# 🚀 Deploy en GitHub Pages - Guía Rápida

## Paso 1: Verificar que el código está en GitHub

El código ya está subido a:
- **Repo**: https://github.com/Baena15/Web-Ergonomia

## Paso 2: Configurar GitHub Pages (2 minutos)

### Opción A: Desde la web de GitHub

1. **Ir al repo**: Ve a https://github.com/Baena15/Web-Ergonomia

2. **Settings** → Click en la pestaña **"Settings"** (arriba a la derecha)

3. **Pages** → En el menú lateral izquierdo, click en **"Pages"**

4. **Source** → En "Build and deployment":
   - **Source**: Selecciona "Deploy from a branch"
   - **Branch**: Selecciona `main` y carpeta `/ (root)`
   - Click **"Save"**

5. **Esperar** → En 1-2 minutos GitHub generará la URL

### Opción B: Desde GitHub Desktop (más fácil)

Si tienes GitHub Desktop instalado, simplemente haz push del código y luego configura Pages desde la web.

---

## Paso 3: Obtener la URL

Después de guardar, GitHub te dará una URL como:
```
https://baena15.github.io/Web-Ergonomia/
```

Esta será la URL de tu web pública.

---

## Paso 4: Actualizar API (si es necesario)

Una vez tengas la URL de GitHub Pages, debes agregarla a la API para CORS:

```bash
cd ergonomia-api
railway variables --service ergonomia-api --set "ALLOWED_ORIGINS=https://baena15.github.io,http://localhost:8080"
```

---

## ✅ Verificación

Abre tu URL de GitHub Pages en el navegador:
- Debería cargar la web
- Los productos deberían aparecer (cargados desde la API)

---

## 🔧 Solución de Problemas

### "404 page not found" en GitHub Pages
- Espera 1-2 minutos después de activar Pages
- Verifica que el archivo `index.html` exista en la raíz del repo
- Ve a Settings → Pages y revisa el mensaje de estado

### Productos no cargan
- Abre la consola del navegador (F12)
- Verifica errores de CORS
- Si hay errores CORS, ejecuta el comando del Paso 4

---

## 📝 Nota

GitHub Pages es **gratis** y sirve páginas estáticas perfectamente. Tu API en Railway seguirá funcionando independientemente.
