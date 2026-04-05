/**
 * ERGONOMÍA PRO - JavaScript Principal
 */

// ─── Configuración API ────────────────────
const API_CONFIG = {
    baseUrl: 'https://ergonomia-api-production.up.railway.app',
    endpoints: {
        products: '/api/v1/products',
        auth: {
            login: '/api/v1/auth/login',
            register: '/api/v1/auth/register'
        },
        favorites: '/api/v1/favorites',
        me: '/api/v1/me'
    }
};

// Token JWT almacenado en memoria (en producción usar localStorage con precaución)
let authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || null;
let currentUser = null;

// ─── Datos de Productos (Cache) ───────────
let featuredProducts = [];

// ─── Utilidades ───────────────────────────
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ─── API Functions ────────────────────────

/**
 * Realiza peticiones a la API
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    // Agregar token si existe
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Obtiene productos de la API
 */
async function fetchProducts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiFetch(`${API_CONFIG.endpoints.products}${query}`);
}

/**
 * Obtiene un producto por slug
 */
async function fetchProductBySlug(slug) {
    return await apiFetch(`${API_CONFIG.endpoints.products}/${slug}`);
}

/**
 * Login de usuario
 */
async function login(email, password) {
    const data = await apiFetch(API_CONFIG.endpoints.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (data.access_token) {
        authToken = data.access_token;
        localStorage.setItem('authToken', authToken);
        await loadUserProfile();
    }
    
    return data;
}

/**
 * Registro de usuario
 */
async function register(userData) {
    const data = await apiFetch(API_CONFIG.endpoints.auth.register, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    
    if (data.access_token) {
        authToken = data.access_token;
        localStorage.setItem('authToken', authToken);
    }
    
    return data;
}

/**
 * Carga el perfil del usuario
 */
async function loadUserProfile() {
    if (!authToken) return null;
    
    try {
        currentUser = await apiFetch(API_CONFIG.endpoints.me);
        return currentUser;
    } catch (error) {
        // Token inválido
        logout();
        return null;
    }
}

/**
 * Cierra sesión
 */
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
}

/**
 * Formatea precio en euros
 */
function formatPrice(price, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(price);
}

/**
 * Mapea producto de API a formato del frontend
 */
function mapProductFromAPI(apiProduct) {
    const categoryLabels = {
        'general': 'Ergonomía General',
        'espalda': 'Espalda',
        'programadores': 'Programadores',
        'minimalista': 'Minimalista'
    };
    
    // Obtener el primer link de afiliado disponible
    let affiliateUrl = '#';
    if (apiProduct.affiliate_links) {
        const links = Object.values(apiProduct.affiliate_links);
        if (links.length > 0) affiliateUrl = links[0];
    }
    
    return {
        id: apiProduct.id,
        name: apiProduct.name,
        category: apiProduct.category,
        categoryLabel: categoryLabels[apiProduct.category] || apiProduct.category,
        description: apiProduct.description,
        price: formatPrice(apiProduct.price, apiProduct.currency),
        image: getProductEmoji(apiProduct.category, apiProduct.subcategory),
        affiliateUrl: affiliateUrl,
        rating: apiProduct.rating,
        slug: apiProduct.slug
    };
}

/**
 * Devuelve emoji según categoría
 */
function getProductEmoji(category, subcategory) {
    const emojis = {
        'sillas': '🪑',
        'reposapies': '🦶',
        'cojines-lumbares': '🧘',
        'teclados': '⌨️',
        'ratones': '🖱️',
        'monitores': '🖥️',
        'soportes': '📐',
        'escritorios': '🛋️'
    };
    
    if (subcategory && emojis[subcategory]) return emojis[subcategory];
    
    const categoryEmojis = {
        'general': '🦶',
        'espalda': '🪑',
        'programadores': '⌨️',
        'minimalista': '📐'
    };
    
    return categoryEmojis[category] || '📦';
}

// ─── Inicialización ───────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initSmoothScroll();
    
    // Cargar usuario si hay token
    if (authToken) {
        await loadUserProfile();
    }
    updateUIForLoggedUser();
    
    // Cargar productos desde API
    await renderFeaturedProducts();
    
    initNewsletterForm();
    initAuthForms();
});

// ─── UI Updates ───────────────────────────
function updateUIForLoggedUser() {
    const navMenu = $('#navMenu');
    if (!navMenu) return;
    
    // Remove existing auth items
    const existingAuthItem = navMenu.querySelector('.nav-auth-item');
    if (existingAuthItem) {
        existingAuthItem.remove();
    }
    
    // Create auth menu item
    const authItem = document.createElement('li');
    authItem.className = 'nav-auth-item';
    
    if (currentUser) {
        // User is logged in - show user menu
        authItem.innerHTML = `
            <div class="user-menu">
                <span class="user-name">👤 ${currentUser.first_name}</span>
                <button class="btn-logout" onclick="handleLogout()">Cerrar sesión</button>
            </div>
        `;
    } else {
        // User is not logged in - show login link
        authItem.innerHTML = `<a href="login.html">🔐 Login</a>`;
    }
    
    navMenu.appendChild(authItem);
}

// Handle logout
function handleLogout() {
    logout();
    showNotification('Sesión cerrada correctamente', 'success');
    updateUIForLoggedUser();
    
    // If on a protected page, redirect to home
    const protectedPages = ['favoritos.html', 'perfil.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage)) {
        window.location.href = '/';
    }
}

// ─── Formularios de Autenticación ─────────
function initAuthForms() {
    // Login form
    const loginForm = $('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            
            try {
                await login(email, password);
                showNotification('¡Bienvenido!', 'success');
                window.location.href = '/';
            } catch (error) {
                showNotification(error.message || 'Error al iniciar sesión', 'error');
            }
        });
    }
    
    // Register form
    const registerForm = $('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                email: registerForm.querySelector('input[name="email"]').value,
                password: registerForm.querySelector('input[name="password"]').value,
                first_name: registerForm.querySelector('input[name="first_name"]').value,
                last_name: registerForm.querySelector('input[name="last_name"]').value
            };
            
            try {
                await register(userData);
                showNotification('¡Registro exitoso!', 'success');
                window.location.href = '/';
            } catch (error) {
                showNotification(error.message || 'Error al registrarse', 'error');
            }
        });
    }
}

// ─── Notificaciones ───────────────────────
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        background: ${type === 'success' ? 'var(--color-success, #10b981)' : type === 'error' ? 'var(--color-error, #ef4444)' : 'var(--color-primary, #6366f1)'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ─── Navegación Móvil ─────────────────────
function initNavigation() {
    const navToggle = $('#navToggle');
    const navMenu = $('#navMenu');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animar el botón hamburguesa
        const spans = navToggle.querySelectorAll('span');
        navToggle.classList.toggle('open');
        
        if (navToggle.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
    
    // Cerrar menú al hacer click en un enlace
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('open');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

// ─── Renderizar Productos Destacados ──────
async function renderFeaturedProducts() {
    const container = $('#featuredProducts');
    if (!container) return;
    
    // Mostrar estado de carga
    container.innerHTML = '<div class="loading">Cargando productos...</div>';
    
    try {
        // Cargar desde API
        const response = await fetchProducts({ limit: 6 });
        
        if (response.products && response.products.length > 0) {
            featuredProducts = response.products.map(mapProductFromAPI);
        }
        
        // Si no hay productos de la API, mostrar mensaje
        if (featuredProducts.length === 0) {
            container.innerHTML = '<div class="no-products">No hay productos disponibles</div>';
            return;
        }
        
        // Renderizar productos
        container.innerHTML = featuredProducts.map(product => `
            <article class="product-card" data-category="${product.category}" data-slug="${product.slug}">
                <div class="product-image">${product.image}</div>
                <div class="product-content">
                    <span class="product-category">${product.categoryLabel}</span>
                    <h3>${product.name}</h3>
                    <div class="product-rating">${'⭐'.repeat(Math.round(product.rating))} ${product.rating}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">${product.price}</span>
                        <a href="${product.affiliateUrl}" 
                           class="btn btn-primary product-button" 
                           target="_blank" 
                           rel="noopener sponsored"
                           onclick="trackAffiliateClick('${product.id}', '${product.name}')">
                            Ver oferta
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>Error al cargar productos. <button onclick="renderFeaturedProducts()" class="btn btn-secondary">Reintentar</button></p>
            </div>
        `;
    }
}

// ─── Formulario Newsletter ────────────────
function initNewsletterForm() {
    const form = $('#newsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        
        // Aquí iría la integración con el servicio de email
        // Por ahora simulamos el envío
        
        const button = form.querySelector('button');
        const originalText = button.textContent;
        
        button.textContent = '¡Suscrito! ✓';
        button.disabled = true;
        button.style.backgroundColor = 'var(--color-success)';
        
        console.log('Nueva suscripción:', email);
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.backgroundColor = '';
            form.reset();
        }, 3000);
    });
}

// ─── Smooth Scroll ────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ─── Tracking de Afiliados ────────────────
function trackAffiliateClick(productId, productName) {
    // Tracking básico - en producción usar Google Analytics o similar
    console.log('Affiliate click:', { productId, productName, timestamp: new Date().toISOString() });
    
    // Ejemplo de envío a analytics:
    // gtag('event', 'affiliate_click', {
    //     product_id: productId,
    //     product_name: productName
    // });
}

// ─── Lazy Loading de Imágenes ─────────────
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ─── Filtros de Categoría (para páginas de categoría) ─
function initCategoryFilters() {
    const filterButtons = $$('[data-filter]');
    const products = $$('[data-category]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filtrar productos
            products.forEach(product => {
                if (filter === 'all' || product.dataset.category === filter) {
                    product.style.display = '';
                    product.style.animation = 'fadeIn 0.3s ease';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
}

// ─── Animación de entrada ─────────────────
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.category-card, .product-card, .article-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Añadir clase CSS para animación
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
`);

// Inicializar animaciones si no es móvil
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    initScrollAnimations();
}
