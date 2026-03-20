/**
 * ERGONOMÍA PRO - JavaScript Principal
 */

// ─── Datos de Productos ───────────────────
const featuredProducts = [
    {
        id: 1,
        name: "Reposapiés Ergonómico Ajustable",
        category: "ergonomia-general",
        categoryLabel: "Ergonomía General",
        description: "Mejora tu postura y circulación con este reposapiés ajustable en altura e inclinación.",
        price: "29,99 €",
        image: "🦶",
        affiliateUrl: "#",
        rating: 4.5
    },
    {
        id: 2,
        name: "Silla Ergonómica SIHOO M57",
        category: "espalda",
        categoryLabel: "Espalda",
        description: "Silla de oficina con soporte lumbar ajustable, reposabrazos 3D y respirable.",
        price: "189,99 €",
        image: "🪑",
        affiliateUrl: "#",
        rating: 4.7
    },
    {
        id: 3,
        name: "Teclado Ergonómico Logitech ERGO K860",
        category: "programadores",
        categoryLabel: "Programadores",
        description: "Teclado split con reposamanos integrado. Diseñado para reducir la tensión muscular.",
        price: "119,00 €",
        image: "⌨️",
        affiliateUrl: "#",
        rating: 4.6
    }
];

// ─── Utilidades ───────────────────────────
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ─── Inicialización ───────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderFeaturedProducts();
    initNewsletterForm();
    initSmoothScroll();
});

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
function renderFeaturedProducts() {
    const container = $('#featuredProducts');
    if (!container) return;
    
    container.innerHTML = featuredProducts.map(product => `
        <article class="product-card" data-category="${product.category}">
            <div class="product-image">${product.image}</div>
            <div class="product-content">
                <span class="product-category">${product.categoryLabel}</span>
                <h3>${product.name}</h3>
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
