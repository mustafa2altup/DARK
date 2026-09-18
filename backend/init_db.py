#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DARK Platform - Database Initialization Script
منصة دارك - سكريبت إعداد قاعدة البيانات

هذا السكريبت يقوم بإنشاء قاعدة البيانات وجداولها الأولية
"""

import sqlite3
import os
from pathlib import Path

# مسار قاعدة البيانات
DB_PATH = Path(__file__).parent.parent / 'database' / 'darq.db'
SCHEMA_PATH = Path(__file__).parent.parent / 'database' / 'schema.sql'

def connect_db():
    """الاتصال بقاعدة البيانات"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def verify_tables(conn):
    """التحقق من وجود جميع الجداول"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
    """)
    tables = [row[0] for row in cursor.fetchall()]
    return tables

def verify_data(conn):
    """التحقق من البيانات الأولية"""
    cursor = conn.cursor()
    
    # التحقق من المدن
    cursor.execute("SELECT COUNT(*) FROM cities")
    cities_count = cursor.fetchone()[0]
    
    # التحقق من أنواع العقارات
    cursor.execute("SELECT COUNT(*) FROM property_types")
    property_types_count = cursor.fetchone()[0]
    
    # التحقق من المرافق
    cursor.execute("SELECT COUNT(*) FROM amenities")
    amenities_count = cursor.fetchone()[0]
    
    # التحقق من الإعدادات
    cursor.execute("SELECT COUNT(*) FROM settings")
    settings_count = cursor.fetchone()[0]
    
    # التحقق من المستخدمين
    cursor.execute("SELECT COUNT(*) FROM users")
    users_count = cursor.fetchone()[0]
    
    return {
        'cities': cities_count,
        'property_types': property_types_count,
        'amenities': amenities_count,
        'settings': settings_count,
        'users': users_count
    }

def print_database_info(conn):
    """طباعة معلومات قاعدة البيانات"""
    print("\n" + "="*60)
    print("📊 معلومات قاعدة بيانات DARK - دارك")
    print("="*60)
    
    tables = verify_tables(conn)
    print(f"\n✅ عدد الجداول: {len(tables)}")
    print("\nالجداول الموجودة:")
    for table in tables:
        print(f"   • {table}")
    
    data = verify_data(conn)
    print("\n📋 البيانات الأولية:")
    print(f"   • المدن: {data['cities']}")
    print(f"   • أنواع العقارات: {data['property_types']}")
    print(f"   • المرافق: {data['amenities']}")
    print(f"   • الإعدادات: {data['settings']}")
    print(f"   • المستخدمين: {data['users']}")
    
    # عرض المدن
    cursor = conn.cursor()
    cursor.execute("SELECT name_ar, name_en FROM cities")
    cities = cursor.fetchall()
    print("\n🏙️ المدن المتاحة:")
    for city in cities:
        print(f"   • {city[0]} ({city[1]})")
    
    print("\n" + "="*60)
    print("✅ قاعدة البيانات جاهزة للاستخدام!")
    print("="*60 + "\n")

def main():
    """الدالة الرئيسية"""
    print("\n🚀 جاري الاتصال بقاعدة بيانات DARK...")
    
    if not DB_PATH.exists():
        print(f"❌ خطأ: قاعدة البيانات غير موجودة في {DB_PATH}")
        print("   يرجى تشغيل ملف schema.sql أولاً")
        return False
    
    try:
        conn = connect_db()
        print("✅ تم الاتصال بنجاح")
        
        print_database_info(conn)
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ خطأ في قاعدة البيانات: {e}")
        return False
    except Exception as e:
        print(f"❌ خطأ غير متوقع: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
