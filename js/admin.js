// ============================================================
// admin.js — Shared logic & components for Admin Panel
// ============================================================

// Admin Sidebar Component
function renderAdminSidebar(activeKey = 'dashboard') {
  const navItems = [
    { key: 'dashboard',   label: 'لوحة التحكم',      href: 'index.html',        icon: 'dashboard' },
    { key: 'products',    label: 'إدارة المنتجات',   href: 'products.html',     icon: 'package' },
    { key: 'categories',  label: 'إدارة الفئات',     href: 'categories.html',   icon: 'category' },
    { key: 'orders',      label: 'إدارة الطلبات',    href: 'orders.html',       icon: 'orders' },
    { key: 'customers',   label: 'العملاء',          href: 'customers.html',    icon: 'users' },
  ];

  return `
    <aside class="admin-sidebar" aria-label="شريط التنقل الإداري">
      <div class="admin-sidebar-logo">
        <div class="logo-icon" style="width:34px; height:34px; background:var(--primary); border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; color:#fff;">
          ${icon('bolt')}
        </div>
        <span class="logo-text" style="font-weight:800; font-size:1.15rem; color:#fff;">Volt<span style="color:var(--primary);">Admin</span></span>
      </div>

      <nav class="admin-nav" aria-label="القائمة الرئيسية">
        <div class="admin-nav-section">
          <div class="admin-nav-label">الرئيسية</div>
          ${navItems.slice(0, 1).map(item => `
            <a href="${item.href}" class="${activeKey === item.key ? 'active' : ''}">
              ${icon(item.icon)}
              <span>${item.label}</span>
            </a>
          `).join('')}
        </div>

        <div class="admin-nav-section" style="margin-top:16px;">
          <div class="admin-nav-label">المتجر والكتالوج</div>
          ${navItems.slice(1, 3).map(item => `
            <a href="${item.href}" class="${activeKey === item.key ? 'active' : ''}">
              ${icon(item.icon)}
              <span>${item.label}</span>
            </a>
          `).join('')}
        </div>

        <div class="admin-nav-section" style="margin-top:16px;">
          <div class="admin-nav-label">المبيعات والمستخدمين</div>
          ${navItems.slice(3).map(item => `
            <a href="${item.href}" class="${activeKey === item.key ? 'active' : ''}">
              ${icon(item.icon)}
              <span>${item.label}</span>
            </a>
          `).join('')}
        </div>
      </nav>

      <div class="admin-sidebar-footer">
        <a href="../index.html" style="display:flex; align-items:center; gap:8px; color:rgba(255,255,255,0.7); text-decoration:none; font-size:0.85rem;">
          ${icon('home')} عرض المتجر
        </a>
      </div>
    </aside>
  `;
}

// Admin Header Component
function renderAdminHeader(pageTitle = '') {
  return `
    <header class="admin-header">
      <div style="display:flex; align-items:center; gap:16px;">
        <h2 style="font-size:1.25rem; font-weight:700; color:var(--text-primary); margin:0;">${pageTitle}</h2>
      </div>

      <div style="display:flex; align-items:center; gap:16px;">
        <a href="../index.html" class="btn btn-outline btn-sm" target="_blank" rel="noopener">
          ${icon('eye')} معاينة المتجر
        </a>
        <div style="display:flex; align-items:center; gap:10px; padding-inline-start:12px; border-inline-start:1px solid var(--border);">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--secondary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">
            A
          </div>
          <div>
            <div style="font-weight:600; font-size:0.85rem; line-height:1.2;">مدير النظام</div>
            <small style="color:var(--text-muted); font-size:0.75rem;">admin@voltstore.sa</small>
          </div>
        </div>
      </div>
    </header>
  `;
}

// Init Admin Layout
function initAdminPage(activeKey, pageTitle) {
  const sidebarContainer = document.getElementById('admin-sidebar-root');
  const headerContainer = document.getElementById('admin-header-root');

  if (sidebarContainer) sidebarContainer.innerHTML = renderAdminSidebar(activeKey);
  if (headerContainer) headerContainer.innerHTML = renderAdminHeader(pageTitle);
}

// Order Status Helper
function getAdminStatusBadge(status) {
  const map = {
    delivered: { cls: 'badge-success', label: 'تم التسليم' },
    shipped:   { cls: 'badge-info',    label: 'تم الشحن' },
    processing:{ cls: 'badge-primary', label: 'جاري المعالجة' },
    pending:   { cls: 'badge-warning', label: 'قيد الانتظار' },
    cancelled: { cls: 'badge-error',   label: 'ملغي' },
  };
  const item = map[status] || { cls: 'badge-muted', label: status };
  return `<span class="badge ${item.cls}">${item.label}</span>`;
}
