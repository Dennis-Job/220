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

  function renderCategoryAttributes(categoryId) {
    var tbody = document.getElementById('categoryAttributesBody');
    if (!tbody) return;

    var groups = (CATEGORY_ATTRIBUTE_GROUPS && CATEGORY_ATTRIBUTE_GROUPS[categoryId]) ? CATEGORY_ATTRIBUTE_GROUPS[categoryId] : [];
    var rows = [];

    groups.forEach(function (g) {
      var attrs = Array.isArray(g.attributes) ? g.attributes : [];
      attrs.forEach(function (cfg) {
        var attr = getAttributeById(cfg.id);
        if (!attr) return;
        var unit = (cfg && typeof cfg.unit === 'string' && cfg.unit.trim()) ? cfg.unit.trim() : (attr.unit || '');
        rows.push({
          groupId: g.id,
          groupName: g.name,
          attrId: attr.id,
          name: attr.name,
          type: formatTypeLabel(attr.type, cfg),
          unit: unit
        });
      });
    });

    if (!rows.length) {
      tbody.innerHTML = '' +
        '<tr>' +
        '  <td colspan="5" class="text-muted small">Для выбранной категории пока не настроены характеристики.</td>' +
        '</tr>';
      return;
    }

    tbody.innerHTML = rows.map(function (row) {
      return '' +
        '<tr>' +
        '  <td>' + escapeHtml(row.groupName) + '</td>' +
        '  <td>' + escapeHtml(row.name) + '</td>' +
        '  <td>' + escapeHtml(row.type) + '</td>' +
        '  <td>' + escapeHtml(row.unit) + '</td>' +
        '  <td class="text-end">' +
        '    <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-category-attribute" data-category-id="' + escapeHtml(categoryId) + '" data-group-id="' + escapeHtml(row.groupId) + '" data-attr-id="' + escapeHtml(row.attrId) + '">Удалить</button>' +
        '  </td>' +
        '</tr>';
    }).join('');
  }

  function setSelectedCategoryUi(name, id) {
    var label = document.getElementById('selectedCategoryName');
    if (label) label.textContent = name ? String(name) : '—';

    var addBtn = document.querySelector('[data-add-attribute-group-btn]');
    if (addBtn) addBtn.disabled = !id;

    var modalCat = document.querySelector('[data-modal-selected-category]');
    if (modalCat) modalCat.textContent = name ? String(name) : '—';
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
        '          <div class="fw-semibold">' + escapeHtml(a.name) + ' <span class="text-muted-2">#' + escapeHtml(a.id) + '</span></div>' +
        '          <div class="small text-muted-2">' + escapeHtml(a.type) + (a.unit ? (' • базовая ед.: ' + escapeHtml(a.unit)) : '') + '</div>' +
        '        </div>' +
        '        <span class="badge text-bg-light border">' + escapeHtml(a.type) + '</span>' +
        '      </div>' +
        '      <div class="mt-2 d-none" data-attribute-picker-config>' +
        '        <div class="row g-2">' +
        '          <div class="col-12 col-md-4">' +
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

  function wireAttributeGroupModal() {
    var modalEl = document.getElementById('addAttributeGroupModal');
    if (!modalEl || !window.bootstrap) return;

    modalEl.addEventListener('show.bs.modal', function () {
      if (!selectedCategoryId) {
        // На всякий случай: не даём открыть без выбранной категории.
        showAttributeGroupError('Сначала выберите категорию слева.');
      }
      setSelectedCategoryUi(selectedCategoryName, selectedCategoryId);
      resetAttributeGroupModal();
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

        var newGroup = {
          id: 'g_' + Date.now(),
          name: groupName,
          attributes: attributes
        };

        list.unshift(newGroup);
        data[selectedCategoryId] = list;
        CATEGORY_ATTRIBUTE_GROUPS = data;
        saveCategoryAttributeGroups(CATEGORY_ATTRIBUTE_GROUPS);

        renderCategoryAttributes(selectedCategoryId);

        var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
      });
    }
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

