// ============================================
// CONFIGURACIÓN GLOBAL DE LA APLICACIÓN
// ============================================

/**
 * Objeto de configuración central
 * Define constantes utilizadas en toda la aplicación
 */
const CONFIG = {
  itemsPerPage: 6, // Número de productos por pagina en la galerí­a
  animationDelay: 100, // Delay entre animaciones de items (ms)
  scrollOffset: 80, // Offset para scroll suave considerando el header fijo
  cursorSmoothing: 0.2, // Suavizado del cursor personalizado (0-1)
};

// ============================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================================

/**
 * Objeto que mantiene el estado de la aplicación
 * Evita uso de variables globales dispersas
 */
const state = {
  galleryData: null, // Datos cargados desde gallery-data.json
  currentFandom: null, // Fandom actualmente seleccionado
  currentProductType: "llaveros", // Tipo de producto actual
  currentPage: 1, // PÃ¡gina actual en la paginación
};

// ============================================
// CARGA DE DATOS DE LA GALERÍA
// ============================================

/**
 * Carga los datos de la galerí­a desde el archivo JSON
 * Maneja errores y proporciona datos de respaldo
 */
async function loadGalleryData() {
  try {
    // Intenta cargar los datos del JSON
    const response = await fetch("gallery-data.json");

    // Verifica que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parsea y guarda los datos en el estado global
    state.galleryData = await response.json();

    // Inicializa la galerí­a con los datos cargados
    initializeGallery();
  } catch (error) {
    // Log del error para debugging
    console.error("Error cargando datos de galerÃ­a:", error);

    // Muestra mensaje visual al usuario
    const gallery = document.getElementById("galeria");
    if (gallery) {
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.innerHTML = `
        <p>Error cargando la galerí­a. Por favor, recargá la página.</p>
      `;
      gallery.prepend(errorMessage);
    }

    // Usa datos de respaldo para evitar que la página quede vací­a
    state.galleryData = getFallbackData();
    initializeGallery();
  }
}

// ============================================
// DATOS DE RESPALDO
// ============================================

/**
 * Proporciona datos de respaldo en caso de error de carga
 * Permite que la aplicación funcione incluso si falla el fetch
 * @returns {Object} Objeto con estructura mí­nima de datos
 */
function getFallbackData() {
  return {
    fandoms: [
      {
        id: "isaac",
        name: "The Binding of Isaac",
        featured: true,
        thumbnail: "img/isaac.jpg",
        products: {
          llaveros: [
            { id: "isaac-1", image: "img/isaac.jpg", name: "Isaac Design 1" },
            { id: "isaac-2", image: "img/isaac.jpg", name: "Isaac Design 2" },
          ],
        },
      },
    ],
    productTypes: [{ id: "llaveros", name: "Llaveros", icon: "" }],
  };
}

// ============================================
// INICIALIZACIÓN DE LA GALERÍA
// ============================================

/**
 * Inicializa la galerí­a una vez que los datos están cargados
 * Renderiza los filtros y productos destacados
 */
function initializeGallery() {
  renderFandomFilters();
  renderFeaturedProducts();
}

// ============================================
// RENDERIZADO DE FILTROS DE FANDOM
// ============================================

/**
 * Genera y renderiza los botones de filtro de fandoms
 * Incluye un botón "Todos" y un botón por cada fandom
 */
function renderFandomFilters() {
  const filtersContainer = document.getElementById("fandomFilters");

  // Verificación de existencia del contenedor
  if (!filtersContainer || !state.galleryData) return;

  // Construye el HTML con el botón "Todos" activo por defecto
  let filtersHTML = `
    <button class="filter-btn active" data-fandom="all">
      Más populares
    </button>
  `;

  // Agrega un botón por cada fandom en los datos
  state.galleryData.fandoms.forEach((fandom) => {
    filtersHTML += `
      <button class="filter-btn" data-fandom="${fandom.id}">
        ${fandom.name}
      </button>
    `;
  });

  // Inserta el HTML generado
  filtersContainer.innerHTML = filtersHTML;

  // Agrega event listeners a todos los botones de filtro
  const filterButtons = filtersContainer.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", handleFandomFilter);
  });
}

// ============================================
// RENDERIZADO DE PRODUCTOS DESTACADOS
// ============================================

/**
 * Muestra los productos destacados (vista inicial)
 * Toma los primeros 6 fandoms como destacados
 */
function renderFeaturedProducts() {
  const featuredGrid = document.getElementById("featuredGrid");

  // Verificación de existencia del contenedor
  if (!featuredGrid || !state.galleryData) return;

  let productsHTML = "";

  // Toma solo los primeros 6 fandoms para destacados
  state.galleryData.fandoms.slice(0, 6).forEach((fandom) => {
    const thumbnail = fandom.thumbnail || "img/placeholder.jpg";

    productsHTML += `
      <div class="gallery-item featured-item" data-fandom="${fandom.id}">
        <div class="gallery-image">
          <img 
            src="${thumbnail}" 
            alt="${fandom.name}"
            loading="lazy"
            onerror="this.src='img/placeholder.jpg'"
            style="width: 100%; height: 100%; object-fit: cover"
          />
        </div>
        <div class="gallery-overlay">
          <h3>${fandom.name}</h3>
          <p>Ver productos disponibles</p>
        </div>
      </div>
    `;
  });

  featuredGrid.innerHTML = productsHTML;

  // Agrega handlers de click para navegar al detalle del fandom
  const featuredItems = featuredGrid.querySelectorAll(".featured-item");
  featuredItems.forEach((item) => {
    item.addEventListener("click", function () {
      const fandomId = this.getAttribute("data-fandom");
      showFandomDetail(fandomId);
    });
  });
}

// ============================================
// MANEJO DE CLICK EN FILTRO DE FANDOM
// ============================================

/**
 * Maneja el click en los botones de filtro de fandom
 * Actualiza el estado activo y cambia la vista
 * @param {Event} e - Evento de click
 */
function handleFandomFilter(e) {
  const fandomId = e.target.getAttribute("data-fandom");

  // Actualiza el estado visual de los botones
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  e.target.classList.add("active");

  // Cambia entre vista destacados o vista de fandom especí­fico
  if (fandomId === "all") {
    showFeaturedView();
  } else {
    showFandomDetail(fandomId);
  }
}

// ============================================
// MOSTRAR VISTA DE DESTACADOS
// ============================================

/**
 * Muestra la vista de productos destacados (inicial)
 * Oculta la vista de detalle de fandom
 */
function showFeaturedView() {
  document.getElementById("featuredView").style.display = "block";
  document.getElementById("fandomView").style.display = "none";
  state.currentFandom = null;
}

// ============================================
// MOSTRAR DETALLE DE FANDOM
// ============================================

/**
 * Muestra la vista detallada de un fandom especí­fico
 * Incluye filtros de tipo de producto y grid de productos
 * @param {string} fandomId - ID del fandom a mostrar
 */
function showFandomDetail(fandomId) {
  // Busca el fandom en los datos
  const fandom = state.galleryData.fandoms.find((f) => f.id === fandomId);
  if (!fandom) return;

  // Actualiza el estado
  state.currentFandom = fandom;
  state.currentPage = 1;

  // Actualiza la UI
  document.getElementById("featuredView").style.display = "none";
  document.getElementById("fandomView").style.display = "block";
  document.getElementById("selectedFandomName").textContent = fandom.name;

  // Renderiza los filtros de tipo de producto disponibles
  renderProductTypeFilters(fandom);

  // Selecciona el primer tipo de producto disponible por defecto
  state.currentProductType = Object.keys(fandom.products)[0] || "llaveros";
  renderProducts();

  // Hace scroll suave hacia la galerÃ­a
  document
    .getElementById("galeria")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================
// RENDERIZADO DE FILTROS DE TIPO DE PRODUCTO
// ============================================

/**
 * Genera los botones de filtro por tipo de producto
 * Solo muestra los tipos que tiene el fandom actual
 * @param {Object} fandom - Objeto fandom con sus productos
 */
function renderProductTypeFilters(fandom) {
  const filtersContainer = document.getElementById("productTypeFilters");
  if (!filtersContainer) return;

  let filtersHTML = "";

  // Itera sobre los tipos de productos disponibles en el fandom
  Object.keys(fandom.products).forEach((productTypeId, index) => {
    // Busca la información del tipo de producto en los datos globales
    const productType = state.galleryData.productTypes.find(
      (pt) => pt.id === productTypeId,
    );
    if (!productType) return;

    // Marca el primero como activo
    const activeClass = index === 0 ? "active" : "";

    filtersHTML += `
      <button class="product-type-btn ${activeClass}" data-type="${productType.id}">
        <span class="product-type-icon"><i data-lucide="${productType.icon}"></i></span>
        <span class="product-type-name">${productType.name}</span>
        <span class="product-count">${fandom.products[productTypeId].length}</span>
      </button>
    `;
  });

  filtersContainer.innerHTML = filtersHTML;

  // Agrega event listeners a los botones
  const typeButtons = filtersContainer.querySelectorAll(".product-type-btn");
  typeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Actualiza estado visual
      typeButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Actualiza estado y re-renderiza
      state.currentProductType = this.getAttribute("data-type");
      state.currentPage = 1;
      renderProducts();
    });
  });

  // Inicializa iconos de Lucide
  initializeLucideIcons();
}

// ============================================
// RENDERIZADO DE PRODUCTOS CON PAGINACIÓN
// ============================================

/**
 * Renderiza el grid de productos del tipo seleccionado
 * Implementa paginación para mostrar solo itemsPerPage productos
 */
function renderProducts() {
  if (!state.currentFandom) return;

  // Obtiene los productos del tipo seleccionado
  const products = state.currentFandom.products[state.currentProductType] || [];
  const totalPages = Math.ceil(products.length / CONFIG.itemsPerPage);

  // Calcula los ídices para la página actual
  const startIndex = (state.currentPage - 1) * CONFIG.itemsPerPage;
  const endIndex = startIndex + CONFIG.itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Referencia al contenedor del grid
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) return;

  // Construye el HTML de los productos
  let productsHTML = "";
  currentProducts.forEach((product) => {
    productsHTML += `
      <div class="product-item" data-product-id="${product.id}">
        <div class="product-item-image">
          <img 
            src="${product.image}" 
            alt="${product.name}"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'placeholder-art\\' style=\\'background: linear-gradient(135deg, var(--fire-orange) 0%, var(--fire-red) 100%);\\'>ðŸ”¥</div>'"
          />
        </div>
        <div class="product-item-info">
          <h4>${product.name}</h4>
        </div>
      </div>
    `;
  });

  productGrid.innerHTML = productsHTML;

  // Actualiza los controles de paginación
  updatePaginationControls(products.length, totalPages);

  // Anima la aparición de los items con stagger
  const items = productGrid.querySelectorAll(".product-item");
  items.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    setTimeout(() => {
      item.style.transition = "all 0.4s ease";
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, index * CONFIG.animationDelay);
  });
}

// ============================================
// ACTUALIZACIÓN DE CONTROLES DE PAGINACIÓN
// ============================================

/**
 * Actualiza el estado de los botones de paginación
 * Maneja la habilitación/deshabilitación y eventos
 * @param {number} totalItems - Total de items
 * @param {number} totalPages - Total de páginas
 */
function updatePaginationControls(totalItems, totalPages) {
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  // Deshabilita botones según página actual
  prevBtn.disabled = state.currentPage === 1;
  nextBtn.disabled = state.currentPage === totalPages || totalPages === 0;

  // Event listener para botón anterior
  prevBtn.onclick = () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderProducts();
      scrollToProductGrid();
    }
  };

  // Event listener para botón siguiente
  nextBtn.onclick = () => {
    if (state.currentPage < totalPages) {
      state.currentPage++;
      renderProducts();
      scrollToProductGrid();
    }
  };
}

// ============================================
// SCROLL AL GRID DE PRODUCTOS
// ============================================

/**
 * Hace scroll suave hasta el grid de productos
 * Se usa al cambiar de página para mantener contexto
 */
function scrollToProductGrid() {
  const productGrid = document.getElementById("productGrid");
  if (productGrid) {
    productGrid.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// ============================================
// UTILIDAD: DEBOUNCE
// ============================================

/**
 * Función de utilidad para debouncing de eventos
 * Previene ejecuciones excesivas de funciones costosas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================
// CURSOR PERSONALIZADO TIPO POKÉMON
// ============================================
// Crear el contenedor del cursor
const customCursor = document.createElement("div");
customCursor.className = "custom-cursor";
customCursor.innerHTML = '<div class="cursor-pokemon"></div>';
document.body.appendChild(customCursor);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Trail de partí­culas
let trailIndex = 0;
const trails = [];

// Actualizar posición del mouse
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Crear estela de fuego cada ciertos frames
  if (trailIndex % 3 === 0) {
    createTrail(mouseX, mouseY);
  }
  trailIndex++;
});

// Animar el cursor suavemente
function animateCursor() {
  // Suavizado del movimiento (easing)
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;

  customCursor.style.left = cursorX + "px";
  customCursor.style.top = cursorY + "px";
  customCursor.style.transform = "translate(-50%, -50%)";

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Crear estela de partí­culas
function createTrail(x, y) {
  const trail = document.createElement("div");
  trail.className = "cursor-trail";
  trail.style.left = x + "px";
  trail.style.top = y + "px";
  document.body.appendChild(trail);

  // Remover después de la animación
  setTimeout(() => {
    trail.remove();
  }, 800);
}

// Efecto al hacer click
document.addEventListener("mousedown", () => {
  customCursor.querySelector(".cursor-pokemon").style.transform = "scale(0.8)";
});

document.addEventListener("mouseup", () => {
  customCursor.querySelector(".cursor-pokemon").style.transform = "scale(1)";
});

// Ocultar cursor cuando sale de la ventana
document.addEventListener("mouseleave", () => {
  customCursor.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  customCursor.style.opacity = "1";
});

// Efecto especial al pasar sobre elementos interactivos
const interactiveElements = document.querySelectorAll(
  "a, button, .gallery-item, .product-card",
);

interactiveElements.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    customCursor.querySelector(".cursor-pokemon").style.animation =
      "pokemonExcited 0.4s ease infinite";
    customCursor.querySelector(".cursor-pokemon").style.transform =
      "scale(1.3)";
  });

  element.addEventListener("mouseleave", () => {
    customCursor.querySelector(".cursor-pokemon").style.animation =
      "pokemonFloat 2s ease-in-out infinite";
    customCursor.querySelector(".cursor-pokemon").style.transform = "scale(1)";
  });
});

// ============================================
// NAVEGACIÓN
// ============================================

/**
 * Manejo de la barra de navegación
 * Incluye efecto de scroll y menú móvil
 */

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");

/**
 * Añade clase "scrolled" a la navegación al hacer scroll
 * Usa debounce para optimizar rendimiento
 */
const handleScroll = debounce(() => {
  if (window.scrollY > 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
}, 10);

window.addEventListener("scroll", handleScroll);

/**
 * Toggle del menú múvil
 * Anima las lÃ­neas del hamburger
 */
navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  navToggle.classList.toggle("active");

  // Animación de las lí­neas del botón hamburger
  const spans = navToggle.querySelectorAll("span");
  if (navMenu.classList.contains("active")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
  } else {
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  }
});

/**
 * Cierra el menú móvil al hacer click en un enlace
 */
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");

    // Resetea la animación del hamburger
    const spans = navToggle.querySelectorAll("span");
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  });
});

// ============================================
// SCROLL SUAVE
// ============================================

/**
 * Implementa scroll suave para todos los enlaces ancla
 * Considera el offset del header fijo
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      const offsetTop = target.offsetTop - CONFIG.scrollOffset;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// ============================================
// INTERSECTION OBSERVER PARA ANIMACIONES
// ============================================

/**
 * Observa elementos para animarlos cuando entran en viewport
 * Mejora la percepciÃ³n de carga progresiva
 */

const observerOptions = {
  threshold: 0.1, // Se activa cuando 10% del elemento es visible
  rootMargin: "0px 0px -100px 0px", // Offset inferior de 100px
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Anima el elemento cuando es visible
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

/**
 * Observa las tarjetas de productos para animación
 */
const productCards = document.querySelectorAll(".product-card");
productCards.forEach((card, index) => {
  // Estado inicial oculto
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = `all 0.6s ease ${index * 0.15}s`;

  // Inicia observación
  observer.observe(card);
});

// ============================================
// BOTÓN DE CATÁLOGO
// ============================================

/**
 * Maneja el click en el botón de catálogo completo
 * Muestra información de contacto
 */
const catalogBtn = document.getElementById("catalogBtn");
if (catalogBtn) {
  catalogBtn.addEventListener("click", function (e) {
    e.preventDefault();
    alert(
      "Por favor, contactÃ¡ a Hades Salem para acceder al catÃ¡logo completo de diseÃ±os.\n\nInstagram: @hades.salem\nWhatsApp: +54 11 2455-7767",
    );
  });
}

// ============================================
// MANEJO DEL FORMULARIO DE CONTACTO
// ============================================

/**
 * Procesa el enví­o del formulario de contacto
 * Valida datos y muestra mensaje de confirmación
 */
const contactForm = document.querySelector(".contact-form");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Obtiene y limpia los datos del formulario
  const formData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    product: document.getElementById("product").value,
    message: document.getElementById("message").value.trim(),
  };

  // Valida campos obligatorios
  if (!formData.name || !formData.email || !formData.message) {
    alert("Por favor completÃ¡ todos los campos obligatorios");
    return;
  }

  // Valida formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert("Por favor ingresÃ¡ un email vÃ¡lido");
    return;
  }

  // Crea y muestra mensaje de éxito
  const successMessage = document.createElement("div");
  successMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #ff6b35, #e63946);
    color: white;
    padding: 30px 50px;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(255, 107, 53, 0.4);
    z-index: 10000;
    text-align: center;
    animation: successFadeIn 0.3s ease;
  `;

  successMessage.innerHTML = `
    <h3 style="font-family: 'Cinzel', serif; font-size: 24px; margin-bottom: 10px;">Â¡Mensaje Enviado!</h3>
    <p style="margin: 0;">Gracias ${formData.name}, te contactarÃ© pronto ðŸ”¥</p>
  `;

  // Agrega animación CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes successFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  // Muestra el mensaje
  document.body.appendChild(successMessage);
  contactForm.reset();

  // Oculta y elimina el mensaje después de 3 segundos
  setTimeout(() => {
    successMessage.style.animation = "successFadeIn 0.3s ease reverse";
    setTimeout(() => {
      successMessage.remove();
    }, 300);
  }, 3000);

  // Log para debugging (en producción se enviarí­a a un backend)
  console.log("Form submitted:", formData);
});

// ============================================
// EFECTO PARALLAX EN EL HERO
// ============================================

/**
 * Aplica efecto parallax al contenido del hero
 * Usa debounce para optimizar rendimiento
 */
const handleParallax = debounce(() => {
  const scrolled = window.pageYOffset;
  const heroContent = document.querySelector(".hero-content");

  if (heroContent) {
    // Mueve el contenido más lento que el scroll (parallax)
    heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;

    // Fade out progresivo
    heroContent.style.opacity = 1 - scrolled / 600;
  }
}, 10);

window.addEventListener("scroll", handleParallax);

// ============================================
// CONTADOR ANIMADO DE ESTADÍSTICAS
// ============================================

/**
 * Anima los números de las estadí­sticas cuando son visibles
 * Cuenta desde 0 hasta el valor final
 */
const stats = document.querySelectorAll(".stat-number");
const statsSection = document.querySelector(".about-stats");

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Anima cada estadística
        stats.forEach((stat) => {
          const targetText = stat.textContent.trim();
          const hasPlus = targetText.includes("+");
          const target = parseInt(targetText.replace("+", ""));
          let count = 0;
          const increment = target / 60; // 60 frames para la animación

          /**
           * Función recursiva para actualizar el contador
           */
          const updateCount = () => {
            if (count < target) {
              count += increment;
              stat.textContent = Math.ceil(count) + (hasPlus ? "+" : "");
              requestAnimationFrame(updateCount);
            } else {
              stat.textContent = target + (hasPlus ? "+" : "");
            }
          };

          updateCount();
        });

        // Deja de observar después de animar
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }, // Se activa cuando 50% es visible
);

// Inicia observación si existe la sección de stats
if (statsSection) {
  statsObserver.observe(statsSection);
}

// ============================================
// EFECTO RIPPLE EN BOTONES
// ============================================

/**
 * Agrega efecto de onda (ripple) a todos los botones
 * Similar al Material Design
 */
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    // Crea el elemento ripple
    const ripple = document.createElement("span");
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    // Estiliza el ripple
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      top: ${y}px;
      left: ${x}px;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    // Agrega y remueve después de la animación
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Agrega la animación CSS del ripple
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// ============================================
// INICIALIZACIÓN AL CARGAR EL DOM
// ============================================

/**
 * Punto de entrada principal
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener("DOMContentLoaded", () => {
  loadGalleryData();
});

// ============================================
// MENSAJES DE CONSOLA
// ============================================

/**
 * Mensajes estilizados en la consola para desarrolladores
 */
console.log(
  "%cðŸ”¥ Hades Salem - Arte Digital en Llamas ðŸ”¥",
  "font-size: 20px; font-weight: bold; color: #ff6b35;",
);
console.log(
  "%cSitio creado con pasiÃ³n y dedicaciÃ³n",
  "font-size: 14px; color: #f7931e;",
);

// ============================================
// SOPORTE PARA ICONOS LUCIDE
// ============================================

/**
 * Inicializa iconos de Lucide después de renderizar contenido dinámico
 * Debe llamarse cada vez que se agregue contenido nuevo con iconos
 */
function initializeLucideIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Inicializar iconos después de cargar la página
setTimeout(() => {
  initializeLucideIcons();
}, 200);
