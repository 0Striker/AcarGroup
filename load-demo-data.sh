#!/bin/bash

# AcarGroup Demo Data Loader
# Bu script API üzerinden demo verileri yükler

API_BASE_URL="http://localhost:5203"

echo "🚀 AcarGroup Demo Data Yükleniyor..."
echo ""

# Önce admin token alınmalı
echo "⚠️  Önce admin paneline giriş yapıp bir token almanız gerekiyor."
echo "   Admin token'ınızı buraya yapıştırın:"
read -r ADMIN_TOKEN

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Token boş olamaz!"
    exit 1
fi

echo ""
echo "1️⃣  Biz Kimiz içeriği ekleniyor..."

curl -X PUT "$API_BASE_URL/api/companyinfo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Biz Kimiz?",
    "subtitle": "Güvenlik ve teknoloji çözümlerinde 15 yıllık tecrübe ile yanınızdayız",
    "content": "<h2>AcarGroup - Güvenlik ve Teknoloji Çözümleri</h2><p>2008 yılından beri güvenlik sistemleri, ağ altyapısı ve bilişim teknolojileri alanında hizmet veren AcarGroup, müşterilerine en kaliteli ve güvenilir çözümleri sunmayı ilke edinmiştir.</p><h3>Misyonumuz</h3><p>İşletmelerin ve kurumların güvenlik ihtiyaçlarını en üst seviyede karşılayarak, teknoloji ile güvenliği bir araya getirmek. Müşterilerimizin dijital dönüşüm süreçlerinde güvenilir çözüm ortağı olmak.</p><h3>Vizyonumuz</h3><p>Türkiye'\''nin önde gelen güvenlik ve teknoloji çözümleri sağlayıcısı olmak. Sürekli gelişen teknoloji ile birlikte, sektörde yenilikçi ve öncü bir firma olmak.</p><h3>Neden AcarGroup?</h3><ul><li><strong>15 Yıllık Tecrübe:</strong> Sektörde uzun yıllara dayanan deneyimimiz ile her türlü projeyi başarıyla tamamlıyoruz.</li><li><strong>Uzman Kadro:</strong> Alanında uzman mühendis ve teknisyenlerimiz ile profesyonel hizmet.</li><li><strong>7/24 Destek:</strong> Kesintisiz teknik destek ve bakım hizmetleri.</li><li><strong>Kaliteli Ürünler:</strong> Hikvision, Dahua, TP-Link gibi dünya markalarıyla çalışıyoruz.</li><li><strong>Müşteri Memnuniyeti:</strong> 500+ mutlu müşteri ve %98 müşteri memnuniyet oranı.</li></ul><p>Güvenliğiniz bizim önceliğimiz!</p>",
    "heroImageUrl": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1920&h=1080&fit=crop",
    "sliderImageUrl1": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    "sliderImageUrl2": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop",
    "sliderImageUrl3": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop"
  }'

echo ""
echo "2️⃣  Projeler ekleniyor..."

# Proje 1
curl -X POST "$API_BASE_URL/api/admin/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "İstanbul Havalimanı Güvenlik Sistemi",
    "slug": "istanbul-havalimani-guvenlik-sistemi",
    "status": "Completed",
    "city": "İstanbul",
    "district": "Arnavutköy",
    "clientName": "DHMİ",
    "startDate": "2023-01-15",
    "endDate": "2023-06-30",
    "shortDescription": "İstanbul Havalimanı iç hatlar terminaline 150 adet IP kamera ve yüz tanıma sistemi kurulumu.",
    "longDescription": "<p>İstanbul Havalimanı projesi kapsamında toplam 150 adet 4K çözünürlüklü IP kamera, 10 adet NVR kayıt cihazı ve yüz tanıma sistemi entegrasyonu gerçekleştirilmiştir.</p>",
    "heroImageUrl": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&h=800&fit=crop",
    "galleryImageUrls": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600"],
    "displayOrder": 1,
    "isFeatured": true,
    "isActive": true
  }'

# Proje 2
curl -X POST "$API_BASE_URL/api/admin/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Ankara Valilik Binası Ağ Altyapısı",
    "slug": "ankara-valilik-binasi-ag-altyapisi",
    "status": "Completed",
    "city": "Ankara",
    "district": "Çankaya",
    "clientName": "Ankara Valiliği",
    "startDate": "2023-03-01",
    "endDate": "2023-05-15",
    "shortDescription": "Valilik binası için fiber optik omurga ve yapısal kablolama projesi.",
    "longDescription": "<p>Ankara Valiliği ana hizmet binasında mevcut bakır altyapının fiber optik ve Cat6A kablolama ile yenilenmesi projesi.</p>",
    "heroImageUrl": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1200&h=800&fit=crop",
    "galleryImageUrls": [],
    "displayOrder": 2,
    "isFeatured": true,
    "isActive": true
  }'

# Proje 3
curl -X POST "$API_BASE_URL/api/admin/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "İzmir Fabrika Güvenlik ve Otomasyon",
    "slug": "izmir-fabrika-guvenlik-otomasyon",
    "status": "Active",
    "city": "İzmir",
    "district": "Çiğli",
    "clientName": "ABC Tekstil A.Ş.",
    "startDate": "2024-10-01",
    "shortDescription": "Tekstil fabrikası için entegre güvenlik ve otomasyon sistemi kurulumu.",
    "longDescription": "<p>20.000 m² kapalı alanda kamera sistemi, alarm, yangın algılama ve akıllı aydınlatma otomasyonu projesi.</p>",
    "heroImageUrl": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=800&fit=crop",
    "galleryImageUrls": [],
    "displayOrder": 3,
    "isFeatured": false,
    "isActive": true
  }'

echo ""
echo "3️⃣  Referanslar ekleniyor..."

# Referans 1
curl -X POST "$API_BASE_URL/api/admin/references" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Hikvision",
    "logoUrl": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=300&fit=crop",
    "websiteUrl": "https://www.hikvision.com",
    "description": "Dünya çapında güvenlik kamera sistemleri lideri. Yetkili iş ortağıyız.",
    "displayOrder": 1,
    "isActive": true
  }'

# Referans 2
curl -X POST "$API_BASE_URL/api/admin/references" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Dahua Technology",
    "logoUrl": "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=400&h=300&fit=crop",
    "websiteUrl": "https://www.dahuasecurity.com",
    "description": "IP kamera ve video gözetleme sistemlerinde global marka.",
    "displayOrder": 2,
    "isActive": true
  }'

# Referans 3
curl -X POST "$API_BASE_URL/api/admin/references" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "TP-Link",
    "logoUrl": "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=400&h=300&fit=crop",
    "websiteUrl": "https://www.tp-link.com",
    "description": "Network ve ağ altyapı çözümlerinde güvenilir partner.",
    "displayOrder": 3,
    "isActive": true
  }'

# Referans 4
curl -X POST "$API_BASE_URL/api/admin/references" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Cisco Systems",
    "logoUrl": "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop",
    "websiteUrl": "https://www.cisco.com",
    "description": "Kurumsal network çözümlerinde dünya devi.",
    "displayOrder": 4,
    "isActive": true
  }'

echo ""
echo "✅ Demo veriler başarıyla yüklendi!"
echo ""
echo "Kontrol için:"
echo "  - Biz Kimiz: http://localhost:3000/biz-kimiz"
echo "  - Projeler: http://localhost:3000/projelerimiz"
echo "  - Referanslar: http://localhost:3000/referanslarimiz"
