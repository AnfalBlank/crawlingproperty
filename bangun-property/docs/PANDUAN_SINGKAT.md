# Estate Insight — Panduan Singkat

> Platform intelijen harga sewa properti Malaysia. Data SPEEDHOME langsung, patokan harga wajar, perbandingan area, dan laporan yang bisa diekspor.

Dokumen ini menjelaskan secara ringkas **apa itu sistem ini, cara memakainya, dan fitur-fiturnya**. Untuk panduan lengkap lihat `MANUAL.md`, untuk teknis lihat `TECHNICAL.md`.

---

## 1. Apa itu Estate Insight?

Mencari properti sewa di Kuala Lumpur itu membingungkan: ratusan listing, harga naik-turun, tidak ada patokan "wajar". Estate Insight mengubah ratusan listing SPEEDHOME yang berantakan menjadi **7 angka yang jelas + grafik + rekomendasi** hanya dalam ~10 detik.

Cukup ketik nama area (mis. `Mont Kiara`), sistem akan:
1. Meng-crawl listing SPEEDHOME secara langsung
2. Menghitung harga rata-rata, median, dan **harga wajar**
3. Menyajikan dashboard interaktif: grafik, peta, perbandingan, ekspor

Tanpa login. Tanpa biaya.

---

## 2. Cara Memakai (alur cepat)

```
1. Buka halaman utama
2. Ketik nama area di kolom pencarian (mis. "Bangsar")
3. Tekan Enter atau klik Analyze
4. Tunggu proses crawl (~10–30 detik, ada animasi loading)
5. Baca dashboard — KPI, grafik, listing, peta
6. Klik listing mana saja untuk detail lengkap (foto + peta)
7. Bisa juga bandingkan area lain, simpan alert, atau ekspor ke Excel
```

> Crawl pertama suatu area butuh 10–30 detik. Kunjungan berikutnya dalam 24 jam langsung tampil dari cache (instan).

---

## 3. Penjelasan Fitur

### 📊 Dashboard Analisis
7 kartu KPI utama:

| KPI | Arti |
|---|---|
| Total Listings | Jumlah sewa aktif di area itu |
| Average Rent | Rata-rata sewa bulanan |
| Median Rent | Nilai tengah sewa |
| **Fair Price** | Patokan harga wajar = `0,7 × median + 0,3 × rata-rata` |
| Avg Sqft | Rata-rata luas unit |
| Price / Sqft | Harga per kaki persegi |
| Top Unit | Tipe kamar paling umum |

### 🎯 Harga Wajar (Fair Price)
Patokan utama sistem. Setiap listing dinilai terhadap harga wajar:
- 🟢 **Under Market** — di bawah 90% harga wajar (murah)
- ⚫ **Fair** — wajar
- 🔴 **Overpriced** — di atas 110% harga wajar (mahal)

### 📈 Grafik Interaktif
- **Distribusi Harga** — histogram; klik batang untuk memfilter listing ke rentang harga itu
- **Tipe Kamar** — donat pembagian berdasarkan jumlah kamar tidur
- **Furnishing** — pembagian FF / Partial / Unfurnished

### 🏠 Modal Detail Listing
Klik listing mana saja untuk membuka detail: carousel foto, harga vs harga wajar, peta mini lokasi, fasilitas, deskripsi.

### 🗺️ Tampilan Peta
Beralih ke mode peta — setiap listing jadi pin berwarna: hijau (murah), hitam (wajar), merah (mahal).

### ⚖️ Perbandingan Area
Bandingkan hingga 5 area berdampingan — tabel, grafik batang, dan rekomendasi area dengan nilai terbaik. Bisa disimpan untuk dilihat lagi.

### 🧮 Kalkulator Harga Wajar
Masukkan jumlah kamar + luas + furnishing → dapatkan estimasi harga wajar untuk spesifikasi itu. Opsional masukkan harga Anda untuk lihat selisihnya.

### 💰 Kalkulator Imbal Hasil (ROI)
Untuk investor: masukkan harga beli + sewa → estimasi yield kotor/bersih, periode balik modal, dan rating (Excellent/Good/Average/Low).

### 📉 Riwayat & Prediksi Harga
Grafik tren 30/60/90 hari + proyeksi 30 hari ke depan (regresi linier).

### 🔔 Alert Tersimpan
Simpan pencarian + email → dapat notifikasi saat ada listing baru yang cocok (di bawah harga maks / minimal kamar tertentu).

### 🔗 Bagikan & Ekspor
- **Share** — salin link dengan kondisi tampilan Anda saat ini
- **Export** — unduh Excel (5 sheet) atau CSV

### 🌐 Mata Uang, Periode, Tema, Bahasa
- 9 mata uang (MYR, IDR, USD, SGD, EUR, GBP, AUD, JPY, THB)
- Periode harian / bulanan / tahunan
- Mode terang / gelap
- 4 bahasa: English, Melayu, Indonesia, 中文

---

## 4. Halaman yang Tersedia

| Halaman | Fungsi |
|---|---|
| `/` | Beranda — pencarian, area populer, statistik real |
| `/analysis?area=...` | Dashboard analisis interaktif |
| `/area/[slug]` | Halaman SEO per area (mis. `/area/mont-kiara`) |
| `/admin` | Konsol admin (perlu token): monitor crawler, cache, kurs |

---

## 5. Panel Admin (singkat)

Buka `/admin`, masukkan token admin. Tersedia 4 tab:
- **Crawler Monitor** — mulai crawl baru, lihat job aktif
- **Scan History** — riwayat crawl, jalankan ulang / hapus
- **Cache Manager** — rasio hit, hapus cache
- **Exchange Rates** — kurs terkini, refresh manual

---

## 6. Tips & Troubleshooting

- **"Rate limit reached"** → terlalu banyak permintaan; tunggu beberapa detik.
- **"No listings found"** → nama area salah eja atau SPEEDHOME tidak punya listing; coba area induk (mis. `Bangsar` bukan `Lucky Garden`).
- **Data terasa lama (badge "Cached")** → klik tombol Refresh (ikon panah melingkar) untuk crawl ulang.
- **Peta kosong** → SPEEDHOME tidak selalu menyediakan koordinat; gunakan tampilan List.
- **Demo tercepat** → pakai area yang sudah ter-cache: Bangsar, KLCC, Mont Kiara.

---

## 7. Catatan Penting

- Data listing bersumber dari halaman publik SPEEDHOME. Estate Insight **tidak berafiliasi** dengan SPEEDHOME Sdn. Bhd.
- "Fair Price", kalkulator, dan prediksi bersifat **heuristik** untuk panduan cepat, bukan penilaian/nasihat keuangan resmi.
- Preferensi lokal (tema, bahasa, mata uang, pencarian terkini) disimpan di perangkat Anda (localStorage). Email alert disimpan di server dan tidak dibagikan.

---

Dibuat di Kuala Lumpur · Open source (MIT) · `github.com/AnfalBlank/crawlingproperty`
