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

  /**
   * Каталог характеристик (демо-набор для прототипа).
   * В дальнейшем можно заменить на данные со страницы `catalog/attributes.html`.
   */
  var ATTRIBUTES_CATALOG = [
    { id: '201', name: 'Объём памяти', type: 'Список значений', unit: 'ГБ' },
    { id: '202', name: 'Диагональ экрана', type: 'Число', unit: '″' },
    { id: '203', name: 'Цвет', type: 'Список значений', unit: '' },
    { id: '204', name: 'Бренд', type: 'Строка', unit: '' },
    { id: '205', name: 'Модель', type: 'Строка', unit: '' },
    { id: '206', name: 'Процессор', type: 'Строка', unit: '' },
    { id: '207', name: 'Объём оперативной памяти', type: 'Число', unit: 'ГБ' },
    { id: '208', name: 'Тип накопителя', type: 'Строка', unit: '' },
    { id: '209', name: 'Объём SSD', type: 'Число', unit: 'ГБ' },
    { id: '210', name: 'Тип разъёма', type: 'Строка', unit: '' },
    { id: '211', name: 'Длина кабеля', type: 'Число', unit: 'м' },
    { id: '212', name: 'Тип матрицы', type: 'Строка', unit: '' }
  ];

  var CATEGORY_GROUPS_STORAGE_KEY = 'demo_category_attribute_groups_v1';

  /**
   * Структура:
   * {
   *   [categoryId]: [
   *     {
   *       id,
   *       name,
   *       attributes: [
   *         {
   *           id: '201',
   *           unit: 'ГБ',
   *           numberKind: 'int' | 'decimal',
   *           listValues: ['значение 1', 'значение 2']
   *         }
   *       ]
   *     }
   *   ]
   * }
   */
  function loadCategoryAttributeGroups() {
    try {
      var raw = localStorage.getItem(CATEGORY_GROUPS_STORAGE_KEY);
      if (!raw) return {};
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return {};

      // Миграция старого формата (attributeIds -> attributes)
      Object.keys(data).forEach(function (categoryId) {
        var groups = Array.isArray(data[categoryId]) ? data[categoryId] : [];
        data[categoryId] = groups.map(function (g) {
          if (Array.isArray(g.attributes)) {
            return g;
          }
          if (Array.isArray(g.attributeIds)) {
            return Object.assign({}, g, {
              attributes: g.attributeIds.map(function (id) { return { id: String(id) }; })
            });
          }
          return Object.assign({}, g, { attributes: [] });
        });
      });

      return data;
    } catch (e) {
      return {};
    }
  }

  function saveCategoryAttributeGroups(data) {
    try {
      localStorage.setItem(CATEGORY_GROUPS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Для прототипа игнорируем ошибки хранилища
    }
  }

  function buildDefaultGroups() {
    // Базовые группы (чтобы страница выглядела заполненной до первых действий пользователя).
    return {
      '10': [
        { id: 'g_10_basic', name: 'Основные', attributes: [{ id: '204' }, { id: '205' }] },
        { id: 'g_10_display', name: 'Дисплей', attributes: [{ id: '202' }, { id: '212' }] },
        { id: 'g_10_memory', name: 'Память', attributes: [{ id: '201' }] }
      ],
      '11': [
        { id: 'g_11_basic', name: 'Основные', attributes: [{ id: '204' }, { id: '205' }] },
        { id: 'g_11_perf', name: 'Производительность', attributes: [{ id: '206' }, { id: '207' }] },
        { id: 'g_11_storage', name: 'Накопитель', attributes: [{ id: '208' }, { id: '209' }] }
      ],
      '12': [
        { id: 'g_12_basic', name: 'Основные', attributes: [{ id: '203' }] },
        { id: 'g_12_compat', name: 'Совместимость', attributes: [{ id: '210' }] },
        { id: 'g_12_physical', name: 'Физические параметры', attributes: [{ id: '211' }] }
      ]
    };
  }

  var CATEGORY_ATTRIBUTE_GROUPS = loadCategoryAttributeGroups();
  if (!Object.keys(CATEGORY_ATTRIBUTE_GROUPS).length) {
    CATEGORY_ATTRIBUTE_GROUPS = buildDefaultGroups();
    saveCategoryAttributeGroups(CATEGORY_ATTRIBUTE_GROUPS);
  }

  var selectedCategoryId = null;
  var selectedCategoryName = null;
  var editingGroupId = null;

  function getAttributeById(id) {
    return ATTRIBUTES_CATALOG.find(function (a) { return a.id === String(id); }) || null;
  }

  function isListAttributeType(type) {
    return String(type || '').toLowerCase().includes('спис');
  }

  function isNumberAttributeType(type) {
    return String(type || '').toLowerCase() === 'число';
  }

  var UNIT_OPTIONS = [
    { value: '', label: '— (не указывать)' },
    { value: 'ГБ', label: 'ГБ' },
    { value: 'МБ', label: 'МБ' },
    { value: 'мм', label: 'мм' },
    { value: 'см', label: 'см' },
    { value: 'м', label: 'м' },
    { value: 'МГц', label: 'МГц' },
    { value: 'ГГц', label: 'ГГц' },
    { value: '″', label: 'Дюймы (″)' },
    { value: '%', label: '%' },
    { value: 'Вт', label: 'Вт' },
    { value: 'кг', label: 'кг' }
  ];

  function renderUnitOptionsHtml(selectedValue) {
    var current = String(selectedValue || '');
    return UNIT_OPTIONS.map(function (opt) {
      var isSelected = String(opt.value) === current ? ' selected' : '';
      return '<option value="' + escapeHtml(opt.value) + '"' + isSelected + '>' + escapeHtml(opt.label) + '</option>';
    }).join('');
  }

  function formatTypeLabel(type, cfg) {
    var t = String(type || '');
    if (isNumberAttributeType(t)) {
      if (cfg && cfg.numberKind === 'int') return 'Число (целое)';
      if (cfg && cfg.numberKind === 'decimal') return 'Число (десятичное)';
      return 'Число';
    }
    return t;
  }

  function getAttributePlaceholder(type, cfg) {
    var t = String(type || '');
    if (isNumberAttributeType(t)) {
      if (cfg && cfg.numberKind === 'int') return 'Число (целое)';
      if (cfg && cfg.numberKind === 'decimal') return 'Число (десятичное)';
      return 'Число';
    }
    if (isListAttributeType(t)) {
      return 'Список значений';
    }
    return 'Строка';
  }

  function renderCategoryAttributes(categoryId) {
    var tbody = document.getElementById('categoryAttributesBody');
    if (!tbody) return;

    var groups = (CATEGORY_ATTRIBUTE_GROUPS && CATEGORY_ATTRIBUTE_GROUPS[categoryId]) ? CATEGORY_ATTRIBUTE_GROUPS[categoryId] : [];
    var normalizedGroups = groups.map(function (g) {
      var attrs = Array.isArray(g.attributes) ? g.attributes : [];
      var items = attrs.map(function (cfg) {
        var attr = getAttributeById(cfg.id);
        if (!attr) return null;
        var unit = (cfg && typeof cfg.unit === 'string' && cfg.unit.trim()) ? cfg.unit.trim() : (attr.unit || '');
        var listValues = (cfg && Array.isArray(cfg.listValues)) ? cfg.listValues : [];

        return {
          groupId: g.id,
          groupName: g.name,
          attrId: attr.id,
          name: attr.name,
          type: String(attr.type || ''),
          placeholder: getAttributePlaceholder(attr.type, cfg),
          unit: unit,
          listValues: listValues
        };
      }).filter(Boolean);

      return {
        id: g.id,
        name: g.name,
        items: items
      };
    }).filter(function (g) { return g.items.length > 0; });

    if (!normalizedGroups.length) {
      tbody.innerHTML = '<div class="text-muted small">Для выбранной категории пока не настроены характеристики.</div>';
      return;
    }

    tbody.innerHTML = '' +
      '<div class="row g-3">' +
      normalizedGroups.map(function (g) {
        return '' +
          '<div class="col-12 col-md-6">' +
          '  <div class="card card-soft h-100">' +
          '    <div class="card-body">' +
          '      <div class="d-flex align-items-start justify-content-between gap-2 mb-3">' +
          '        <p class="text-primary mb-0">' + escapeHtml(g.name) + '</p>' +
          '        <div class="btn-group btn-group-sm" role="group" aria-label="Действия с группой">' +
          '          <button class="btn btn-outline-primary border-0" type="button" data-action="edit-attribute-group" data-category-id="' + escapeHtml(categoryId) + '" data-group-id="' + escapeHtml(g.id) + '" title="Редактировать категорию"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></button>' +
          '          <button class="btn btn-outline-danger border-0" type="button" data-action="delete-attribute-group" data-category-id="' + escapeHtml(categoryId) + '" data-group-id="' + escapeHtml(g.id) + '" data-group-name="' + escapeHtml(g.name) + '" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" title="Удалить группу"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"></path><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"></path></svg></button>' +
          '        </div>' +
          '      </div>' +
          '      <div class="row g-3 align-items-end">' +
          g.items.map(function (it) {
            var label = escapeHtml(it.name) + (it.unit ? (' <span class="text-muted-2">(' + escapeHtml(it.unit) + ')</span>') : '');
            var isList = isListAttributeType(it.type);

            if (isList) {
              var values = Array.isArray(it.listValues) ? it.listValues : [];
              var optionsHtml = '';
              optionsHtml += '<option value="" selected disabled>' + escapeHtml(it.placeholder) + '</option>';
              if (values.length) {
                optionsHtml += values.map(function (v) {
                  return '<option value="' + escapeHtml(v) + '" disabled>' + escapeHtml(v) + '</option>';
                }).join('');
              } else {
                optionsHtml += '<option value="" disabled>Значения не заданы</option>';
              }

              return '' +
                '<div class="col-12 col-md-4">' +
                '  <label class="form-label"><small>' + label + '</small></label>' +
                '  <select class="form-select" aria-label="Список значений (просмотр)">' +
                optionsHtml +
                '  </select>' +
                '</div>';
            }

            return '' +
              '<div class="col-12 col-md-4">' +
              '  <label class="form-label"><small>' + label + '</small></label>' +
              '  <input class="form-control" type="text" placeholder="' + escapeHtml(it.placeholder) + '" disabled />' +
              '</div>';
          }).join('') +
          '      </div>' +
          '    </div>' +
          '  </div>' +
          '</div>';
      }).join('') +
      '</div>';
  }

  function setSelectedCategoryUi(name, id) {
    var label = document.getElementById('selectedCategoryName');
    if (label) label.textContent = name ? String(name) : '—';

    var addBtn = document.querySelector('[data-add-attribute-group-btn]');
    if (addBtn) addBtn.disabled = !id;

    var modalCat = document.querySelector('[data-modal-selected-category]');
    if (modalCat) modalCat.textContent = name ? String(name) : '—';

    if (id) {
      renderBrandSelector();  // заполнить селект брендов
      resetLinesAndSeries();  // сбросить списки
    } else {
      var selector = document.getElementById('brandSelector');
      if (selector) selector.disabled = true;
      document.getElementById('addLineBtn').disabled = true;
    }
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

      selectedCategoryId = categoryId;
      selectedCategoryName = link.textContent ? link.textContent.trim() : ('Категория #' + categoryId);
      setSelectedCategoryUi(selectedCategoryName, selectedCategoryId);

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

  function renderAttributePickerList(filter) {
    var listEl = document.querySelector('[data-attribute-picker-list]');
    if (!listEl) return;

    var countEl = document.querySelector('[data-attribute-picker-count]');

    var q = String(filter || '').trim().toLowerCase();
    var items = ATTRIBUTES_CATALOG.filter(function (a) {
      if (!q) return true;
      return (a.name || '').toLowerCase().includes(q) || String(a.id).includes(q);
    });

    if (countEl) countEl.textContent = String(items.length);

    if (!items.length) {
      listEl.innerHTML = '<div class="text-muted small">Ничего не найдено.</div>';
      return;
    }

    listEl.innerHTML = items.map(function (a) {
      var type = String(a.type || '');
      var isNum = isNumberAttributeType(type);
      var isList = isListAttributeType(type);

      return '' +
        '<div class="py-2 border-bottom" data-attribute-picker-row="' + escapeHtml(a.id) + '">' +
        '  <div class="d-flex align-items-start gap-2">' +
        '    <input class="form-check-input mt-1" type="checkbox" value="' + escapeHtml(a.id) + '" data-attribute-picker-item />' +
        '    <div class="flex-grow-1">' +
        '      <div class="d-flex align-items-start justify-content-between gap-2">' +
        '        <div>' +
        '          <div class="text-primary fw-semibold">' + escapeHtml(a.name) + ' <span class="text-muted-2">#' + escapeHtml(a.id) + '</span></div>' +
        '        </div>' +
        '        <span class="badge text-bg-light border">' + escapeHtml(a.type) + '</span>' +
        '      </div>' +
        '      <div class="mt-2 d-none" data-attribute-picker-config>' +
        '        <div class="row g-2">' +
        '          <div class="col-12 col-md-6">' +
        '            <label class="form-label mb-1"><small>Ед. измерения (опционально)</small></label>' +
        '            <select class="form-select form-select-sm" data-attribute-config-unit>' +
        renderUnitOptionsHtml(a.unit || '') +
        '            </select>' +
        '          </div>' +
        (isNum
          ? (
            '          <div class="col-12 col-md-4">' +
            '            <label class="form-label mb-1"><small>Тип числа</small></label>' +
            '            <select class="form-select form-select-sm" data-attribute-config-number-kind>' +
            '              <option value="" selected>Не задано</option>' +
            '              <option value="int">Целое</option>' +
            '              <option value="decimal">Десятичное</option>' +
            '            </select>' +
            '          </div>'
          )
          : (
            '          <div class="col-12 col-md-4 d-none"></div>'
          )
        ) +
        (isList
          ? (
            '          <div class="col-12 col-md-12">' +
            '            <label class="form-label mb-1"><small>Значения списка (по одному в строке)</small></label>' +
            '            <textarea class="form-control form-control-sm" rows="3" placeholder="Например:\nIntel\nAMD" data-attribute-config-list-values></textarea>' +
            '          </div>'
          )
          : ''
        ) +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }).join('');
  }

  function showAttributeGroupError(message) {
    var el = document.querySelector('[data-attribute-group-error]');
    if (!el) return;
    if (!message) {
      el.classList.add('d-none');
      el.textContent = '';
      return;
    }
    el.textContent = message;
    el.classList.remove('d-none');
  }

  function resetAttributeGroupModal() {
    showAttributeGroupError(null);

    var nameInput = document.querySelector('[data-attribute-group-name]');
    if (nameInput) nameInput.value = '';

    var search = document.querySelector('[data-attribute-picker-search]');
    if (search) search.value = '';

    renderAttributePickerList('');
  }

  function setAttributeGroupModalModeAdd() {
    var modalEl = document.getElementById('addAttributeGroupModal');
    if (!modalEl) return;

    editingGroupId = null;

    var title = modalEl.querySelector('.modal-title');
    if (title) title.textContent = 'Добавить группу характеристик';
  }

  function getGroupById(categoryId, groupId) {
    var data = CATEGORY_ATTRIBUTE_GROUPS || {};
    var list = Array.isArray(data[categoryId]) ? data[categoryId] : [];
    return list.find(function (g) { return String(g.id) === String(groupId); }) || null;
  }

  function fillAttributeGroupModalForEdit(categoryId, groupId) {
    var modalEl = document.getElementById('addAttributeGroupModal');
    if (!modalEl) return;

    var group = getGroupById(categoryId, groupId);
    if (!group) return;

    editingGroupId = String(group.id);

    var title = modalEl.querySelector('.modal-title');
    if (title) title.textContent = 'Редактировать группу характеристик';

    var nameInput = modalEl.querySelector('[data-attribute-group-name]');
    if (nameInput) nameInput.value = String(group.name || '');

    var search = modalEl.querySelector('[data-attribute-picker-search]');
    if (search) search.value = '';

    renderAttributePickerList('');

    var attrs = Array.isArray(group.attributes) ? group.attributes : [];
    attrs.forEach(function (cfg) {
      var id = String(cfg.id);
      var row = modalEl.querySelector('[data-attribute-picker-row="' + id + '"]');
      if (!row) return;

      var checkbox = row.querySelector('[data-attribute-picker-item]');
      if (checkbox) checkbox.checked = true;

      var cfgBlock = row.querySelector('[data-attribute-picker-config]');
      if (cfgBlock) cfgBlock.classList.remove('d-none');

      var unitSelect = row.querySelector('[data-attribute-config-unit]');
      if (unitSelect && typeof cfg.unit === 'string') {
        unitSelect.value = cfg.unit;
      }

      var numberKindSelect = row.querySelector('[data-attribute-config-number-kind]');
      if (numberKindSelect && cfg.numberKind) {
        numberKindSelect.value = cfg.numberKind;
      }

      var listValuesTextarea = row.querySelector('[data-attribute-config-list-values]');
      if (listValuesTextarea && Array.isArray(cfg.listValues)) {
        listValuesTextarea.value = cfg.listValues.join('\n');
      }
    });
  }

  function wireAttributeGroupModal() {
    var modalEl = document.getElementById('addAttributeGroupModal');
    if (!modalEl || !window.bootstrap) return;

    modalEl.addEventListener('show.bs.modal', function () {
      if (!selectedCategoryId) {
        // На всякий случай: не даём открыть без выбранной категории.
        showAttributeGroupError('Сначала выберите категорию слева.');
      }
      setSelectedCategoryUi(selectedCategoryName, selectedCategoryId);
      // Если модалку открыли через "Добавить группу" — работаем в режиме добавления.
      if (!editingGroupId) {
        setAttributeGroupModalModeAdd();
        resetAttributeGroupModal();
      }
    });

    var search = modalEl.querySelector('[data-attribute-picker-search]');
    if (search) {
      search.addEventListener('input', function () {
        renderAttributePickerList(search.value);
      });
    }

    modalEl.addEventListener('change', function (event) {
      var checkbox = event.target.closest('[data-attribute-picker-item]');
      if (!checkbox) return;

      var row = checkbox.closest('[data-attribute-picker-row]');
      if (!row) return;

      var cfg = row.querySelector('[data-attribute-picker-config]');
      if (!cfg) return;

      if (checkbox.checked) {
        cfg.classList.remove('d-none');
      } else {
        cfg.classList.add('d-none');
      }
    });

    var saveBtn = modalEl.querySelector('[data-save-attribute-group]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        showAttributeGroupError(null);

        if (!selectedCategoryId) {
          showAttributeGroupError('Сначала выберите категорию слева.');
          return;
        }

        var nameInput = modalEl.querySelector('[data-attribute-group-name]');
        var groupName = nameInput ? String(nameInput.value || '').trim() : '';
        if (!groupName) {
          showAttributeGroupError('Укажите название группы (например: «Процессор»).');
          return;
        }

        var checked = Array.from(modalEl.querySelectorAll('[data-attribute-picker-item]:checked'));
        if (!checked.length) {
          showAttributeGroupError('Выберите хотя бы одну характеристику для добавления в группу.');
          return;
        }

        var attributes = [];
        var listWarnings = [];

        checked.forEach(function (c) {
          var id = String(c.value);
          var def = getAttributeById(id);
          if (!def) return;

          var row = c.closest('[data-attribute-picker-row]');
          var unitInput = row ? row.querySelector('[data-attribute-config-unit]') : null;
          var numberKindSelect = row ? row.querySelector('[data-attribute-config-number-kind]') : null;
          var listValuesTextarea = row ? row.querySelector('[data-attribute-config-list-values]') : null;

          var unit = unitInput ? String(unitInput.value || '').trim() : '';
          var numberKind = numberKindSelect ? String(numberKindSelect.value || '') : '';
          var listValuesRaw = listValuesTextarea ? String(listValuesTextarea.value || '') : '';
          var listValues = listValuesRaw
            .split('\n')
            .map(function (s) { return s.trim(); })
            .filter(Boolean);

          if (isNumberAttributeType(def.type) && numberKind && numberKind !== 'int' && numberKind !== 'decimal') {
            numberKind = '';
          }

          if (isListAttributeType(def.type) && listValues.length === 0) {
            listWarnings.push('Для «' + def.name + '» не заданы значения списка.');
          }

          attributes.push({
            id: id,
            unit: unit,
            numberKind: isNumberAttributeType(def.type) ? numberKind : undefined,
            listValues: isListAttributeType(def.type) ? listValues : undefined
          });
        });

        if (!attributes.length) {
          showAttributeGroupError('Не удалось собрать выбранные характеристики. Попробуйте ещё раз.');
          return;
        }

        if (listWarnings.length) {
          showAttributeGroupError(listWarnings.join(' ') + ' Можно сохранить, но лучше заполнить сейчас.');
          return;
        }

        var data = CATEGORY_ATTRIBUTE_GROUPS || {};
        var list = Array.isArray(data[selectedCategoryId]) ? data[selectedCategoryId] : [];

        if (editingGroupId) {
          var updated = false;
          list = list.map(function (g) {
            if (String(g.id) !== String(editingGroupId)) return g;
            updated = true;
            return Object.assign({}, g, { name: groupName, attributes: attributes });
          });
          if (!updated) {
            list.unshift({ id: 'g_' + Date.now(), name: groupName, attributes: attributes });
          }
          data[selectedCategoryId] = list;
        } else {
          var newGroup = {
            id: 'g_' + Date.now(),
            name: groupName,
            attributes: attributes
          };
          list.unshift(newGroup);
          data[selectedCategoryId] = list;
        }
        CATEGORY_ATTRIBUTE_GROUPS = data;
        saveCategoryAttributeGroups(CATEGORY_ATTRIBUTE_GROUPS);

        renderCategoryAttributes(selectedCategoryId);

        var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
      });
    }

    modalEl.addEventListener('hidden.bs.modal', function () {
      // После закрытия возвращаем модалку в режим добавления.
      setAttributeGroupModalModeAdd();
    });
  }

  function wireCategoryAttributeRemove() {
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action="remove-category-attribute"]');
      if (!btn) return;

      var categoryId = btn.getAttribute('data-category-id');
      var groupId = btn.getAttribute('data-group-id');
      var attrId = btn.getAttribute('data-attr-id');
      if (!categoryId || !groupId || !attrId) return;

      var data = CATEGORY_ATTRIBUTE_GROUPS || {};
      var groups = Array.isArray(data[categoryId]) ? data[categoryId] : [];
      var changed = false;

      groups = groups.map(function (g) {
        if (g.id !== groupId) return g;
        var attrs = Array.isArray(g.attributes) ? g.attributes : [];
        var nextAttrs = attrs.filter(function (a) { return String(a.id) !== String(attrId); });
        if (nextAttrs.length !== attrs.length) changed = true;
        return Object.assign({}, g, { attributes: nextAttrs });
      }).filter(function (g) {
        // Если в группе больше нет атрибутов — удаляем группу.
        var attrs = Array.isArray(g.attributes) ? g.attributes : [];
        return attrs.length > 0;
      });

      if (!changed) return;

      data[categoryId] = groups;
      CATEGORY_ATTRIBUTE_GROUPS = data;
      saveCategoryAttributeGroups(CATEGORY_ATTRIBUTE_GROUPS);

      // Если удаляли в текущей категории — перерисуем.
      if (selectedCategoryId && String(selectedCategoryId) === String(categoryId)) {
        renderCategoryAttributes(categoryId);
      }
    });
  }

  function wireCategoryGroupEdit() {
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action="edit-attribute-group"]');
      if (!btn) return;

      var categoryId = btn.getAttribute('data-category-id');
      var groupId = btn.getAttribute('data-group-id');
      if (!categoryId || !groupId) return;

      // Синхронизируем выбранную категорию (на всякий случай).
      selectedCategoryId = String(categoryId);
      setSelectedCategoryUi(selectedCategoryName, selectedCategoryId);

      fillAttributeGroupModalForEdit(categoryId, groupId);

      var modalEl = document.getElementById('addAttributeGroupModal');
      if (!modalEl || !window.bootstrap) return;
      var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });
  }

  function wireCategoryGroupDelete() {
    var modalEl = document.getElementById('confirmDeleteModal');
    if (!modalEl) return;

    var nameEl = modalEl.querySelector('[data-delete-name]');
    var actionEl = modalEl.querySelector('[data-delete-action]');

    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action="delete-attribute-group"]');
      if (!btn) return;

      var categoryId = btn.getAttribute('data-category-id');
      var groupId = btn.getAttribute('data-group-id');
      var groupName = btn.getAttribute('data-group-name') || 'группа';
      if (!categoryId || !groupId) return;

      if (nameEl) nameEl.textContent = 'Группу «' + groupName + '»';

      if (actionEl) {
        actionEl.onclick = function () {
          var data = CATEGORY_ATTRIBUTE_GROUPS || {};
          var list = Array.isArray(data[categoryId]) ? data[categoryId] : [];
          data[categoryId] = list.filter(function (g) { return String(g.id) !== String(groupId); });
          CATEGORY_ATTRIBUTE_GROUPS = data;
          saveCategoryAttributeGroups(CATEGORY_ATTRIBUTE_GROUPS);

          if (selectedCategoryId && String(selectedCategoryId) === String(categoryId)) {
            renderCategoryAttributes(categoryId);
          }
        };
      }
    });
  }

  // ==================== НОВЫЕ ФУНКЦИИ ДЛЯ ХАРАКТЕРИСТИК И ЕДИНИЦ ИЗМЕРЕНИЯ ====================

  var ATTRIBUTES_STORAGE_KEY = 'demo_attributes_v2';

  function loadAttributes() {
    try {
      var raw = localStorage.getItem(ATTRIBUTES_STORAGE_KEY);
      if (!raw) {
        return ATTRIBUTES_CATALOG.map(function (a) {
          return { id: a.id, name: a.name, type: a.type };
        });
      }
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveAttributes(attrs) {
    try {
      localStorage.setItem(ATTRIBUTES_STORAGE_KEY, JSON.stringify(attrs));
    } catch (e) { }
  }

  function renderAttributesTable() {
    var tbody = document.getElementById('attributesTableBody');
    if (!tbody) return;

    var attrs = loadAttributes();
    if (!attrs.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted small">Нет характеристик. Добавьте первую.</td></tr>';
      return;
    }

    tbody.innerHTML = attrs.map(function (a) {
      return '<tr data-attribute-id="' + escapeHtml(a.id) + '">' +
        '<td>#' + escapeHtml(a.id) + '</td>' +
        '<td>' + escapeHtml(a.name) + '</td>' +
        '<td>' + escapeHtml(a.type) + '</td>' +
        '<td class="text-center">' +
        '<div class="btn-group">' +
        '<button class="btn btn-sm btn-outline-primary" type="button" data-action="edit-attribute" ' +
        'data-attribute-id="' + escapeHtml(a.id) + '" ' +
        'data-attribute-name="' + escapeHtml(a.name) + '" ' +
        'data-attribute-type="' + escapeHtml(a.type) + '" ' +
        'title="Редактировать характеристику">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">' +
        '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
        '</svg>' +
        '</button>' +
        '<button class="btn btn-sm btn-outline-danger" type="button" data-action="delete-attribute" ' +
        'data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ' +
        'data-item-name="Характеристику «' + escapeHtml(a.name) + '»" ' +
        'data-attribute-id="' + escapeHtml(a.id) + '" ' +
        'title="Удалить характеристику">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
        '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
        '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  var UNITS_STORAGE_KEY = 'demo_units_v1';

  var DEFAULT_UNITS = [
    { id: '1', fullName: 'Грамм', abbr: 'г', code: 'GRM' },
    { id: '2', fullName: 'Килограмм', abbr: 'кг', code: 'KGM' },
    { id: '3', fullName: 'Сантиметр', abbr: 'см', code: 'CMT' },
    { id: '4', fullName: 'Дюйм', abbr: '″', code: 'INH' }
  ];

  function loadUnits() {
    try {
      var raw = localStorage.getItem(UNITS_STORAGE_KEY);
      if (!raw) return DEFAULT_UNITS;
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveUnits(units) {
    try {
      localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units));
    } catch (e) { }
  }

  function renderUnitsTable() {
    var tbody = document.getElementById('unitsTableBody');
    if (!tbody) return;

    var units = loadUnits();
    if (!units.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted small">Нет единиц измерения. Добавьте первую.</td></tr>';
      return;
    }

    tbody.innerHTML = units.map(function (u) {
      return '<tr data-unit-id="' + escapeHtml(u.id) + '">' +
        '<td>' + escapeHtml(u.fullName) + '</td>' +
        '<td>' + escapeHtml(u.abbr) + '</td>' +
        '<td>' + escapeHtml(u.code) + '</td>' +
        '<td class="text-center">' +
        '<div class="btn-group">' +
        '<button class="btn btn-sm btn-outline-primary" type="button" data-action="edit-unit" ' +
        'data-unit-id="' + escapeHtml(u.id) + '" ' +
        'data-unit-fullname="' + escapeHtml(u.fullName) + '" ' +
        'data-unit-abbr="' + escapeHtml(u.abbr) + '" ' +
        'data-unit-code="' + escapeHtml(u.code) + '" ' +
        'title="Редактировать единицу измерения">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">' +
        '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
        '</svg>' +
        '</button>' +
        '<button class="btn btn-sm btn-outline-danger" type="button" data-action="delete-unit" ' +
        'data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ' +
        'data-item-name="Единицу измерения «' + escapeHtml(u.fullName) + '»" ' +
        'data-unit-id="' + escapeHtml(u.id) + '" ' +
        'title="Удалить единицу измерения">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
        '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
        '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function wireAttributesCrud() {
    var modalEl = document.getElementById('attributeModal');
    if (!modalEl) return;

    var addBtn = document.getElementById('addAttributeBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        document.getElementById('attributeModalTitle').textContent = 'Добавить характеристику';
        document.getElementById('attributeId').value = '';
        document.getElementById('attributeName').value = '';
        document.getElementById('attributeType').value = 'Строка';
      });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="edit-attribute"]');
      if (!btn) return;

      var id = btn.getAttribute('data-attribute-id');
      var name = btn.getAttribute('data-attribute-name');
      var type = btn.getAttribute('data-attribute-type');

      document.getElementById('attributeModalTitle').textContent = 'Редактировать характеристику';
      document.getElementById('attributeId').value = id || '';
      document.getElementById('attributeName').value = name || '';
      document.getElementById('attributeType').value = type || 'Строка';

      var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });

    var saveBtn = document.getElementById('saveAttributeBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var id = document.getElementById('attributeId').value;
        var name = document.getElementById('attributeName').value.trim();
        var type = document.getElementById('attributeType').value;

        if (!name) {
          alert('Укажите название характеристики');
          return;
        }

        var attrs = loadAttributes();

        if (id) {
          attrs = attrs.map(function (a) {
            return a.id === id ? { id: id, name: name, type: type } : a;
          });
        } else {
          var newId = 'attr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          attrs.unshift({ id: newId, name: name, type: type });
        }

        saveAttributes(attrs);
        renderAttributesTable();

        var modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
      });
    }
  }

  function wireUnitsCrud() {
    var modalEl = document.getElementById('unitModal');
    if (!modalEl) return;

    var addBtn = document.getElementById('addUnitBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        document.getElementById('unitModalTitle').textContent = 'Добавить единицу измерения';
        document.getElementById('unitId').value = '';
        document.getElementById('unitFullName').value = '';
        document.getElementById('unitAbbr').value = '';
        document.getElementById('unitCode').value = '';
      });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="edit-unit"]');
      if (!btn) return;

      var id = btn.getAttribute('data-unit-id');
      var fullName = btn.getAttribute('data-unit-fullname');
      var abbr = btn.getAttribute('data-unit-abbr');
      var code = btn.getAttribute('data-unit-code');

      document.getElementById('unitModalTitle').textContent = 'Редактировать единицу измерения';
      document.getElementById('unitId').value = id || '';
      document.getElementById('unitFullName').value = fullName || '';
      document.getElementById('unitAbbr').value = abbr || '';
      document.getElementById('unitCode').value = code || '';

      var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });

    var saveBtn = document.getElementById('saveUnitBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var id = document.getElementById('unitId').value;
        var fullName = document.getElementById('unitFullName').value.trim();
        var abbr = document.getElementById('unitAbbr').value.trim();
        var code = document.getElementById('unitCode').value.trim();

        if (!fullName || !abbr || !code) {
          alert('Заполните все поля');
          return;
        }

        var units = loadUnits();

        if (id) {
          units = units.map(function (u) {
            return u.id === id ? { id: id, fullName: fullName, abbr: abbr, code: code } : u;
          });
        } else {
          var newId = 'unit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          units.unshift({ id: newId, fullName: fullName, abbr: abbr, code: code });
        }

        saveUnits(units);
        renderUnitsTable();

        var modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
      });
    }
  }

  function wireDeleteForAttributesAndUnits() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="delete-attribute"]');
      if (!btn) return;

      var attrId = btn.getAttribute('data-attribute-id');
      var deleteAction = document.querySelector('#confirmDeleteModal [data-delete-action]');
      if (!deleteAction) return;

      deleteAction.onclick = function () {
        var attrs = loadAttributes().filter(function (a) { return a.id !== attrId; });
        saveAttributes(attrs);
        renderAttributesTable();
      };
    });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="delete-unit"]');
      if (!btn) return;

      var unitId = btn.getAttribute('data-unit-id');
      var deleteAction = document.querySelector('#confirmDeleteModal [data-delete-action]');
      if (!deleteAction) return;

      deleteAction.onclick = function () {
        var units = loadUnits().filter(function (u) { return u.id !== unitId; });
        saveUnits(units);
        renderUnitsTable();
      };
    });
  }

  function wireSearch() {
    var searchAttr = document.getElementById('searchAttributes');
    if (searchAttr) {
      searchAttr.addEventListener('input', function () {
        var term = this.value.toLowerCase();
        var rows = document.querySelectorAll('#attributesTableBody tr');
        rows.forEach(function (row) {
          var text = row.innerText.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      });
    }

    var searchUnits = document.getElementById('searchUnits');
    if (searchUnits) {
      searchUnits.addEventListener('input', function () {
        var term = this.value.toLowerCase();
        var rows = document.querySelectorAll('#unitsTableBody tr');
        rows.forEach(function (row) {
          var text = row.innerText.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      });
    }

    var searchBrands = document.getElementById('searchBrands');
    if (searchBrands) {
      searchBrands.addEventListener('input', function () {
        var term = this.value.toLowerCase();
        var rows = document.querySelectorAll('#brandsTableBody tr');
        rows.forEach(function (row) {
          var text = row.innerText.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      });
    }
  }

  // ========== БРЕНДЫ ==========
  var BRANDS_STORAGE_KEY = 'demo_brands_v1';

  function loadBrands() {
    try {
      var raw = localStorage.getItem(BRANDS_STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveBrands(brands) {
    try {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
    } catch (e) { }
  }

  function renderBrandsTable() {
    var tbody = document.getElementById('brandsTableBody');
    if (!tbody) return;

    var brands = loadBrands();
    if (!brands.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted small">Нет брендов. Добавьте первый.</td></tr>';
      return;
    }

    tbody.innerHTML = brands.map(function (b) {
      return '<tr data-brand-id="' + escapeHtml(b.id) + '">' +
        '<td>#' + escapeHtml(b.id) + '</td>' +
        '<td>' + escapeHtml(b.article1c || '') + '</td>' +
        '<td>' + escapeHtml(b.name) + '</td>' +
        '<td class="text-center">' +
        '<div class="btn-group">' +
        '<button class="btn btn-sm btn-outline-primary" type="button" data-action="edit-brand" ' +
        'data-brand-id="' + escapeHtml(b.id) + '" ' +
        'data-brand-name="' + escapeHtml(b.name) + '" ' +
        'data-brand-article="' + escapeHtml(b.article1c || '') + '" ' +
        'title="Редактировать бренд">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">' +
        '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
        '</svg>' +
        '</button>' +
        '<button class="btn btn-sm btn-outline-danger" type="button" data-action="delete-brand" ' +
        'data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" ' +
        'data-item-name="Бренд «' + escapeHtml(b.name) + '»" ' +
        'data-brand-id="' + escapeHtml(b.id) + '" ' +
        'title="Удалить бренд">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
        '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
        '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function wireBrandsCrud() {
    var modalEl = document.getElementById('brandModal');
    if (!modalEl) return;

    var addBtn = document.getElementById('addBrandBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        document.getElementById('brandModalTitle').textContent = 'Добавить бренд';
        document.getElementById('brandId').value = '';
        document.getElementById('brandName').value = '';
        document.getElementById('brandArticle').value = '';
      });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="edit-brand"]');
      if (!btn) return;

      var id = btn.getAttribute('data-brand-id');
      var name = btn.getAttribute('data-brand-name');
      var article = btn.getAttribute('data-brand-article');

      document.getElementById('brandModalTitle').textContent = 'Редактировать бренд';
      document.getElementById('brandId').value = id || '';
      document.getElementById('brandName').value = name || '';
      document.getElementById('brandArticle').value = article || '';

      var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });

    var saveBtn = document.getElementById('saveBrandBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var id = document.getElementById('brandId').value;
        var name = document.getElementById('brandName').value.trim();
        var article = document.getElementById('brandArticle').value.trim();

        if (!name) {
          alert('Укажите название бренда');
          return;
        }

        var brands = loadBrands();

        if (id) {
          brands = brands.map(function (b) {
            return b.id === id ? { id: id, name: name, article1c: article } : b;
          });
        } else {
          var newId = 'brand_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          brands.unshift({ id: newId, name: name, article1c: article });
        }

        saveBrands(brands);
        renderBrandsTable();

        var modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
      });
    }

    // Удаление бренда через общую модалку
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="delete-brand"]');
      if (!btn) return;

      var brandId = btn.getAttribute('data-brand-id');
      var deleteAction = document.querySelector('#confirmDeleteModal [data-delete-action]');
      if (!deleteAction) return;

      deleteAction.onclick = function () {
        var brands = loadBrands().filter(function (b) { return b.id !== brandId; });
        saveBrands(brands);
        renderBrandsTable();
      };
    });
  }

  // ========== ЛИНЕЙКИ И СЕРИИ ==========
  var LINES_STORAGE_KEY = 'demo_lines_v1';
  var SERIES_STORAGE_KEY = 'demo_series_v1';

  function loadLines() {
    try {
      var raw = localStorage.getItem(LINES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLines(lines) {
    try {
      localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(lines));
    } catch (e) { }
  }

  function loadSeries() {
    try {
      var raw = localStorage.getItem(SERIES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSeries(series) {
    try {
      localStorage.setItem(SERIES_STORAGE_KEY, JSON.stringify(series));
    } catch (e) { }
  }

  // Заполнить селект брендов (вызывается при выборе категории)
  function renderBrandSelector(selectedBrandId) {
    var selector = document.getElementById('brandSelector');
    if (!selector) return;

    var brands = loadBrands();
    var options = '<option value="">Выберите бренд</option>';
    brands.forEach(function (b) {
      var selected = (b.id === selectedBrandId) ? ' selected' : '';
      options += '<option value="' + escapeHtml(b.id) + '"' + selected + '>' + escapeHtml(b.name) + '</option>';
    });
    selector.innerHTML = options;
    selector.disabled = (!selectedCategoryId || brands.length === 0);
    document.getElementById('addLineBtn').disabled = !selectedCategoryId || !selector.value;
  }

  // Отобразить список линеек для выбранной категории и бренда
  function renderLines() {
    var container = document.getElementById('linesContainer');
    if (!container) return;
  
    var categoryId = selectedCategoryId;
    var brandId = document.getElementById('brandSelector')?.value;
  
    var categoryDisplay = selectedCategoryName ? selectedCategoryName : '—';
  
    // Если категория не выбрана
    if (!categoryId) {
      container.innerHTML = '<div class="small text-muted-2 mb-2">Выбрана категория: <span class="text-primary fw-semibold">—</span></div>' +
        '<div class="text-muted alert alert-warning text-center small">Сначала выберите категорию слева.</div>';
      // Сбрасываем правую колонку
      document.getElementById('seriesContainer').innerHTML = '<div class="text-muted alert alert-warning text-center small">Выберите линейку слева, чтобы увидеть серии.</div>';
      document.getElementById('addSeriesBtn').disabled = true;
      return;
    }
  
    // Категория выбрана, но бренд не выбран
    if (!brandId) {
      container.innerHTML = '<div class="small text-muted-2 mb-2">Выбрана категория: <span class="text-primary fw-semibold">' + escapeHtml(categoryDisplay) + '</span></div>' +
        '<div class="text-muted alert alert-warning text-center small m-0">Выберите бренд, чтобы увидеть линейки.</div>';
      document.getElementById('seriesContainer').innerHTML = '<div class="text-muted alert alert-warning text-center small m-0">Выберите линейку слева, чтобы увидеть серии.</div>';
      document.getElementById('addSeriesBtn').disabled = true;
      return;
    }
  
    // Загружаем линейки
    var lines = loadLines().filter(function (l) {
      return l.categoryId === categoryId && l.brandId === brandId;
    });
  
    var headerHtml = '<div class="small text-muted-2 mb-2">Выбрана категория: <span class="text-primary fw-semibold">' + escapeHtml(categoryDisplay) + '</span></div>';
  
    if (lines.length === 0) {
      container.innerHTML = headerHtml + '<div class="text-muted alert alert-primary text-center small m-0">Нет линеек для этой пары. Нажмите <strong>«Добавить линейку»</strong>.</div>';
      document.getElementById('seriesContainer').innerHTML = '<div class="text-muted alert alert-info text-center small">Выберите линейку слева, чтобы увидеть серии.</div>';
      document.getElementById('addSeriesBtn').disabled = true;
      return;
    }
  
    // Отрисовываем список линеек
    var html = headerHtml + '<div class="list-group">';
    lines.forEach(function (line) {
      html += '<div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-line-id="' + escapeHtml(line.id) + '">' +
        '<span>' + escapeHtml(line.name) + '</span>' +
        '<div class="btn-group btn-group-sm">' +
        '<button class="btn btn-outline-primary border-0" data-action="edit-line" data-line-id="' + escapeHtml(line.id) + '" data-line-name="' + escapeHtml(line.name) + '">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">' +
        '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
        '</svg>' +
        '</button>' +
        '<button class="btn btn-outline-danger border-0" data-action="delete-line" data-line-id="' + escapeHtml(line.id) + '" data-line-name="' + escapeHtml(line.name) + '">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
        '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
        '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  
    // Сбрасываем выделение и правую колонку
    var activeLine = document.querySelector('[data-line-id].active-line');
    if (activeLine) {
      activeLine.classList.remove('active-line');
    }
document.getElementById('seriesContainer').innerHTML = '<div class="text-muted alert alert-info text-center small">Выберите линейку слева, чтобы увидеть серии.</div>';
document.getElementById('addSeriesBtn').disabled = true;
document.getElementById('seriesContainer').style.display = 'block';
  }

  // Отобразить серии для выбранной линейки
  function renderSeries(lineId) {
    var container = document.getElementById('seriesContainer');
    if (!container) return;
  
    // Сбрасываем содержимое, чтобы потом заполнить заново
    container.innerHTML = '';
  
    if (!lineId) {
      container.innerHTML = '<div class="text-muted alert alert-info text-center small">Выберите линейку слева, чтобы увидеть серии.</div>';
      document.getElementById('addSeriesBtn').disabled = true;
      return;
    }
  
    // Находим название линейки по её ID
    var lines = loadLines();
    var currentLine = lines.find(function(line) { return line.id === lineId; });
    var lineName = currentLine ? currentLine.name : 'неизвестная линейка';
  
    // Формируем заголовок с названием выбранной линейки
    var headerHtml = '<div class="small text-muted-2 mb-2">Выбрана линейка: <span class="text-primary fw-semibold">' + escapeHtml(lineName) + '</span></div>';
  
    var series = loadSeries().filter(function (s) { return s.lineId === lineId; });
  
    if (series.length === 0) {
      container.innerHTML = headerHtml + '<div class="text-muted alert alert-warning text-center small m-0">Нет серий. Добавьте первую.</div>';
    } else {
      var html = headerHtml + '<div class="list-group">';
      series.forEach(function (s) {
        html += '<div class="list-group-item d-flex justify-content-between align-items-center">' +
          '<span>' + escapeHtml(s.name) + '</span>' +
          '<div class="btn-group btn-group-sm">' +
          '<button class="btn btn-outline-primary border-0" data-action="edit-series" data-series-id="' + escapeHtml(s.id) + '" data-series-name="' + escapeHtml(s.name) + '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">' +
          '<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>' +
          '</svg>' +
          '</button>' +
          '<button class="btn btn-outline-danger border-0" data-action="delete-series" data-series-id="' + escapeHtml(s.id) + '" data-series-name="' + escapeHtml(s.name) + '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
          '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
          '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
          '</svg>' +
          '</button>' +
          '</div>' +
          '</div>';
      });
      html += '</div>';
      container.innerHTML = html;
    }
  
    document.getElementById('addSeriesBtn').disabled = false;
    document.getElementById('seriesContainer').style.display = 'block';
  }

  // Инициализация обработчиков для линеек и серий
  function wireLinesAndSeries() {
    var brandSelector = document.getElementById('brandSelector');
    var addLineBtn = document.getElementById('addLineBtn');
    var addSeriesBtn = document.getElementById('addSeriesBtn');
    var lineModalEl = document.getElementById('lineModal');
    var seriesModalEl = document.getElementById('seriesModal');
    if (!lineModalEl || !seriesModalEl) return;

    var lineModal = new bootstrap.Modal(lineModalEl);
    var seriesModal = new bootstrap.Modal(seriesModalEl);

    // Переменные для хранения ID редактируемых элементов
    var editingLineId = null;
    var editingSeriesId = null;

    if (brandSelector) {
      brandSelector.addEventListener('change', function () {
        renderLines();
        document.getElementById('seriesContainer').style.display = 'none';
        if (addLineBtn) addLineBtn.disabled = !brandSelector.value;
      });
    }

    // Добавление линейки
    if (addLineBtn) {
      addLineBtn.addEventListener('click', function () {
        if (!selectedCategoryId || !brandSelector.value) return;
        editingLineId = null;
        document.getElementById('lineModalTitle').textContent = 'Добавить линейку';
        document.getElementById('lineId').value = '';
        document.getElementById('lineName').value = '';
        lineModal.show();
      });
    }

    // Сохранение линейки
    document.getElementById('saveLineBtn').addEventListener('click', function () {
      var lineName = document.getElementById('lineName').value.trim();
      if (!lineName) {
        alert('Введите название линейки');
        return;
      }

      var lines = loadLines();
      if (editingLineId) {
        // Редактирование
        lines = lines.map(function (l) {
          return l.id === editingLineId ? Object.assign({}, l, { name: lineName }) : l;
        });
      } else {
        // Добавление
        var newLine = {
          id: 'line_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          categoryId: selectedCategoryId,
          brandId: brandSelector.value,
          name: lineName
        };
        lines.push(newLine);
      }
      saveLines(lines);
      renderLines();
      lineModal.hide();
    });

    // Редактирование линейки (через карандаш)
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="edit-line"]');
      if (!btn) return;

      var lineId = btn.getAttribute('data-line-id');
      var lineName = btn.getAttribute('data-line-name');
      editingLineId = lineId;
      document.getElementById('lineModalTitle').textContent = 'Редактировать линейку';
      document.getElementById('lineId').value = lineId;
      document.getElementById('lineName').value = lineName;
      lineModal.show();
    });

    // Удаление линейки
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="delete-line"]');
      if (!btn) return;

      var lineId = btn.getAttribute('data-line-id');
      if (confirm('Удалить линейку? Все связанные серии также будут удалены.')) {
        var lines = loadLines().filter(function (l) { return l.id !== lineId; });
        saveLines(lines);
        var series = loadSeries().filter(function (s) { return s.lineId !== lineId; });
        saveSeries(series);
        renderLines();
        document.getElementById('seriesContainer').style.display = 'none';
      }
    });

    // Выбор линейки для показа серий
    document.addEventListener('click', function (e) {
      var lineDiv = e.target.closest('[data-line-id]');
      if (!lineDiv) return;

      document.querySelectorAll('[data-line-id]').forEach(function (el) {
        el.classList.remove('active-line');
      });
      lineDiv.classList.add('active-line');

      var lineId = lineDiv.getAttribute('data-line-id');
      renderSeries(lineId);
    });

    // Добавление серии
    if (addSeriesBtn) {
      addSeriesBtn.addEventListener('click', function () {
        var activeLine = document.querySelector('[data-line-id].active-line');
        if (!activeLine) {
          alert('Сначала выберите линейку из списка.');
          return;
        }
        editingSeriesId = null;
        document.getElementById('seriesModalTitle').textContent = 'Добавить серию';
        document.getElementById('seriesId').value = '';
        document.getElementById('seriesName').value = '';
        seriesModal.show();
      });
    }

    // Сохранение серии
    document.getElementById('saveSeriesBtn').addEventListener('click', function () {
      var seriesName = document.getElementById('seriesName').value.trim();
      if (!seriesName) {
        alert('Введите название серии');
        return;
      }

      var activeLine = document.querySelector('[data-line-id].active-line');
      if (!activeLine && !editingSeriesId) return; // при редактировании activeLine может отсутствовать

      var series = loadSeries();
      if (editingSeriesId) {
        // Редактирование
        series = series.map(function (s) {
          return s.id === editingSeriesId ? Object.assign({}, s, { name: seriesName }) : s;
        });
      } else {
        // Добавление
        var lineId = activeLine.getAttribute('data-line-id');
        var newSeries = {
          id: 'series_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          lineId: lineId,
          name: seriesName
        };
        series.push(newSeries);
      }
      saveSeries(series);
      var currentLineId = editingSeriesId ?
        series.find(s => s.id === editingSeriesId).lineId :
        activeLine.getAttribute('data-line-id');
      renderSeries(currentLineId);
      seriesModal.hide();
    });

    // Редактирование серии
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="edit-series"]');
      if (!btn) return;

      var seriesId = btn.getAttribute('data-series-id');
      var seriesName = btn.getAttribute('data-series-name');
      editingSeriesId = seriesId;
      document.getElementById('seriesModalTitle').textContent = 'Редактировать серию';
      document.getElementById('seriesId').value = seriesId;
      document.getElementById('seriesName').value = seriesName;
      seriesModal.show();
    });

    // Удаление серии
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="delete-series"]');
      if (!btn) return;

      var seriesId = btn.getAttribute('data-series-id');
      if (confirm('Удалить серию?')) {
        var series = loadSeries().filter(function (s) { return s.id !== seriesId; });
        saveSeries(series);
        var activeLine = document.querySelector('[data-line-id].active-line');
        if (activeLine) renderSeries(activeLine.getAttribute('data-line-id'));
      }
    });
  }

  // Функция для сброса блока линеек при смене категории
  function resetLinesAndSeries() {
    var selector = document.getElementById('brandSelector');
    if (selector) selector.value = '';
    renderLines();
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
    wireAttributeGroupModal();
    wireCategoryAttributeRemove();
    wireCategoryGroupEdit();
    wireCategoryGroupDelete();

    // Новые функции для attributes.html
    renderAttributesTable();
    renderUnitsTable();
    wireAttributesCrud();
    wireUnitsCrud();
    wireDeleteForAttributesAndUnits();
    wireSearch();

    // Для attributes.html
    if (document.getElementById('brandsTableBody')) {
      renderBrandsTable();
      wireBrandsCrud();
    }

    // Для categories.html — инициализация линеек и серий
    wireLinesAndSeries();
    // Также нужно обновить селект брендов при загрузке, если категория уже выбрана (например, при перезагрузке)
    if (selectedCategoryId) {
      renderBrandSelector();
    }
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