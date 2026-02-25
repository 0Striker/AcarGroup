# AcarGroup Web Sitesi

Acar Group şirketinin kurumsal web sitesi projesi.

## 🏗️ Proje Yapısı

Bu proje iki ana bileşenden oluşur:

### Frontend (Next.js)
- **Framework**: Next.js 16.0.10
- **UI Kütüphanesi**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Öne Çıkan Özellikler**: 
  - Modern ve responsive tasarım
  - Admin paneli
  - PDF oluşturma (jsPDF)
  - Framer Motion animasyonları

### Backend (ASP.NET Core)
- **Framework**: .NET 8.0
- **Veritabanı**: PostgreSQL
- **Authentication**: JWT Bearer
- **ORM**: Entity Framework Core

## 🚀 Kurulum

### Gereksinimler

- Node.js 20.x veya üzeri
- .NET 8.0 SDK
- PostgreSQL 14 veya üzeri

### Frontend Kurulumu

```bash
cd acargroup-frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

### Backend Kurulumu

1. PostgreSQL veritabanı oluşturun:
```sql
CREATE DATABASE acargroup_db;
CREATE USER acargroup_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE acargroup_db TO acargroup_user;
```

2. `Acargroup.Api/appsettings.json` dosyasını oluşturun (appsettings.example.json'dan kopyalayın):
```bash
cd Acargroup.Api
cp appsettings.example.json appsettings.json
```

3. `appsettings.json` dosyasındaki bağlantı bilgilerini güncelleyin

4. Migration'ları çalıştırın:
```bash
dotnet ef database update --project ../Acargroup.Infrastructure --startup-project .
```

5. API'yi başlatın:
```bash
dotnet run
```

Backend `http://localhost:5000` adresinde çalışacaktır.

## 📦 Production Deployment

Ubuntu 22.04 VDS'de deployment için detaylı rehber:
[Deployment Guide](docs/deployment_guide.md)

## 🔐 Güvenlik

- `appsettings.json` dosyası Git'e eklenmemiştir
- `.env` dosyaları ignore edilmiştir
- Hassas bilgileri production ortamında environment variables olarak kullanın

## 📝 Lisans

© 2024 Acar Group. Tüm hakları saklıdır.
