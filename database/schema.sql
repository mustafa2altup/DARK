-- ==========================================
-- قاعدة بيانات مشروع DARK - دارك
-- منصة سودانية لتأجير العقارات الموثقة ميدانيًا
-- الإصدار: 1.0
-- التاريخ: 2026-09-18
-- ==========================================

-- تفعيل المفاتيح الأجنبية
PRAGMA foreign_keys = ON;

-- ==========================================
-- جدول المستخدمين (Users)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    full_name_ar TEXT NOT NULL,
    full_name_en TEXT,
    role TEXT CHECK(role IN ('user', 'agent', 'admin', 'verifier')) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- فهرس للبحث السريع بالبريد الإلكتروني والهاتف
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==========================================
-- جدول ملفات تعريف المستخدمين (User Profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    country TEXT,
    city TEXT,
    is_diaspora BOOLEAN DEFAULT FALSE,
    whatsapp_number TEXT,
    national_id_number TEXT,
    national_id_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_diaspora ON user_profiles(is_diaspora);

-- ==========================================
-- جدول المدن (Cities)
-- ==========================================
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT UNIQUE NOT NULL,
    name_en TEXT UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- إدخال المدن الأولية
INSERT OR IGNORE INTO cities (name_ar, name_en, sort_order) VALUES 
('بورتسودان', 'Port Sudan', 1),
('مدني', 'Medani', 2),
('عطبرة', 'Atbara', 3),
('الخرطوم', 'Khartoum', 4),
('أم درمان', 'Omdurman', 5),
('بحري', 'Bahri', 6);

-- ==========================================
-- جدول الأحياء (Districts)
-- ==========================================
CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id INTEGER NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE(city_id, name_ar)
);

CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);

-- ==========================================
-- جدول أنواع العقارات (Property Types)
-- ==========================================
CREATE TABLE IF NOT EXISTS property_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT UNIQUE NOT NULL,
    name_en TEXT UNIQUE,
    description TEXT
);

-- إدخال أنواع العقارات الأولية
INSERT OR IGNORE INTO property_types (name_ar, name_en, description) VALUES 
('شقة', 'Apartment', 'شقة سكنية'),
('منزل', 'House', 'منزل مستقل'),
('استوديو', 'Studio', 'غرفة استوديو'),
('غرفة', 'Room', 'غرفة مفروشة'),
('مكتب', 'Office', 'مكتب تجاري'),
('فيلا', 'Villa', 'فيلا فاخرة'),
('أرض', 'Land', 'أرض للإيجار');

-- ==========================================
-- جدول العقارات (Properties)
-- ==========================================
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    agent_id INTEGER,
    city_id INTEGER NOT NULL,
    district_id INTEGER,
    property_type_id INTEGER NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    description_ar TEXT,
    description_en TEXT,
    price_monthly REAL NOT NULL,
    currency TEXT CHECK(currency IN ('SDG', 'USD', 'SAR', 'EGP')) DEFAULT 'SDG',
    price_usd REAL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area_sqm REAL,
    floor_number INTEGER,
    total_floors INTEGER,
    furnished BOOLEAN DEFAULT FALSE,
    utilities_included BOOLEAN DEFAULT FALSE,
    address_text TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT CHECK(status IN ('pending', 'active', 'rented', 'inactive', 'verification_pending')) DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATETIME,
    verified_by INTEGER,
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    featured_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(id),
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_verified ON properties(is_verified);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_monthly);

-- ==========================================
-- جدول صور العقارات (Property Images)
-- ==========================================
CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    image_type TEXT CHECK(image_type IN ('exterior', 'interior', 'bedroom', 'bathroom', 'kitchen', 'living_room', 'other')) DEFAULT 'other',
    is_primary BOOLEAN DEFAULT FALSE,
    caption_ar TEXT,
    caption_en TEXT,
    sort_order INTEGER DEFAULT 0,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_images_primary ON property_images(is_primary);

-- ==========================================
-- جدول مرافق العقار (Property Amenities)
-- ==========================================
CREATE TABLE IF NOT EXISTS amenities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT UNIQUE NOT NULL,
    name_en TEXT UNIQUE,
    icon_class TEXT,
    category TEXT CHECK(category IN ('essential', 'comfort', 'security', 'connectivity', 'other')) DEFAULT 'other'
);

-- إدخال المرافق الأولية
INSERT OR IGNORE INTO amenities (name_ar, name_en, icon_class, category) VALUES 
('كهرباء', 'Electricity', 'fa-bolt', 'essential'),
('ماء', 'Water', 'fa-tint', 'essential'),
('إنترنت', 'Internet', 'fa-wifi', 'connectivity'),
('تكييف', 'Air Conditioning', 'fa-snowflake', 'comfort'),
('تدفئة', 'Heating', 'fa-fire', 'comfort'),
('غسيل', 'Laundry', 'fa-soap', 'comfort'),
('مطبخ', 'Kitchen', 'fa-utensils', 'essential'),
('موقف سيارات', 'Parking', 'fa-car', 'comfort'),
('حراسة', 'Security', 'fa-shield-alt', 'security'),
('مصعد', 'Elevator', 'fa-arrow-up', 'comfort'),
('أثاث', 'Furniture', 'fa-couch', 'comfort'),
('شرفة', 'Balcony', 'fa-home', 'comfort');

-- جدول الربط بين العقارات والمرافق
CREATE TABLE IF NOT EXISTS property_amenities (
    property_id INTEGER NOT NULL,
    amenity_id INTEGER NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_amenity ON property_amenities(amenity_id);

-- ==========================================
-- جدول التحقق الميداني (Field Verifications)
-- ==========================================
CREATE TABLE IF NOT EXISTS field_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL UNIQUE,
    verifier_id INTEGER NOT NULL,
    verification_date DATE NOT NULL,
    status TEXT CHECK(status IN ('scheduled', 'completed', 'failed', 'cancelled')) DEFAULT 'scheduled',
    ownership_verified BOOLEAN DEFAULT FALSE,
    ownership_documents TEXT,
    condition_verified BOOLEAN DEFAULT FALSE,
    condition_notes TEXT,
    facilities_verified BOOLEAN DEFAULT FALSE,
    facilities_notes TEXT,
    photos_count INTEGER DEFAULT 0,
    video_url TEXT,
    gps_latitude REAL,
    gps_longitude REAL,
    notes TEXT,
    report_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (verifier_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_verifications_property ON field_verifications(property_id);
CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON field_verifications(verifier_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON field_verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON field_verifications(verification_date);

-- ==========================================
-- جدول سجل التدقيق (Audit Log)
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ==========================================
-- جدول الرسائل والاستفسارات (Inquiries)
-- ==========================================
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    contact_method TEXT CHECK(contact_method IN ('whatsapp', 'phone', 'email')) DEFAULT 'whatsapp',
    status TEXT CHECK(status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
    sent_via_whatsapp BOOLEAN DEFAULT FALSE,
    whatsapp_message_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    replied_at DATETIME,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_sender ON inquiries(sender_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_recipient ON inquiries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- ==========================================
-- جدول الحجوزات والزيارات (Bookings/Viewings)
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    booking_type TEXT CHECK(booking_type IN ('viewing', 'rental')) NOT NULL,
    requested_date DATE NOT NULL,
    requested_time_slot TEXT,
    status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',
    notes TEXT,
    confirmation_code TEXT UNIQUE,
    confirmed_at DATETIME,
    cancelled_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(requested_date);

-- ==========================================
-- جدول العقود (Contracts)
-- ==========================================
CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    landlord_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL,
    contract_number TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_amount REAL NOT NULL,
    currency TEXT DEFAULT 'SDG',
    payment_frequency TEXT CHECK(payment_frequency IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
    deposit_amount REAL DEFAULT 0,
    terms TEXT,
    document_url TEXT,
    status TEXT CHECK(status IN ('draft', 'active', 'expired', 'terminated')) DEFAULT 'draft',
    signed_by_landlord BOOLEAN DEFAULT FALSE,
    signed_by_tenant BOOLEAN DEFAULT FALSE,
    signed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (landlord_id) REFERENCES users(id),
    FOREIGN KEY (tenant_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_contracts_property ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date);

-- ==========================================
-- جدول المدفوعات (Payments)
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'SDG',
    payment_type TEXT CHECK(payment_type IN ('rent', 'deposit', 'subscription', 'verification_fee', 'featured_listing')) NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('bank_transfer', 'bankak', 'cash', 'online', 'wallet')),
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_reference TEXT,
    receipt_url TEXT,
    notes TEXT,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);

-- ==========================================
-- جدول اشتراكات السماسرة (Agent Subscriptions)
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_type TEXT CHECK(plan_type IN ('basic', 'premium', 'enterprise')) NOT NULL,
    status TEXT CHECK(status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    max_listings INTEGER DEFAULT 5,
    current_listings INTEGER DEFAULT 0,
    features TEXT,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_type);

-- ==========================================
-- جدول الإشعارات (Notifications)
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('info', 'warning', 'success', 'error', 'system')) DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ==========================================
-- جدول الإعدادات العامة (Settings)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT CHECK(setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- إدخال الإعدادات الأولية
INSERT OR IGNORE INTO settings (setting_key, setting_value, setting_type, description) VALUES 
('site_name_ar', 'دارك', 'string', 'اسم الموقع بالعربية'),
('site_name_en', 'DARK', 'string', 'اسم الموقع بالإنجليزية'),
('currency_default', 'SDG', 'string', 'العملة الافتراضية'),
('currency_exchange_rate', '1500', 'number', 'سعر صرف الدولار مقابل الجنيه السوداني'),
('verification_fee', '50000', 'number', 'رسوم التحقق الميداني بالجنيه'),
('featured_listing_price_usd', '10', 'number', 'سعر الإعلان المميز بالدولار'),
('diaspora_subscription_usd', '50', 'number', 'اشتراك الجالية الشهري بالدولار'),
('maintenance_mode', 'false', 'boolean', 'وضع الصيانة'),
('max_images_per_property', '20', 'number', 'الحد الأقصى لصور العقار');

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);

-- ==========================================
-- عرض (View) للعقارات الموثقة النشطة
-- ==========================================
CREATE VIEW IF NOT EXISTS v_verified_properties AS
SELECT 
    p.id,
    p.title_ar,
    p.title_en,
    p.price_monthly,
    p.currency,
    p.price_usd,
    c.name_ar as city_name,
    d.name_ar as district_name,
    pt.name_ar as property_type_name,
    p.bedrooms,
    p.bathrooms,
    p.area_sqm,
    p.furnished,
    u.full_name_ar as owner_name,
    p.views_count,
    p.created_at,
    fv.verification_date,
    fv.condition_notes
FROM properties p
JOIN cities c ON p.city_id = c.id
LEFT JOIN districts d ON p.district_id = d.id
JOIN property_types pt ON p.property_type_id = pt.id
JOIN users u ON p.owner_id = u.id
LEFT JOIN field_verifications fv ON p.id = fv.property_id
WHERE p.status = 'active' 
  AND p.is_verified = TRUE 
  AND fv.status = 'completed'
ORDER BY p.featured DESC, p.created_at DESC;

-- ==========================================
-- مشغل (Trigger) لتحديث updated_at تلقائيًا
-- ==========================================
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_properties_updated_at 
AFTER UPDATE ON properties
BEGIN
    UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at 
AFTER UPDATE ON user_profiles
BEGIN
    UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==========================================
-- بيانات أولية للتجربة (Seed Data)
-- ==========================================

-- مستخدم مدير
INSERT OR IGNORE INTO users (email, phone, password_hash, full_name_ar, role, is_verified) VALUES 
('admin@darq.sd', '+249123456789', '$2a$10$placeholder', 'مدير النظام', 'admin', TRUE);

-- مستخدم سمكري (للتجربة)
INSERT OR IGNORE INTO users (email, phone, password_hash, full_name_ar, role, is_verified) VALUES 
('agent@darq.sd', '+249987654321', '$2a$10$placeholder', 'سمكري تجريبي', 'agent', TRUE);

-- أحياء بورتسودان
INSERT OR IGNORE INTO districts (city_id, name_ar, name_en) VALUES 
(1, 'الركيبة', 'Al-Rakiba'),
(1, 'السوق العربي', 'Souk Al-Arabi'),
(1, 'الميناء', 'Al-Mina'),
(1, 'حي العمال', 'Hayy Al-Ummal'),
(1, 'دروسيب', 'Dorosib');

-- ==========================================
-- نهاية إنشاء قاعدة البيانات
-- ==========================================
