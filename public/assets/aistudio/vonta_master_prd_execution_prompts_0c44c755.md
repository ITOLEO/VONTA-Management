# MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD) & EXECUTION PROMPTS: VONTA
*(Gunakan dokumen ini sebagai referensi utama dan salin Prompt Tahap 1 hingga Tahap 4 secara berurutan ke Google AI Studio setelah AI mengonfirmasi Training Context).*

---

## BAGIAN 1: ARSITEKTUR HIRARKI SISTEM VONTA

```plaintext
[ LEVEL 1: WORKSPACE PROYEK (Command Center - Owner & Mandor) ]
 ├── 📊 Executive Project Overview
 │    ├── Persentase Penyelesaian & Transparansi Waktu Pengerjaan
 │    ├── Progress-to-Termin Unlocker (Syarat cair dana retensi/termin)
 │    ├── Red Flag Detector (Daftar titik dengan Revision Counter >= 3)
 │    └── General Note & General Chat (Permission Leader + Fitur Voice Note 15s)
 │
 ├── 📦 Global Project Inventory & Pin-Bound Shopping Cart
 │    ├── Tabel Stok Gudang Utama Proyek (Input stok glondongan)
 │    ├── Riwayat Klaim Material per Titik Pin + Deteksi Permintaan Ganda (Fraud Alert)
 │    └── Auto-Shopping List (To-Buy) terfilter per Departemen [Listrik | Pipa | Sipil | Cat]
 │
 ├── 🗺️ Master Map & Multi-Blueprint Canvas (Lazy-Loaded per Area)
 │    ├── 📁 Area 1: Denah Lantai Dasar (Mode 2.5D Tilted Three.js / Mode 2D Cepat)
 │    │    ├── Filter Layer Departemen: [Semua] [⚡ Listrik] [💧 Pipa] [🧱 Sipil] [🎨 Cat]
 │    │    ├── 📍 Pin #101 (Status Warna, Prioritas Urgent/Normal, Hitungan Revisi)
 │    │    ├── 🖼️ Before-After Slider Gate (Wajib foto After sebelum Approve Owner/Mandor)
 │    │    └── 🛒 Pin-Bound Material Request (Potong Gudang Global / Masuk To-Buy)
 │    ├── 📁 Area 2: Denah Lantai 2
 │    └── 📁 Area 3: Area Kolam & Outdoor
 │
 └── 🖨️ Custom Print & Handover (BAST) Compiler
      ├── Toggle: Cetak Denah dengan Titik Pin vs Tanpa Titik Pin (Bersih)
      ├── Cetak Daftar Belanja per Departemen
      └── 1-Click PDF BAST (Tabel Foto Before-After + Kanvas Tanda Tangan Digital)

[ LEVEL 2: ZERO-CONFUSION WORKER VIEW (Tampilan HP Tukang) ]
 ├── 🔐 1-Click Google Login / Email Magic Link (Tanpa Nomor Telepon)
 ├── 🎯 Auto-Filtered Task List & 2D Fast Blueprint (Hanya menampilkan departemennya sendiri)
 ├── 📸 Giant Camera Upload Button (Min 44px, unggah foto/video bukti perbaikan)
 └── ⚙️ Settings Modal (Tempat penyimpanan aman untuk Toggle Night/Dark Mode)

[ LINTAS PROYEK: AUTOMATED WORKER PORTFOLIO (Terikat Email Pekerja) ]
 └── 👷 Profil & CV Tukang (Total Titik Selesai, Rasio First-Time Right %, Galeri Before-After)
```

---

## BAGIAN 2: SKEMA DATABASE SUPABASE (POSTGRESQL + RLS)

Simpan skema SQL ini untuk dijalankan di SQL Editor Supabase:

```sql
-- 1. Tabel Profil Pengguna & Portofolio Pekerja (Terikat ke Email / Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  global_role TEXT NOT NULL DEFAULT 'worker' CHECK (global_role IN ('owner', 'mandor', 'worker')),
  specialty_department TEXT CHECK (specialty_department IN ('listrik', 'pipa', 'sipil', 'cat', 'all')),
  theme_preference TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
  total_resolved_pins INTEGER NOT NULL DEFAULT 0,
  first_time_right_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Proyek
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  general_note TEXT DEFAULT '',
  chat_leader_only BOOLEAN NOT NULL DEFAULT FALSE,
  termin_target_percent INTEGER NOT NULL DEFAULT 100,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Anggota Tim Proyek (Undangan via Email)
CREATE TABLE public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'mandor', 'worker')),
  department TEXT NOT NULL DEFAULT 'all' CHECK (department IN ('listrik', 'pipa', 'sipil', 'cat', 'all')),
  UNIQUE(project_id, user_email)
);

-- 4. Tabel Multi-Blueprint (Denah per Area/Lantai)
CREATE TABLE public.blueprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  area_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Spatial Pins (Titik Pekerjaan / Kerusakan)
CREATE TABLE public.pins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_code TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL CHECK (department IN ('listrik', 'pipa', 'sipil', 'cat')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'reopened')),
  coord_x NUMERIC(5,2) NOT NULL,
  coord_y NUMERIC(5,2) NOT NULL,
  before_media_url TEXT NOT NULL,
  after_media_url TEXT,
  assigned_worker_email TEXT,
  revision_count INTEGER NOT NULL DEFAULT 0,
  delete_requested_by_mandor BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 6. Tabel Global Project Inventory (Gudang Utama Proyek)
CREATE TABLE public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('listrik', 'pipa', 'sipil', 'cat')),
  unit TEXT NOT NULL,
  stock_available NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabel Pin-Bound Material Requests & Auto-Shopping Cart
CREATE TABLE public.material_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  pin_id UUID REFERENCES public.pins(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('listrik', 'pipa', 'sipil', 'cat')),
  qty_requested NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  allocation_status TEXT NOT NULL CHECK (allocation_status IN ('allocated_from_stock', 'to_buy')),
  is_duplicate_warning BOOLEAN NOT NULL DEFAULT FALSE,
  requested_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tabel Contextual Activity Stream & Voice Note Chat
CREATE TABLE public.activity_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE CASCADE,
  pin_id UUID REFERENCES public.pins(id) ON DELETE CASCADE,
  department TEXT CHECK (department IN ('listrik', 'pipa', 'sipil', 'cat', 'all')),
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice_note', 'system_event')),
  content TEXT NOT NULL,
  voice_duration_sec INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## BAGIAN 3: KEPUTUSAN DESAIN TERTULIS (WAJIB UNTUK R-31 `antislop.md`)

Setiap keputusan visual dalam Vonta memiliki alasan fungsional satu baris yang tegas:
1. **Warna `#F8F7F4` (Warm Paper White) & `#141619` (Carbon Black):** Memberikan rasio kontras >15:1 agar layar smartphone pekerja lapangan tetap terbaca jelas di bawah terik matahari siang.
2. **Warna `#1B365D` (Drafting Navy) & `#D97706` (Surveyor Ochre):** Mengambil warna teknis kertas cetak biru arsitektur dan kuningan alat ukur, sekaligus menjaga agar warna tombol utama tidak bertabrakan dengan warna pin Merah/Kuning/Hijau/Ungu.
3. **Layout Split-View 70/30 (Desktop) & Single-Column Task Focus (Mobile Worker):** Memisahkan area kerja spasial (kanvas denah di kiri) dengan arus komunikasi kontekstual (live stream di kanan) untuk menghilangkan perpindahan tab.
4. **Tipografi `Plus Jakarta Sans` + `JetBrains Mono`:** Menggabungkan huruf tanpa kait yang ramah layar kecil dengan huruf *monospace* untuk akurasi pembacaan nomor kode pin, koordinat, dan stok barang.
5. **Penyembunyian Toggle Night Mode di dalam Modal Settings:** Mencegah pekerja lapangan yang tangannya berkeringat atau kotor tidak sengaja menekan tombol ubah tema saat sedang memfoto titik bangunan.

---

## BAGIAN 4: URUTAN PROMPT EKSEKUSI UNTUK GOOGLE AI STUDIO

Setelah Anda menempelkan **File 1 (`vonta_ai_studio_training_context.md`)** dan AI menjawab siap, salin dan tempelkan prompt di bawah ini secara berurutan.

### PROMPT EKSEKUSI 1: Fondasi Workspace, Role Switcher, & Kanvas 2.5D/2D Multi-Blueprint
*(Salin teks di bawah ini ke Google AI Studio)*

```text
Sekarang bangun aplikasi web interaktif VONTA secara lengkap dan fungsional dengan menerapkan seluruh aturan di Training Context (antislop active: during, palet Architectural Blueprint & Brass, dan Karpathy Simplicity First).

Pastikan fitur-fitur berikut berjalan 100% tanpa tombol mati:
1. Header & Autentikasi Simulasi Berbasis Email/Google:
   - Tampilkan identitas tipografi "[VONTA]" di kiri atas, nama proyek aktif ("Renovasi Resort & Villa Uluwatu"), dan indikator progres keseluruhan.
   - Buat pemilih peran interaktif (Role Switcher) untuk menguji seluruh alur: [Owner (Leader)], [Mandor (Leader)], dan [Worker: Budi - Spesialis Listrik (budi.listrik@gmail.com)]. Sertakan juga tombol Modal "Invite via Email / Google OAuth".
   - Buat tombol "Pengaturan (Settings)" yang membuka Modal Pengaturan berisi opsi "Night / Dark Mode Toggle" (disimpan di dalam pengaturan agar tidak terpencet tidak sengaja saat kerja lapangan) dan preferensi notifikasi email. Pastikan Light Mode (#F8F7F4) dan Night Mode (#0F172A) sama-sama berfungsi sempurna dan memenuhi kontras WCAG AA.

2. Navigasi Multi-Blueprint (Lazy-Loaded per Area) & Filter Departemen:
   - Sediakan pemilih Area Blueprint: [Area 1: Lantai Dasar & Lobby], [Area 2: Lantai 2 Kamar Utama], dan [Area 3: Area Kolam & Mesin], lengkap dengan tombol "+ Upload Blueprint Baru".
   - Sediakan bar Filter Departemen: [Semua Departemen], [⚡ Kelistrikan], [💧 Pipa / Plumbing], [🧱 Tembok / Sipil], dan [🎨 Cat / Finishing].
   - Saat peran diubah menjadi "Worker (Tukang)", tampilan otomatis beralih ke "Zero-Confusion Worker View" yang simpel (ukuran tombol minimal 44px) dan otomatis mengunci filter pada departemen pekerja tersebut.

3. Kanvas Spasial 2.5D/3D Interaktif + Toggle 2D Cepat:
   - Buat kanvas visualisasi denah bangunan yang memiliki toggle: [Mode 2.5D Perspektif Interaktif] (denah dapat dimiringkan/diputar dengan pilar Pin berdiri menyala di atas titik koordinat) dan [Mode 2D Cepat] (tampilan datar hemat baterai untuk HP tukang).
   - Hanya Leader (Owner & Mandor) yang dapat mengklik kanvas untuk menambahkan titik Pin baru (input Judul, Catatan, Departemen, Prioritas Urgent/Normal, dan Foto Before).
   - Tampilkan titik Pin dengan kode monospace (#101, #102, dst.) dan warna status akurat: Merah (Open), Kuning (In Progress/Pending Approval), Hijau (Resolved), atau Ungu Berkedip (Re-opened/Ghost Pin).
```

---

### PROMPT EKSEKUSI 2: Before-After Slider Gate, Revision Lock, & Contextual Live Stream
*(Kirimkan setelah Prompt 1 selesai atau gabungkan jika ingin langsung sekaligus)*

```text
Lanjutkan dengan menyempurnakan Mesin Alur Kerja (Spatial Task Engine) dan Panel Kanan (Contextual Activity Stream ala YouTube Live) pada aplikasi VONTA:

1. Detail Pin, Before-After Slider Gate, & Anti-Hapus Sembarangan:
   - Saat sebuah titik Pin diklik, tampilkan panel inspeksi titik tersebut.
   - Jika pengguna adalah Worker, tampilkan tombol besar (minimal 44px) "Unggah Foto/Video Bukti Selesai (After)". Pekerja tidak bisa mengubah status langsung menjadi Hijau; mengunggah bukti akan mengubah status menjadi Kuning (Pending Approval Mandor/Owner).
   - Jika pengguna adalah Leader (Mandor/Owner) dan titik sudah memiliki foto After, tampilkan "Interactive Before-After Image Comparison Slider" (penggeser perbandingan foto Sebelum vs Sesudah) beserta tombol [Approve -> Jadi Hijau] dan [Reject -> Kembali Merah & Tambah Revision Counter +1].
   - Jika titik yang sudah Hijau dibuka kembali oleh Owner karena rusak lagi, ubah statusnya menjadi Ungu Berkedip (Recurring Issue / Ghost Pin).
   - Terapkan aturan Anti-Manipulasi: Jika Mandor mencoba menghapus titik Pin, sistem menahan penghapusan tersebut dan mengubah statusnya menjadi "Menunggu Persetujuan Hapus dari Owner". Hanya Owner yang bisa menyetujui penghapusan titik.

2. Panel Kanan: Contextual Live Stream, General Note, & Voice Note:
   - Buat kolom kanan dengan tab kontekstual yang otomatis mengikuti layar dan filter departemen yang sedang aktif.
   - Sediakan kotak "General Note dari Leader" di bagian atas yang hanya bisa diedit oleh Owner/Mandor.
   - Di kolom General Chat / Activity Stream, sediakan toggle permission "Hanya Leader yang Bisa Mengirim Pesan", input pesan teks, dan tombol "Rekam Voice Note (15 Detik)" interaktif (dengan simulasi perekaman waktu berjalan dan pemutar audio gelombang suara di dalam chat).
```

---

### PROMPT EKSEKUSI 3: Global Inventory, Pin-Bound Shopping Cart, Portofolio Email Tukang, & Print Engine
*(Kirimkan untuk melengkapi seluruh 17 fitur utama)*

```text
Sekarang lengkapi 3 modul terakhir VONTA: Global Inventory & Pin-Bound Shopping Cart, Executive Overview + Automated Worker Portfolio, serta Custom Print / BAST Engine:

1. Global Project Inventory & Pin-Bound Material Tracker (Anti-Penggelapan Dana):
   - Buat tampilan/tab "Inventory & Daftar Belanja" yang terhubung langsung ke titik Pin.
   - Tampilkan tabel "Gudang Utama Proyek (Global Stock)" (contoh data realistis: Semen Gresik 40kg, Pipa PVC Rucika 4 Inch, Kabel NYM Eterna 3x2.5mm, Cat Dulux Weathershield Putih).
   - Di dalam tiap titik Pin, sediakan fitur "Alokasi Material ke Titik Ini". Jika stok di Gudang Global mencukupi, potong stok gudang secara otomatis. Jika stok gudang 0 atau kurang, otomatis masukkan kekurangannya ke dalam tabel "Daftar Belanja (To-Buy List)".
   - Pastikan Daftar Belanja otomatis terfilter saat pengguna memilih departemen tertentu (misal: hanya menampilkan belanjaan departemen Kelistrikan).
   - Budget Guard (Anti-Fraud): Jika sebuah titik Pin meminta alokasi barang yang sama lebih dari satu kali tanpa adanya status revisi resmi dari Owner, tampilkan badge peringatan merah "Indikasi Permintaan Ganda / Cek Pemborosan".

2. Executive Project Overview & Automated Worker Portfolio (CV Tukang via Email):
   - Di tab "Project Overview", tampilkan metrik kesehatan proyek, transparansi waktu pengerjaan, daftar titik Red Flag (Revision Counter >= 3), dan "Progress-to-Termin Unlocker" (bar syarat pencairan dana retensi proyek berdasarkan persentase titik Hijau).
   - Buat modal/halaman "Portofolio Pekerja (CV Tukang)" yang terikat pada alamat Email pekerja (misal: budi.listrik@gmail.com). Tampilkan statistik yang dihitung langsung dari data pin proyek (Total Titik Diselesaikan, Rasio First-Time Right %, Rata-rata Waktu Pengerjaan, dan galeri bukti Before-After). Saat suatu titik di-Approve menjadi Hijau, skor portofolio pekerja otomatis bertambah secara real-time.

3. Fitur Cetak (Print Engine & 1-Click BAST):
   - Buat modal "Cetak Laporan / BAST & Denah" dengan kontrol nyata:
     a. Opsi Cetak: [Cetak Denah 2.5D/2D Area Aktif], [Cetak Daftar Belanja per Departemen], atau [Cetak Dokumen Serah Terima (BAST) Lengkap Before-After].
     b. Checkbox Toggle: "Sertakan Titik-Titik Pin Pengerjaan di Atas Gambar Denah" (bisa dicentang atau dikosongkan sesuai kebutuhan cetak).
     c. Kanvas Tanda Tangan Digital (Signature Pad) untuk Mandor dan Owner sebelum menekan tombol Print (`window.print()`).
   - Sertakan Empty State, Loading State, dan Error State yang rapi, serta jalankan pemeriksaan Delivery Gate (R-01 s/d R-38) di akhir.
```