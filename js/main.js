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

  function wireSalesPointStatusDropdown() {
    document.addEventListener('click', function (event) {
      var option = event.target.closest('[data-status-option]');
      if (!option) return;

      var dropdown = option.closest('[data-status-dropdown]');
      if (!dropdown) return;

      var badge = dropdown.querySelector('.badge');
      if (!badge) return;

      var label = option.getAttribute('data-status-label');
      var badgeClass = option.getAttribute('data-status-class');

      if (label) {
        badge.textContent = label;
      }

      if (badgeClass) {
        badge.className = 'badge ' + badgeClass + ' border-0';
      }
    });
  }

  var CATEGORY_ATTRIBUTES = {
    '10': [
      { group: 'Основные', name: 'Бренд', type: 'Справочник', unit: '' },
      { group: 'Основные', name: 'Модель', type: 'Строка', unit: '' },
      { group: 'Дисплей', name: 'Диагональ экрана', type: 'Число', unit: '″' },
      { group: 'Дисплей', name: 'Тип матрицы', type: 'Справочник', unit: '' },
      { group: 'Память', name: 'Объём встроенной памяти', type: 'Число', unit: 'ГБ' }
    ],
    '11': [
      { group: 'Основные', name: 'Бренд', type: 'Справочник', unit: '' },
      { group: 'Основные', name: 'Модель', type: 'Строка', unit: '' },
      { group: 'Производительность', name: 'Процессор', type: 'Строка', unit: '' },
      { group: 'Производительность', name: 'Объём оперативной памяти', type: 'Число', unit: 'ГБ' },
      { group: 'Накопитель', name: 'Тип накопителя', type: 'Справочник', unit: '' },
      { group: 'Накопитель', name: 'Объём SSD', type: 'Число', unit: 'ГБ' }
    ],
    '12': [
      { group: 'Основные', name: 'Тип аксессуара', type: 'Справочник', unit: '' },
      { group: 'Совместимость', name: 'Тип разъёма', type: 'Справочник', unit: '' },
      { group: 'Физические параметры', name: 'Длина кабеля', type: 'Число', unit: 'м' }
    ]
  };

  function renderCategoryAttributes(categoryId) {
    var tbody = document.getElementById('categoryAttributesBody');
    if (!tbody) return;

    var attributes = CATEGORY_ATTRIBUTES[categoryId] || [];

    if (!attributes.length) {
      tbody.innerHTML = '' +
        '<tr>' +
        '  <td colspan="5" class="text-muted small">Для выбранной категории пока не настроены характеристики.</td>' +
        '</tr>';
      return;
    }

    tbody.innerHTML = attributes.map(function (attr) {
      return '' +
        '<tr>' +
        '  <td>' + escapeHtml(attr.group) + '</td>' +
        '  <td>' + escapeHtml(attr.name) + '</td>' +
        '  <td>' + escapeHtml(attr.type) + '</td>' +
        '  <td>' + escapeHtml(attr.unit) + '</td>' +
        '  <td class="text-end">' +
        '    <button type="button" class="btn btn-sm btn-outline-secondary" disabled>Редактировать</button>' +
        '  </td>' +
        '</tr>';
    }).join('');
  }

  function wireCategoryAttributes() {
    var categoriesTable = document.querySelector('[data-categories-table]');
    if (!categoriesTable) return;

    categoriesTable.addEventListener('click', function (event) {
      var link = event.target.closest('[data-category-id]');
      if (!link || !categoriesTable.contains(link)) return;

      event.preventDefault();

      var categoryId = link.getAttribute('data-category-id');
      if (!categoryId) return;

      var activeRow = categoriesTable.querySelector('tr.table-active');
      if (activeRow) {
        activeRow.classList.remove('table-active');
      }

      var currentRow = link.closest('tr');
      if (currentRow) {
        currentRow.classList.add('table-active');
      }

      renderCategoryAttributes(categoryId);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveSidebarLink();
    wireDeleteModal();
    wireCmsCreate();
    wireCmsDelete();
    renderCmsStores();
    wireSalesPointStatusDropdown();
    wirePhotoPreviewModal();
    wireCategoryAttributes();
  });
})();

/**
 * Модальное окно предпросмотра фото товара.
 * Отвечает только за открытие/закрытие крупного изображения при клике.
 */
function wirePhotoPreviewModal() {
  var modalEl = document.getElementById('photoPreviewModal');
  if (!modalEl || !window.bootstrap) return;

  var imgTarget = modalEl.querySelector('[data-photo-preview-image]');
  if (!imgTarget) return;

  var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);

  document.addEventListener('click', function (event) {
    var img = event.target.closest('.photo-preview img');
    if (!img) {
      return;
    }

    var src = img.getAttribute('src');
    if (!src) {
      return;
    }

    var alt = img.getAttribute('alt') || 'Предпросмотр фото';

    imgTarget.setAttribute('src', src);
    imgTarget.setAttribute('alt', alt);

    modal.show();
  });
}

