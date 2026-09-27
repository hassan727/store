// ============================================================
// ELECTROTECH — STORE JAVASCRIPT CONTROLLER
// Search, Filters, Cart, Wishlist, Deals Timer & Swiper
// ============================================================

// LocalStorage Keys
const STORAGE_CART_KEY = 'electrotech_cart_v1';
const STORAGE_WISHLIST_KEY = 'electrotech_wishlist_v1';

// Application State
let currentCategory = 'all';
let searchQuery = '';
let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]');
let wishlist = JSON.parse(localStorage.getItem(STORAGE_WISHLIST_KEY) || '[]');

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', () => {
  initSwiper();
  initHeaderBadges();
  renderCategories();
  renderWeeklyDeals();
  renderProducts();
  renderBrands();
  initSearch();
  initDealsCountdown();
});

// ============================================================
// 1. SWIPER HERO SLIDER INITIALIZATION
// ============================================================
function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper('.hero-swiper', {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      speed: 800,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      rtl: true,
    });
  }
}

// ============================================================
// 2. HEADER BADGES (Cart & Wishlist)
// ============================================================
function initHeaderBadges() {
  updateCartBadge();
  updateWishlistBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const totalDisplay = document.getElementById('cart-total-display');
  const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  
  if (badge) {
    badge.textContent = count;
  }
  
  if (totalDisplay) {
    const total = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
    totalDisplay.textContent = formatPrice(total) + ' ج.م';
  }
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  if (badge) {
    badge.textContent = wishlist.length;
  }
}

// ============================================================
// 3. CATEGORIES RENDERING
// ============================================================
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container || typeof CATEGORIES_DATA === 'undefined') return;

  // Skip 'all' for the category showcase cards (display 8 real categories)
  const displayCats = CATEGORIES_DATA.filter(c => c.id !== 'all');

  container.innerHTML = displayCats.map(cat => `
    <div class="category-card ${currentCategory === cat.id ? 'active' : ''}" 
         onclick="filterByCategory('${cat.id}')"
         role="button"
         tabindex="0"
         title="${cat.name}">
      <div class="category-card-img">
        <img src="${cat.image}" alt="${cat.name}" loading="lazy" />
      </div>
      <div class="category-card-title">${cat.name}</div>
      <div class="category-card-count">${cat.count} منتجات</div>
    </div>
  `).join('');
}

// ============================================================
// 4. WEEKLY OFFERS / FLASH DEALS
// ============================================================
function renderWeeklyDeals() {
  const container = document.getElementById('deals-container');
  if (!container || typeof PRODUCTS_DATA === 'undefined') return;

  const dealProducts = PRODUCTS_DATA.filter(p => p.isDeal).slice(0, 4);

  container.innerHTML = dealProducts.map(p => `
    <div class="deal-card">
      <div class="deal-badge-pill">خصم ${p.discount}%</div>
      <div class="deal-img-box">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="deal-brand">${p.brand}</div>
      <h3 class="deal-title" title="${p.name}">${p.name}</h3>
      <div class="deal-prices">
        <span class="current-price">${formatPrice(p.price)} ج.م</span>
        <span class="old-price">${formatPrice(p.oldPrice)} ج.م</span>
      </div>
      <div class="deal-progress-wrap">
        <div class="deal-progress-label">
          <span>تم بيع 78%</span>
          <span>متبقي 6 قطع</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: 78%;"></div>
        </div>
      </div>
      <button class="deal-btn" onclick="addToCart(${p.id})">
        <i class="fa-solid fa-cart-shopping"></i>
        <span>أضف للسلة الآن</span>
      </button>
    </div>
  `).join('');
}

// ============================================================
// 5. PRODUCTS GRID RENDERING & FILTERING
// ============================================================
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countDisplay = document.getElementById('products-count');
  if (!container || typeof PRODUCTS_DATA === 'undefined') return;

  let filtered = PRODUCTS_DATA;

  // Filter by Category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Filter by Search Query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  }

  // Update counter
  if (countDisplay) {
    countDisplay.textContent = `(${filtered.length} منتج)`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">لم نتمكن من العثور على أي منتجات</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">جرب البحث بكلمات أخرى أو اختر فئة مختلفة</p>
        <button class="btn btn-primary" onclick="resetFilters()">عرض جميع الأجهزة</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isWishlisted = wishlist.includes(p.id);
    return `
      <div class="product-card" id="product-${p.id}">
        <div class="card-top-bar">
          <span class="card-discount-badge">خصم ${p.discount}%</span>
          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  onclick="toggleWishlist(${p.id})"
                  title="${isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}"
                  aria-label="قائمة الرغبات">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
        </div>

        <div class="card-image-box">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>

        <div class="card-meta">
          <span class="card-brand">${p.brand}</span>
          <div class="card-rating">
            <i class="fa-solid fa-star"></i>
            <span>${p.rating}</span>
            <span class="card-rating-count">(${p.reviewCount})</span>
          </div>
        </div>

        <h3 class="card-title" title="${p.name}">${p.name}</h3>

        <div class="card-stock">
          <span class="stock-dot"></span>
          <span>${p.stockStatus}</span>
        </div>

        <div class="card-price-box">
          <div class="price-row">
            <span class="price-main">${formatPrice(p.price)}</span>
            <span class="price-currency">ج.م</span>
            <span class="price-old">${formatPrice(p.oldPrice)} ج.م</span>
          </div>
        </div>

        <button class="card-add-btn" onclick="addToCart(${p.id})">
          <i class="fa-solid fa-cart-plus"></i>
          <span>أضف إلى السلة</span>
        </button>
      </div>
    `;
  }).join('');
}

// ============================================================
// 6. FILTER INTERACTIONS
// ============================================================
function filterByCategory(catId) {
  currentCategory = catId;
  
  // Update Tab buttons
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    if (btn.dataset.category === catId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Category showcase cards
  renderCategories();

  // Re-render products grid
  renderProducts();

  // Smooth scroll to products section
  const section = document.getElementById('featured-products-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function resetFilters() {
  currentCategory = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });

  renderCategories();
  renderProducts();
}

// ============================================================
// 7. LIVE SEARCH FUNCTIONALITY
// ============================================================
function initSearch() {
  const input = document.getElementById('main-search-input');
  const dropdown = document.getElementById('search-dropdown');
  const form = document.getElementById('search-form');

  if (!input || !dropdown) return;

  // Real-time input listener
  input.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    searchQuery = val;

    if (val.length >= 2) {
      const q = val.toLowerCase();
      const matches = PRODUCTS_DATA.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      ).slice(0, 5);

      if (matches.length > 0) {
        dropdown.innerHTML = matches.map(p => `
          <div class="search-result-item" onclick="selectSearchResult(${p.id})">
            <img src="${p.image}" alt="${p.name}" />
            <div class="search-result-info">
              <div class="search-result-title">${p.name}</div>
              <div class="search-result-price">${formatPrice(p.price)} ج.م</div>
            </div>
            <i class="fa-solid fa-arrow-left" style="color: var(--text-light); font-size: 0.8rem;"></i>
          </div>
        `).join('');
        dropdown.classList.add('active');
      } else {
        dropdown.innerHTML = `
          <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            لا توجد نتائج مطابقة لـ "${val}"
          </div>
        `;
        dropdown.classList.add('active');
      }
    } else {
      dropdown.classList.remove('active');
    }

    // Also live-filter the main product grid
    renderProducts();
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    dropdown.classList.remove('active');
    renderProducts();
    const section = document.getElementById('featured-products-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
}

function selectSearchResult(productId) {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.remove('active');
  
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (product) {
    currentCategory = product.category;
    renderCategories();
    renderProducts();
    
    setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 0 3px var(--accent)';
        setTimeout(() => { el.style.boxShadow = ''; }, 2000);
      }
    }, 150);
  }
}

// ============================================================
// 8. CART & WISHLIST ACTIONS (Interactive & Persisted)
// ============================================================
function addToCart(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();

  showToast('تمت الإضافة بنجاح', `تمت إضافة "${product.name.slice(0, 35)}..." إلى سلة التسوق`);
}

function toggleWishlist(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const index = wishlist.indexOf(productId);
  let added = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast('تمت الإزالة', `تمت إزالة المنتج من قائمة المفضلة`);
  } else {
    wishlist.push(productId);
    added = true;
    showToast('تم الحفظ في المفضلة', `تمت إضافة "${product.name.slice(0, 35)}..." إلى قائمة رغباتك`);
  }

  localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
  updateWishlistBadge();
  renderProducts();
}

// ============================================================
// CART OFFCANVAS DRAWER CONTROLS
// ============================================================
function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  const countEl = document.getElementById('drawer-cart-count');
  if (!body) return;

  const totalCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  if (countEl) countEl.textContent = `(${totalCount} قطع)`;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-view">
        <i class="fa-solid fa-cart-arrow-down"></i>
        <h4>سلة التسوق فارغة</h4>
        <p>لم تقم بإضافة أي أجهزة كهربائية إلى سلتك بعد.</p>
        <button class="btn btn-primary" onclick="closeCartDrawer(); filterByCategory('all');">
          <i class="fa-solid fa-boxes-stacked"></i> ابدأ التسوق الآن
        </button>
      </div>
    `;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';

  // Render items list
  body.innerHTML = `
    <div class="drawer-items-list">
      ${cart.map(item => `
        <div class="drawer-item" id="drawer-item-${item.id}">
          <div class="drawer-item-img">
            <img src="${item.image}" alt="${item.name}" />
          </div>
          <div class="drawer-item-info">
            <span class="drawer-item-brand">${item.brand}</span>
            <h4 class="drawer-item-name" title="${item.name}">${item.name}</h4>
            <div class="drawer-item-price">${formatPrice(item.price * (item.qty || 1))} ج.م</div>
            <div class="drawer-item-actions">
              <div class="drawer-qty-box">
                <button class="qty-btn" onclick="updateDrawerQty(${item.id}, -1)" aria-label="تقليل">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-number">${item.qty || 1}</span>
                <button class="qty-btn" onclick="updateDrawerQty(${item.id}, 1)" aria-label="زيادة">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <button class="drawer-remove-btn" onclick="removeFromCart(${item.id})">
                <i class="fa-regular fa-trash-can"></i> حذف
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Render footer summary
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const shipping = subtotal > 1000 ? 0 : 75;
  const total = subtotal + shipping;

  footer.innerHTML = `
    <div class="cart-summary-row">
      <span>مجموع الأجهزة:</span>
      <strong>${formatPrice(subtotal)} ج.م</strong>
    </div>
    <div class="cart-summary-row">
      <span>الشحن والتوصيل:</span>
      <span style="color: var(--success); font-weight: 700;">${shipping === 0 ? 'مجاني بالكامل' : formatPrice(shipping) + ' ج.م'}</span>
    </div>
    <div class="cart-summary-total">
      <span>الإجمالي النهائي:</span>
      <span class="total-amount">${formatPrice(total)} ج.م</span>
    </div>
    <button class="cart-checkout-btn" onclick="openCheckoutModal()">
      <i class="fa-solid fa-credit-card"></i>
      <span>متابعة إتمام الطلب الآن</span>
    </button>
    <a class="cart-clear-link" onclick="clearCart()">
      <i class="fa-regular fa-trash-can"></i> إفراغ السلة بالكامل
    </a>
  `;
}

function updateDrawerQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  const newQty = (item.qty || 1) + delta;
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  item.qty = newQty;
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  showToast('تم الحذف', 'تم حذف المنتج من سلة المشتريات');
}

function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  showToast('تم إفراغ السلة', 'تم تفريغ كافة المنتجات من سلة التسوق');
}

// ============================================================
// QUICK CHECKOUT MODAL CONTROLLER
// ============================================================
function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal-overlay');
  const countDisplay = document.getElementById('checkout-items-count');
  const totalDisplay = document.getElementById('checkout-total-price');
  
  if (!modal) return;

  const total = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0);

  if (countDisplay) countDisplay.textContent = `${count} أجهزة`;
  if (totalDisplay) totalDisplay.textContent = `${formatPrice(total)} ج.م`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');
  const addressInput = document.getElementById('customer-address');
  const cityInput = document.getElementById('customer-city');

  const customerName = nameInput ? nameInput.value.trim() : 'العميل الكريم';
  const customerPhone = phoneInput ? phoneInput.value.trim() : '';
  const orderNumber = 'EG-' + Math.floor(100000 + Math.random() * 900000);
  const total = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);

  // Show confirmation view inside modal
  const modalContent = document.getElementById('checkout-modal-content');
  if (modalContent) {
    modalContent.innerHTML = `
      <div class="checkout-success-icon">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3>تم استلام طلبك بنجاح!</h3>
      <p>شكراً لتسوقك معنا، تم تأكيد طلبك وجاري تجهيزه للشحن المباشر لباب منزلك.</p>
      
      <div class="order-details-box">
        <div class="order-detail-row">
          <span>رقم الطلب:</span>
          <strong>#${orderNumber}</strong>
        </div>
        <div class="order-detail-row">
          <span>اسم العميل:</span>
          <span>${customerName}</span>
        </div>
        <div class="order-detail-row">
          <span>رقم الهاتف:</span>
          <span>${customerPhone}</span>
        </div>
        <div class="order-detail-row">
          <span>طريقة الدفع:</span>
          <span>الدفع عند الاستلام مع فحص الأجهزة</span>
        </div>
        <div class="order-detail-row">
          <span>موعد التوصيل:</span>
          <span>خلال 24 إلى 48 ساعة</span>
        </div>
        <div class="order-detail-row">
          <span>المبلغ الإجمالي:</span>
          <span>${formatPrice(total)} ج.م</span>
        </div>
      </div>

      <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="closeCheckoutModal(); clearCart();">
        <i class="fa-solid fa-house"></i> العودة ومواصلة التصفح
      </button>
    `;
  }

  showToast('مبروك!', `تم تسجيل طلبك رقم #${orderNumber} بنجاح`);
}

// ============================================================
// 9. BRANDS STRIP RENDERING
// ============================================================
function renderBrands() {
  const container = document.getElementById('brands-container');
  if (!container || typeof BRANDS_DATA === 'undefined') return;

  container.innerHTML = BRANDS_DATA.map(b => `
    <div class="brand-card" onclick="filterByBrand('${b.name}')" title="أجهزة ماركة ${b.arabic}">
      <span class="brand-logo-text">${b.logoText}</span>
      <span class="brand-ar-name">${b.arabic}</span>
    </div>
  `).join('');
}

function filterByBrand(brandName) {
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) searchInput.value = brandName;
  searchQuery = brandName;
  renderProducts();
  const section = document.getElementById('featured-products-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// 10. COUNTDOWN TIMER FOR DEALS
// ============================================================
function initDealsCountdown() {
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');

  if (!hoursEl || !minsEl || !secsEl) return;

  // Fixed 24h cycle
  let totalSeconds = 24 * 3600 - 1245;

  setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
    } else {
      totalSeconds = 24 * 3600;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

// ============================================================
// 11. TOAST NOTIFICATION UTILITY
// ============================================================
function showToast(title, message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fa-solid fa-check"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Helper: Format Price with Egyptian Comma
function formatPrice(num) {
  return Number(num).toLocaleString('ar-EG');
}
