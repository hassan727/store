// ============================================================
// checkout.js — Checkout page logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initPage('');
  renderCheckoutPage();
});

function renderCheckoutPage() {
  const cart = getCart();
  const products = getStoredProducts();
  const container = document.getElementById('checkout-container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="card" style="margin: 40px auto; max-width: 600px; text-align: center; padding: 48px 24px;">
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="80" height="80">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h3>سلة التسوق فارغة</h3>
          <p>يرجى إضافة منتجات إلى السلة للمتابعة لإتمام الطلب.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top:16px;">تصفح المنتجات</a>
        </div>
      </div>`;
    return;
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= 500 ? 0 : 49;
  const total = subtotal + shipping;

  const itemsListHTML = cart.map(item => {
    const prod = products.find(p => p.id === item.productId);
    const name = prod ? prod.name : item.name;
    const img = prod ? prod.image : (item.image || '');
    return `
      <div class="order-item">
        <div class="order-item-img">
          <img src="${img}" alt="${name}" />
        </div>
        <div style="flex:1;">
          <div class="order-item-name">${name}</div>
          <div class="order-item-qty">الكمية: ${item.qty} × ${formatPrice(item.price)}</div>
        </div>
        <div class="order-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="checkout-layout">
      <!-- Shipping & Customer Form -->
      <section class="checkout-form-card" aria-label="بيانات الشحن والتوصيل">
        <h3>بيانات الشحن والتوصيل</h3>
        <form id="checkout-form" novalidate>
          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label for="cust-name">الاسم الكامل <span style="color:var(--error)">*</span></label>
              <input type="text" id="cust-name" class="form-control" required placeholder="مثال: محمد عبدالله" />
              <small class="form-error" id="err-name" style="color:var(--error);display:none;">يرجى كتابة الاسم الكامل</small>
            </div>
            <div class="form-group">
              <label for="cust-phone">رقم الجوال <span style="color:var(--error)">*</span></label>
              <input type="tel" id="cust-phone" class="form-control" required placeholder="05XXXXXXXX" dir="ltr" style="text-align:right;" />
              <small class="form-error" id="err-phone" style="color:var(--error);display:none;">يرجى إدخال رقم جوال صحيح</small>
            </div>
          </div>

          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label for="cust-email">البريد الإلكتروني <span style="color:var(--error)">*</span></label>
              <input type="email" id="cust-email" class="form-control" required placeholder="user@example.com" dir="ltr" style="text-align:right;" />
              <small class="form-error" id="err-email" style="color:var(--error);display:none;">يرجى إدخال بريد إلكتروني صالح</small>
            </div>
            <div class="form-group">
              <label for="cust-city">المدينة <span style="color:var(--error)">*</span></label>
              <select id="cust-city" class="form-control" required>
                <option value="">اختر المدينة...</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
                <option value="الدمام">الدمام</option>
                <option value="الخبر">الخبر</option>
                <option value="أبها">أبها</option>
                <option value="تبوك">تبوك</option>
                <option value="أخرى">مدينة أخرى</option>
              </select>
              <small class="form-error" id="err-city" style="color:var(--error);display:none;">يرجى اختيار المدينة</small>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label for="cust-address">عنوان التوصيل (الحي، الشارع، رقم المبنى) <span style="color:var(--error)">*</span></label>
            <input type="text" id="cust-address" class="form-control" required placeholder="مثال: حي الياسمين، طريق أنس بن مالك" />
            <small class="form-error" id="err-address" style="color:var(--error);display:none;">يرجى إدخال العنوان بالتفصيل</small>
          </div>

          <div class="form-group" style="margin-bottom:24px;">
            <label for="cust-notes">ملاحظات إضافية للتوصيل (اختياري)</label>
            <textarea id="cust-notes" class="form-control" rows="2" placeholder="ملاحظات المندوب أو وقت التوصيل المفضل..."></textarea>
          </div>

          <h3 style="margin-top:28px;">طريقة الدفع</h3>
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:24px;">
            <label class="card" style="display:flex; align-items:center; gap:14px; padding:16px; cursor:pointer; margin:0; border:2px solid var(--primary);">
              <input type="radio" name="paymentMethod" value="cod" checked style="accent-color:var(--primary); width:18px; height:18px;" />
              <div>
                <strong>الدفع عند الاستلام (COD)</strong>
                <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">ادفع نقداً أو عبر البطاقة عند استلام أجهزتك</p>
              </div>
            </label>
            <label class="card" style="display:flex; align-items:center; gap:14px; padding:16px; cursor:pointer; margin:0;">
              <input type="radio" name="paymentMethod" value="card" style="accent-color:var(--primary); width:18px; height:18px;" />
              <div>
                <strong>بطاقة مدى / البطاقة الائتمانية (تجريبي)</strong>
                <p style="font-size:0.82rem; color:var(--text-muted); margin:0;">دفع إلكتروني آمن وسريع عبر البوابة الافتراضية</p>
              </div>
            </label>
          </div>

          <div class="demo-notice">
            ${icon('bolt')} هذا الموقع نموذج توضيحي للواجهة الأمامية فقط. لن يتم خصم مبالغ حقيقية.
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" id="submit-order-btn" style="margin-top:16px;">
            تأكيد الطلب الآن (${formatPrice(total)})
          </button>
        </form>
      </section>

      <!-- Order Review Sidebar -->
      <aside class="order-review" aria-label="ملخص المنتجات والطلب">
        <h3>ملخص الطلب (${cart.length} منتجات)</h3>
        <div style="max-height: 280px; overflow-y:auto; margin-bottom:16px; padding-inline-end:4px;">
          ${itemsListHTML}
        </div>

        <div class="summary-row">
          <span>المجموع الفرعي</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>الشحن والتوصيل</span>
          <span>${shipping === 0 ? '<strong style="color:var(--success)">مجاني</strong>' : formatPrice(shipping)}</span>
        </div>
        <div class="summary-total">
          <span class="label">الإجمالي النهائي</span>
          <span class="value">${formatPrice(total)}</span>
        </div>

        <div style="margin-top:20px; font-size:0.82rem; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">${icon('shield')} ضمان رسمي سنتان على جميع الأجهزة</div>
          <div style="display:flex; align-items:center; gap:8px;">${icon('refresh')} إرجاع واستبدال مجاني خلال 14 يوم</div>
        </div>
      </aside>
    </div>`;

  bindCheckoutForm();
}

function bindCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('cust-name');
    const phoneEl   = document.getElementById('cust-phone');
    const emailEl   = document.getElementById('cust-email');
    const cityEl    = document.getElementById('cust-city');
    const addressEl = document.getElementById('cust-address');
    const notesEl   = document.getElementById('cust-notes');

    let isValid = true;

    function checkField(el, errId, condition) {
      const err = document.getElementById(errId);
      if (condition) {
        if (err) err.style.display = 'block';
        el.style.borderColor = 'var(--error)';
        isValid = false;
      } else {
        if (err) err.style.display = 'none';
        el.style.borderColor = '';
      }
    }

    checkField(nameEl, 'err-name', !nameEl.value.trim());
    checkField(phoneEl, 'err-phone', !phoneEl.value.trim() || phoneEl.value.trim().length < 8);
    checkField(emailEl, 'err-email', !emailEl.value.trim() || !emailEl.value.includes('@'));
    checkField(cityEl, 'err-city', !cityEl.value);
    checkField(addressEl, 'err-address', !addressEl.value.trim());

    if (!isValid) {
      showToast('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
      return;
    }

    const cart = getCart();
    const subtotal = getCartTotal();
    const shipping = subtotal >= 500 ? 0 : 49;
    const total = subtotal + shipping;

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'cod';

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderDate = new Date().toISOString().split('T')[0];

    const newOrder = {
      id: orderId,
      date: orderDate,
      customer: nameEl.value.trim(),
      email: emailEl.value.trim(),
      phone: phoneEl.value.trim(),
      city: cityEl.value,
      address: addressEl.value.trim(),
      notes: notesEl ? notesEl.value.trim() : '',
      paymentMethod: paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة مدى / ائتمانية',
      status: 'pending',
      items: cart.map(i => ({ productId: i.productId, qty: i.qty, price: i.price, name: i.name })),
      total: total,
    };

    // Save to localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
      existingOrders.unshift(newOrder);
      localStorage.setItem('customer_orders', JSON.stringify(existingOrders));
    } catch (err) {
      console.error('Error saving order', err);
    }

    // Clear shopping cart
    clearCart();
    updateCartBadge();

    // Show Confirmation Screen
    showOrderConfirmation(newOrder);
  });
}

function showOrderConfirmation(order) {
  const container = document.getElementById('checkout-container');
  if (!container) return;

  container.innerHTML = `
    <div class="order-confirm">
      <div class="confirm-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 style="font-size: 1.8rem; margin-bottom: 12px; color:var(--text-primary);">شكراً لك! تم استلام طلبك بنجاح</h2>
      <p style="color:var(--text-secondary); margin-bottom: 24px;">
        تم تأكيد طلبك وسيتواصل معك مندوب الشحن قبل التوصيل.
      </p>

      <div class="card" style="text-align:start; padding:24px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <div>
            <div style="font-size:0.82rem; color:var(--text-muted);">رقم الطلب</div>
            <strong style="font-size:1.15rem; color:var(--primary);">${order.id}</strong>
          </div>
          <div>
            <div style="font-size:0.82rem; color:var(--text-muted);">التاريخ</div>
            <strong>${order.date}</strong>
          </div>
          <div>
            <div style="font-size:0.82rem; color:var(--text-muted);">الإجمالي</div>
            <strong style="color:var(--success); font-size:1.1rem;">${formatPrice(order.total)}</strong>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.9rem;">
          <div><strong>الاسم:</strong> ${order.customer}</div>
          <div><strong>الجوال:</strong> ${order.phone}</div>
          <div><strong>المدينة:</strong> ${order.city}</div>
          <div><strong>طريقة الدفع:</strong> ${order.paymentMethod}</div>
          <div style="grid-column:1/-1;"><strong>العنوان:</strong> ${order.address}</div>
        </div>
      </div>

      <div class="confirm-badge">
        ${icon('bolt')} تم حفظ الطلب بنجاح في متصفحك. يمكنك مراجعته أو تتبعه في صفحة طلباتي.
      </div>

      <div style="display:flex; justify-content:center; gap:16px; margin-top:32px; flex-wrap:wrap;">
        <a href="orders.html" class="btn btn-primary btn-lg">عرض طلباتي</a>
        <a href="products.html" class="btn btn-outline btn-lg">مواصلة التسوق</a>
      </div>
    </div>`;

  showToast('تم إتمام الطلب بنجاح! رقم: ' + order.id, 'success', 5000);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
