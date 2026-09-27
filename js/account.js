// ============================================================
// account.js — Customer Account page logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initPage('account');
  renderAccountPage();
});

function getAuthUser() {
  try {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : { role: 'customer', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567', city: 'الرياض' };
  } catch {
    return { role: 'customer', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567', city: 'الرياض' };
  }
}

function renderAccountPage() {
  const container = document.getElementById('account-container');
  if (!container) return;

  const user = getAuthUser();
  const orders = getStoredOrders();
  const userOrders = orders.slice(0, 3); // latest 3 orders for overview

  container.innerHTML = `
    <div class="account-layout">
      <!-- Sidebar -->
      <aside class="account-sidebar" aria-label="قائمة الحساب">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border);">
          <div style="width:48px; height:48px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.2rem;">
            ${user.name.charAt(0)}
          </div>
          <div>
            <div style="font-weight:700; font-size:0.95rem;">${user.name}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${user.email}</div>
          </div>
        </div>

        <nav class="account-nav" aria-label="روابط الحساب">
          <a href="#" class="tab-link active" data-tab="overview">
            ${icon('dashboard')} نظرة عامة
          </a>
          <a href="orders.html">
            ${icon('orders')} طلباتي (${orders.length})
          </a>
          <a href="#" class="tab-link" data-tab="profile">
            ${icon('user')} البيانات الشخصية
          </a>
          <a href="#" class="tab-link" data-tab="address">
            ${icon('map')} العناوين المحفوظة
          </a>
          <div class="divider" style="margin:12px 0;"></div>
          <a href="#" id="logout-btn" style="color:var(--error);">
            ${icon('logOut')} تسجيل الخروج
          </a>
        </nav>
      </aside>

      <!-- Content Area -->
      <div class="account-content" id="account-tab-content">
        <!-- Overview Tab -->
        <div class="account-tab active" id="tab-overview">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px;">
            <div class="card" style="padding:20px; display:flex; align-items:center; gap:16px;">
              <div style="width:48px; height:48px; background:var(--info-bg); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:var(--secondary);">
                ${icon('orders')}
              </div>
              <div>
                <div style="font-size:0.82rem; color:var(--text-muted);">إجمالي الطلبات</div>
                <div style="font-size:1.5rem; font-weight:800;">${orders.length}</div>
              </div>
            </div>

            <div class="card" style="padding:20px; display:flex; align-items:center; gap:16px;">
              <div style="width:48px; height:48px; background:#dcfce7; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:var(--success);">
                ${icon('cart')}
              </div>
              <div>
                <div style="font-size:0.82rem; color:var(--text-muted);">عناصر في السلة</div>
                <div style="font-size:1.5rem; font-weight:800;">${getCartCount()}</div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="account-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border);">
              <h3 style="margin:0; border:none; padding:0;">أحدث الطلبات</h3>
              <a href="orders.html" class="btn btn-outline btn-sm">عرض كل الطلبات</a>
            </div>

            <div style="overflow-x:auto;">
              <table class="orders-table" aria-label="أحدث الطلبات">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>التاريخ</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  ${userOrders.map(o => `
                    <tr>
                      <td><strong>${o.id}</strong></td>
                      <td>${o.date}</td>
                      <td><strong>${formatPrice(o.total)}</strong></td>
                      <td>
                        <span class="badge ${getStatusBadgeClass(o.status)}">${getStatusLabel(o.status)}</span>
                      </td>
                      <td>
                        <a href="orders.html?id=${o.id}" class="btn btn-ghost btn-sm">عرض</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Profile Tab -->
        <div class="account-tab" id="tab-profile" style="display:none;">
          <div class="account-card">
            <h3>تعديل البيانات الشخصية</h3>
            <form id="profile-form">
              <div class="form-group" style="margin-bottom:16px;">
                <label for="prof-name">الاسم الكامل</label>
                <input type="text" id="prof-name" class="form-control" value="${user.name}" required />
              </div>
              <div class="form-group" style="margin-bottom:16px;">
                <label for="prof-email">البريد الإلكتروني</label>
                <input type="email" id="prof-email" class="form-control" value="${user.email}" required dir="ltr" style="text-align:right;" />
              </div>
              <div class="form-group" style="margin-bottom:20px;">
                <label for="prof-phone">رقم الجوال</label>
                <input type="tel" id="prof-phone" class="form-control" value="${user.phone || '0501234567'}" required dir="ltr" style="text-align:right;" />
              </div>
              <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
            </form>
          </div>
        </div>

        <!-- Address Tab -->
        <div class="account-tab" id="tab-address" style="display:none;">
          <div class="account-card">
            <h3>العنوان الافتراضي للشحن</h3>
            <div class="card" style="padding:16px; margin-bottom:16px; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <strong>المنزل</strong>
                  <p style="margin:6px 0 0; color:var(--text-secondary); font-size:0.9rem;">
                    المملكة العربية السعودية، ${user.city || 'الرياض'}، حي النزهة، شارع الملك فهد، مبنى 14
                  </p>
                  <p style="margin:4px 0 0; color:var(--text-muted); font-size:0.85rem;">جوال: ${user.phone || '0501234567'}</p>
                </div>
                <span class="badge badge-primary">افتراضي</span>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="showToast('تم تحديث العنوان الافتراضي', 'success')">تعديل العنوان</button>
          </div>
        </div>
      </div>
    </div>`;

  bindAccountEvents();
}

function bindAccountEvents() {
  // Tab switching
  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabKey = link.getAttribute('data-tab');
      if (!tabKey) return;

      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.account-tab').forEach(t => t.style.display = 'none');
      const target = document.getElementById('tab-' + tabKey);
      if (target) target.style.display = 'block';
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('auth_user');
      showToast('تم تسجيل الخروج بنجاح', 'default');
      setTimeout(() => { window.location.href = 'index.html'; }, 600);
    });
  }

  // Profile save
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('prof-name').value.trim();
      const email = document.getElementById('prof-email').value.trim();
      const phone = document.getElementById('prof-phone').value.trim();
      const user = getAuthUser();
      user.name = name;
      user.email = email;
      user.phone = phone;
      localStorage.setItem('auth_user', JSON.stringify(user));
      showToast('تم حفظ البيانات الشخصية بنجاح ✓', 'success');
      renderAccountPage();
    });
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'delivered': return 'badge-success';
    case 'shipped': return 'badge-info';
    case 'processing': return 'badge-primary';
    case 'pending': return 'badge-warning';
    case 'cancelled': return 'badge-error';
    default: return 'badge-muted';
  }
}

function getStatusLabel(status) {
  const map = {
    delivered: 'تم التسليم',
    shipped: 'تم الشحن',
    processing: 'جاري التجهيز',
    pending: 'قيد الانتظار',
    cancelled: 'ملغي',
  };
  return map[status] || status;
}
