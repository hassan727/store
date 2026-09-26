// ============================================================
// product.js — Product detail page logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initPage('products');

  const productId = parseInt(getParam('id'), 10);
  const products  = getStoredProducts();

  if (!productId || isNaN(productId)) {
    renderError('لم يتم تحديد رقم المنتج.');
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    renderError(`لم يتم العثور على المنتج رقم ${productId}.`);
    return;
  }

  renderProduct(product);

  function renderProduct(p) {
    document.title = `${p.name} — VoltStore`;

    const discount   = getDiscount(p.price, p.oldPrice);
    const stockClass = p.inStock ? 'in-stock' : 'out-of-stock';
    const stockText  = p.inStock ? t('inStock') : t('outOfStock');

    // ── Gallery ──────────────────────────────────────────────────────────────
    const galleryEl = document.getElementById('product-gallery');
    const images = p.images && p.images.length ? p.images : [p.image];
    galleryEl.innerHTML = `
      <div class="gallery-main">
        <img id="gallery-main-img" src="${images[0]}" alt="${p.name}" />
      </div>
      <div class="gallery-thumbs">
        ${images.map((img, i) => `
          <button class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchImage('${img}', this)" aria-label="صورة ${i + 1}">
            <img src="${img}" alt="${p.name} - صورة ${i + 1}" loading="lazy" />
          </button>`).join('')}
      </div>`;

    window.switchImage = function (src, btn) {
      document.getElementById('gallery-main-img').src = src;
      document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
    };

    // ── Info ──────────────────────────────────────────────────────────────────
    const infoEl = document.getElementById('product-info');
    infoEl.innerHTML = `
      <div class="product-detail-brand">${p.brand}</div>
      <h1 class="product-detail-name">${p.name}</h1>
      <div class="product-detail-meta">
        <div class="product-rating">
          ${renderStars(p.rating)}
          <span class="rating-count">(${p.reviews} تقييم)</span>
        </div>
        <span class="product-sku">${t('sku')}: ${p.sku}</span>
      </div>
      <div class="product-detail-price">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px;">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="discount-pct">وفّر ${discount}%</span>` : ''}
        </div>
        <div class="product-availability ${stockClass}" style="margin-top:8px;">${stockText}</div>
      </div>

      <div class="qty-selector">
        <label for="qty-input">${t('quantity')}:</label>
        <div class="qty-control">
          <button id="qty-minus" aria-label="تقليل الكمية" onclick="adjustQty(-1)">−</button>
          <input type="number" id="qty-input" value="1" min="1" max="99" aria-label="الكمية" />
          <button id="qty-plus" aria-label="زيادة الكمية" onclick="adjustQty(1)">+</button>
        </div>
      </div>

      <div class="product-detail-actions">
        <button class="btn btn-primary btn-lg" id="add-to-cart-main" ${!p.inStock ? 'disabled' : ''} aria-label="إضافة ${p.name} للسلة">
          ${icon('cart')} ${t('addToCart')}
        </button>
        <a href="cart.html" class="btn btn-secondary btn-lg" aria-label="عرض السلة">
          ${icon('eye')} ${t('cart')}
        </a>
      </div>

      <!-- Tabs -->
      <div class="tabs" role="tablist">
        <button class="tab-btn active" role="tab" aria-selected="true" aria-controls="tab-desc" id="tab-btn-desc" onclick="switchTab('desc', this)">${t('description')}</button>
        <button class="tab-btn" role="tab" aria-selected="false" aria-controls="tab-spec" id="tab-btn-spec" onclick="switchTab('spec', this)">${t('specifications')}</button>
      </div>

      <div id="tab-desc" class="tab-panel active" role="tabpanel" aria-labelledby="tab-btn-desc">
        <p style="line-height:1.8;color:var(--text-secondary);font-size:0.95rem;">${p.description}</p>
      </div>
      <div id="tab-spec" class="tab-panel" role="tabpanel" aria-labelledby="tab-btn-spec">
        <table class="spec-table" aria-label="المواصفات">
          <tbody>
            ${Object.entries(p.specifications || {}).map(([k, v]) =>
              `<tr><td>${k}</td><td>${v}</td></tr>`
            ).join('')}
          </tbody>
        </table>
      </div>`;

    // ── Quantity control ──────────────────────────────────────────────────────
    window.adjustQty = function (delta) {
      const input = document.getElementById('qty-input');
      const current = parseInt(input.value, 10) || 1;
      input.value = Math.max(1, Math.min(99, current + delta));
    };

    // ── Add to cart ───────────────────────────────────────────────────────────
    const addBtn = document.getElementById('add-to-cart-main');
    if (addBtn && p.inStock) {
      addBtn.addEventListener('click', () => {
        const qty = parseInt(document.getElementById('qty-input').value, 10) || 1;
        addToCart(p.id, qty);
        showToast(`تم إضافة ${qty} × ${p.name} للسلة ✓`, 'success');
        addBtn.innerHTML = `${icon('check')} تم الإضافة`;
        setTimeout(() => { addBtn.innerHTML = `${icon('cart')} ${t('addToCart')}`; }, 2000);
      });
    }

    // ── Tab switching ─────────────────────────────────────────────────────────
    window.switchTab = function (tabId, btn) {
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      document.getElementById('tab-' + tabId).classList.add('active');
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    };

    // ── Breadcrumb ────────────────────────────────────────────────────────────
    const cats = getStoredCategories();
    const cat  = cats.find(c => c.slug === p.category);
    const breadEl = document.getElementById('product-breadcrumb');
    if (breadEl && cat) {
      breadEl.innerHTML = `
        <a href="index.html">الرئيسية</a>
        <span>/</span>
        <a href="products.html">المنتجات</a>
        <span>/</span>
        <a href="products.html?cat=${cat.slug}">${cat.name}</a>
        <span>/</span>
        <span aria-current="page">${p.name}</span>`;
    }
    document.getElementById('product-page-title').textContent = p.name;

    // ── Related products ──────────────────────────────────────────────────────
    const relatedEl = document.getElementById('related-products');
    if (relatedEl) {
      const related = products
        .filter(rp => rp.category === p.category && rp.id !== p.id)
        .slice(0, 4);
      if (related.length) {
        relatedEl.innerHTML = related.map(rp => productCardHTML(rp)).join('');
        bindAddToCart();
      } else {
        document.getElementById('related-section').style.display = 'none';
      }
    }
  }

  function renderError(msg) {
    document.title = 'خطأ — VoltStore';
    const main = document.getElementById('main-content');
    if (main) main.innerHTML = `
      <div class="container" style="padding:80px 20px;text-align:center;">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="80" height="80"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h2 style="margin:16px 0 8px;">المنتج غير موجود</h2>
          <p style="color:var(--text-muted);margin-bottom:24px;">${msg}</p>
          <a href="products.html" class="btn btn-primary">العودة للمنتجات</a>
        </div>
      </div>`;
  }
});
