// ============================================================
// products.js — Products listing page logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initPage('products');

  const params   = new URLSearchParams(window.location.search);
  const initCat  = params.get('cat')  || 'all';
  const initQ    = params.get('q')    || '';

  let allProducts = getStoredProducts();
  let currentFilter = {
    cat: initCat,
    brands: [],
    priceMin: '',
    priceMax: '',
    inStock: false,
    q: initQ,
    sort: 'default',
  };

  // ── Build sidebar categories ──────────────────────────────────────────────
  function buildCategorySidebar() {
    const cats = getStoredCategories();
    const el = document.getElementById('filter-categories');
    if (!el) return;
    let html = `<div class="filter-checkbox" id="cat-all">
      <input type="radio" name="cat-radio" id="radio-all" value="all" ${currentFilter.cat === 'all' ? 'checked' : ''}>
      <label for="radio-all">جميع الفئات</label>
    </div>`;
    cats.forEach(c => {
      html += `<div class="filter-checkbox">
        <input type="radio" name="cat-radio" id="radio-${c.slug}" value="${c.slug}" ${currentFilter.cat === c.slug ? 'checked' : ''}>
        <label for="radio-${c.slug}">${c.name} <small class="text-muted">(${c.count})</small></label>
      </div>`;
    });
    el.innerHTML = html;

    el.querySelectorAll('input[name="cat-radio"]').forEach(r => {
      r.addEventListener('change', () => {
        currentFilter.cat = r.value;
        applyFilters();
      });
    });
  }

  // ── Build brand checkboxes ────────────────────────────────────────────────
  function buildBrandFilter() {
    const el = document.getElementById('filter-brands');
    if (!el) return;
    const brands = [...new Set(allProducts.map(p => p.brand))].sort();
    el.innerHTML = brands.map(b => `
      <div class="filter-checkbox">
        <input type="checkbox" id="brand-${b}" value="${b}" ${currentFilter.brands.includes(b) ? 'checked' : ''}>
        <label for="brand-${b}">${b}</label>
      </div>`).join('');

    el.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        currentFilter.brands = [...el.querySelectorAll('input:checked')].map(i => i.value);
        applyFilters();
      });
    });
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  function filteredProducts() {
    let list = [...allProducts];

    if (currentFilter.q) {
      const q = currentFilter.q.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
    }
    if (currentFilter.cat && currentFilter.cat !== 'all') {
      list = list.filter(p => p.category === currentFilter.cat);
    }
    if (currentFilter.brands.length) {
      list = list.filter(p => currentFilter.brands.includes(p.brand));
    }
    if (currentFilter.priceMin !== '') {
      list = list.filter(p => p.price >= Number(currentFilter.priceMin));
    }
    if (currentFilter.priceMax !== '') {
      list = list.filter(p => p.price <= Number(currentFilter.priceMax));
    }
    if (currentFilter.inStock) {
      list = list.filter(p => p.inStock);
    }

    // Sort
    switch (currentFilter.sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest':     list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
    }

    return list;
  }

  // ── Render products ───────────────────────────────────────────────────────
  function applyFilters() {
    const list = filteredProducts();
    renderProducts(list);
    renderCount(list.length);
    updateURL();
  }

  function renderProducts(list) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3>${t('noProducts')}</h3>
          <p>${t('tryOther')}</p>
          <button class="btn btn-outline" onclick="clearAllFilters()">مسح التصفية</button>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(p => productCardHTML(p)).join('');
    bindAddToCart();
  }

  function renderCount(n) {
    const el = document.getElementById('product-count');
    if (el) el.textContent = `${n} منتج`;
  }

  // ── Update URL params (without reload) ────────────────────────────────────
  function updateURL() {
    const p = new URLSearchParams();
    if (currentFilter.cat && currentFilter.cat !== 'all') p.set('cat', currentFilter.cat);
    if (currentFilter.q) p.set('q', currentFilter.q);
    const newUrl = `${window.location.pathname}${p.toString() ? '?' + p.toString() : ''}`;
    history.replaceState(null, '', newUrl);
  }

  // ── Sort select ───────────────────────────────────────────────────────────
  function initSort() {
    const sel = document.getElementById('sort-select');
    if (!sel) return;
    sel.addEventListener('change', () => {
      currentFilter.sort = sel.value;
      applyFilters();
    });
  }

  // ── Search box (inline) ───────────────────────────────────────────────────
  function initSearchBox() {
    const input = document.getElementById('products-search');
    if (!input) return;
    input.value = initQ;
    input.addEventListener('input', () => {
      currentFilter.q = input.value.trim();
      applyFilters();
    });
  }

  // ── Price filter ──────────────────────────────────────────────────────────
  function initPriceFilter() {
    const minEl = document.getElementById('price-min');
    const maxEl = document.getElementById('price-max');
    const btn   = document.getElementById('apply-price');
    if (!btn) return;
    btn.addEventListener('click', () => {
      currentFilter.priceMin = minEl.value;
      currentFilter.priceMax = maxEl.value;
      applyFilters();
    });
  }

  // ── In-stock filter ───────────────────────────────────────────────────────
  function initStockFilter() {
    const cb = document.getElementById('filter-in-stock');
    if (!cb) return;
    cb.addEventListener('change', () => {
      currentFilter.inStock = cb.checked;
      applyFilters();
    });
  }

  // ── Clear all filters ─────────────────────────────────────────────────────
  window.clearAllFilters = function () {
    currentFilter = { cat: 'all', brands: [], priceMin: '', priceMax: '', inStock: false, q: '', sort: 'default' };
    buildCategorySidebar();
    buildBrandFilter();
    const searchEl = document.getElementById('products-search');
    if (searchEl) searchEl.value = '';
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'default';
    const stockCb = document.getElementById('filter-in-stock');
    if (stockCb) stockCb.checked = false;
    applyFilters();
  };

  // ── Mobile filter toggle ──────────────────────────────────────────────────
  function initFilterToggle() {
    const btn   = document.getElementById('filter-toggle-btn');
    const panel = document.getElementById('filter-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      panel.classList.toggle('open');
      btn.textContent = panel.classList.contains('open') ? '✕ إخفاء التصفية' : '⊞ تصفية المنتجات';
    });
  }

  // ── Init page ─────────────────────────────────────────────────────────────
  buildCategorySidebar();
  buildBrandFilter();
  initSort();
  initSearchBox();
  initPriceFilter();
  initStockFilter();
  initFilterToggle();
  applyFilters();

  // Highlight active page category title
  if (initCat !== 'all') {
    const cats = getStoredCategories();
    const cat  = cats.find(c => c.slug === initCat);
    const titleEl = document.getElementById('page-category-title');
    if (titleEl && cat) titleEl.textContent = cat.name;
  }
});
