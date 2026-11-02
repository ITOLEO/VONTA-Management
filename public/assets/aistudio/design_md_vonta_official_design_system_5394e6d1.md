# DESIGN.md — Vonta Design System & UI Specification
*(Updated with Primary PRD Color Palettes & Anti-Slop Strict Standards)*

Dokumen ini adalah **Single Source of Truth (Acuan Mutlak)** untuk seluruh pengembangan antarmuka pengguna (UI/UX) pada platform web **Vonta**. Setiap komponen wajib mematuhi standar enterprise anti-slop, proporsi mikro, dan token warna PRD asli Vonta.

## 1. PRINSIP UTAMA & ANTISLOP PROTOCOL
1. **Zero-Slop Standard:** Dilarang menggunakan *shadow* tebal berlebihan, gradasi pelangi norak, sudut terlalu bulat (`rounded-full`) untuk tombol aksi, atau teks berukuran besar tanpa hierarki.
2. **Hairline Bento Architecture:** Kedalaman visual diciptakan dari kontras permukaan yang sangat halus (`#09090B` ke `#111115`) dengan garis pembatas tipis `1px solid rgba(255, 255, 255, 0.07)`.
3. **Dual-Tone Text Hierarchy:** Paragraf penjelasan wajib memadukan warna abu-abu redup (`#8E929F`) dengan kata kunci putih terang (`#FAFAFA`).

## 2. COLOR TOKENS (PRD PALETTE LOCKED)
* **Canvas Background:** `#09090B` (Deep Obsidian Navy)
* **Surface / Bento Cards:** `#111115`
* **Primary Brand Action:** `#2563EB` (Blueprint Electric Blue)
* **Spatial Wireframe Accent:** `#06B6D4` (Laser Cyan)
* **Status Pins:** 
  - Open/Urgent: `#EF4444` (Red)
  - In Progress: `#F59E0B` (Amber)
  - Resolved: `#10B981` (Emerald)

## 3. TYPOGRAPHY (PLUS JAKARTA SANS + JETBRAINS MONO)
* **UI & Body:** `Plus Jakarta Sans` (`text-[13.5px] leading-[1.55] text-[#8E929F]`)
* **Headings:** `Plus Jakarta Sans` dengan ukuran presisi `15px` (Card Title) hingga `20px` (Header).
* **Technical Data (Pin ID, Inventory Stock, Coordinates):** `JetBrains Mono` (`font-mono text-[11.5px] tracking-[0.02em]`).

## 4. COMPONENT GUIDELINES
- Tombol Utama: `bg-[#2563EB] text-[#FAFAFA] rounded-[6px] px-3.5 py-2 text-[13px] font-medium shadow-sm`
- Card Container: `bg-[#111115] border border-white/[0.07] rounded-xl p-6`
- Group List Container (Worker View): `bg-[#111115] border border-white/[0.07] rounded-2xl divide-y divide-white/[0.05]`