/* ==========================================================================
   دارك / DARK — التفاعلات والبيانات النموذجية
   ملف واحد يعمل على كل الصفحات: كل تهيئة تتحقق من وجود عنصرها أولًا.
   بلا أي اعتماد خارجي — لا مكتبات، ولا طلبات شبكة.
   ========================================================================== */
'use strict';

(function () {

  /* ------------------------------ 0. أدوات ------------------------------ */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const nf = new Intl.NumberFormat('en-US');
  const num = (n) => nf.format(n);

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const img = (name) => 'assets/img/' + name + '.png';

  /* أيقونات SVG مضمّنة (بلا شبكة) */
  const IC = {
    check: '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    tick:  '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5.1 4.2 8.4 11 1.5"/></svg>',
    pin:   '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    area:  '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 15v5h-5M4 15v5h5M20 9V4h-5"/></svg>',
    bed:   '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-8h18v8M3 10V6M21 18v2M3 18v2M7 10V8h10v2"/></svg>',
    wa:    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6A8 8 0 0 1 8.4 19L4 20.5l1.5-4.3A8 8 0 1 1 20 11.6Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></svg>',
    shield:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6l-7-3Z"/><path d="m9.2 12 2 2 3.6-3.8"/></svg>',
    home:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z"/><path d="M9.5 20v-5h5v5"/></svg>',
    search:'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    plus:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    user:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.2 7-5.2S17.8 16.4 19 20"/></svg>',
    empty: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4M8.5 11h5"/></svg>',
    flag:  '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4h12l-2 4 2 4H6"/></svg>',
    cam:   '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z"/><circle cx="12" cy="13" r="3.2"/></svg>',
    clock: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.8"/></svg>',
    eye:   '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    doc:   '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v4h4"/></svg>',
    users: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3.2"/><path d="M3 19c1-3.2 3.2-4.6 6-4.6S14 15.8 15 19M16 6.2a3 3 0 0 1 0 5.6M18 19c-.3-1.6-.9-2.8-1.7-3.7"/></svg>',
    card:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.4"/><path d="M3 10.5h18"/></svg>',
    gear:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>',
    grid:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></svg>',
    menu:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    trash: '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>',
    share: '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8"/></svg>',
    edit:  '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m14.5 5.5 4 4"/></svg>',
    pause: '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>',
    star:  '<svg class="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 2.4 5 5.4.7-3.9 3.7 1 5.3-4.9-2.6-4.9 2.6 1-5.3L4.2 9.7l5.4-.7L12 4Z"/></svg>',
    bolt:  '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/></svg>',
    phone: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h4l2 5-2.5 1.6a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/></svg>',
    globe: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 2.4 14.4 0 17M12 3.5c-2.4 2.6-2.4 14.4 0 17"/></svg>',
    key:   '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="3.5"/><path d="M11.5 12h9M17 12v3M20 12v2.2"/></svg>',
    box:   '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z"/><path d="m4 7 8 4 8-4M12 11v10"/></svg>'
  };

  /* ------------------------------ 1. البيانات --------------------------- */
  const CITIES = ['بورتسودان', 'مدني', 'عطبرة'];
  const TYPES = ['شقة', 'منزل', 'استوديو', 'غرفة', 'مكتب'];

  /* الحالات: verified موثّق · pending قيد المراجعة · rejected مرفوض · paused موقوف */
  const LISTINGS = [
    { code: 'DRQ-1F2A9', title: 'شقة مفروشة — حي الديوم', city: 'بورتسودان', district: 'الديوم', type: 'شقة',
      price: 420000, area: 118, rooms: 2, roomsLabel: 'غرفتان + صالة', furnishing: 'مفروش',
      status: 'verified', rating: 4.8, days: 2, img: 'liv-01', gallery: ['liv-01', 'bed-01', 'kit-01', 'ext-01'],
      views: 1840, created: '2026-09-12', report: 'DRQ-VR-2026-0918' },
    { code: 'DRQ-77C10', title: 'منزل عائلي — حي الرديف', city: 'مدني', district: 'الرديف', type: 'منزل',
      price: 780000, area: 240, rooms: 4, roomsLabel: '4 غرف + حوش', furnishing: 'فارغ',
      status: 'verified', rating: 4.6, days: 5, img: 'ext-01', gallery: ['ext-01', 'liv-01', 'bed-01', 'str-01'],
      views: 1120, created: '2026-09-09', report: 'DRQ-VR-2026-0907' },
    { code: 'DRQ-3B8E1', title: 'استوديو مفروش — وسط البلد', city: 'بورتسودان', district: 'وسط البلد', type: 'استوديو',
      price: 210000, area: 52, rooms: 1, roomsLabel: 'غرفة واحدة', furnishing: 'مفروش',
      status: 'verified', rating: 4.5, days: 1, img: 'kit-01', gallery: ['kit-01', 'bed-01', 'liv-01', 'bal-01'],
      views: 2260, created: '2026-09-13', report: 'DRQ-VR-2026-0919' },
    { code: 'DRQ-9D4F2', title: 'شقة جديدة — الأركويت', city: 'بورتسودان', district: 'الأركويت', type: 'شقة',
      price: 560000, area: 134, rooms: 3, roomsLabel: '3 غرف + صالة', furnishing: 'فارغ',
      status: 'verified', rating: 4.7, days: 8, img: 'bal-01', gallery: ['bal-01', 'liv-01', 'kit-01', 'ext-01'],
      views: 940, created: '2026-09-06', report: 'DRQ-VR-2026-0902' },
    { code: 'DRQ-5A7K2', title: 'غرفة مفروشة — حي الشرق', city: 'عطبرة', district: 'الشرق', type: 'غرفة',
      price: 145000, area: 38, rooms: 1, roomsLabel: 'غرفة واحدة', furnishing: 'مفروش',
      status: 'verified', rating: 4.2, days: 3, img: 'bed-01', gallery: ['bed-01', 'kit-01', 'bal-01', 'liv-01'],
      views: 640, created: '2026-09-11', report: 'DRQ-VR-2026-0914' },
    { code: 'DRQ-2C6H8', title: 'شقة عائلية — حي المطار', city: 'بورتسودان', district: 'المطار', type: 'شقة',
      price: 495000, area: 126, rooms: 3, roomsLabel: '3 غرف + صالة', furnishing: 'فارغ',
      status: 'verified', rating: 4.4, days: 11, img: 'str-01', gallery: ['str-01', 'liv-01', 'bed-01', 'kit-01'],
      views: 780, created: '2026-09-03', report: 'DRQ-VR-2026-0898' },
    { code: 'DRQ-4E9J1', title: 'مكتب مفروش — شارع الجمهورية', city: 'بورتسودان', district: 'وسط البلد', type: 'مكتب',
      price: 650000, area: 96, rooms: 2, roomsLabel: 'غرفتان', furnishing: 'مفروش',
      status: 'verified', rating: 4.3, days: 14, img: 'off-01', gallery: ['off-01', 'liv-01', 'bal-01', 'str-01'],
      views: 410, created: '2026-08-31', report: 'DRQ-VR-2026-0891' },
    { code: 'DRQ-6F1L3', title: 'منزل — حي الحنتوب', city: 'مدني', district: 'الحنتوب', type: 'منزل',
      price: 380000, area: 180, rooms: 3, roomsLabel: '3 غرف + صالة', furnishing: 'فارغ',
      status: 'pending', rating: 0, days: 1, img: 'ext-01', gallery: ['ext-01', 'str-01', 'liv-01', 'bed-01'],
      views: 0, created: '2026-09-14', report: '' },
    { code: 'DRQ-8G3M5', title: 'شقة مفروشة — حي الروصيرص', city: 'عطبرة', district: 'الروصيرص', type: 'شقة',
      price: 265000, area: 92, rooms: 2, roomsLabel: 'غرفتان + صالة', furnishing: 'مفروش',
      status: 'verified', rating: 4.1, days: 6, img: 'liv-01', gallery: ['liv-01', 'kit-01', 'bed-01', 'bal-01'],
      views: 520, created: '2026-09-08', report: 'DRQ-VR-2026-0905' },
    { code: 'DRQ-0H5N7', title: 'استوديو فارغ — حي العشير', city: 'مدني', district: 'العشير', type: 'استوديو',
      price: 120000, area: 44, rooms: 1, roomsLabel: 'غرفة واحدة', furnishing: 'فارغ',
      status: 'verified', rating: 4.0, days: 9, img: 'kit-01', gallery: ['kit-01', 'bed-01', 'ext-01', 'str-01'],
      views: 360, created: '2026-09-05', report: 'DRQ-VR-2026-0900' },
    { code: 'DRQ-7J8P2', title: 'شقة — حي الترتيبة', city: 'بورتسودان', district: 'الترتيبة', type: 'شقة',
      price: 330000, area: 104, rooms: 2, roomsLabel: 'غرفتان + صالة', furnishing: 'فارغ',
      status: 'verified', rating: 4.6, days: 4, img: 'bal-01', gallery: ['bal-01', 'kit-01', 'liv-01', 'bed-01'],
      views: 1310, created: '2026-09-10', report: 'DRQ-VR-2026-0911' },
    { code: 'DRQ-2K4Q9', title: 'منزل واسع — حي ديم المدينة', city: 'مدني', district: 'ديم المدينة', type: 'منزل',
      price: 900000, area: 300, rooms: 4, roomsLabel: '4 غرف + حوش', furnishing: 'فارغ',
      status: 'verified', rating: 4.9, days: 7, img: 'str-01', gallery: ['str-01', 'ext-01', 'liv-01', 'kit-01'],
      views: 2050, created: '2026-09-07', report: 'DRQ-VR-2026-0903' }
  ];

  const STATUS_META = {
    verified: { label: 'موثّق', cls: 'ok',   icon: '✅' },
    pending:  { label: 'قيد المراجعة', cls: 'wait', icon: '⏳' },
    rejected: { label: 'مرفوض', cls: 'rej',  icon: '⛔' },
    paused:   { label: 'موقوف', cls: '',      icon: '⏸' }
  };

  const byCode = (code) => LISTINGS.filter((l) => l.code === code)[0] || null;

  /* --------------------------- 2. التنبيهات (Toast) ---------------------- */
  let toastBox = null;
  function toast(title, body, kind) {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toasts';
      toastBox.setAttribute('role', 'status');
      toastBox.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastBox);
    }
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.innerHTML = '<span>' + (kind === 'ok' ? IC.check : kind === 'rej' ? IC.flag : IC.shield) + '</span>' +
                  '<span><strong>' + esc(title) + '</strong>' + (body ? '<span>' + esc(body) + '</span>' : '') + '</span>';
    toastBox.appendChild(t);
    window.setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 4200);
    window.setTimeout(() => t.remove(), 4700);
  }

  /* ----------------------------- 3. النوافذ المنبثقة --------------------- */
  let lastFocus = null;
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function openModal(el) {
    if (!el) return;
    lastFocus = document.activeElement;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    const first = $(FOCUSABLE, el);
    if (first) first.focus();
  }
  function closeModal(el) {
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    $$('.modal').forEach((m) => {
      m.addEventListener('click', (e) => {
        if (e.target === m || e.target.closest('[data-close]')) closeModal(m);
      });
      m.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); closeModal(m); return; }
        if (e.key !== 'Tab') return;
        const f = $$(FOCUSABLE, m).filter((n) => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    });
    document.addEventListener('click', (e) => {
      const op = e.target.closest('[data-open-modal]');
      if (op) { e.preventDefault(); openModal($('#' + op.getAttribute('data-open-modal'))); }
    });
  }

  /* ---------------------- 4. الترويسة وشريط الجوال ----------------------- */
  function initChrome() {
    const btn = $('#menu-btn'), menu = $('#mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
          menu.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    }
    /* تعبئة أيقونات الأزرار المُعلَّمة بـ data-ic */
    $$('[data-ic]').forEach((n) => {
      const k = n.getAttribute('data-ic');
      if (IC[k]) n.insertAdjacentHTML('afterbegin', IC[k]);
    });
  }

  /* --------------------------- 5. بطاقة العقار --------------------------- */
  function cardHTML(l) {
    const st = STATUS_META[l.status] || STATUS_META.pending;
    const badge = l.status === 'verified'
      ? '<span class="badge"><span class="dot"></span> ✅ عقار موثق</span>'
      : '<span class="badge gold"><span class="dot"></span> ' + st.icon + ' ' + esc(st.label) + '</span>';
    return '' +
      '<article class="card">' +
        '<a class="card-link" href="listing.html?code=' + encodeURIComponent(l.code) + '">' +
          '<div class="thumb">' +
            '<img src="' + img(l.img) + '" alt="' + esc(l.title + ' — ' + l.city) + '" loading="lazy" width="600" height="400">' +
            badge +
          '</div>' +
          '<div class="body">' +
            '<h3>' + esc(l.title) + '</h3>' +
            '<div class="loc">' + IC.pin + '<span>' + esc(l.city) + ' · ' + esc(l.district) + '</span></div>' +
            '<div class="specs">' +
              '<span>' + IC.area + esc(num(l.area)) + ' م²</span>' +
              '<span>' + IC.bed + esc(l.roomsLabel) + '</span>' +
              '<span>' + IC.box + esc(l.furnishing) + '</span>' +
            '</div>' +
            '<div class="price">' +
              '<span class="v">' + num(l.price) + ' <small>جنيه</small></span>' +
              '<span class="c">شهريًا</span>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function skeletonHTML() {
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += '<div class="skel"><div class="sk sk-img"></div><div class="sk-body">' +
             '<div class="sk sk-l w70"></div><div class="sk sk-l w45"></div><div class="sk sk-l w90"></div>' +
             '<div class="sk sk-l w45"></div></div></div>';
    }
    return out;
  }

  /* ------------------------------ 6. الرئيسية --------------------------- */
  function initHome() {
    const grid = $('#home-grid');
    if (grid) {
      const featured = LISTINGS.filter((l) => l.status === 'verified').slice(0, 6);
      grid.innerHTML = featured.map(cardHTML).join('');
    }

    const form = $('#home-search');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const p = new URLSearchParams();
        const c = $('#hs-city', form).value;
        const t = $('#hs-type', form).value;
        const b = $('#hs-budget', form).value;
        const d = $('#hs-district', form).value.trim();
        if (c) p.set('city', c);
        if (t) p.set('type', t);
        if (b) p.set('budget', b);
        if (d) p.set('district', d);
        window.location.href = 'search.html' + (p.toString() ? '?' + p.toString() : '');
      });
    }
  }

  /* ------------------------------ 7. البحث ------------------------------ */
  function initSearch() {
    const root = $('#search-root');
    if (!root) return;

    const MAXP = 1000000;
    const state = {
      verify: 'verified',
      cities: [], types: [], rooms: [], furnish: [],
      min: 0, max: MAXP,
      sort: 'newest',
      district: ''
    };

    /* قراءة معطيات الرابط القادمة من الرئيسية */
    const qp = new URLSearchParams(window.location.search);
    const qCity = qp.get('city'), qType = qp.get('type'), qBudget = qp.get('budget');
    state.district = qp.get('district') || '';
    if (qCity && CITIES.indexOf(qCity) > -1) state.cities = [qCity];
    if (qType && TYPES.indexOf(qType) > -1) state.types = [qType];
    if (qBudget) { const n = parseInt(qBudget, 10); if (!isNaN(n)) state.max = Math.min(MAXP, Math.max(0, n)); }

    /* تعبئة أعداد الخيارات من البيانات الفعلية */
    function setCount(id, n) { const el = $('#' + id); if (el) el.textContent = num(n); }
    setCount('cnt-city-بورتسودان', LISTINGS.filter((l) => l.city === 'بورتسودان').length);
    setCount('cnt-city-مدني', LISTINGS.filter((l) => l.city === 'مدني').length);
    setCount('cnt-city-عطبرة', LISTINGS.filter((l) => l.city === 'عطبرة').length);
    TYPES.forEach((t) => setCount('cnt-type-' + t, LISTINGS.filter((l) => l.type === t).length));
    setCount('cnt-rooms-1', LISTINGS.filter((l) => l.rooms === 1).length);
    setCount('cnt-rooms-2', LISTINGS.filter((l) => l.rooms === 2).length);
    setCount('cnt-rooms-3', LISTINGS.filter((l) => l.rooms >= 3).length);
    setCount('cnt-fur-مفروش', LISTINGS.filter((l) => l.furnishing === 'مفروش').length);
    setCount('cnt-fur-فارغ', LISTINGS.filter((l) => l.furnishing === 'فارغ').length);

    /* ضبط القيم الابتدائية على عناصر الإدخال */
    if (state.cities.length) state.cities.forEach((c) => { const i = $('#fc-' + c); if (i) i.checked = true; });
    if (state.types.length) state.types.forEach((t) => { const i = $('#ft-' + t); if (i) i.checked = true; });

    const rMin = $('#f-min'), rMax = $('#f-max');
    const outMin = $('#f-min-v'), outMax = $('#f-max-v');

    function fill(el) {
      if (!el) return;
      const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
      el.style.setProperty('--fill', pct + '%');
    }
    function syncRange() {
      state.min = parseInt(rMin.value, 10);
      state.max = parseInt(rMax.value, 10);
      if (state.min > state.max) {
        if (document.activeElement === rMin) { rMin.value = state.max; state.min = state.max; }
        else { rMax.value = state.min; state.max = state.min; }
      }
      outMin.textContent = num(state.min) + ' جنيه';
      outMax.textContent = num(state.max) + ' جنيه';
      fill(rMin); fill(rMax);
    }
    rMin.value = state.min; rMax.value = state.max;
    rMin.step = 10000; rMax.step = 10000;
    rMin.min = 0; rMin.max = MAXP; rMax.min = 0; rMax.max = MAXP;

    const grid = $('#results');
    const countEl = $('#res-count');
    const live = $('#res-live');
    const emptyBox = $('#empty-state');
    const emptyHint = $('#empty-hint');
    let timer = null, token = 0;

    function collect() {
      state.verify = ($('input[name="verify"]:checked') || {}).value || 'verified';
      state.cities = $$('#f-cities input:checked').map((i) => i.value);
      state.types = $$('#f-types input:checked').map((i) => i.value);
      state.rooms = $$('#f-rooms input:checked').map((i) => i.value);
      state.furnish = $$('#f-furnish input:checked').map((i) => i.value);
    }

    function filtered() {
      let out = LISTINGS.filter((l) => {
        if (state.verify === 'verified' && l.status !== 'verified') return false;
        if (l.status === 'rejected') return false;
        if (state.cities.length && state.cities.indexOf(l.city) === -1) return false;
        if (state.types.length && state.types.indexOf(l.type) === -1) return false;
        if (state.furnish.length && state.furnish.indexOf(l.furnishing) === -1) return false;
        if (state.rooms.length) {
          const ok = state.rooms.some((r) => (r === '3' ? l.rooms >= 3 : String(l.rooms) === r));
          if (!ok) return false;
        }
        if (l.price < state.min || l.price > state.max) return false;
        if (state.district && l.district.indexOf(state.district) === -1 && l.title.indexOf(state.district) === -1) return false;
        return true;
      });
      if (state.sort === 'cheap') out.sort((a, b) => a.price - b.price);
      else if (state.sort === 'rating') out.sort((a, b) => b.rating - a.rating);
      else out.sort((a, b) => a.days - b.days);
      return out;
    }

    function render() {
      const list = filtered();
      const hasFilters = state.cities.length || state.types.length || state.rooms.length ||
                         state.furnish.length || state.min > 0 || state.max < MAXP || state.verify !== 'verified';

      countEl.textContent = num(list.length);
      $$('.tab', $('#sort-tabs')).forEach((t) => {
        const on = t.getAttribute('data-sort') === state.sort;
        t.classList.toggle('on', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      if (!list.length) {
        grid.innerHTML = '';
        grid.hidden = true;
        emptyBox.hidden = false;
        emptyHint.textContent = hasFilters
          ? 'جرّب توسيع نطاق الميزانية أو إزالة بعض المدن والأنواع.'
          : 'لم تُنشر عقارات في هذا النطاق بعد.';
      } else {
        emptyBox.hidden = true;
        grid.hidden = false;
        grid.innerHTML = list.map(cardHTML).join('');
      }
      live.textContent = list.length
        ? 'عدد النتائج: ' + num(list.length) + ' عقار'
        : 'لا توجد نتائج مطابقة.';
    }

    /* حالة تحميل قصيرة عند كل تغيير للفلاتر */
    function scheduleLoading() {
      const my = ++token;
      grid.hidden = false;
      emptyBox.hidden = true;
      grid.innerHTML = skeletonHTML();
      live.textContent = 'جارٍ تحديث النتائج…';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { if (my === token) render(); }, 320);
    }

    function reset() {
      $$('#f-cities input, #f-types input, #f-rooms input, #f-furnish input').forEach((i) => { i.checked = false; });
      const v = $('#f-verify-only'); if (v) v.checked = true;
      rMin.value = 0; rMax.value = MAXP;
      state.verify = 'verified'; state.sort = 'newest'; state.district = '';
      $('#sort-tabs').querySelector('[data-sort="newest"]').click();
      syncRange();
      scheduleLoading();
    }

    /* الربط */
    const filters = $('#filters');
    filters.addEventListener('change', () => { collect(); scheduleLoading(); });
    filters.addEventListener('input', (e) => {
      if (e.target.type === 'range') { syncRange(); scheduleLoading(); }
    });
    $('#sort-tabs').addEventListener('click', (e) => {
      const t = e.target.closest('.tab'); if (!t) return;
      state.sort = t.getAttribute('data-sort');
      scheduleLoading();
    });
    const rb = $('#reset-filters'); if (rb) rb.addEventListener('click', reset);
    const eb = $('#empty-reset'); if (eb) eb.addEventListener('click', reset);

    /* حالة الفلاتر المطوية على الجوال */
    const ft = $('#filters-toggle'), fp = $('#filters-panel');
    if (ft && fp) {
      ft.addEventListener('click', () => {
        const open = fp.hidden;
        fp.hidden = !open;
        ft.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    syncRange();
    render();
    if (state.district) toast('تم تطبيق البحث', 'الحي المطلوب: ' + state.district);
  }

  /* --------------------------- 8. تفاصيل العقار -------------------------- */
  function initListing() {
    const root = $('#listing-root');
    if (!root) return;

    const qp = new URLSearchParams(window.location.search);
    const l = byCode(qp.get('code')) || LISTINGS[0];

    /* تعبئة الحقول المرتبطة بالعقار */
    $$('[data-l]').forEach((n) => {
      const k = n.getAttribute('data-l');
      let v;
      switch (k) {
        case 'title': v = l.title; break;
        case 'city': v = l.city; break;
        case 'district': v = l.district; break;
        case 'type': v = l.type; break;
        case 'price': v = num(l.price); break;
        case 'area': v = num(l.area); break;
        case 'roomsLabel': v = l.roomsLabel; break;
        case 'furnishing': v = l.furnishing; break;
        case 'code': v = l.code; break;
        case 'report': v = l.report || 'قيد الاستخراج'; break;
        case 'created': v = l.created; break;
        default: v = '';
      }
      n.textContent = v;
    });
    document.title = l.title + ' — دارك';

    /* المعرض */
    const main = $('#g-main');
    if (main) {
      main.src = img(l.gallery[0]);
      main.alt = 'الصورة الرئيسية — ' + l.title;
    }
    $$('#g-thumbs button').forEach((b, i) => {
      const name = l.gallery[i] || l.gallery[0];
      const im = $('img', b);
      im.src = img(name);
      im.alt = 'صورة ' + (i + 2) + ' — ' + l.title;
      b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      b.addEventListener('click', () => {
        main.src = img(name);
        main.alt = 'صورة ' + (i + 2) + ' — ' + l.title;
        $$('#g-thumbs button').forEach((o) => o.setAttribute('aria-current', 'false'));
        b.setAttribute('aria-current', 'true');
      });
    });

    /* شارة الحالة */
    const badge = $('#l-badge');
    if (badge) {
      if (l.status === 'verified') badge.innerHTML = '<span class="dot"></span> ✅ عقار موثق ميدانيًا';
      else badge.innerHTML = '<span class="dot"></span> ' + STATUS_META[l.status].icon + ' ' + STATUS_META[l.status].label;
      badge.className = 'badge' + (l.status === 'verified' ? '' : ' gold');
    }

    /* واتساب — رسالة مُعبّأة مسبقًا */
    const wa = $('#wa-btn');
    if (wa) {
      const msg = 'مرحبًا، أرغب في الاستفسار عن هذا العقار المعروض على منصة دارك:\n' +
                  '«' + l.title + '»\n' +
                  'رمز العقار: ' + l.code + '\n' +
                  'الإيجار الشهري: ' + num(l.price) + ' جنيه.';
      wa.href = 'https://wa.me/249912000000?text=' + encodeURIComponent(msg);
      wa.setAttribute('rel', 'noopener noreferrer');
    }

    /* نموذج طلب المعاينة عن بُعد */
    const rvForm = $('#remote-form');
    if (rvForm) {
      rvForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = $('#rv-date', rvForm).value;
        const t = $('#rv-time', rvForm).value;
        if (!d) { $('#rv-err').textContent = 'اختر تاريخًا للمعاينة.'; $('#rv-date').focus(); return; }
        $('#rv-err').textContent = '';
        closeModal($('#remote-modal'));
        toast('تم إرسال طلب المعاينة', 'سيُنسّق مندوب التوثيق موعدًا في ' + d + (t ? ' — ' + t : '') + '.', 'ok');
      });
    }

    /* نموذج الإبلاغ */
    const repForm = $('#report-form');
    if (repForm) {
      repForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const picked = $('input[name="reason"]:checked', repForm);
        if (!picked) { $('#rep-err').textContent = 'اختر سببًا للإبلاغ.'; return; }
        $('#rep-err').textContent = '';
        closeModal($('#report-modal'));
        toast('تم استلام الإبلاغ', 'سيراجع فريق دارك الإعلان ' + l.code + ' خلال 24 ساعة.', 'ok');
        repForm.reset();
      });
    }
  }

  /* ------------------------------ 9. الدخول ------------------------------ */
  function initLogin() {
    const form = $('#login-form');
    if (!form) return;

    const OTP_LEN = 5, OTP_CODE = '12345', TTL = 300, MAX_TRIES = 5;
    const stepPhone = $('#step-phone'), stepOtp = $('#step-otp');
    const codeInput = $('#country'), phoneInput = $('#phone');
    const errBox = $('#phone-err'), otpErr = $('#otp-err');
    const timerEl = $('#otp-timer'), triesEl = $('#otp-tries'), otpInputs = $$('.otp input');
    const resend = $('#resend'), verifyBtn = $('#verify-btn');
    let left = TTL, tries = 0, tick = null;

    /* أرقام تُقبل: 7–12 خانة بعد تجريد غير الأرقام */
    function digits(v) { return String(v).replace(/[^\d]/g, ''); }

    function paint() {
      const m = String(Math.floor(left / 60)).padStart(2, '0');
      const s = String(left % 60).padStart(2, '0');
      timerEl.textContent = m + ':' + s;
      triesEl.textContent = num(MAX_TRIES - tries);
      if (left <= 0) {
        window.clearInterval(tick);
        otpErr.textContent = 'انتهت صلاحية الكود. اطلب كودًا جديدًا.';
        verifyBtn.disabled = true;
      }
      resend.disabled = left > (TTL - 30);
    }

    function startTimer() {
      left = TTL; tries = 0;
      otpErr.textContent = ''; verifyBtn.disabled = false;
      paint();
      window.clearInterval(tick);
      tick = window.setInterval(() => { left -= 1; paint(); }, 1000);
    }

    otpInputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = digits(inp.value).slice(0, 1);
        inp.setAttribute('aria-invalid', 'false');
        if (inp.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
        if (otpInputs.every((x) => x.value)) verifyBtn.focus();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && i > 0) otpInputs[i - 1].focus();
        if (e.key === 'ArrowLeft' && i < otpInputs.length - 1) otpInputs[i + 1].focus();
        if (e.key === 'ArrowRight' && i > 0) otpInputs[i - 1].focus();
      });
      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const v = digits((e.clipboardData || window.clipboardData).getData('text')).slice(0, OTP_LEN);
        v.split('').forEach((ch, k) => { if (otpInputs[k]) otpInputs[k].value = ch; });
        if (v.length === OTP_LEN) verifyBtn.focus();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!stepPhone.hidden) {
        const n = digits(phoneInput.value);
        if (n.length < 7) {
          errBox.textContent = 'أدخل رقم هاتف صحيحًا (7 خانات على الأقل).';
          phoneInput.setAttribute('aria-invalid', 'true'); phoneInput.focus(); return;
        }
        if (n.length > 12) {
          errBox.textContent = 'الرقم أطول من المتوقع — تحقق من مقدمة الدولة.';
          phoneInput.setAttribute('aria-invalid', 'true'); phoneInput.focus(); return;
        }
        errBox.textContent = ''; phoneInput.setAttribute('aria-invalid', 'false');
        $('#otp-phone').textContent = codeInput.value + ' ' + n;
        stepPhone.hidden = true; stepOtp.hidden = false;
        startTimer(); otpInputs[0].focus();
        toast('تم إرسال الكود', 'رمز التحقق التجريبي: ' + OTP_CODE);
        return;
      }

      const entered = otpInputs.map((x) => x.value).join('');
      if (entered.length < OTP_LEN) {
        otpErr.textContent = 'أدخل الخانات الخمس كاملة.';
        otpInputs[0].focus(); return;
      }
      if (left <= 0) { otpErr.textContent = 'انتهت صلاحية الكود. اطلب كودًا جديدًا.'; return; }
      if (entered !== OTP_CODE) {
        tries += 1;
        otpInputs.forEach((x) => x.setAttribute('aria-invalid', 'true'));
        if (tries >= MAX_TRIES) {
          window.clearInterval(tick);
          otpErr.textContent = 'تجاوزت عدد المحاولات المسموح (5). اطلب كودًا جديدًا.';
          verifyBtn.disabled = true;
        } else {
          otpErr.textContent = 'الكود غير صحيح. المحاولات المتبقية: ' + num(MAX_TRIES - tries) + '.';
        }
        paint();
        otpInputs.forEach((x) => { x.value = ''; });
        otpInputs[0].focus();
        return;
      }
      window.clearInterval(tick);
      otpErr.textContent = '';
      toast('تم تسجيل الدخول', 'أهلًا بك في دارك.', 'ok');
      window.setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
    });

    resend.addEventListener('click', () => {
      startTimer();
      otpInputs.forEach((x) => { x.value = ''; x.setAttribute('aria-invalid', 'false'); otpInputs[0].focus(); });
      toast('تم إرسال كود جديد', 'رمز التحقق التجريبي: ' + OTP_CODE);
    });

    $('#back-phone').addEventListener('click', () => {
      window.clearInterval(tick);
      stepOtp.hidden = true; stepPhone.hidden = false;
      phoneInput.focus();
    });
  }

  /* ------------------------------ 10. النشر ------------------------------ */
  const DRAFT_KEY = 'darq:publish:draft:v1';
  function initPublish() {
    const root = $('#publish-root');
    if (!root) return;

    const FIELDS = ['p-title', 'p-type', 'p-city', 'p-district', 'p-price', 'p-cur', 'p-rooms', 'p-area', 'p-furnish', 'p-desc'];
    const steps = [1, 2, 3];
    let current = 1;
    let photos = [];     /* {name, size, data} */

    const draftNote = $('#draft-note');

    function goto(n) {
      current = n;
      steps.forEach((s) => { $('#step-' + s).hidden = s !== n; });
      $$('.stepper .st').forEach((st) => {
        const s = Number(st.getAttribute('data-step'));
        st.classList.toggle('active', s === n);
        st.classList.toggle('done', s < n);
        const numEl = $('.n', st);
        numEl.textContent = s < n ? '✓' : String(s);
      });
      const t = $('.stepper .st[data-step="' + n + '"] .tt');
      if (t) t.setAttribute('aria-current', 'step');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const h = $('#step-' + n).querySelector('h2, h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }

    function draftData() {
      const d = {};
      FIELDS.forEach((id) => { const el = $('#' + id); if (el) d[id] = el.value; });
      d.__photos = photos.map((p) => ({ name: p.name, size: p.size }));
      d.__savedAt = new Date().toISOString();
      return d;
    }
    function saveDraft() {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData()));
        const t = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        if (draftNote) draftNote.textContent = 'تم حفظ المسودة تلقائيًا — ' + t;
      } catch (err) { /* التخزين المحلي غير متاح */ }
    }
    function clearDraft() {
      try { window.localStorage.removeItem(DRAFT_KEY); } catch (err) {}
      if (draftNote) draftNote.textContent = '';
    }
    function loadDraft() {
      let raw = null;
      try { raw = window.localStorage.getItem(DRAFT_KEY); } catch (err) { return false; }
      if (!raw) return false;
      let d;
      try { d = JSON.parse(raw); } catch (err) { return false; }
      FIELDS.forEach((id) => { const el = $('#' + id); if (el && d[id] != null) el.value = d[id]; });
      const n = (d.__photos || []).length;
      const note = $('#restored');
      if (note) {
        note.hidden = false;
        note.textContent = 'استُعيدت مسودة محفوظة' + (n ? ' (' + num(n) + ' صور كانت مرفقة — أعد إرفاقها)' : '') + '.';
      }
      return true;
    }

    let saveTimer = null;
    function queueSave() { window.clearTimeout(saveTimer); saveTimer = window.setTimeout(saveDraft, 400); }
    FIELDS.forEach((id) => {
      const el = $('#' + id);
      if (el) { el.addEventListener('input', queueSave); el.addEventListener('change', queueSave); }
    });

    /* ---- الصور ---- */
    const drop = $('#drop'), fileInput = $('#p-files'), thumbWrap = $('#thumbs'), photoNote = $('#photo-note');
    const MIN_PHOTOS = 3, MAX_PHOTOS = 12;

    function renderThumbs() {
      thumbWrap.innerHTML = photos.map((p, i) => (
        '<div class="thumb-item">' +
          '<img src="' + p.data + '" alt="معاينة الصورة ' + (i + 1) + '">' +
          '<button type="button" class="rm" data-i="' + i + '" aria-label="حذف الصورة ' + (i + 1) + '">' + IC.trash + '</button>' +
          '<span class="cap"><span>' + esc(p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name) + '</span><span>' + Math.round(p.size / 1024) + ' ك.ب</span></span>' +
        '</div>'
      )).join('');
      const n = photos.length;
      if (n < MIN_PHOTOS) {
        photoNote.textContent = 'أضفت ' + num(n) + ' من ' + MIN_PHOTOS + ' صور كحدّ أدنى. أضف ' + num(MIN_PHOTOS - n) + ' على الأقل.';
        photoNote.className = 'err';
      } else {
        photoNote.textContent = 'عدد الصور: ' + num(n) + ' — جاهزة للمتابعة.';
        photoNote.className = 'hint';
      }
      $('#to-review').disabled = n < MIN_PHOTOS;
    }

    function readFiles(files) {
      Array.prototype.slice.call(files).forEach((f) => {
        if (!/^image\//.test(f.type)) { toast('ملف غير مدعوم', f.name + ' ليس صورة.', 'rej'); return; }
        if (photos.length >= MAX_PHOTOS) { toast('الحد الأقصى', 'يمكن رفع ' + num(MAX_PHOTOS) + ' صورة كحد أقصى.', 'rej'); return; }
        const fr = new FileReader();
        fr.onload = () => {
          photos.push({ name: f.name, size: f.size, data: fr.result });
          renderThumbs();
          saveDraft();
        };
        fr.readAsDataURL(f);
      });
    }

    if (fileInput) {
      $('#pick').addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => { readFiles(fileInput.files); fileInput.value = ''; });
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) readFiles(e.dataTransfer.files); });
      thumbWrap.addEventListener('click', (e) => {
        const b = e.target.closest('.rm'); if (!b) return;
        photos.splice(Number(b.getAttribute('data-i')), 1);
        renderThumbs(); saveDraft();
      });
    }

    /* ---- التنقّل ---- */
    $('#to-photos').addEventListener('click', () => {
      const need = [['p-title', 'اكتب عنوانًا للإعلان.'], ['p-price', 'أدخل الإيجار الشهري.'], ['p-area', 'أدخل المساحة بالمتر المربع.'], ['p-desc', 'اكتب وصفًا للعقار.']];
      for (let i = 0; i < need.length; i++) {
        const el = $('#' + need[i][0]);
        if (!el.value.trim()) {
          el.setAttribute('aria-invalid', 'true'); el.focus();
          toast('بيانات ناقصة', need[i][1], 'rej'); return;
        }
        el.setAttribute('aria-invalid', 'false');
      }
      saveDraft();
      goto(2);
    });
    $('#to-review').addEventListener('click', () => {
      if (photos.length < MIN_PHOTOS) { toast('صور غير كافية', 'الحد الأدنى ثلاث صور.', 'rej'); return; }
      renderReview(); goto(3);
    });
    $('#back-details').addEventListener('click', () => goto(1));
    $('#back-photos').addEventListener('click', () => goto(2));

    function renderReview() {
      const g = (id) => { const el = $('#' + id); return el ? (el.value || '—') : '—'; };
      const price = g('p-price'), cur = g('p-cur');
      const rows = [
        ['العنوان', g('p-title')],
        ['نوع العقار', g('p-type')],
        ['المدينة', g('p-city')],
        ['الحي', g('p-district') || '—'],
        ['الإيجار الشهري', price === '—' ? '—' : num(Number(price) || 0) + ' ' + cur],
        ['عدد الغرف', g('p-rooms')],
        ['المساحة', g('p-area') + ' م²'],
        ['الفِرَش', g('p-furnish')],
        ['عدد الصور', num(photos.length) + ' صور']
      ];
      $('#review-list').innerHTML = rows.map((r) =>
        '<div><span class="k">' + esc(r[0]) + '</span><span class="v">' + esc(r[1]) + '</span></div>'
      ).join('') + '<div><span class="k">الوصف</span><span class="v">' + esc(g('p-desc')) + '</span></div>';
      $('#review-thumbs').innerHTML = photos.map((p, i) =>
        '<div class="thumb-item"><img src="' + p.data + '" alt="صورة ' + (i + 1) + ' في المراجعة"></div>'
      ).join('');
    }

    /* ---- الإرسال ---- */
    $('#submit-listing').addEventListener('click', () => {
      if (!$('#p-terms').checked) { toast('إقرار مطلوب', 'يجب الإقرار بصحة البيانات.', 'rej'); $('#p-terms').focus(); return; }
      const code = 'DRQ-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      clearDraft();
      $('#wizard').hidden = true;
      $('#publish-success').hidden = false;
      $('#new-code').textContent = code;
      const link = window.location.origin === 'null'
        ? 'listing.html?code=' + code
        : new URL('listing.html?code=' + code, window.location.href).href;
      $('#share-link').value = link;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast('تم إرسال الإعلان', 'الرمز: ' + code + ' — قيد المراجعة.', 'ok');
    });

    $('#copy-link').addEventListener('click', async () => {
      const f = $('#share-link');
      f.select(); f.setSelectionRange(0, 99999);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(f.value); }
        else { document.execCommand('copy'); }
        toast('تم نسخ الرابط', '', 'ok');
      } catch (err) {
        toast('انسخ الرابط يدويًا', 'الرابط محدَّد في الحقل.', 'rej');
      }
    });

    renderThumbs();
    const restored = loadDraft();
    if (restored) toast('استُعيدت المسودة', 'أكمل من حيث توقفت.');
    else if ($('#draft-note')) $('#draft-note').textContent = 'تُحفظ المسودة تلقائيًا أثناء الكتابة.';
  }

  /* --------------------------- 11. لوحة المالك --------------------------- */
  function initDashboard() {
    const root = $('#dash-root');
    if (!root) return;

    let rows = LISTINGS.filter((l) => ['DRQ-1F2A9', 'DRQ-3B8E1', 'DRQ-6F1L3', 'DRQ-7J8P2', 'DRQ-9D4F2'].indexOf(l.code) > -1)
      .map((l) => Object.assign({}, l, { featured: l.code === 'DRQ-1F2A9' }));
    let filter = 'all';
    let forceEmpty = false;

    const tbody = $('#dash-rows');
    const tableWrap = $('#dash-table');
    const emptyBox = $('#dash-empty');
    const live = $('#dash-live');

    function counts() {
      return {
        all: rows.length,
        pending: rows.filter((r) => r.status === 'pending').length,
        verified: rows.filter((r) => r.status === 'verified').length,
        rejected: rows.filter((r) => r.status === 'rejected').length
      };
    }
    function paintCounts() {
      const c = counts();
      Object.keys(c).forEach((k) => { const el = $('#cnt-' + k); if (el) el.textContent = num(c[k]); });
      const totalViews = rows.reduce((a, r) => a + (r.views || 0), 0);
      const el = $('#kpi-views'); if (el) el.textContent = num(totalViews);
      const ev = $('#kpi-verified'); if (ev) ev.textContent = num(c.verified);
      const ep = $('#kpi-pending'); if (ep) ep.textContent = num(c.pending);
    }

    function rowHTML(r) {
      const st = STATUS_META[r.status];
      const actions = [];
      actions.push('<button class="act" data-do="edit" data-c="' + r.code + '">' + IC.edit + 'تعديل</button>');
      if (r.status !== 'rejected') actions.push('<button class="act" data-do="pause" data-c="' + r.code + '">' + IC.pause + (r.status === 'paused' ? 'استئناف' : 'إيقاف') + '</button>');
      actions.push('<button class="act" data-do="promote" data-c="' + r.code + '"' + (r.featured ? ' disabled' : '') + '>' + IC.star + (r.featured ? 'مميز' : 'ترقية إلى مميز') + '</button>');
      return '<tr>' +
        '<td><b>' + esc(r.title) + '</b><div class="sub">' + esc(r.code) + '</div></td>' +
        '<td>' + esc(r.city) + '<div class="sub">' + esc(r.district) + '</div></td>' +
        '<td>' + num(r.price) + ' <span class="sub">جنيه</span></td>' +
        '<td>' + num(r.views || 0) + '</td>' +
        '<td><span class="pill ' + st.cls + '">' + st.icon + ' ' + esc(st.label) + '</span>' +
          (r.featured ? ' <span class="pill gold">★ مميز</span>' : '') + '</td>' +
        '<td><div class="acts">' + actions.join('') + '</div></td>' +
      '</tr>';
    }

    function render() {
      const list = filter === 'all' ? rows : rows.filter((r) => r.status === filter);
      paintCounts();
      $$('#dash-tabs .tb').forEach((t) => {
        const on = t.getAttribute('data-tab') === filter;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      if (!list.length || forceEmpty) {
        tableWrap.hidden = true;
        emptyBox.hidden = false;
        $('#empty-title').textContent = forceEmpty
          ? 'ابدأ بنشر أول عقار'
          : (filter === 'rejected' ? 'لا إعلانات مرفوضة' : filter === 'pending' ? 'لا إعلانات قيد المراجعة' : 'لا إعلانات في هذه القائمة');
        $('#empty-text').textContent = forceEmpty
          ? 'انشر تفاصيل عقارك وأرفق ثلاث صور على الأقل، وسيتولّى مندوب دارك الزيارة الميدانية والتوثيق خلال 48 ساعة.'
          : 'جرّب تبويبًا آخر لمتابعة بقية إعلاناتك.';
        $('#empty-cta').hidden = !forceEmpty;
        $('#empty-cta-2').hidden = forceEmpty;
        live.textContent = 'لا توجد إعلانات في هذه القائمة.';
      } else {
        tableWrap.hidden = false;
        emptyBox.hidden = true;
        tbody.innerHTML = list.map(rowHTML).join('');
        live.textContent = 'عدد الإعلانات المعروضة: ' + num(list.length);
      }
    }

    $('#dash-tabs').addEventListener('click', (e) => {
      const t = e.target.closest('.tb'); if (!t) return;
      filter = t.getAttribute('data-tab');
      forceEmpty = false;
      render();
    });

    tbody.addEventListener('click', (e) => {
      const b = e.target.closest('[data-do]'); if (!b) return;
      const code = b.getAttribute('data-c');
      const r = rows.filter((x) => x.code === code)[0]; if (!r) return;
      const what = b.getAttribute('data-do');
      if (what === 'edit') {
        toast('فتح التعديل', 'الإعلان ' + code + ' — في النموذج الكامل يُحفظ التعديل ثم يُعاد للمراجعة.');
      } else if (what === 'pause') {
        if (r.status === 'paused') { r.status = r.prev || 'verified'; delete r.prev; toast('تم الاستئناف', code + ' عاد إلى حالة ' + STATUS_META[r.status].label + '.', 'ok'); }
        else { r.prev = r.status; r.status = 'paused'; toast('تم الإيقاف', 'الإعلان ' + code + ' موقوف مؤقتًا ولا يظهر للزوار.', 'rej'); }
        render();
      } else if (what === 'promote') {
        if (r.status !== 'verified') { toast('غير متاح', 'الترقية إلى «مميز» متاحة للإعلانات الموثّقة فقط.', 'rej'); return; }
        r.featured = true;
        toast('تمت الترقية', 'الإعلان ' + code + ' أصبح «مميزًا» في نتائج البحث.', 'ok');
        render();
      }
    });

    const tog = $('#toggle-empty');
    if (tog) tog.addEventListener('click', () => {
      forceEmpty = !forceEmpty;
      tog.setAttribute('aria-pressed', forceEmpty ? 'true' : 'false');
      tog.textContent = forceEmpty ? 'عرض الإعلانات' : 'معاينة حالة الفراغ';
      render();
    });

    render();
  }

  /* --------------------------- 12. لوحة الإدارة -------------------------- */
  function initAdmin() {
    const root = $('#admin-root');
    if (!root) return;

    const QUEUE = [
      { code: 'DRQ-1F2A9', title: 'شقة — حي الديوم', city: 'بورتسودان', agent: 'عمر ع.', state: 'wait', note: 'بانتظار المراجعة' },
      { code: 'DRQ-77C10', title: 'منزل — حي الرديف', city: 'مدني', agent: 'سمية م.', state: 'wait', note: 'بانتظار الصور' },
      { code: 'DRQ-3B8E1', title: 'استوديو — وسط البلد', city: 'بورتسودان', agent: 'عمر ع.', state: 'ok', note: 'مكتمل' },
      { code: 'DRQ-9D4F2', title: 'شقة — الأركويت', city: 'بورتسودان', agent: 'هيثم ط.', state: 'ok', note: 'مكتمل' },
      { code: 'DRQ-6F1L3', title: 'منزل — حي الحنتوب', city: 'مدني', agent: 'سمية م.', state: 'wait', note: 'بانتظار المراجعة' },
      { code: 'DRQ-8G3M5', title: 'شقة — حي الروصيرص', city: 'عطبرة', agent: 'هيثم ط.', state: 'wait', note: 'بانتظار الصور' }
    ];

    let audit = [
      { t: '21:14', who: 'س. الحسن', what: 'اعتمد توثيق DRQ-3B8E1', kind: 'ok' },
      { t: '20:52', who: 'نظام', what: 'حظر إعلان مُبلَّغ عنه DRQ-5A7K2', kind: 'rej' },
      { t: '19:38', who: 'ع. عبد الله', what: 'رفع 9 صور ميدانية', kind: '' },
      { t: '18:05', who: 'م. إبراهيم', what: 'عدّل صلاحيات مندوب', kind: '' },
      { t: '17:41', who: 'نظام', what: 'إشعار تلقائي لـ 214 مستخدمًا', kind: '' }
    ];

    /* تبديل أقسام الشريط الجانبي */
    const snav = $('#snav');
    snav.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-section]'); if (!b) return;
      const id = b.getAttribute('data-section');
      $$('button[data-section]', snav).forEach((o) => o.setAttribute('aria-current', o === b ? 'true' : 'false'));
      $$('.apanel').forEach((p) => p.classList.toggle('on', p.id === 'sec-' + id));
      const title = $('#sec-title'), sub = $('#sec-sub');
      if (title) title.textContent = b.getAttribute('data-title');
      if (sub) sub.textContent = b.getAttribute('data-sub') || '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* جدول قائمة التوثيق */
    const qt = $('#queue-rows');
    function queueRow(q) {
      const done = q.state !== 'wait';
      return '<tr><td><b>' + esc(q.title) + '</b><div class="sub">' + esc(q.code) + '</div></td>' +
        '<td>' + esc(q.city) + '</td><td>' + esc(q.agent) + '</td>' +
        '<td><span class="pill ' + (done ? 'ok' : 'wait') + '">' + esc(q.note) + '</span></td>' +
        '<td><div class="acts">' +
          '<button class="act" data-ok="' + q.code + '"' + (done ? ' disabled' : '') + '>' + IC.check + 'قبول</button>' +
          '<button class="act" data-no="' + q.code + '"' + (done ? ' disabled' : '') + '>' + IC.close + 'رفض</button>' +
        '</div></td></tr>';
    }
    function paintQueue() { qt.innerHTML = QUEUE.map(queueRow).join(''); }

    /* سجل التدقيق */
    function logHTML(a) {
      return '<div class="log"><span class="t">' + esc(a.t) + '</span><span><b>' + esc(a.who) + '</b> ' + esc(a.what) + '</span></div>';
    }
    function tlHTML(a) {
      return '<div class="tl-item ' + (a.kind || '') + '"><div class="log"><span class="t">' + esc(a.t) + '</span>' +
        '<span><b>' + esc(a.who) + '</b> ' + esc(a.what) + '</span></div></div>';
    }
    function paintAudit() {
      const ov = $('#audit-list'); if (ov) ov.innerHTML = audit.slice(0, 6).map(logHTML).join('');
      const full = $('#audit-full'); if (full) full.innerHTML = audit.map(tlHTML).join('');
      const cnt = $('#kpi-audit'); if (cnt) cnt.textContent = num(audit.length);
    }
    function stamp() {
      const d = new Date();
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    function pushAudit(who, what, kind) {
      audit.unshift({ t: stamp(), who: who, what: what, kind: kind });
      paintAudit();
    }

    /* القرارات */
    let pendingReject = null;
    qt.addEventListener('click', (e) => {
      const ok = e.target.closest('[data-ok]');
      const no = e.target.closest('[data-no]');
      if (ok) {
        const q = QUEUE.filter((x) => x.code === ok.getAttribute('data-ok'))[0]; if (!q) return;
        q.state = 'ok'; q.note = 'مكتمل';
        paintQueue();
        pushAudit('س. الحسن', 'اعتمد توثيق ' + q.code + ' ومنح شارة «✅ عقار موثق»', 'ok');
        toast('تم قبول التوثيق', q.code + ' — مُنحت شارة «عقار موثق».', 'ok');
      } else if (no) {
        const q = QUEUE.filter((x) => x.code === no.getAttribute('data-no'))[0]; if (!q) return;
        pendingReject = q;
        $('#rej-code').textContent = q.code + ' — ' + q.title;
        $('#reject-form').reset();
        $('#rej-err').textContent = '';
        openModal($('#reject-modal'));
      }
    });

    $('#reject-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const picked = $('input[name="rej"]:checked');
      if (!picked) { $('#rej-err').textContent = 'سبب الرفض إلزامي.'; return; }
      const extra = $('#rej-note').value.trim();
      if (extra && extra.length < 10) { $('#rej-err').textContent = 'الملاحظة قصيرة — اكتب 10 أحرف على الأقل أو اتركها فارغة.'; return; }
      $('#rej-err').textContent = '';
      const q = pendingReject;
      closeModal($('#reject-modal'));
      if (!q) return;
      q.state = 'no'; q.note = 'مرفوض';
      paintQueue();
      pushAudit('س. الحسن', 'رفض توثيق ' + q.code + ' — السبب: ' + picked.value + (extra ? ' · ' + extra : ''), 'rej');
      toast('تم رفض الإعلان', q.code + ' — أُبلغ المالك بالسبب.', 'rej');
      pendingReject = null;
    });

    /* أزرار الرأس */
    const exp = $('#export-report');
    if (exp) exp.addEventListener('click', () => toast('تصدير التقرير', 'في النسخة الكاملة يُنزَّل ملف CSV بكل قائمة التوثيق.'));
    const rq = $('#review-queue');
    if (rq) rq.addEventListener('click', () => {
      $('#snav').querySelector('[data-section="queue"]').click();
    });

    paintQueue();
    paintAudit();
  }

  /* ------------------------------ 13. التشغيل ---------------------------- */
  function boot() {
    initChrome();
    initModals();
    document.body.classList.toggle('has-mnav', !!$('#mnav'));
    initHome();
    initSearch();
    initListing();
    initLogin();
    initPublish();
    initDashboard();
    initAdmin();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.DARQ = { LISTINGS: LISTINGS, CITIES: CITIES, TYPES: TYPES, STATUS_META: STATUS_META, toast: toast };
})();
