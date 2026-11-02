import {
  VontaDatabaseState,
  DepartmentOnly,
  PinStatus,
  DivisionRecord,
} from '../types/schema';

// Generator SVG Data URI untuk Denah Arsitektural Teknis (Anti-Broken Image)
export function createBlueprintSvgDataUri(
  areaCode: 'area1' | 'area2' | 'area3' | 'custom',
  title: string
): string {
  const safeTitle = title.replace(/[<>&"']/g, '');

  const layouts: Record<string, string> = {
    area1: `
      <rect x="60" y="60" width="880" height="580" fill="#F8F7F4" stroke="#1B365D" stroke-width="6"/>
      <rect x="68" y="68" width="864" height="564" fill="none" stroke="#1B365D" stroke-width="1.5" stroke-dasharray="6 4"/>
      <g stroke="#CBD5E1" stroke-width="0.75">
        <line x1="280" y1="40" x2="280" y2="660"/>
        <line x1="520" y1="40" x2="520" y2="660"/>
        <line x1="740" y1="40" x2="740" y2="660"/>
        <line x1="40" y1="240" x2="960" y2="240"/>
        <line x1="40" y1="440" x2="960" y2="440"/>
      </g>
      <g font-family="JetBrains Mono, monospace" font-size="11" fill="#1B365D" font-weight="700" text-anchor="middle">
        <circle cx="280" cy="30" r="12" fill="#E2E6EC" stroke="#1B365D" stroke-width="1.5"/>
        <text x="280" y="34">A1</text>
        <circle cx="520" cy="30" r="12" fill="#E2E6EC" stroke="#1B365D" stroke-width="1.5"/>
        <text x="520" y="34">B1</text>
        <circle cx="740" cy="30" r="12" fill="#E2E6EC" stroke="#1B365D" stroke-width="1.5"/>
        <text x="740" y="34">C1</text>
      </g>
      <rect x="60" y="60" width="460" height="380" fill="#F1F5F9" fill-opacity="0.55" stroke="#1B365D" stroke-width="4"/>
      <rect x="120" y="130" width="160" height="55" fill="#E2E6EC" stroke="#1B365D" stroke-width="2"/>
      <rect x="430" y="75" width="75" height="65" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
      <text x="467" y="105" font-family="JetBrains Mono, monospace" font-size="10" fill="#92400E" text-anchor="middle" font-weight="700">MDP PANEL</text>
      <text x="467" y="120" font-family="JetBrains Mono, monospace" font-size="9" fill="#92400E" text-anchor="middle">EL-01</text>
      <rect x="520" y="60" width="420" height="260" fill="#EFF6FF" fill-opacity="0.45" stroke="#1B365D" stroke-width="4"/>
      <line x1="740" y1="60" x2="740" y2="320" stroke="#1B365D" stroke-width="3"/>
      <circle cx="610" cy="150" r="18" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="2"/>
      <text x="610" y="154" font-family="JetBrains Mono, monospace" font-size="10" fill="#1E3A8A" text-anchor="middle" font-weight="700">P-01</text>
      <rect x="520" y="320" width="420" height="320" fill="#F8FAFC" stroke="#1B365D" stroke-width="4"/>
      <rect x="60" y="440" width="460" height="200" fill="#F1F5F9" stroke="#1B365D" stroke-width="4"/>
      <line x1="280" y1="440" x2="280" y2="640" stroke="#1B365D" stroke-width="3"/>
      <path d="M 280 390 A 50 50 0 0 1 330 440" fill="none" stroke="#D97706" stroke-width="2" stroke-dasharray="4 2"/>
      <path d="M 520 210 A 45 45 0 0 1 565 255" fill="none" stroke="#D97706" stroke-width="2" stroke-dasharray="4 2"/>
      <g fill="#1B365D">
        <rect x="272" y="232" width="16" height="16"/>
        <rect x="512" y="232" width="16" height="16"/>
        <rect x="732" y="232" width="16" height="16"/>
        <rect x="272" y="432" width="16" height="16"/>
        <rect x="512" y="432" width="16" height="16"/>
        <rect x="732" y="432" width="16" height="16"/>
      </g>
      <g font-family="Plus Jakarta Sans, sans-serif" fill="#1B365D" font-weight="700" font-size="14">
        <text x="110" y="295">ZONE A: GRAND LOBBY &amp; MAIN FOYER</text>
        <text x="110" y="315" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569" font-weight="500">ELV +0.00 | AREA 148 M2</text>
        <text x="550" y="110">ZONE B: MAIN KITCHEN &amp; PIPE SHAFT</text>
        <text x="550" y="128" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569" font-weight="500">ELV -0.05 | PLUMBING CORE</text>
        <text x="765" y="110">MECHANICAL ROOM</text>
        <text x="765" y="128" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569" font-weight="500">ELV +0.00</text>
        <text x="560" y="490">ZONE C: LOUNGE &amp; EAST TERRACE</text>
        <text x="560" y="510" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569" font-weight="500">ELV +0.15 | WOOD &amp; PAINT FINISH</text>
        <text x="90" y="535">GUEST RESTROOMS</text>
        <text x="310" y="535">SERVICE CORRIDOR &amp; MAIN STAIRS</text>
      </g>
    `,
    area2: `
      <rect x="70" y="65" width="860" height="570" fill="#F8F7F4" stroke="#1B365D" stroke-width="6"/>
      <g stroke="#CBD5E1" stroke-width="0.75">
        <line x1="340" y1="45" x2="340" y2="655"/>
        <line x1="650" y1="45" x2="650" y2="655"/>
        <line x1="50" y1="350" x2="950" y2="350"/>
      </g>
      <rect x="70" y="65" width="580" height="285" fill="#F8FAFC" stroke="#1B365D" stroke-width="4"/>
      <rect x="130" y="110" width="180" height="140" fill="#E2E6EC" stroke="#1B365D" stroke-width="2"/>
      <text x="220" y="185" font-family="JetBrains Mono, monospace" font-size="11" fill="#1B365D" text-anchor="middle" font-weight="700">KING BED 200x200</text>
      <rect x="650" y="65" width="280" height="285" fill="#EFF6FF" fill-opacity="0.6" stroke="#1B365D" stroke-width="4"/>
      <ellipse cx="790" cy="175" rx="75" ry="50" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="2.5"/>
      <text x="790" y="179" font-family="JetBrains Mono, monospace" font-size="11" fill="#1E3A8A" text-anchor="middle" font-weight="700">JACUZZI TUB</text>
      <rect x="70" y="350" width="580" height="285" fill="#F1F5F9" stroke="#1B365D" stroke-width="4"/>
      <rect x="650" y="350" width="280" height="285" fill="#FEF3C7" fill-opacity="0.35" stroke="#1B365D" stroke-width="4"/>
      <g font-family="Plus Jakarta Sans, sans-serif" fill="#1B365D" font-weight="700" font-size="14">
        <text x="360" y="140">MASTER SUITE 201 (OCEAN VIEW)</text>
        <text x="360" y="160" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569">ELV +4.20 | CEILING GYPSUM DROP</text>
        <text x="680" y="280">EN-SUITE BATHROOM</text>
        <text x="680" y="298" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569">WATERPROOFING ZONE</text>
        <text x="115" y="470">SUITE 202 &amp; WALK-IN CLOSET</text>
        <text x="115" y="490" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569">ELV +4.20 | PARQUET FLOORING</text>
        <text x="685" y="475">BALCONY &amp; GLASS RAILING</text>
        <text x="685" y="495" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569">EXTERIOR COATING</text>
      </g>
    `,
    area3: `
      <rect x="60" y="60" width="880" height="580" fill="#F8F7F4" stroke="#1B365D" stroke-width="6"/>
      <rect x="110" y="110" width="520" height="300" rx="16" fill="#DBEAFE" fill-opacity="0.7" stroke="#0284C7" stroke-width="5"/>
      <rect x="130" y="130" width="480" height="260" rx="10" fill="none" stroke="#0284C7" stroke-width="1.5" stroke-dasharray="8 6"/>
      <text x="370" y="255" font-family="Plus Jakarta Sans, sans-serif" font-size="18" fill="#0369A1" font-weight="800" text-anchor="middle">MAIN INFINITY POOL (22M x 8M)</text>
      <text x="370" y="280" font-family="JetBrains Mono, monospace" font-size="12" fill="#0C4A6E" font-weight="600" text-anchor="middle">DEPTH -1.45M | 24V UNDERWATER LED LIGHTS</text>
      <rect x="670" y="110" width="230" height="300" fill="#FEF3C7" fill-opacity="0.5" stroke="#1B365D" stroke-width="4"/>
      <circle cx="740" cy="210" r="28" fill="#FDE68A" stroke="#B45309" stroke-width="2.5"/>
      <text x="740" y="214" font-family="JetBrains Mono, monospace" font-size="10" fill="#78350F" text-anchor="middle" font-weight="700">PUMP-1</text>
      <circle cx="830" cy="210" r="28" fill="#FDE68A" stroke="#B45309" stroke-width="2.5"/>
      <text x="830" y="214" font-family="JetBrains Mono, monospace" font-size="10" fill="#78350F" text-anchor="middle" font-weight="700">PUMP-2</text>
      <rect x="110" y="440" width="790" height="160" fill="#F1F5F9" stroke="#1B365D" stroke-width="3"/>
      <g font-family="Plus Jakarta Sans, sans-serif" fill="#1B365D" font-weight="700" font-size="14">
        <text x="690" y="150">PUMP ROOM &amp; BALANCING TANK</text>
        <text x="690" y="340" font-family="JetBrains Mono, monospace" font-size="11" fill="#475569">4-INCH AW PVC PIPE MANIFOLD</text>
        <text x="150" y="520">IRONWOOD SUN DECK</text>
        <text x="580" y="520">GAZEBO BAR &amp; OUTDOOR RINSE SHOWER</text>
      </g>
    `,
    custom: `
      <rect x="60" y="60" width="880" height="580" fill="#F8F7F4" stroke="#1B365D" stroke-width="6"/>
      <g stroke="#CBD5E1" stroke-width="1">
        <line x1="350" y1="60" x2="350" y2="640"/>
        <line x1="650" y1="60" x2="650" y2="640"/>
        <line x1="60" y1="350" x2="940" y2="350"/>
      </g>
      <text x="500" y="330" font-family="Plus Jakarta Sans, sans-serif" font-size="20" fill="#1B365D" font-weight="800" text-anchor="middle">${safeTitle}</text>
      <text x="500" y="365" font-family="JetBrains Mono, monospace" font-size="13" fill="#475569" text-anchor="middle">SCALE 1:100 | ACTIVE FLOOR PLAN</text>
    `,
  };

  const selectedLayout = layouts[areaCode] || layouts.custom;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
    <rect width="1000" height="700" fill="#EFECE6"/>
    <g stroke="#E2DFD7" stroke-width="1">
      <line x1="0" y1="100" x2="1000" y2="100"/>
      <line x1="0" y1="200" x2="1000" y2="200"/>
      <line x1="0" y1="300" x2="1000" y2="300"/>
      <line x1="0" y1="400" x2="1000" y2="400"/>
      <line x1="0" y1="500" x2="1000" y2="500"/>
      <line x1="0" y1="600" x2="1000" y2="600"/>
      <line x1="100" y1="0" x2="100" y2="700"/>
      <line x1="200" y1="0" x2="200" y2="700"/>
      <line x1="300" y1="0" x2="300" y2="700"/>
      <line x1="400" y1="0" x2="400" y2="700"/>
      <line x1="500" y1="0" x2="500" y2="700"/>
      <line x1="600" y1="0" x2="600" y2="700"/>
      <line x1="700" y1="0" x2="700" y2="700"/>
      <line x1="800" y1="0" x2="800" y2="700"/>
      <line x1="900" y1="0" x2="900" y2="700"/>
    </g>
    ${selectedLayout}
    <rect x="670" y="645" width="270" height="42" fill="#1B365D"/>
    <text x="682" y="664" font-family="JetBrains Mono, monospace" font-size="10" fill="#F8FAFC" font-weight="700">VONTA CAD SHEET: ${safeTitle.toUpperCase()}</text>
    <text x="682" y="679" font-family="JetBrains Mono, monospace" font-size="9" fill="#94A3B8">SCALE 1:100 | UNIT: MM</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generator SVG Data URI untuk Bukti Foto Lapangan Before & After
export function createFieldPhotoSvgDataUri(
  pinCode: string,
  stage: 'BEFORE' | 'AFTER',
  department: DepartmentOnly,
  caption: string
): string {
  const safeCaption = caption.replace(/[<>&"']/g, '');
  const isBefore = stage === 'BEFORE';
  const bg = isBefore ? '#1C1917' : '#064E3B';
  const badgeBg = isBefore ? '#DC2626' : '#16A34A';
  const accentStroke = isBefore ? '#F87171' : '#34D399';

  const illustration = isBefore
    ? `
      <rect x="140" y="80" width="520" height="260" rx="8" fill="#292524" stroke="#57534E" stroke-width="3"/>
      <path d="M 210 130 L 360 210 L 320 265 L 480 310" fill="none" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
      <circle cx="360" cy="210" r="36" fill="none" stroke="#F59E0B" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="400" y="155" font-family="JetBrains Mono, monospace" font-size="13" fill="#FCA5A5" font-weight="700">INSPECTION FINDING (${pinCode})</text>
    `
    : `
      <rect x="140" y="80" width="520" height="260" rx="8" fill="#065F46" stroke="#10B981" stroke-width="3"/>
      <line x1="200" y1="200" x2="600" y2="200" stroke="#A7F3D0" stroke-width="8" stroke-linecap="round"/>
      <circle cx="400" cy="200" r="42" fill="#047857" stroke="#34D399" stroke-width="3"/>
      <path d="M 382 200 L 395 214 L 422 186" fill="none" stroke="#ECFDF5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="400" y="125" font-family="JetBrains Mono, monospace" font-size="13" fill="#A7F3D0" font-weight="700" text-anchor="middle">VERIFIED COMPLETE (${pinCode})</text>
    `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <rect width="800" height="450" fill="${bg}"/>
    ${illustration}
    <rect x="24" y="24" width="170" height="36" rx="6" fill="${badgeBg}"/>
    <text x="109" y="47" font-family="JetBrains Mono, monospace" font-size="13" fill="#FFFFFF" font-weight="700" text-anchor="middle">${stage} · ${pinCode}</text>
    <rect x="620" y="24" width="156" height="32" rx="6" fill="#0F172A" fill-opacity="0.8" stroke="${accentStroke}" stroke-width="1.5"/>
    <text x="698" y="45" font-family="JetBrains Mono, monospace" font-size="11" fill="#F8FAFC" font-weight="600" text-anchor="middle">DIV: ${department.toUpperCase()}</text>
    <rect x="0" y="375" width="800" height="75" fill="#090D16" fill-opacity="0.92"/>
    <text x="28" y="404" font-family="Plus Jakarta Sans, sans-serif" font-size="15" fill="#F8FAFC" font-weight="700">${safeCaption}</text>
    <text x="28" y="428" font-family="JetBrains Mono, monospace" font-size="11" fill="#94A3B8">VONTA FIELD DOCUMENTATION</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_VONTA_DATABASE: VontaDatabaseState = {
  // 1. public.profiles (Mencakup Personel Unik untuk Masing-Masing Proyek / Bisnis)
  profiles: [
    // Owner Utama
    {
      id: 'prof-owner-01',
      email: 'owner@uluwaturesort.id',
      full_name: 'Ir. Hendra Wijaya (Owner)',
      avatar_url: null,
      global_role: 'owner',
      specialty_department: 'all',
      theme_preference: 'light',
      total_resolved_pins: 0,
      first_time_right_count: 0,
      worker_code: 'OWN-001',
      can_chat: true,
      created_at: '2026-10-01T08:00:00Z',
    },
    // --- TIM PROYEK 1: RENOVASI RESORT & VILLA ULUWATU ---
    {
      id: 'prof-mandor-01',
      email: 'mandor.agus@konstruksi.id',
      full_name: 'Agus Supriyadi (Uluwatu Foreman)',
      avatar_url: null,
      global_role: 'mandor',
      specialty_department: 'all',
      theme_preference: 'light',
      total_resolved_pins: 14,
      first_time_right_count: 12,
      worker_code: 'MDR-001',
      can_chat: true,
      created_at: '2026-10-01T08:15:00Z',
    },
    {
      id: 'prof-worker-listrik',
      email: 'budi.listrik@gmail.com',
      full_name: 'Budi Santoso',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'listrik',
      theme_preference: 'light',
      total_resolved_pins: 18,
      first_time_right_count: 16,
      worker_code: 'TKG-101',
      can_chat: false,
      created_at: '2026-10-02T07:30:00Z',
    },
    {
      id: 'prof-worker-pipa',
      email: 'slamet.plumbing@gmail.com',
      full_name: 'Slamet Riyadi',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'pipa',
      theme_preference: 'light',
      total_resolved_pins: 11,
      first_time_right_count: 9,
      worker_code: 'TKG-102',
      can_chat: false,
      created_at: '2026-10-02T07:45:00Z',
    },
    {
      id: 'prof-worker-sipil',
      email: 'wahyu.sipil@gmail.com',
      full_name: 'Wahyu Hidayat',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'sipil',
      theme_preference: 'light',
      total_resolved_pins: 15,
      first_time_right_count: 14,
      worker_code: 'TKG-103',
      can_chat: false,
      created_at: '2026-10-02T08:00:00Z',
    },
    {
      id: 'prof-worker-cat',
      email: 'dedi.finishing@gmail.com',
      full_name: 'Dedi Kurniawan',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'cat',
      theme_preference: 'light',
      total_resolved_pins: 9,
      first_time_right_count: 8,
      worker_code: 'TKG-104',
      can_chat: false,
      created_at: '2026-10-02T08:10:00Z',
    },
    // --- TIM PROYEK 2: VILLA CEMPAKA RESIDENCE (CANGGU) ---
    {
      id: 'prof-mandor-cempaka',
      email: 'ketut.mandor@cempakavilla.id',
      full_name: 'I Ketut Sudiana (Cempaka Foreman)',
      avatar_url: null,
      global_role: 'mandor',
      specialty_department: 'all',
      theme_preference: 'light',
      total_resolved_pins: 19,
      first_time_right_count: 18,
      worker_code: 'MDR-201',
      can_chat: true,
      created_at: '2026-09-10T08:00:00Z',
    },
    {
      id: 'prof-worker-cempaka-1',
      email: 'rizky.smarthome@gmail.com',
      full_name: 'Rizky Pratama',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'listrik',
      theme_preference: 'light',
      total_resolved_pins: 14,
      first_time_right_count: 13,
      worker_code: 'TKG-201',
      can_chat: false,
      created_at: '2026-09-11T08:00:00Z',
    },
    {
      id: 'prof-worker-cempaka-2',
      email: 'hendra.saniter@gmail.com',
      full_name: 'Hendra Gunawan',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'pipa',
      theme_preference: 'light',
      total_resolved_pins: 12,
      first_time_right_count: 11,
      worker_code: 'TKG-202',
      can_chat: false,
      created_at: '2026-09-11T08:30:00Z',
    },
    {
      id: 'prof-worker-cempaka-3',
      email: 'anton.marmer@gmail.com',
      full_name: 'Anton Wijaya',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'sipil',
      theme_preference: 'light',
      total_resolved_pins: 16,
      first_time_right_count: 15,
      worker_code: 'TKG-203',
      can_chat: false,
      created_at: '2026-09-11T09:00:00Z',
    },
    // --- TIM PROYEK 3: JIMBARAN CLIFF BOUTIQUE HOTEL ---
    {
      id: 'prof-mandor-jimbaran',
      email: 'made.mandor@jimbaranhotel.id',
      full_name: 'I Made Wirawan (Jimbaran Foreman)',
      avatar_url: null,
      global_role: 'mandor',
      specialty_department: 'all',
      theme_preference: 'light',
      total_resolved_pins: 10,
      first_time_right_count: 9,
      worker_code: 'MDR-301',
      can_chat: true,
      created_at: '2026-08-15T08:00:00Z',
    },
    {
      id: 'prof-worker-jimbaran-1',
      email: 'surya.marine@gmail.com',
      full_name: 'Surya Darma',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'listrik',
      theme_preference: 'light',
      total_resolved_pins: 11,
      first_time_right_count: 10,
      worker_code: 'TKG-301',
      can_chat: false,
      created_at: '2026-08-16T08:00:00Z',
    },
    {
      id: 'prof-worker-jimbaran-2',
      email: 'bayu.struktur@gmail.com',
      full_name: 'Bayu Nugroho',
      avatar_url: null,
      global_role: 'worker',
      specialty_department: 'sipil',
      theme_preference: 'light',
      total_resolved_pins: 13,
      first_time_right_count: 12,
      worker_code: 'TKG-302',
      can_chat: false,
      created_at: '2026-08-16T08:30:00Z',
    },
  ],

  // 2. public.projects (3 Unit Bisnis / Proyek Terpisah)
  projects: [
    {
      id: 'proj-uluwatu-01',
      name: 'Uluwatu Resort & Villa Renovation',
      location: 'Jl. Pantai Suluban No. 8, Uluwatu, Bali',
      business_unit_code: 'BUSINESS UNIT RESORT-01',
      owner_id: 'prof-owner-01',
      general_note:
        'Focus this week: finish Lobby main panel conduit and pressure-test Floor 2 hot water pipes before final painting.',
      chat_leader_only: true,
      termin_target_percent: 80,
      sop_low_stock_threshold: 5,
      estimated_countdown_label: '5 Years 3 Months 2 Days',
      start_date: '2026-10-01',
      target_end_date: '2032-02-02',
      created_at: '2026-10-01T08:00:00Z',
    },
    {
      id: 'proj-cempaka-02',
      name: 'Villa Cempaka Residence',
      location: 'Jl. Cempaka Raya No. 14, Canggu, Bali',
      business_unit_code: 'BUSINESS UNIT VILLA-02',
      owner_id: 'prof-owner-01',
      general_note:
        'Main floor marble interior finishing, smart home lighting, and master bathroom hot water piping.',
      chat_leader_only: true,
      termin_target_percent: 75,
      sop_low_stock_threshold: 4,
      estimated_countdown_label: '2 Years 6 Months 14 Days',
      start_date: '2026-09-10',
      target_end_date: '2029-05-15',
      created_at: '2026-09-10T08:00:00Z',
    },
    {
      id: 'proj-jimbaran-03',
      name: 'Jimbaran Cliff Boutique Hotel',
      location: 'Jl. Bukit Permai No. 21, Jimbaran, Bali',
      business_unit_code: 'BUSINESS UNIT HOTEL-03',
      owner_id: 'prof-owner-01',
      general_note:
        'Cliffside restaurant deck structure and marine-grade corrosion-resistant panel installation.',
      chat_leader_only: true,
      termin_target_percent: 85,
      sop_low_stock_threshold: 6,
      estimated_countdown_label: '3 Years 9 Months 20 Days',
      start_date: '2026-08-15',
      target_end_date: '2030-06-05',
      created_at: '2026-08-15T08:00:00Z',
    },
  ],

  // 3. public.project_members (Setiap Proyek Memiliki Tim & Pekerja Berbeda)
  project_members: [
    // Tim Proyek 1 (Uluwatu): 4 Pekerja + Mandor Agus + Owner
    {
      id: 'pm-01',
      project_id: 'proj-uluwatu-01',
      user_email: 'owner@uluwaturesort.id',
      role: 'owner',
      department: 'all',
      can_chat: true,
    },
    {
      id: 'pm-02',
      project_id: 'proj-uluwatu-01',
      user_email: 'mandor.agus@konstruksi.id',
      role: 'mandor',
      department: 'all',
      can_chat: true,
    },
    {
      id: 'pm-03',
      project_id: 'proj-uluwatu-01',
      user_email: 'budi.listrik@gmail.com',
      role: 'worker',
      department: 'listrik',
      can_chat: false,
    },
    {
      id: 'pm-04',
      project_id: 'proj-uluwatu-01',
      user_email: 'slamet.plumbing@gmail.com',
      role: 'worker',
      department: 'pipa',
      can_chat: false,
    },
    {
      id: 'pm-05',
      project_id: 'proj-uluwatu-01',
      user_email: 'wahyu.sipil@gmail.com',
      role: 'worker',
      department: 'sipil',
      can_chat: false,
    },
    {
      id: 'pm-06',
      project_id: 'proj-uluwatu-01',
      user_email: 'dedi.finishing@gmail.com',
      role: 'worker',
      department: 'cat',
      can_chat: false,
    },
    // Tim Proyek 2 (Villa Cempaka): 3 Pekerja + Mandor Ketut + Owner
    {
      id: 'pm-cempaka-01',
      project_id: 'proj-cempaka-02',
      user_email: 'owner@uluwaturesort.id',
      role: 'owner',
      department: 'all',
      can_chat: true,
    },
    {
      id: 'pm-cempaka-02',
      project_id: 'proj-cempaka-02',
      user_email: 'ketut.mandor@cempakavilla.id',
      role: 'mandor',
      department: 'all',
      can_chat: true,
    },
    {
      id: 'pm-cempaka-03',
      project_id: 'proj-cempaka-02',
      user_email: 'rizky.smarthome@gmail.com',
      role: 'worker',
      department: 'listrik',
      can_chat: false,
    },
    {
      id: 'pm-cempaka-04',
      project_id: 'proj-cempaka-02',
      user_email: 'hendra.saniter@gmail.com',
      role: 'worker',
      department: 'pipa',
      can_chat: false,
    },
    {
      id: 'pm-cempaka-05',
      project_id: 'proj-cempaka-02',
      user_email: 'anton.marmer@gmail.com',
      role: 'worker',
      department: 'sipil',
      can_chat: false,
    },
    // Tim Proyek 3 (Jimbaran Hotel): 2 Pekerja + Mandor Made + Owner
    {
      id: 'pm-jimbaran-01',
      project_id: 'proj-jimbaran-03',
      user_email: 'owner@uluwaturesort.id',
      role: 'owner',
      department: 'all',
      can_chat: true,
    },
    {
      id: 'pm-jimbaran-02',
      project_id: 'proj-jimbaran-03',
      user_email: 'made.mandor@jimbaranhotel.id',
      role: 'mandor',
      department: 'all',
      can_chat: true,
    },
    {
      id: 'pm-jimbaran-03',
      project_id: 'proj-jimbaran-03',
      user_email: 'surya.marine@gmail.com',
      role: 'worker',
      department: 'listrik',
      can_chat: false,
    },
    {
      id: 'pm-jimbaran-04',
      project_id: 'proj-jimbaran-03',
      user_email: 'bayu.struktur@gmail.com',
      role: 'worker',
      department: 'sipil',
      can_chat: false,
    },
  ],

  // 4. public.blueprints (Setiap Proyek Memiliki Denah Multi-Area Sendiri)
  blueprints: [
    // Proyek 1: Uluwatu
    {
      id: 'bp-area-1',
      project_id: 'proj-uluwatu-01',
      area_name: 'Area 1: Ground Floor & Lobby',
      image_url: createBlueprintSvgDataUri('area1', 'Area 1: Ground Floor & Lobby'),
      sort_order: 1,
      created_at: '2026-10-01T09:00:00Z',
    },
    {
      id: 'bp-area-2',
      project_id: 'proj-uluwatu-01',
      area_name: 'Area 2: Floor 2 Master Suite',
      image_url: createBlueprintSvgDataUri('area2', 'Area 2: Floor 2 Master Suite'),
      sort_order: 2,
      created_at: '2026-10-01T09:10:00Z',
    },
    {
      id: 'bp-area-3',
      project_id: 'proj-uluwatu-01',
      area_name: 'Area 3: Pool & Pump Room',
      image_url: createBlueprintSvgDataUri('area3', 'Area 3: Pool & Pump Room'),
      sort_order: 3,
      created_at: '2026-10-01T09:20:00Z',
    },
    // Proyek 2: Villa Cempaka Residence
    {
      id: 'bp-cempaka-1',
      project_id: 'proj-cempaka-02',
      area_name: 'Area 1: Villa Cempaka Main Floor',
      image_url: createBlueprintSvgDataUri('area1', 'Area 1: Villa Cempaka Main Floor'),
      sort_order: 1,
      created_at: '2026-09-10T09:00:00Z',
    },
    {
      id: 'bp-cempaka-2',
      project_id: 'proj-cempaka-02',
      area_name: 'Area 2: Master Suite & Plunge Pool Cempaka',
      image_url: createBlueprintSvgDataUri('area2', 'Area 2: Master Suite & Plunge Pool Cempaka'),
      sort_order: 2,
      created_at: '2026-09-10T09:15:00Z',
    },
    // Proyek 3: Jimbaran Cliff Boutique Hotel
    {
      id: 'bp-jimbaran-1',
      project_id: 'proj-jimbaran-03',
      area_name: 'Area 1: Cliffside Restaurant & Deck',
      image_url: createBlueprintSvgDataUri('area3', 'Area 1: Cliffside Restaurant & Deck'),
      sort_order: 1,
      created_at: '2026-08-15T09:00:00Z',
    },
    {
      id: 'bp-jimbaran-2',
      project_id: 'proj-jimbaran-03',
      area_name: 'Area 2: Ocean View Penthouse Wing',
      image_url: createBlueprintSvgDataUri('area2', 'Area 2: Ocean View Penthouse Wing'),
      sort_order: 2,
      created_at: '2026-08-15T09:20:00Z',
    },
  ],

  // 5. public.pins (Titik Pin Terpisah per Proyek)
  pins: [
    // --- PINS PROYEK 1: RENOVASI RESORT & VILLA ULUWATU (9 Titik, 3 Selesai) ---
    {
      id: 'pin-101',
      pin_code: '#101',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      title: 'MDP-EL01 Panel Cable Exposed & Unfinished Grounding',
      description:
        'Main NYM 3x2.5mm cable near the Lobby MDP box lacks protective conduit and has a loose grounding terminal.',
      department: 'listrik',
      priority: 'urgent',
      status: 'open',
      coord_x: 46.5,
      coord_y: 16.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#101',
        'BEFORE',
        'listrik',
        'MDP-EL01 panel cable without protective conduit'
      ),
      before_revision_media_url: createFieldPhotoSvgDataUri(
        '#101',
        'BEFORE',
        'listrik',
        'Cable condition before R-01 revision (loose conduit)'
      ),
      after_media_url: null,
      assigned_worker_email: 'budi.listrik@gmail.com',
      revision_count: 1,
      delete_requested_by_mandor: false,
      pin_comments: [
        {
          id: 'cmt-101-1',
          sender_name: 'Agus Supriyadi (Uluwatu Foreman)',
          sender_role: 'mandor',
          note: 'Revision R-01: Upper corner conduit is still loose, please tighten the conduit and grounding terminal bolt.',
          media_url: createFieldPhotoSvgDataUri(
            '#101',
            'BEFORE',
            'listrik',
            'Foreman note: Tighten upper corner conduit'
          ),
          status_label: 'Open (Revision R-01)',
          created_at: '2026-10-25T10:15:00Z',
        },
      ],
      created_by: 'prof-owner-01',
      created_at: '2026-10-25T10:15:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-102',
      pin_code: '#102',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      title: 'Clean Water Pipe Joint Leak at Shaft P-01',
      description:
        'Water dripping at the 4-inch PVC elbow in the main kitchen shaft. Re-glued with heavy-duty pipe cement, awaiting Foreman review.',
      department: 'pipa',
      priority: 'urgent',
      status: 'in_preview',
      coord_x: 61.0,
      coord_y: 22.5,
      before_media_url: createFieldPhotoSvgDataUri(
        '#102',
        'BEFORE',
        'pipa',
        'Water seepage at shaft P-01 elbow joint'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#102',
        'AFTER',
        'pipa',
        '4-inch PVC elbow joint dry after pressure test'
      ),
      assigned_worker_email: 'slamet.plumbing@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      pin_comments: [
        {
          id: 'cmt-102-1',
          sender_name: 'Slamet Riyadi',
          sender_role: 'worker',
          note: '4-inch PVC elbow joint re-glued and pressure-tested at 2 bar, dry with no leaks.',
          media_url: createFieldPhotoSvgDataUri(
            '#102',
            'AFTER',
            'pipa',
            '4-inch PVC elbow joint dry after pressure test'
          ),
          status_label: 'Pending review',
          created_at: '2026-10-26T14:20:00Z',
        },
      ],
      created_by: 'prof-mandor-01',
      created_at: '2026-10-26T11:30:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-103',
      pin_code: '#103',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      title: 'Hairline Plaster Crack on Reception Pillar',
      description:
        'Center column plaster near the reception desk has been repaired with skimcoat mortar and sanded smooth.',
      department: 'sipil',
      priority: 'normal',
      status: 'resolved',
      coord_x: 22.0,
      coord_y: 35.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#103',
        'BEFORE',
        'sipil',
        '80cm hairline crack on lobby column plaster'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#103',
        'AFTER',
        'sipil',
        'Column surface smooth and passed light inspection'
      ),
      assigned_worker_email: 'wahyu.sipil@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      pin_comments: [
        {
          id: 'cmt-103-1',
          sender_name: 'Wahyu Hidayat',
          sender_role: 'worker',
          note: 'Pillar plaster repaired using fine skimcoat mortar.',
          media_url: createFieldPhotoSvgDataUri(
            '#103',
            'AFTER',
            'sipil',
            'Column surface smooth and passed light inspection'
          ),
          status_label: 'Resolved',
          created_at: '2026-10-27T15:30:00Z',
        },
      ],
      created_by: 'prof-owner-01',
      created_at: '2026-10-24T09:00:00Z',
      resolved_at: '2026-10-27T16:00:00Z',
    },
    {
      id: 'pin-104',
      pin_code: '#104',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      title: 'East Terrace Wall Paint Blistering Again',
      description:
        'Damp blisters appeared after last night rain. Being scraped down to plaster and coated with alkali sealer.',
      department: 'cat',
      priority: 'urgent',
      status: 'in_progress',
      coord_x: 72.5,
      coord_y: 68.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#104',
        'BEFORE',
        'cat',
        'East terrace paint blistering from moisture'
      ),
      before_revision_media_url: createFieldPhotoSvgDataUri(
        '#104',
        'BEFORE',
        'cat',
        'Paint before R-03 revision (still damp blistering)'
      ),
      after_media_url: null,
      assigned_worker_email: 'dedi.finishing@gmail.com',
      revision_count: 3,
      delete_requested_by_mandor: false,
      pin_comments: [
        {
          id: 'cmt-104-1',
          sender_name: 'Agus Supriyadi (Uluwatu Foreman)',
          sender_role: 'mandor',
          note: 'Request revision R-03: Do not paint over directly, scrape old coat first and apply 2 coats of alkali sealer.',
          media_url: createFieldPhotoSvgDataUri(
            '#104',
            'BEFORE',
            'cat',
            'Paint before R-03 revision (still damp blistering)'
          ),
          status_label: 'In progress',
          created_at: '2026-10-26T09:15:00Z',
        },
      ],
      created_by: 'prof-owner-01',
      created_at: '2026-10-23T14:20:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-105',
      pin_code: '#105',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      title: 'Main Staircase Corridor Two-Way Switch Installation',
      description:
        'Flush box is recessed neatly and wiring is pulled. Waiting for approval on switch frame alignment.',
      department: 'listrik',
      priority: 'normal',
      status: 'in_preview',
      coord_x: 38.0,
      coord_y: 78.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#105',
        'BEFORE',
        'listrik',
        'Staircase corridor flush box before switch cover'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#105',
        'AFTER',
        'listrik',
        'Two-way switch installed level with spirit level'
      ),
      assigned_worker_email: 'budi.listrik@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      pin_comments: [
        {
          id: 'cmt-105-1',
          sender_name: 'Budi Santoso',
          sender_role: 'worker',
          note: 'Two-way hotel switch frame installed level, ready for Foreman review.',
          media_url: createFieldPhotoSvgDataUri(
            '#105',
            'AFTER',
            'listrik',
            'Two-way switch installed level with spirit level'
          ),
          status_label: 'Pending review',
          created_at: '2026-10-27T11:20:00Z',
        },
      ],
      created_by: 'prof-mandor-01',
      created_at: '2026-10-27T08:40:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-201',
      pin_code: '#201',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-2',
      title: 'Suite 201 Drop-Ceiling LED Strip Driver Placement',
      description:
        '24V LED driver transformer needs relocation near the maintenance hatch for technician access.',
      department: 'listrik',
      priority: 'urgent',
      status: 'open',
      coord_x: 45.0,
      coord_y: 28.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#201',
        'BEFORE',
        'listrik',
        'LED strip driver hanging loose on ceiling frame'
      ),
      after_media_url: null,
      assigned_worker_email: 'budi.listrik@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-owner-01',
      created_at: '2026-10-28T09:10:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-202',
      pin_code: '#202',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-2',
      title: 'Floor 2 Jacuzzi Area Waterproofing Flood Test',
      description:
        'Two-coat waterproofing membrane cured and passed 48-hour flood test with no seepage to Floor 1 ceiling.',
      department: 'pipa',
      priority: 'normal',
      status: 'resolved',
      coord_x: 78.5,
      coord_y: 27.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#202',
        'BEFORE',
        'pipa',
        'Jacuzzi concrete slab before membrane coating'
      ),
      before_revision_media_url: createFieldPhotoSvgDataUri(
        '#202',
        'BEFORE',
        'pipa',
        'Before R-01 revision: thin coat at east corner'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#202',
        'AFTER',
        'pipa',
        '48-hour flood test passed with zero leakage'
      ),
      assigned_worker_email: 'slamet.plumbing@gmail.com',
      revision_count: 1,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-01',
      created_at: '2026-10-22T13:00:00Z',
      resolved_at: '2026-10-26T17:00:00Z',
    },
    {
      id: 'pin-301',
      pin_code: '#301',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-3',
      title: 'Pool Light Junction Box Waterproof Seal',
      description:
        'Waterproof resin in the west underwater light junction box must be topped up to withstand pool pressure.',
      department: 'listrik',
      priority: 'urgent',
      status: 'open',
      coord_x: 32.0,
      coord_y: 38.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#301',
        'BEFORE',
        'listrik',
        'Pool light junction box before waterproof resin fill'
      ),
      before_revision_media_url: createFieldPhotoSvgDataUri(
        '#301',
        'BEFORE',
        'listrik',
        'Before R-02 revision: resin level below top seal'
      ),
      after_media_url: null,
      assigned_worker_email: 'budi.listrik@gmail.com',
      revision_count: 2,
      delete_requested_by_mandor: false,
      created_by: 'prof-owner-01',
      created_at: '2026-10-28T15:20:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-302',
      pin_code: '#302',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-3',
      title: 'Pool Pump Room Check-Valve Installation',
      description:
        'Check-valves on pump 1 and pump 2 manifolds installed and tested for automatic circulation.',
      department: 'pipa',
      priority: 'normal',
      status: 'resolved',
      coord_x: 76.0,
      coord_y: 31.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#302',
        'BEFORE',
        'pipa',
        'Pump room pipe manifold before check-valve install'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#302',
        'AFTER',
        'pipa',
        'Check-valve installed with stable 1.8 bar pressure'
      ),
      assigned_worker_email: 'slamet.plumbing@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-01',
      created_at: '2026-10-21T10:00:00Z',
      resolved_at: '2026-10-25T14:30:00Z',
    },

    // --- PINS PROYEK 2: VILLA CEMPAKA RESIDENCE (4 Titik, 3 Selesai = 75% Siap Cair) ---
    {
      id: 'pin-401',
      pin_code: '#401',
      project_id: 'proj-cempaka-02',
      blueprint_id: 'bp-cempaka-1',
      title: 'Main Floor Smart Home Panel & Sub-DB Installation',
      description:
        'Smart home dimmer module installation and main cable dressing at Villa Cempaka.',
      department: 'listrik',
      priority: 'normal',
      status: 'resolved',
      coord_x: 42.0,
      coord_y: 28.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#401',
        'BEFORE',
        'listrik',
        'Cempaka Sub-DB panel before smart module termination'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#401',
        'AFTER',
        'listrik',
        'Cempaka Sub-DB panel dressed and load-tested'
      ),
      assigned_worker_email: 'rizky.smarthome@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-owner-01',
      created_at: '2026-10-10T09:00:00Z',
      resolved_at: '2026-10-12T15:00:00Z',
    },
    {
      id: 'pin-402',
      pin_code: '#402',
      project_id: 'proj-cempaka-02',
      blueprint_id: 'bp-cempaka-1',
      title: 'Master Bathroom Hot Water PPR Piping',
      description: '3-bar PPR hot water pipe pressure test passed without leaks.',
      department: 'pipa',
      priority: 'normal',
      status: 'resolved',
      coord_x: 64.0,
      coord_y: 35.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#402',
        'BEFORE',
        'pipa',
        'PPR pipe joints before pressure test'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#402',
        'AFTER',
        'pipa',
        'Stable 3-bar pressure test with zero leaks'
      ),
      assigned_worker_email: 'hendra.saniter@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-cempaka',
      created_at: '2026-10-11T10:00:00Z',
      resolved_at: '2026-10-14T16:00:00Z',
    },
    {
      id: 'pin-403',
      pin_code: '#403',
      project_id: 'proj-cempaka-02',
      blueprint_id: 'bp-cempaka-1',
      title: 'Cempaka Foyer Marble Slab & Fine Wall Finish',
      description: 'Travertine marble grout leveling and main foyer wall finishing.',
      department: 'sipil',
      priority: 'normal',
      status: 'resolved',
      coord_x: 28.0,
      coord_y: 54.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#403',
        'BEFORE',
        'sipil',
        'Foyer floor substrate before marble slab installation'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#403',
        'AFTER',
        'sipil',
        'Marble grout joints aligned and level'
      ),
      assigned_worker_email: 'anton.marmer@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-cempaka',
      created_at: '2026-10-12T11:00:00Z',
      resolved_at: '2026-10-15T17:00:00Z',
    },
    {
      id: 'pin-404',
      pin_code: '#404',
      project_id: 'proj-cempaka-02',
      blueprint_id: 'bp-cempaka-2',
      title: 'Teak Wood Coating & Plunge Pool Wall Paint',
      description: 'Waiting for approval on second coat of weatherproof paint.',
      department: 'cat',
      priority: 'normal',
      status: 'in_preview',
      coord_x: 72.0,
      coord_y: 62.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#404',
        'BEFORE',
        'cat',
        'West wall before weatherproof coating'
      ),
      before_revision_media_url: createFieldPhotoSvgDataUri(
        '#404',
        'BEFORE',
        'cat',
        'Before R-01 revision: first coat coverage too thin'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#404',
        'AFTER',
        'cat',
        'Second coat complete, awaiting Foreman Ketut review'
      ),
      assigned_worker_email: 'anton.marmer@gmail.com',
      revision_count: 1,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-cempaka',
      created_at: '2026-10-18T09:00:00Z',
      resolved_at: null,
    },

    // --- PINS PROYEK 3: JIMBARAN CLIFF BOUTIQUE HOTEL (5 Titik, 2 Selesai = 40%) ---
    {
      id: 'pin-501',
      pin_code: '#501',
      project_id: 'proj-jimbaran-03',
      blueprint_id: 'bp-jimbaran-1',
      title: 'Cliff Deck Corrosion-Resistant Armoured Cable',
      description: 'Under-deck ironwood cable routing requires marine-grade conduit.',
      department: 'listrik',
      priority: 'urgent',
      status: 'open',
      coord_x: 34.0,
      coord_y: 42.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#501',
        'BEFORE',
        'listrik',
        'Cliff deck cable run without marine protective conduit'
      ),
      after_media_url: null,
      assigned_worker_email: 'surya.marine@gmail.com',
      revision_count: 1,
      delete_requested_by_mandor: false,
      created_by: 'prof-owner-01',
      created_at: '2026-10-20T09:00:00Z',
      resolved_at: null,
    },
    {
      id: 'pin-502',
      pin_code: '#502',
      project_id: 'proj-jimbaran-03',
      blueprint_id: 'bp-jimbaran-1',
      title: 'Main Deck Bore Pile Foundation & Wind Bracing',
      description: 'Pile cap concrete pour completed and passed slump test.',
      department: 'sipil',
      priority: 'normal',
      status: 'resolved',
      coord_x: 58.0,
      coord_y: 48.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#502',
        'BEFORE',
        'sipil',
        'West cliff pile cap formwork before pour'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#502',
        'AFTER',
        'sipil',
        'K-400 concrete cured with no honeycombing'
      ),
      assigned_worker_email: 'bayu.struktur@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-jimbaran',
      created_at: '2026-10-15T10:00:00Z',
      resolved_at: '2026-10-19T16:00:00Z',
    },
    {
      id: 'pin-503',
      pin_code: '#503',
      project_id: 'proj-jimbaran-03',
      blueprint_id: 'bp-jimbaran-1',
      title: 'Cliff Restaurant Clean Water Transfer Pump',
      description: 'Booster pump installed, awaiting final pressure verification.',
      department: 'pipa',
      priority: 'normal',
      status: 'in_preview',
      coord_x: 75.0,
      coord_y: 26.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#503',
        'BEFORE',
        'pipa',
        'Booster pump base before manifold connection'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#503',
        'AFTER',
        'pipa',
        'Booster pump installed with pressure gauge'
      ),
      assigned_worker_email: 'surya.marine@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-jimbaran',
      created_at: '2026-10-22T11:00:00Z',
      resolved_at: null,
      pin_comments: [
        {
          id: 'cmt-503-1',
          author_name: 'Surya Darma',
          author_role: 'worker',
          note: 'Booster pump installed and ready for Foreman review.',
          media_url: createFieldPhotoSvgDataUri(
            '#503',
            'AFTER',
            'pipa',
            'Booster pump installed with pressure gauge'
          ),
          status_snapshot: 'in_preview',
          created_at: '2026-10-24T15:30:00Z',
        },
      ],
    },
    {
      id: 'pin-504',
      pin_code: '#504',
      project_id: 'proj-jimbaran-03',
      blueprint_id: 'bp-jimbaran-2',
      title: 'Penthouse Railing Anti-Salt Epoxy Coating',
      description: 'Zinc chromate primer and marine top coat completed.',
      department: 'cat',
      priority: 'normal',
      status: 'resolved',
      coord_x: 68.0,
      coord_y: 52.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#504',
        'BEFORE',
        'cat',
        'Penthouse balcony steel railing before primer'
      ),
      after_media_url: createFieldPhotoSvgDataUri(
        '#504',
        'AFTER',
        'cat',
        'Matte black marine epoxy coating finished'
      ),
      assigned_worker_email: 'bayu.struktur@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-mandor-jimbaran',
      created_at: '2026-10-18T14:00:00Z',
      resolved_at: '2026-10-23T17:00:00Z',
    },
    {
      id: 'pin-505',
      pin_code: '#505',
      project_id: 'proj-jimbaran-03',
      blueprint_id: 'bp-jimbaran-2',
      title: 'Penthouse Facade Natural Stone Grout Repair',
      description: 'Grout gaps found on south limestone facade wall.',
      department: 'sipil',
      priority: 'urgent',
      status: 'open',
      coord_x: 29.0,
      coord_y: 33.0,
      before_media_url: createFieldPhotoSvgDataUri(
        '#505',
        'BEFORE',
        'sipil',
        'Natural stone grout gaps on penthouse facade'
      ),
      after_media_url: null,
      assigned_worker_email: 'bayu.struktur@gmail.com',
      revision_count: 0,
      delete_requested_by_mandor: false,
      created_by: 'prof-owner-01',
      created_at: '2026-10-26T09:00:00Z',
      resolved_at: null,
    },
  ],

  // 6. public.inventory_items (Stok Gudang Berbeda untuk Setiap Proyek)
  inventory_items: [
    // Gudang Proyek 1: Uluwatu (4 Jenis Barang)
    {
      id: 'inv-01',
      project_id: 'proj-uluwatu-01',
      item_name: 'Eterna NYM Cable 3x2.5mm (50m Roll)',
      department: 'listrik',
      unit: 'Roll',
      stock_available: 6,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-02',
      project_id: 'proj-uluwatu-01',
      item_name: 'Rucika AW 4-Inch PVC Pipe',
      department: 'pipa',
      unit: 'Length',
      stock_available: 4,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-03',
      project_id: 'proj-uluwatu-01',
      item_name: 'Gresik Portland Cement 40kg',
      department: 'sipil',
      unit: 'Bag',
      stock_available: 18,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-04',
      project_id: 'proj-uluwatu-01',
      item_name: 'Dulux Weathershield Exterior White (20L Pail)',
      department: 'cat',
      unit: 'Pail',
      stock_available: 0,
      updated_at: '2026-10-28T08:00:00Z',
    },

    // Gudang Proyek 2: Villa Cempaka Residence (5 Jenis Barang Berbeda)
    {
      id: 'inv-cempaka-01',
      project_id: 'proj-cempaka-02',
      item_name: 'Philips Smart Home Downlight 12W',
      department: 'listrik',
      unit: 'Unit',
      stock_available: 14,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-cempaka-02',
      project_id: 'proj-cempaka-02',
      item_name: 'Toro PN20 1/2-Inch Hot Water PPR Pipe',
      department: 'pipa',
      unit: 'Length',
      stock_available: 3,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-cempaka-03',
      project_id: 'proj-cempaka-02',
      item_name: 'Mortar Utama MU-400 Marble Adhesive',
      department: 'sipil',
      unit: 'Bag',
      stock_available: 22,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-cempaka-04',
      project_id: 'proj-cempaka-02',
      item_name: 'Jotun Majestic True Beauty Matt (5L Gallon)',
      department: 'cat',
      unit: 'Gallon',
      stock_available: 0,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-cempaka-05',
      project_id: 'proj-cempaka-02',
      item_name: 'Propan Ultran Lasur Teak Wood Stain',
      department: 'cat',
      unit: 'Can',
      stock_available: 8,
      updated_at: '2026-10-28T08:00:00Z',
    },

    // Gudang Proyek 3: Jimbaran Cliff Boutique Hotel (3 Jenis Barang Berbeda)
    {
      id: 'inv-jimbaran-01',
      project_id: 'proj-jimbaran-03',
      item_name: 'Marine Armoured Cable NYYHY 4x4mm (50m Roll)',
      department: 'listrik',
      unit: 'Roll',
      stock_available: 11,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-jimbaran-02',
      project_id: 'proj-jimbaran-03',
      item_name: 'High-Pressure HDPE Pipe PN16 3-Inch',
      department: 'pipa',
      unit: 'Length',
      stock_available: 4,
      updated_at: '2026-10-28T08:00:00Z',
    },
    {
      id: 'inv-jimbaran-03',
      project_id: 'proj-jimbaran-03',
      item_name: 'Anti-Corrosion Marine Epoxy Paint (20L Pail)',
      department: 'cat',
      unit: 'Pail',
      stock_available: 0,
      updated_at: '2026-10-28T08:00:00Z',
    },
  ],

  // 7. public.material_allocations (Daftar Belanja, SR & PR Berbeda per Proyek)
  material_allocations: [
    // Alokasi Proyek 1: Uluwatu
    {
      id: 'alloc-01',
      project_id: 'proj-uluwatu-01',
      pin_id: 'pin-101',
      inventory_item_id: 'inv-01',
      item_name: 'Eterna NYM Cable 3x2.5mm (50m Roll)',
      department: 'listrik',
      qty_requested: 2,
      unit: 'Roll',
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
      order_date: '2026-10-31',
      needed_date: null,
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-01',
      created_at: '2026-10-31T08:15:00Z',
    },
    {
      id: 'alloc-02',
      project_id: 'proj-uluwatu-01',
      pin_id: 'pin-104',
      inventory_item_id: 'inv-04',
      item_name: 'Dulux Weathershield Exterior White (20L Pail)',
      department: 'cat',
      qty_requested: 4,
      unit: 'Pail',
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: '2026-10-31',
      needed_date: '2026-11-03',
      is_duplicate_warning: true,
      requested_by: 'prof-mandor-01',
      created_at: '2026-10-31T09:00:00Z',
    },
    {
      id: 'alloc-03',
      project_id: 'proj-uluwatu-01',
      pin_id: 'pin-102',
      inventory_item_id: 'inv-02',
      item_name: 'Rucika AW 4-Inch PVC Pipe',
      department: 'pipa',
      qty_requested: 3,
      unit: 'Length',
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
      order_date: '2026-10-31',
      needed_date: null,
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-01',
      created_at: '2026-10-31T09:30:00Z',
    },
    {
      id: 'alloc-04',
      project_id: 'proj-uluwatu-01',
      pin_id: 'pin-301',
      inventory_item_id: null,
      item_name: 'IP68 Junction Box Waterproof Epoxy Resin',
      department: 'listrik',
      qty_requested: 6,
      unit: 'Can',
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: '2026-10-31',
      needed_date: '2026-11-02',
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-01',
      created_at: '2026-10-31T10:00:00Z',
    },

    // Alokasi Proyek 2: Villa Cempaka Residence
    {
      id: 'alloc-cempaka-01',
      project_id: 'proj-cempaka-02',
      pin_id: 'pin-401',
      inventory_item_id: 'inv-cempaka-01',
      item_name: 'Philips Smart Home Downlight 12W',
      department: 'listrik',
      qty_requested: 4,
      unit: 'Unit',
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
      order_date: '2026-10-31',
      needed_date: null,
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-cempaka',
      created_at: '2026-10-31T08:30:00Z',
    },
    {
      id: 'alloc-cempaka-02',
      project_id: 'proj-cempaka-02',
      pin_id: 'pin-403',
      inventory_item_id: 'inv-cempaka-03',
      item_name: 'Mortar Utama MU-400 Marble Adhesive',
      department: 'sipil',
      qty_requested: 5,
      unit: 'Bag',
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
      order_date: '2026-10-31',
      needed_date: null,
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-cempaka',
      created_at: '2026-10-31T09:10:00Z',
    },
    {
      id: 'alloc-cempaka-03',
      project_id: 'proj-cempaka-02',
      pin_id: 'pin-404',
      inventory_item_id: 'inv-cempaka-04',
      item_name: 'Jotun Majestic True Beauty Matt (5L Gallon)',
      department: 'cat',
      qty_requested: 3,
      unit: 'Gallon',
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: '2026-10-31',
      needed_date: '2026-11-04',
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-cempaka',
      created_at: '2026-10-31T09:40:00Z',
    },
    {
      id: 'alloc-cempaka-04',
      project_id: 'proj-cempaka-02',
      pin_id: 'pin-402',
      inventory_item_id: null,
      item_name: 'TOTO Matte Black Hot Water Mixer Faucet',
      department: 'pipa',
      qty_requested: 2,
      unit: 'Unit',
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: '2026-10-31',
      needed_date: '2026-11-05',
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-cempaka',
      created_at: '2026-10-31T10:15:00Z',
    },

    // Alokasi Proyek 3: Jimbaran Cliff Boutique Hotel
    {
      id: 'alloc-jimbaran-01',
      project_id: 'proj-jimbaran-03',
      pin_id: 'pin-501',
      inventory_item_id: 'inv-jimbaran-01',
      item_name: 'Marine Armoured Cable NYYHY 4x4mm (50m Roll)',
      department: 'listrik',
      qty_requested: 3,
      unit: 'Roll',
      allocation_status: 'allocated_from_stock',
      request_type: 'SR',
      order_date: '2026-10-31',
      needed_date: null,
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-jimbaran',
      created_at: '2026-10-31T08:00:00Z',
    },
    {
      id: 'alloc-jimbaran-02',
      project_id: 'proj-jimbaran-03',
      pin_id: 'pin-504',
      inventory_item_id: 'inv-jimbaran-03',
      item_name: 'Anti-Corrosion Marine Epoxy Paint (20L Pail)',
      department: 'cat',
      qty_requested: 5,
      unit: 'Pail',
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: '2026-10-31',
      needed_date: '2026-11-06',
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-jimbaran',
      created_at: '2026-10-31T09:20:00Z',
    },
    {
      id: 'alloc-jimbaran-03',
      project_id: 'proj-jimbaran-03',
      pin_id: 'pin-505',
      inventory_item_id: null,
      item_name: 'Marine Weatherproof Polyurethane Sealant',
      department: 'sipil',
      qty_requested: 3,
      unit: 'Box',
      allocation_status: 'to_buy',
      request_type: 'PR',
      order_date: '2026-10-31',
      needed_date: '2026-11-04',
      is_duplicate_warning: false,
      requested_by: 'prof-mandor-jimbaran',
      created_at: '2026-10-31T10:05:00Z',
    },
  ],

  // 8. public.activity_streams (Chat Room Terpisah per Area & per Proyek)
  activity_streams: [
    // Chat Room Proyek 1: Uluwatu
    {
      id: 'act-01',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      pin_id: 'pin-101',
      department: 'listrik',
      sender_name: 'Ir. Hendra Wijaya (Owner)',
      sender_role: 'owner',
      message_type: 'text',
      content:
        'Agus, for Area 1 Ground Floor & Lobby, please ensure the cable run at MDP Panel #101 is dressed in high-impact conduit before the lobby ceiling is closed.',
      voice_duration_sec: null,
      created_at: '2026-10-28T09:30:00Z',
    },
    {
      id: 'act-02',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-1',
      pin_id: 'pin-102',
      department: 'pipa',
      sender_name: 'Agus Supriyadi (Uluwatu Foreman)',
      sender_role: 'mandor',
      message_type: 'voice_note',
      content:
        'Area 1 voice note: Water pressure at pipe shaft P-01 passed 2-bar test, please check the Before-After slider on pin #102.',
      voice_duration_sec: 12,
      created_at: '2026-10-28T10:20:00Z',
    },
    {
      id: 'act-03',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-2',
      pin_id: 'pin-201',
      department: 'pipa',
      sender_name: 'Agus Supriyadi (Uluwatu Foreman)',
      sender_role: 'mandor',
      message_type: 'text',
      content:
        'Area 2 (Floor 2 Master Suite): Hot water heater pipe joints at Master Suite #201 are being pressure-tested this afternoon.',
      voice_duration_sec: null,
      created_at: '2026-10-28T11:00:00Z',
    },
    {
      id: 'act-04',
      project_id: 'proj-uluwatu-01',
      blueprint_id: 'bp-area-3',
      pin_id: 'pin-301',
      department: 'listrik',
      sender_name: 'Ir. Hendra Wijaya (Owner)',
      sender_role: 'owner',
      message_type: 'text',
      content:
        'Area 3 (Pool & Pump Room): Pool light junction box seal #301 must use IP68 resin before filling the pool.',
      voice_duration_sec: null,
      created_at: '2026-10-28T11:15:00Z',
    },

    // Chat Room Proyek 2: Villa Cempaka Residence
    {
      id: 'act-cempaka-01',
      project_id: 'proj-cempaka-02',
      blueprint_id: 'bp-cempaka-1',
      pin_id: 'pin-401',
      department: 'listrik',
      sender_name: 'I Ketut Sudiana (Cempaka Foreman)',
      sender_role: 'mandor',
      message_type: 'text',
      content:
        'Villa Cempaka Area 1 update: Smart Home Panel #401 and foyer marble grout #403 are 100% resolved. Progress is now at 75% (Ready for release).',
      voice_duration_sec: null,
      created_at: '2026-10-29T09:15:00Z',
    },
    {
      id: 'act-cempaka-02',
      project_id: 'proj-cempaka-02',
      blueprint_id: 'bp-cempaka-2',
      pin_id: 'pin-404',
      department: 'cat',
      sender_name: 'Ir. Hendra Wijaya (Owner)',
      sender_role: 'owner',
      message_type: 'text',
      content:
        'Ketut, for Area 2 Cempaka Plunge Pool (#404), please apply the 3 gallons of Jotun Majestic paint as soon as the PR arrives.',
      voice_duration_sec: null,
      created_at: '2026-10-29T10:00:00Z',
    },

    // Chat Room Proyek 3: Jimbaran Cliff Boutique Hotel
    {
      id: 'act-jimbaran-01',
      project_id: 'proj-jimbaran-03',
      blueprint_id: 'bp-jimbaran-1',
      pin_id: 'pin-501',
      department: 'listrik',
      sender_name: 'I Made Wirawan (Jimbaran Foreman)',
      sender_role: 'mandor',
      message_type: 'text',
      content:
        'Jimbaran Area 1 update: Deck pile cap pour #502 is resolved, Surya team is now pulling armoured cable at pin #501.',
      voice_duration_sec: null,
      created_at: '2026-10-29T11:00:00Z',
    },
  ],

  // 9. Divisi Proyek Dinamis (Setiap Proyek Memiliki Divisi Tersendiri)
  divisions: [
    // Divisi Proyek 1: Uluwatu
    {
      id: 'div-listrik',
      project_id: 'proj-uluwatu-01',
      code: 'listrik',
      name: 'Electrical',
      short_code: 'ELC',
      label: 'Electrical',
      short_label: 'Electrical',
      badge_bg: '#FEF3C7',
      badge_text: '#92400E',
    },
    {
      id: 'div-pipa',
      project_id: 'proj-uluwatu-01',
      code: 'pipa',
      name: 'Plumbing',
      short_code: 'PLB',
      label: 'Plumbing',
      short_label: 'Plumbing',
      badge_bg: '#DBEAFE',
      badge_text: '#1E40AF',
    },
    {
      id: 'div-sipil',
      project_id: 'proj-uluwatu-01',
      code: 'sipil',
      name: 'Civil',
      short_code: 'CVL',
      label: 'Civil',
      short_label: 'Civil',
      badge_bg: '#E2E8F0',
      badge_text: '#334155',
    },
    {
      id: 'div-cat',
      project_id: 'proj-uluwatu-01',
      code: 'cat',
      name: 'Finishing',
      short_code: 'FIN',
      label: 'Finishing',
      short_label: 'Finishing',
      badge_bg: '#FCE7F3',
      badge_text: '#9D174D',
    },

    // Divisi Proyek 2: Villa Cempaka Residence
    {
      id: 'div-cempaka-listrik',
      project_id: 'proj-cempaka-02',
      code: 'listrik',
      name: 'Smart Home & Electrical',
      short_code: 'SMH',
      label: 'Smart Home & Electrical',
      short_label: 'Smart Home',
      badge_bg: '#FEF3C7',
      badge_text: '#92400E',
    },
    {
      id: 'div-cempaka-pipa',
      project_id: 'proj-cempaka-02',
      code: 'pipa',
      name: 'Sanitary & Hot Water',
      short_code: 'SNT',
      label: 'Sanitary & Hot Water',
      short_label: 'Sanitary',
      badge_bg: '#DBEAFE',
      badge_text: '#1E40AF',
    },
    {
      id: 'div-cempaka-sipil',
      project_id: 'proj-cempaka-02',
      code: 'sipil',
      name: 'Marble & Interior Civil',
      short_code: 'MRM',
      label: 'Marble & Interior Civil',
      short_label: 'Marble Civil',
      badge_bg: '#E2E8F0',
      badge_text: '#334155',
    },
    {
      id: 'div-cempaka-cat',
      project_id: 'proj-cempaka-02',
      code: 'cat',
      name: 'Teak Wood & Finishing',
      short_code: 'JTI',
      label: 'Teak Wood & Finishing',
      short_label: 'Wood & Paint',
      badge_bg: '#FCE7F3',
      badge_text: '#9D174D',
    },

    // Divisi Proyek 3: Jimbaran Cliff Boutique Hotel
    {
      id: 'div-jimbaran-listrik',
      project_id: 'proj-jimbaran-03',
      code: 'listrik',
      name: 'Marine Electrical & Panel',
      short_code: 'MRN',
      label: 'Marine Electrical & Panel',
      short_label: 'Marine Elec',
      badge_bg: '#FEF3C7',
      badge_text: '#92400E',
    },
    {
      id: 'div-jimbaran-pipa',
      project_id: 'proj-jimbaran-03',
      code: 'pipa',
      name: 'Cliff Pump & Plumbing',
      short_code: 'PMP',
      label: 'Cliff Pump & Plumbing',
      short_label: 'Cliff Plumbing',
      badge_bg: '#DBEAFE',
      badge_text: '#1E40AF',
    },
    {
      id: 'div-jimbaran-sipil',
      project_id: 'proj-jimbaran-03',
      code: 'sipil',
      name: 'Bore Pile & Cliff Structure',
      short_code: 'STR',
      label: 'Bore Pile & Cliff Structure',
      short_label: 'Cliff Civil',
      badge_bg: '#E2E8F0',
      badge_text: '#334155',
    },
    {
      id: 'div-jimbaran-cat',
      project_id: 'proj-jimbaran-03',
      code: 'cat',
      name: 'Anti-Corrosion Epoxy Coating',
      short_code: 'EPX',
      label: 'Anti-Corrosion Epoxy Coating',
      short_label: 'Epoxy Coating',
      badge_bg: '#FCE7F3',
      badge_text: '#9D174D',
    },
  ],

  // 10. Rekam Absensi Pekerja (Terpisah per Proyek)
  attendance_records: [
    // Absensi Proyek 1: Uluwatu
    {
      id: 'att-01',
      project_id: 'proj-uluwatu-01',
      profile_id: 'prof-worker-listrik',
      worker_profile_id: 'prof-worker-listrik',
      worker_name: 'Budi Santoso',
      worker_code: 'TKG-101',
      division_code: 'listrik',
      date: '2026-10-29',
      attendance_type: 'masuk',
      check_in_time: '07:45',
      check_out_time: '17:05',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Budi Santoso',
      recorded_by_name: 'Budi Santoso',
      created_at: '2026-10-29T07:45:00Z',
    },
    {
      id: 'att-02',
      project_id: 'proj-uluwatu-01',
      profile_id: 'prof-worker-listrik',
      worker_profile_id: 'prof-worker-listrik',
      worker_name: 'Budi Santoso',
      worker_code: 'TKG-101',
      division_code: 'listrik',
      date: '2026-10-30',
      attendance_type: 'masuk',
      check_in_time: '07:50',
      check_out_time: '17:00',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Budi Santoso',
      recorded_by_name: 'Budi Santoso',
      created_at: '2026-10-30T07:50:00Z',
    },
    {
      id: 'att-03',
      project_id: 'proj-uluwatu-01',
      profile_id: 'prof-worker-pipa',
      worker_profile_id: 'prof-worker-pipa',
      worker_name: 'Slamet Riyadi',
      worker_code: 'TKG-102',
      division_code: 'pipa',
      date: '2026-10-30',
      attendance_type: 'masuk',
      check_in_time: '07:55',
      check_out_time: '17:10',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Slamet Riyadi',
      recorded_by_name: 'Slamet Riyadi',
      created_at: '2026-10-30T07:55:00Z',
    },
    {
      id: 'att-04',
      project_id: 'proj-uluwatu-01',
      profile_id: 'prof-worker-sipil',
      worker_profile_id: 'prof-worker-sipil',
      worker_name: 'Wahyu Hidayat',
      worker_code: 'TKG-103',
      division_code: 'sipil',
      date: '2026-10-30',
      attendance_type: 'masuk',
      check_in_time: '08:00',
      check_out_time: '17:00',
      method: 'manual_leader',
      verification_method: 'manual_leader',
      face_verified: true,
      recorded_by: 'Agus Supriyadi (Uluwatu Foreman)',
      recorded_by_name: 'Agus Supriyadi (Uluwatu Foreman)',
      created_at: '2026-10-30T08:00:00Z',
    },

    // Absensi Proyek 2: Villa Cempaka Residence
    {
      id: 'att-cempaka-01',
      project_id: 'proj-cempaka-02',
      profile_id: 'prof-worker-cempaka-1',
      worker_profile_id: 'prof-worker-cempaka-1',
      worker_name: 'Rizky Pratama',
      worker_code: 'TKG-201',
      division_code: 'listrik',
      date: '2026-10-28',
      attendance_type: 'masuk',
      check_in_time: '07:40',
      check_out_time: '17:00',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Rizky Pratama',
      recorded_by_name: 'Rizky Pratama',
      created_at: '2026-10-28T07:40:00Z',
    },
    {
      id: 'att-cempaka-02',
      project_id: 'proj-cempaka-02',
      profile_id: 'prof-worker-cempaka-1',
      worker_profile_id: 'prof-worker-cempaka-1',
      worker_name: 'Rizky Pratama',
      worker_code: 'TKG-201',
      division_code: 'listrik',
      date: '2026-10-29',
      attendance_type: 'masuk',
      check_in_time: '07:45',
      check_out_time: '17:00',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Rizky Pratama',
      recorded_by_name: 'Rizky Pratama',
      created_at: '2026-10-29T07:45:00Z',
    },
    {
      id: 'att-cempaka-03',
      project_id: 'proj-cempaka-02',
      profile_id: 'prof-worker-cempaka-2',
      worker_profile_id: 'prof-worker-cempaka-2',
      worker_name: 'Hendra Gunawan',
      worker_code: 'TKG-202',
      division_code: 'pipa',
      date: '2026-10-29',
      attendance_type: 'masuk',
      check_in_time: '07:50',
      check_out_time: '17:05',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Hendra Gunawan',
      recorded_by_name: 'Hendra Gunawan',
      created_at: '2026-10-29T07:50:00Z',
    },
    {
      id: 'att-cempaka-04',
      project_id: 'proj-cempaka-02',
      profile_id: 'prof-worker-cempaka-3',
      worker_profile_id: 'prof-worker-cempaka-3',
      worker_name: 'Anton Wijaya',
      worker_code: 'TKG-203',
      division_code: 'sipil',
      date: '2026-10-30',
      attendance_type: 'masuk',
      check_in_time: '07:55',
      check_out_time: '17:00',
      method: 'manual_leader',
      verification_method: 'manual_leader',
      face_verified: true,
      recorded_by: 'I Ketut Sudiana (Cempaka Foreman)',
      recorded_by_name: 'I Ketut Sudiana (Cempaka Foreman)',
      created_at: '2026-10-30T07:55:00Z',
    },

    // Absensi Proyek 3: Jimbaran Cliff Boutique Hotel
    {
      id: 'att-jimbaran-01',
      project_id: 'proj-jimbaran-03',
      profile_id: 'prof-worker-jimbaran-1',
      worker_profile_id: 'prof-worker-jimbaran-1',
      worker_name: 'Surya Darma',
      worker_code: 'TKG-301',
      division_code: 'listrik',
      date: '2026-10-29',
      attendance_type: 'masuk',
      check_in_time: '07:45',
      check_out_time: '17:00',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Surya Darma',
      recorded_by_name: 'Surya Darma',
      created_at: '2026-10-29T07:45:00Z',
    },
    {
      id: 'att-jimbaran-02',
      project_id: 'proj-jimbaran-03',
      profile_id: 'prof-worker-jimbaran-2',
      worker_profile_id: 'prof-worker-jimbaran-2',
      worker_name: 'Bayu Nugroho',
      worker_code: 'TKG-302',
      division_code: 'sipil',
      date: '2026-10-30',
      attendance_type: 'masuk',
      check_in_time: '07:50',
      check_out_time: '17:05',
      method: 'face_scan',
      verification_method: 'face_scan',
      face_verified: true,
      recorded_by: 'Bayu Nugroho',
      recorded_by_name: 'Bayu Nugroho',
      created_at: '2026-10-30T07:50:00Z',
    },
  ],
};

export const DEPARTMENT_META: Record<
  string,
  { label: string; shortLabel: string; code: string }
> = {
  listrik: {
    label: 'Electrical',
    shortLabel: 'Electrical',
    code: 'ELC',
  },
  pipa: {
    label: 'Plumbing',
    shortLabel: 'Plumbing',
    code: 'PLB',
  },
  sipil: {
    label: 'Civil',
    shortLabel: 'Civil',
    code: 'CVL',
  },
  cat: {
    label: 'Finishing',
    shortLabel: 'Finishing',
    code: 'FIN',
  },
};

export function getDepartmentMeta(
  deptCode: string | null | undefined,
  divisions?: DivisionRecord[]
): { label: string; shortLabel: string; code: string } {
  if (!deptCode || deptCode === 'all') {
    return { label: 'All divisions', shortLabel: 'All', code: 'ALL' };
  }
  const found = divisions?.find((d) => d.code === deptCode);
  if (found) {
    return {
      label: found.name || found.label,
      shortLabel: found.short_label || found.name,
      code:
        found.short_code ||
        found.code.slice(0, 3).toUpperCase(),
    };
  }
  if (DEPARTMENT_META[deptCode]) {
    return DEPARTMENT_META[deptCode];
  }
  return {
    label: deptCode.toUpperCase(),
    shortLabel: deptCode.toUpperCase(),
    code: deptCode.slice(0, 3).toUpperCase(),
  };
}

export const PIN_STATUS_META: Record<
  PinStatus,
  {
    label: string;
    workerActionHint: string;
    hex: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    ringClass: string;
  }
> = {
  open: {
    label: 'Open',
    workerActionHint: 'Click Start work to begin working on this pin',
    hex: '#DC2626',
    bgClass: 'bg-red-600',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-600',
    ringClass: 'ring-red-500/40',
  },
  in_progress: {
    label: 'In progress',
    workerActionHint: 'In progress, upload the latest photo to submit for review',
    hex: '#CA8A04',
    bgClass: 'bg-amber-600',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-600',
    ringClass: 'ring-amber-500/40',
  },
  in_preview: {
    label: 'Pending review',
    workerActionHint: 'Latest photo uploaded, waiting for Foreman review',
    hex: '#0284C7',
    bgClass: 'bg-sky-600',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-600',
    ringClass: 'ring-sky-500/40',
  },
  resolved: {
    label: 'Resolved',
    workerActionHint: 'Work approved and saved in History',
    hex: '#16A34A',
    bgClass: 'bg-emerald-600',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-600',
    ringClass: 'ring-emerald-500/40',
  },
  reopened: {
    label: 'Reopened',
    workerActionHint: 'Fix according to Foreman revision notes',
    hex: '#DC2626',
    bgClass: 'bg-red-600',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-600',
    ringClass: 'ring-red-500/50',
  },
};

export const SUPABASE_SQL_SCHEMA_SCRIPT = `-- VONTA MULTI-PROJECT SUPABASE POSTGRESQL SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
`;
export const SUPABASE_SQL_SCHEMA_STRING = SUPABASE_SQL_SCHEMA_SCRIPT;

export function generateDynamicSqlSeed(db: VontaDatabaseState): string {
  const esc = (val: string | null | undefined) =>
    val ? `'${val.replace(/'/g, "''")}'` : 'NULL';

  const lines: string[] = [
    '-- ACTIVE VONTA PROJECT SEED DATA',
    '',
  ];

  db.projects.forEach((p) => {
    lines.push(
      `INSERT INTO public.projects (name, general_note, chat_leader_only, termin_target_percent, start_date, target_end_date) VALUES (${esc(
        p.name
      )}, ${esc(p.general_note)}, ${p.chat_leader_only}, ${
        p.termin_target_percent
      }, ${esc(p.start_date)}, ${esc(p.target_end_date)});`
    );
  });

  return lines.join('\n');
}

export const DEFAULT_DIVISIONS: DivisionRecord[] =
  (INITIAL_VONTA_DATABASE.divisions || []).filter(
    (d) => d.project_id === 'proj-uluwatu-01'
  );
