# دليل تطوير DARK - تحسين الأداء للشبكات الضعيفة

## 📋 ملخص التنفيذ

تم إضافة ميزات متقدمة لتحسين أداء تطبيق DARK في ظل ظروف الشبكات الضعيفة والمتقطعة في السودان. هذا الدليل يشرح ما تم إضافته وكيفية استخدامه.

## 🎯 الملفات المضافة

### 1. **وثيقة الاستراتيجية** (`docs/network-optimization.md`)
تحتوي على خطة شاملة لتحسين الأداء تشمل:
- تقليل حجم البيانات المنقولة
- التخزين المؤقت الذكي
- تحسين الصور والوسائط
- معالجة الاتصال المتقطع
- تحسين قاعدة البيانات والاستعلامات

### 2. **صفحة حالة الشبكة** (`assets/network-status.html`)
صفحة تفاعلية تعرض:
- نوع الشبكة الحالي (2G/3G/4G)
- قوة الإشارة وسرعة التحميل
- حالة الاتصال (متصل/منقطع)
- نصائح للمستخدم بناءً على حالة الشبكة
- قائمة بالمزايا المتاحة دون اتصال

### 3. **صفحة عدم الاتصال** (`offline.html`)
صفحة جميلة ومفيدة تظهر عند فقدان الاتصال:
- شرح واضح للوضع الحالي
- عرض المزايا المتاحة دون اتصال
- أزرار لإعادة المحاولة والعودة للرئيسية
- نصائح للاستخدام الفعال دون اتصال
- كشف تلقائي لعودة الاتصال

### 4. **Service Worker** (`assets/js/service-worker.js`)
قلب نظام Offline-First، يوفر:
- تخزين مؤقت ذكي للموارد
- استراتيجيات متعددة للتخزين (Cache First, Network First, Stale While Revalidate)
- مزامنة خلفية عند عودة الاتصال
- إدارة الإشعارات
- دعم التحدث مع التطبيق الرئيسي

## 🔧 كيفية الاستخدام

### تفعيل Service Worker

أضف هذا الكود إلى ملف JavaScript الرئيسي في تطبيقك:

```javascript
// تسجيل Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/js/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}
```

### كشف حالة الشبكة

```javascript
// التحقق من حالة الاتصال
function checkConnection() {
  if (!navigator.onLine) {
    // المستخدم دون اتصال
    showOfflineMessage();
  } else {
    // المستخدم متصل
    showOnlineMessage();
  }
}

// الاستماع لتغيرات الاتصال
window.addEventListener('online', checkConnection);
window.addEventListener('offline', checkConnection);
```

### استخدام IndexedDB للتخزين المحلي

```javascript
// فتح قاعدة بيانات محلية
const request = indexedDB.open('DARK_DB', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // إنشاء متجر للعقارات
  if (!db.objectStoreNames.contains('properties')) {
    const store = db.createObjectStore('properties', { keyPath: 'id' });
    store.createIndex('city_id', 'city_id', { unique: false });
    store.createIndex('price', 'price_monthly', { unique: false });
  }
  
  // إنشاء متجر للإجراءات المعلقة
  if (!db.objectStoreNames.contains('pendingActions')) {
    const store = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
    store.createIndex('timestamp', 'timestamp', { unique: false });
  }
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('Database opened successfully');
};
```

### حفظ الإجراءات للمزامنة اللاحقة

```javascript
// حفظ إجراء للمزامنة عند عودة الاتصال
async function queueAction(action) {
  const db = await openDatabase();
  const tx = db.transaction('pendingActions', 'readwrite');
  const store = tx.objectStore('pendingActions');
  
  await store.add({
    type: action.type,
    url: action.url,
    method: action.method,
    data: action.data,
    timestamp: Date.now(),
    retryCount: 0
  });
  
  // طلب المزامنة إذا كان متاحًا
  if ('sync' in registration) {
    registration.sync.register('sync-pending-actions');
  }
}
```

### تحميل الصور بشكل كسول

```html
<!-- استخدام التحميل الكسول للصور -->
<img src="placeholder.jpg" 
     data-src="property-image.jpg" 
     loading="lazy" 
     alt="عقار">

<script>
// تحميل الصور عند ظهورها في الشاشة
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
});
</script>
```

## 📊 مؤشرات الأداء المستهدفة

| المقياس | قبل التحسين | بعد التحسين | الهدف |
|---------|-------------|-------------|-------|
| FCP (First Contentful Paint) | 5-15 ثانية | 1-3 ثواني | < 2 ثانية |
| TTI (Time to Interactive) | 10-30 ثانية | 2-5 ثواني | < 3 ثواني |
| حجم الصفحة | 2-5 MB | 300-500 KB | < 500 KB |
| عدد الطلبات | 100-300 | 30-50 | < 50 |
| العمل دون اتصال | ❌ غير مدعوم | ✅ مدعوم | كامل |

## 🚀 خطوات النشر

### 1. اختبار محلي

```bash
# تشغيل خادم محلي مع دعم HTTPS (مطلوب لـ Service Worker)
python3 -m http.server 8000 --ssl

# أو استخدام Node.js
npx serve .
```

### 2. اختبار في ظروف شبكية مختلفة

استخدم أدوات المطور في المتصفح:
- Chrome DevTools → Network → Throttling
- اختبر على: Slow 3G, Fast 3G, Offline

### 3. التحقق من Service Worker

```javascript
// التحقق من حالة Service Worker
navigator.serviceWorker.getRegistration().then(registration => {
  if (registration) {
    console.log('Service Worker active:', registration.active);
  } else {
    console.log('No Service Worker registered');
  }
});
```

### 4. مراقبة الأداء

أضف Google Analytics أو أداة مشابهة لتتبع:
- سرعات التحميل الحقيقية
- معدلات الارتداد
- استخدام الميزات دون اتصال

## 💡 أفضل الممارسات

### للصور:
- استخدم صيغة WebP مع fallback لـ JPEG
- ضغط الصور بنسبة 60-80%
- أحجام متعددة لنفس الصورة
- Lazy Loading لجميع الصور

### للكود:
- Code Splitting للمكونات الكبيرة
- إزالة الكود غير المستخدم
- Minification لجميع الملفات
- Gzip/Brotli Compression

### للبيانات:
- Pagination للقوائم الطويلة
- Infinite Scroll بدلاً من Load All
- فهارس قاعدة البيانات
- استعلامات محسّنة

### لتجربة المستخدم:
- Skeleton Screens أثناء التحميل
- رسائل واضحة عن حالة الاتصال
- حفظ تلقائي للنماذج
- إعادة محاولة تلقائية

## 🔍 استكشاف الأخطاء

### Service Worker لا يعمل؟

1. تأكد من استخدام HTTPS (أو localhost)
2. تحقق من أن المسار صحيح
3. امسح Cache المتصفح
4. تحقق من Console للأخطاء

### البيانات لا تُزامن؟

1. تأكد من تسجيل حدث 'sync'
2. تحقق من وجود البيانات في IndexedDB
3. اختبر المزامنة اليدوية
4. راجع سجلات Service Worker

### الصفحات لا تُخزن؟

1. تحقق من استراتيجية التخزين المستخدمة
2. تأكد من أن URLs في STATIC_ASSETS صحيحة
3. اختبر كل استراتيجية على حدة

## 📱 دعم المتصفحات

| المتصفح | Service Worker | IndexedDB | Offline Events |
|---------|---------------|-----------|----------------|
| Chrome 40+ | ✅ | ✅ | ✅ |
| Firefox 44+ | ✅ | ✅ | ✅ |
| Safari 11.1+ | ✅ | ✅ | ✅ |
| Edge 17+ | ✅ | ✅ | ✅ |
| Opera 27+ | ✅ | ✅ | ✅ |

## 🎓 موارد إضافية

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google: Workbox](https://developers.google.com/web/tools/workbox)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**آخر تحديث**: 2026-09-18  
**الإصدار**: 1.0  
**الحالة**: جاهز للإنتاج
