# SYSTEM INSTRUCTIONS & CONTEXT TRAINING: PROYEK "VONTA"
*(Salin dan tempelkan seluruh isi dokumen ini pada pesan pertama / System Instructions di Google AI Studio untuk melatih AI sebelum meminta pembuatan kode).*

---

## PERINTAH AWAL UNTUK AI AGENT:
**JANGAN MENULIS KODE APAPUN SEKARANG.** Tugas pertamamu adalah membaca, memahami, dan mengunci seluruh konteks produk, arsitektur sistem, aturan desain (`DESIGN.md` & `antislop.md`), serta pedoman rekayasa perangkat lunak (`karpathy-guidelines`) untuk proyek bernama **Vonta** di bawah ini. Setelah membaca dokumen ini, cukup balas dengan: **"KONTEKS VONTA, DESIGN SYSTEM, DAN ATURAN ANTI-SLOP/KARPATHY TELAH DIKUNCI. SIAP MENERIMA PROMPT EKSEKUSI TAHAP 1."**

---

## 1. IDENTITAS & DEFINISI PRODUK (APA ITU VONTA?)
* **Nama Produk:** **Vonta**
* **Definisi:** Platform *Collaborative Spatial Workspace* berbasis web (menggabungkan kemudahan kolaborasi ala Canva/Figma, kanvas denah bangunan 2D ke 2.5D/3D interaktif, dan arus laporan *real-time* bergaya YouTube Live Chat) yang dirancang khusus untuk industri konstruksi, renovasi, dan manajemen properti skala mikro-menengah di Indonesia (Arsitek independen, Owner rumah/vila/kafe, Mandor, dan Tukang bangunan).
* **Masalah Utama yang Diselesaikan (Pain Points):**
  1. **Miskomunikasi Spasial:** Foto kerusakan tembok/pipa di grup WhatsApp terlihat sama semua tanpa koordinat denah yang jelas, memicu salah titik bongkar (*rework waste*).
  2. **Informasi Tenggelam & Lembur Rekap:** Catatan revisi tertimbun ratusan chat WhatsApp dan arsitek harus lembur menyalin foto satu per satu ke Word/Excel saat serah terima kunci (*handover*).
  3. **Kecurangan Material & Kualitas Kerja Asal-Asalan:** Penggelapan dana belanja bahan bangunan oleh oknum lapangan dan klaim pekerjaan "Selesai" tanpa bukti validasi visual *Before-After*.
* **Landasan Ilmiah & Bisnis:**
  * *Theory of Distributed Cognition* (Edwin Hutchins) & *Cognitive Fit Theory* (Iris Vessey): Memindahkan beban ingatan ke artefak spasial berkoordinat.
  * *Lean Construction* (Lauri Koskela): Menghilangkan pemborosan material dan pengerjaan ulang.
  * *Jobs-to-be-Done (JTBD)*: Menjual kepastian kualitas bangunan, anti-rugi material, dan ketenangan pikiran kepada Owner properti.

---

## 2. ARSITEKTUR PERAN & AUTENTIKASI (MULTI-ROLE WORKSPACE)
Sistem menggunakan **Email Authentication (Email Magic Link / Notifikasi Email & 1-Click Google OAuth)** melalui Supabase Auth. Tidak menggunakan SMS/WhatsApp OTP.

1. **Leader (Owner & Mandor) - "The Command Center View":**
   * Masuk dengan Google OAuth atau Email.
   * Mengakses *Dashboard Workspace* penuh di layar desktop/tablet/HP.
   * Hak Akses: Membuat proyek, mengunggah *Multi-Blueprint* (banyak denah per lantai/area), menancapkan titik *Pin* pengerjaan di atas denah, mengatur tingkat prioritas (**Urgent / Normal**), menulis **General Note**, mengirim pesan/rekaman suara (**Voice Note**) di **General Chat**, mengelola **Global Inventory & Daftar Belanja**, serta melakukan **Approve / Reject** hasil kerja tukang.
   * **Aturan Ketat Anti-Manipulasi:** Mandor **TIDAK BISA** menghapus titik Pin lama atau membuat penghapusan sembarangan demi menyembunyikan revisi berulang tanpa *Approval* resmi dari **Owner**.
2. **Worker (Tukang / Pekerja Lapangan) - "The Zero-Confusion View":**
   * Masuk dengan sangat mudah: klik link undangan proyek dari grup/notifikasi email, lalu pilih **Continue with Google** (1 klik) atau **Email Magic Link**.
   * **Email sebagai Unique ID Portofolio Abadi:** Alamat email tukang menjadi *Primary Key* lintas proyek. Setiap titik pekerjaan yang berstatus Hijau (*Resolved*) otomatis terekam ke profil email tersebut sebagai **CV / Portofolio Konstruksi Otomatis** (mencatat jumlah titik selesai, foto *Before-After*, dan rasio *First-Time Right*).
   * **Layar Khusus Anti-Gaptek:** Tukang hanya melihat daftar titik tugas dan denah yang sudah terfilter otomatis sesuai departemennya sendiri (misal: khusus **Kelistrikan**, **Pipa/Plumbing**, **Tembok/Sipil**, atau **Cat/Finishing**). Tombol kamera dibuat besar (minimal 44px) untuk mengunggah foto/video bukti pengerjaan.

---

## 3. LIMA MESIN UTAMA VONTA (CORE ENGINES)
1. **Master Map & Lazy-Loaded 2.5D/3D Blueprint Canvas (Three.js / React Three Fiber):**
   * Mendukung **Multi-Blueprint** per proyek (misal: Area Lobby, Lantai 1, Lantai 2, Area Kolam).
   * Menggunakan metode **Opsi A (2.5D Interactive Tilted Plane + 3D Glowing Pin Pillars)**: Gambar denah 2D (JPG/PNG) diletakkan sebagai lantai di ruang 3D yang bisa diputar 360 derajat dan di-zoom, dengan pilar pin 3D menyala sesuai warna status (**Merah = Open**, **Kuning = In Progress**, **Hijau = Resolved**, **Ungu Berkedip = Ghost Pin / Recurring Issue**).
   * **Lazy-Loading & Mode 2D Cepat:** Hanya me-render 1 denah area yang sedang dibuka (menghapus memori WebGL area sebelumnya agar HP tukang tidak *crash*). Dilengkapi tombol *toggle* **Mode 2D Cepat** khusus untuk pekerja lapangan.
2. **Spatial Task Engine, Before-After Slider Gate, & Revision Counter:**
   * Pekerja **TIDAK BISA** mengubah status titik menjadi Hijau (*Resolved*) sendiri. Pekerja wajib mengunggah foto/video *After* untuk mengubah status ke *Pending Review*.
   * Di layar Leader (Owner/Mandor), muncul **Interactive Before-After Image Comparison Slider** untuk memeriksa kualitas perbaikan.
   * Jika Leader klik **Approve**, status terkunci jadi **Hijau (Resolved)**. Jika Leader klik **Reject**, status kembali ke **Merah (Open)** dan **Revision Counter** bertambah (`+1`). Jika `revision_count >= 3`, muncul peringatan **Red Flag** di Project Overview Owner.
3. **Contextual Live Stream & Voice Note (Panel Kanan ala YouTube Live):**
   * Panel kanan otomatis memfilter arus obrolan dan aktivitas berdasarkan lapisan yang sedang dibuka:
     * Saat di *Project Overview*: Menampilkan **General Chat** (yang bisa diatur *permission*-nya hanya untuk pengumuman Leader) + fitur rekam **Voice Note (15 detik)** + **General Note**.
     * Saat memilih *Area Blueprint*: Hanya menampilkan aktivitas di lantai/area tersebut.
     * Saat mengklik *Filter Departemen* (`[Semua]`, `[Listrik]`, `[Pipa]`, `[Sipil]`, `[Cat]`): Kanvas, aktivitas chat, dan daftar belanja otomatis menyempit ke departemen tersebut.
4. **Global Project Inventory & Pin-Bound Material Tracker (Anti-Penggelapan Dana):**
   * Stok bahan bangunan utama dicatat di **Gudang Global Proyek (Global Inventory)**.
   * Setiap pemakaian bahan atau permintaan belanja oleh mandor **WAJIB diikat ke nomor Pin kerusakan** di denah (*Pin-Bound Allocation*).
   * Jika stok di Gudang Global masih ada, stok otomatis terpotong. Jika stok Gudang Global sisa `0`, kebutuhan bahan otomatis masuk ke **Daftar Belanja (To-Buy List)** yang bisa difilter per departemen.
   * **Budget Guard:** Jika sebuah Pin yang sama meminta alokasi material berulang tanpa adanya status revisi resmi dari Owner, sistem menampilkan peringatan merah (*Fraud/Waste Alert*).
5. **Executive Project Overview, Termin Unlocker, & Custom Print Engine:**
   * Menampilkan kesehatan proyek, transparansi waktu pengerjaan, dan **Progress-to-Termin Unlocker** (bar progres syarat pencairan dana termin/retensi berdasarkan persentase titik Hijau).
   * **Custom Print / PDF Compiler:** Mencetak Daftar Belanja per departemen, laporan serah terima kunci (BAST) lengkap dengan tabel *Before-After*, serta cetak gambar denah 2D/3D dengan opsi *toggle* **Tampilkan / Sembunyikan Titik Pin**.

---

## 4. PEDOMAN DESAIN WAJIB (`DESIGN.md` & `antislop.md`)
Mode aktif: `antislop active: during (session override).`
**Design Read:** *"Reading this as: Collaborative Spatial Construction Workspace & Field Inspection Web-App for Property Owners, Architects, Foremen, and Field Workers, in an Architectural Blueprint & Brass precision style, dial ENERGY 2 / RHYTHM 2 / MOTION 1."*

### A. Palet Warna Resmi: "Architectural Blueprint & Brass" (Patuh R-25 & R-29)
1. **Neutral Background (Primary Surface):** `#F8F7F4` (*Warm Paper White* - warna kertas kalkir terang agar layar HP pekerja terbaca tajam di bawah sinar matahari langsung).
2. **Neutral Text (Primary Ink):** `#141619` (*Carbon Black* - rasio kontras > 15:1 terhadap `#F8F7F4`, melampaui standar WCAG AA 4.5:1).
3. **Core Color 1 (Primary Structural Brand):** `#1B365D` (*Drafting Navy* - digunakan untuk *top navbar*, kerangka *Command Center*, dan identitas arsitektural).
4. **Core Color 2 (Secondary Surface & Borders):** `#E2E6EC` (*Concrete Slate* - digunakan untuk pemisah panel, *card border* struktural, dan latar tabel).
5. **Deliberate Accent (1 Primary Action Accent):** `#D97706` (*Surveyor Ochre / Brass* - digunakan khusus untuk CTA utama seperti tombol "+ Tambah Pin", "Kirim Bukti Foto", dan "Cetak Laporan/BAST").
6. **Semantic Pin Status Colors (Fungsional Murni):**
   * **Open / Baru / Ditolak:** `#DC2626` (Merah Tegas)
   * **In Progress / Pending Review:** `#CA8A04` (Kuning Kunyit Gelap - kontras tinggi)
   * **Resolved / Approved:** `#16A34A` (Hijau Solid)
   * **Recurring / Ghost Pin (Re-opened):** `#9333EA` (Ungu Berkedip)

### B. Tema & Pengaturan Lapangan (Patuh R-21 & R-34)
* **Default Theme:** **Light Mode Kontras Tinggi** (`#F8F7F4`) di seluruh halaman (terutama halaman *Worker*) untuk visibilitas maksimal di lokasi proyek terbuka.
* **Hidden-Safe Night Mode Toggle:** Fitur *Dark/Night Mode* (`#0F172A` surface, `#F8FAFC` text, `#38BDF8` blueprint line, `#F59E0B` accent) **WAJIB ADA dan berfungsi penuh**, namun tombol pengubahnya **DILARANG ditaruh di bar luar yang mudah terpencet tidak sengaja oleh jari tukang**. Tombol *Night Mode* wajib diletakkan di dalam **Modal/Drawer Pengaturan (Settings)** yang diakses melalui menu profil/pengaturan.

### C. Tipografi & Hierarki (Patuh R-06 & R-31)
* **UI & Body Font:** `Plus Jakarta Sans` (Alasan 1 baris: Memiliki *x-height* tinggi dan keterbacaan bersih pada layar HP ukuran kecil di lapangan).
* **Technical & Data Font:** `JetBrains Mono` (Alasan 1 baris: Digunakan khusus untuk Nomor Pin `#101`, koordinat `X/Y`, hitungan revisi, rasio portofolio tukang, dan kuantitas stok material agar sejajar secara tabular).

### D. Aturan Mutlak Anti-Slop (Hard Gates R-01 s/d R-38)
1. **DILARANG KERAS menggunakan karakter em dash** atau en dash di seluruh teks UI, label, maupun salinan teks (R-02). Gunakan koma, titik, titik dua, atau tanda kurung.
2. **Ukuran Tap Target Minimal 44px x 44px** untuk seluruh tombol interaktif, terutama pada tampilan mobile *Worker* (R-03). Tidak boleh ada *horizontal overflow*.
3. **Wajib menyediakan 3 UI States** (Empty State, Loading State, Error State) pada kanvas denah, daftar pin, live chat, dan tabel inventaris (R-27).
4. **DILARANG membuat tombol atau link mati** (R-26 & R-35). Setiap tombol harus memiliki fungsi nyata (membuka modal, memfilter state, menambah data, atau mengubah tampilan).
5. **DILARANG mengarang klaim palsu**, testimoni fiktif, atau menggunakan gradien ungu-biru khas AI dan *glassmorphism* berlebihan (R-01, R-10, R-17, R-18, R-36). Gunakan penanda teks `[VONTA]` sebagai identitas logo tipografi jujur (R-23).

---

## 5. PEDOMAN REKAYASA KODE (`karpathy-guidelines`)
1. **Think Before Coding:** Jangan membuat asumsi tersembunyi. Ikuti spesifikasi data dan skema yang diberikan.
2. **Simplicity First:** Tulis kode paling ringkas, bersih, dan langsung menyelesaikan fungsi utama. Hindari abstraksi berlebih untuk fungsi sekali pakai.
3. **Surgical Changes:** Saat memperbarui modul pada tahap selanjutnya, hanya ubah bagian yang diminta tanpa merusak fitur yang sudah berjalan.
4. **Goal-Driven Execution:** Setiap tahap implementasi harus memenuhi kriteria verifikasi fungsional yang jelas.