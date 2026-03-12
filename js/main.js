/**
 * Простое поведение UI для прототипа:
 * - подсветка активного пункта меню
 * - подтверждение удаления (общая модалка)
 * - мок-создание CMS магазинов (localStorage)
 */

(function () {
  'use strict';

  function normalizePath(pathname) {
    if (!pathname) return '/';
    return pathname.replace(/\\/g, '/');
  }

  function setActiveSidebarLink() {
    var current = normalizePath(window.location.pathname);
    var links = document.querySelectorAll('[data-nav-link]');
    links.forEach(function (a) {
      try {
        var url = new URL(a.getAttribute('href'), window.location.origin);
        var target = normalizePath(url.pathname);
        if (target === current) {
          a.classList.add('active');
          var collapseId = a.getAttribute('data-collapse-target');
          if (collapseId) {
            var collapseEl = document.querySelector(collapseId);
            if (collapseEl && window.bootstrap) {
              var collapse = window.bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
              collapse.show();
            }
          }
        }
      } catch (e) {
        // В прототипе тихо игнорируем некорректные ссылки
      }
    });
  }

  function wireDeleteModal() {
    var modalEl = document.getElementById('confirmDeleteModal');
    if (!modalEl) return;

    var nameEl = modalEl.querySelector('[data-delete-name]');
    var actionEl = modalEl.querySelector('[data-delete-action]');

    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action="delete"]');
      if (!btn) return;

      var itemName = btn.getAttribute('data-item-name') || 'элемент';
      if (nameEl) nameEl.textContent = itemName;

      if (actionEl) {
        actionEl.onclick = function () {
          // Это статический прототип — показываем только визуальную реакцию.
          btn.closest('tr, .card, .list-group-item')?.remove();
        };
      }
    });
  }

  var CMS_STORAGE_KEY = 'demo_cms_stores_v1';

  function loadCmsStores() {
    try {
      var raw = localStorage.getItem(CMS_STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveCmsStores(stores) {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(stores));
    } catch (e) {
      // Игнорируем для прототипа
    }
  }

  function renderCmsStores() {
    var container = document.getElementById('cmsStoresContainer');
    if (!container) return;

    var stores = loadCmsStores();
    if (stores.length === 0) {
      container.innerHTML = '' +
        '<div class="alert alert-info mb-0">' +
        '<div class="fw-semibold">Пока нет созданных CMS.</div>' +
        '<div class="small">Нажмите «Создать CMS», чтобы добавить магазин (это сохранится в localStorage).</div>' +
        '</div>';
      return;
    }

    container.innerHTML = stores.map(function (s) {
      return '' +
        '<div class="col-12 col-md-6 col-xl-4">' +
        '  <div class="card card-soft h-100">' +
        '    <div class="card-body">' +
        '      <div class="d-flex align-items-start justify-content-between">' +
        '        <div>' +
        '          <div class="fw-semibold">' + escapeHtml(s.name) + '</div>' +
        '          <div class="small text-muted-2">CMS ID: ' + escapeHtml(s.id) + '</div>' +
        '        </div>' +
        '        <span class="badge text-bg-success">Активна</span>' +
        '      </div>' +
        '      <hr />' +
        '      <div class="small text-muted-2 mb-3">Каталог магазина формируется из общего каталога.</div>' +
        '      <div class="d-flex gap-2 flex-wrap">' +
        '        <a class="btn btn-sm btn-outline-primary" href="cms-store.html?store=' + encodeURIComponent(s.id) + '">Открыть</a>' +
        '        <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete-store" data-store-id="' + escapeHtml(s.id) + '" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" data-item-name="CMS «' + escapeHtml(s.name) + '»">Удалить</button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join('');
  }

  function wireCmsCreate() {
    var btn = document.getElementById('createCmsBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var storeName = prompt('Название магазина для CMS (пример: Магазин на Ленина)');
      if (!storeName) return;

      var stores = loadCmsStores();
      var id = 'store_' + Date.now();
      stores.unshift({ id: id, name: storeName.trim() });
      saveCmsStores(stores);
      renderCmsStores();
    });
  }

  function wireCmsDelete() {
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action="delete-store"]');
      if (!btn) return;

      var storeId = btn.getAttribute('data-store-id');
      var actionEl = document.querySelector('#confirmDeleteModal [data-delete-action]');
      if (!actionEl) return;

      actionEl.onclick = function () {
        var stores = loadCmsStores().filter(function (s) { return s.id !== storeId; });
        saveCmsStores(stores);
        renderCmsStores();
      };
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveSidebarLink();
    wireDeleteModal();
    wireCmsCreate();
    wireCmsDelete();
    renderCmsStores();
  });
})();

