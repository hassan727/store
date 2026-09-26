// ============================================================
// cart.js — Shopping Cart Page Controller
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
});

function renderCartPage() {
  const container = document.getElementById('cart-content');
  const summaryEl = document.getElementById('cart-summary-col');
  if (!container) return;

  const rawCart = JSON.parse(localStorage.getItem('electrotech_cart_v1') || '[]');

  if (rawCart.length === 0) {
    container.innerHTML = `
      <div style="background: #ffffff; border-radius: 16px; padding: 60px 20px; text-align: center; border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-cart-arrow-down" style="font-size: 4rem; color: #94a3b8; margin-bottom: 20px;"></i>
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">سلة التسوق فارغة</h3>
        <p style="color: #64748b; margin-bottom: 24px;">لم تقم بإضافة أي أجهزة كهربائية إلى سلتك حتى الآن.</p>
        <a href="index.html#featured-products-section" class="btn btn-primary" style="background: #0a3d62; color: #fff; padding: 12px 28px; border-radius: 9999px;">
          <i class="fa-solid fa-bag-shopping"></i> تصفح الأجهزة الكهربائية
        </a>
      </div>
    `;
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (summaryEl) summaryEl.style.display = 'block';

  // Table items
  const itemsHTML = rawCart.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 16px 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; background: #f8fafc; border-radius: 8px; padding: 4px; border: 1px solid #e2e8f0;" />
          <div>
            <span style="font-size: 0.75rem; color: #2563eb; font-weight: 700;">${item.brand}</span>
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #0f172a; margin: 2px 0;">${item.name}</h4>
          </div>
        </div>
      </td>
      <td style="padding: 16px 12px; font-weight: 700; color: #0a3d62;">${Number(item.price).toLocaleString('ar-EG')} ج.م</td>
      <td style="padding: 16px 12px;">
        <div style="display: inline-flex; align-items: center; background: #f1f5f9; border-radius: 6px; border: 1px solid #e2e8f0;">
          <button onclick="changePageQty(${item.id}, -1)" style="border:none; background:transparent; width:28px; height:28px; cursor:pointer; font-weight:700;">-</button>
          <span style="padding: 0 10px; font-weight: 700;">${item.qty || 1}</span>
          <button onclick="changePageQty(${item.id}, 1)" style="border:none; background:transparent; width:28px; height:28px; cursor:pointer; font-weight:700;">+</button>
        </div>
      </td>
      <td style="padding: 16px 12px; font-weight: 900; color: #dc2626;">${Number(item.price * (item.qty || 1)).toLocaleString('ar-EG')} ج.م</td>
      <td style="padding: 16px 12px;">
        <button onclick="removePageItem(${item.id})" style="background:transparent; border:none; color:#dc2626; cursor:pointer; font-weight:700;">
          <i class="fa-regular fa-trash-can"></i> حذف
        </button>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div style="background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; text-align: right;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 14px 16px; font-size: 0.85rem; color: #64748b;">المنتج</th>
            <th style="padding: 14px 16px; font-size: 0.85rem; color: #64748b;">السعر</th>
            <th style="padding: 14px 16px; font-size: 0.85rem; color: #64748b;">الكمية</th>
            <th style="padding: 14px 16px; font-size: 0.85rem; color: #64748b;">الإجمالي</th>
            <th style="padding: 14px 16px; font-size: 0.85rem; color: #64748b;">حذف</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
      <a href="index.html#featured-products-section" style="color: #0a3d62; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-arrow-right"></i> مواصلة التسوق
      </a>
      <button onclick="clearPageCart()" style="background: transparent; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; color: #64748b; cursor: pointer; font-weight: 600;">
        <i class="fa-regular fa-trash-can"></i> مسح السلة بالكامل
      </button>
    </div>
  `;

  // Summary
  const subtotal = rawCart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const count = rawCart.reduce((acc, item) => acc + (item.qty || 1), 0);
  const shipping = subtotal > 1000 ? 0 : 75;
  const total = subtotal + shipping;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #0a3d62; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">ملخص الطلب</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; color: #64748b;">
          <span>عدد الأجهزة (${count} قطعة):</span>
          <strong style="color: #0f172a;">${Number(subtotal).toLocaleString('ar-EG')} ج.م</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; color: #64748b;">
          <span>الشحن والتوصيل:</span>
          <span style="color: #10b981; font-weight: 700;">${shipping === 0 ? 'مجاني' : Number(shipping).toLocaleString('ar-EG') + ' ج.م'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 14px; padding-top: 14px; border-top: 1px dashed #e2e8f0; font-size: 1.15rem; font-weight: 800;">
          <span>الإجمالي النهائي:</span>
          <span style="color: #dc2626; font-size: 1.35rem; font-weight: 900;">${Number(total).toLocaleString('ar-EG')} ج.م</span>
        </div>
        <button onclick="openCheckoutModal()" class="cart-checkout-btn" style="width: 100%; margin-top: 20px;">
          <i class="fa-solid fa-truck-fast"></i> إتمام الشراء والدفع
        </button>
      </div>
    `;
  }
}

function changePageQty(productId, delta) {
  let cart = JSON.parse(localStorage.getItem('electrotech_cart_v1') || '[]');
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  const newQty = (item.qty || 1) + delta;
  if (newQty <= 0) {
    removePageItem(productId);
    return;
  }
  item.qty = newQty;
  localStorage.setItem('electrotech_cart_v1', JSON.stringify(cart));
  renderCartPage();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function removePageItem(productId) {
  let cart = JSON.parse(localStorage.getItem('electrotech_cart_v1') || '[]');
  cart = cart.filter(i => i.id !== productId);
  localStorage.setItem('electrotech_cart_v1', JSON.stringify(cart));
  renderCartPage();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function clearPageCart() {
  if (confirm('هل أنت متأكد من رغبتك في إفراغ سلة التسوق؟')) {
    localStorage.setItem('electrotech_cart_v1', JSON.stringify([]));
    renderCartPage();
    if (typeof updateCartBadge === 'function') updateCartBadge();
  }
}
