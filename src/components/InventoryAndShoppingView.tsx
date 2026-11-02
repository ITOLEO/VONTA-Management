import React, { useState, useMemo } from 'react';
import {
  DepartmentOnly,
  DivisionRecord,
  GlobalRole,
  InventoryItemRecord,
  MaterialAllocationRecord,
  PinRecord,
  SpecialtyDepartment,
} from '../types/schema';
import { DEFAULT_DIVISIONS, getDepartmentMeta } from '../data/initialDatabase';
import {
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Search,
  Download,
  Copy,
  MapPin,
  Settings,
} from 'lucide-react';

interface InventoryAndShoppingViewProps {
  inventoryItems: InventoryItemRecord[];
  materialAllocations: MaterialAllocationRecord[];
  pins: PinRecord[];
  divisions?: DivisionRecord[];
  sopLowStockThreshold?: number;
  activeDepartmentFilter: SpecialtyDepartment;
  activeRole: GlobalRole;
  selectedPinId: string | null;
  onAllocateMaterialToPin: (payload: {
    pinId: string;
    inventoryItemId: string;
    qtyRequested: number;
  }) => void;
  onAddNewInventoryItem: (payload: {
    itemName: string;
    department: DepartmentOnly;
    unit: string;
    initialStock: number;
  }) => void;
  onRestockInventoryItem: (inventoryItemId: string, addedQty: number) => void;
  onMarkShoppingItemBought: (allocationId: string) => void;
  onUpdateShoppingItemQty?: (allocationId: string, nextQty: number) => void;
  onJumpToPinOnMap: (pinId: string) => void;
  onOpenPrintModal?: () => void;
  onOpenSettingsPage?: () => void;
  simulatedUiState: 'normal' | 'loading' | 'empty' | 'error';
  onResetSimulatedState: () => void;
  sectionMode?: 'inventory' | 'shopping';
  onSwitchSectionMode?: (mode: 'inventory' | 'shopping') => void;
}

const getMaterialCatalogMeta = (
  itemName: string,
  dept: DepartmentOnly
): { warehouseZone: string } => {
  const lower = itemName.toLowerCase();
  if (lower.includes('panel')) {
    return { warehouseZone: 'Zone A, Rack ELC-01' };
  }
  if (lower.includes('kabel') || lower.includes('cable')) {
    return { warehouseZone: 'Zone A, Rack ELC-02' };
  }
  if (
    lower.includes('mcb') ||
    lower.includes('stopkontak') ||
    lower.includes('socket') ||
    lower.includes('outlet')
  ) {
    return { warehouseZone: 'Zone A, Rack ELC-03' };
  }
  if (
    lower.includes('pipa') ||
    lower.includes('pipe') ||
    lower.includes('pvc')
  ) {
    return { warehouseZone: 'Zone B, Plumbing' };
  }
  if (lower.includes('waterproofing') || lower.includes('sika')) {
    return { warehouseZone: 'Zone B, Chemical' };
  }
  if (
    lower.includes('semen') ||
    lower.includes('cement') ||
    lower.includes('mortar') ||
    lower.includes('aci') ||
    lower.includes('plaster') ||
    lower.includes('skim')
  ) {
    return { warehouseZone: 'Zone C, Civil' };
  }
  if (
    lower.includes('cat') ||
    lower.includes('paint') ||
    lower.includes('weatherbond') ||
    lower.includes('sealer')
  ) {
    return { warehouseZone: 'Zone D, Finishing' };
  }
  const fallbackMap: Record<string, { warehouseZone: string }> = {
    listrik: { warehouseZone: 'Zone A, Electrical' },
    pipa: { warehouseZone: 'Zone B, Plumbing' },
    sipil: { warehouseZone: 'Zone C, Civil' },
    cat: { warehouseZone: 'Zone D, Finishing' },
  };
  return fallbackMap[dept] || { warehouseZone: 'Main Project Warehouse' };
};

export const InventoryAndShoppingView: React.FC<
  InventoryAndShoppingViewProps
> = ({
  inventoryItems,
  materialAllocations,
  pins,
  divisions = DEFAULT_DIVISIONS,
  sopLowStockThreshold = 5,
  activeDepartmentFilter,
  activeRole,
  selectedPinId,
  onAllocateMaterialToPin,
  onAddNewInventoryItem,
  onRestockInventoryItem,
  onMarkShoppingItemBought,
  onUpdateShoppingItemQty,
  onJumpToPinOnMap,
  onOpenSettingsPage,
  sectionMode = 'inventory',
  onSwitchSectionMode,
}) => {
  const isLeader = activeRole === 'owner' || activeRole === 'mandor';

  const [targetPinId, setTargetPinId] = useState<string>(
    selectedPinId || pins[0]?.id || ''
  );
  const [selectedInvId, setSelectedInvId] = useState<string>(
    inventoryItems[0]?.id || ''
  );
  const [qtyInput, setQtyInput] = useState<number>(2);

  const [showAddStockForm, setShowAddStockForm] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDept, setNewItemDept] = useState<DepartmentOnly>(
    divisions[0]?.code || 'listrik'
  );
  const [newItemUnit, setNewItemUnit] = useState<string>('Unit');
  const [newItemStock, setNewItemStock] = useState<number>(10);

  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [copiedWaBanner, setCopiedWaBanner] = useState<boolean>(false);

  const filteredInventory = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    return inventoryItems.filter((item) => {
      const matchDept =
        activeDepartmentFilter === 'all' ||
        item.department === activeDepartmentFilter;
      if (!matchDept) return false;
      if (q.length > 0) {
        const meta = getMaterialCatalogMeta(item.item_name, item.department);
        return (
          item.item_name.toLowerCase().includes(q) ||
          meta.warehouseZone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inventoryItems, activeDepartmentFilter, inventorySearch]);

  const filteredAllocations = useMemo(() => {
    return materialAllocations.filter(
      (alloc) =>
        activeDepartmentFilter === 'all' ||
        alloc.department === activeDepartmentFilter
    );
  }, [materialAllocations, activeDepartmentFilter]);

  const toBuyList = useMemo(
    () => filteredAllocations.filter((a) => a.allocation_status === 'to_buy'),
    [filteredAllocations]
  );

  // 4 Metrik Sesuai Arahan Gambar 4:
  // 1. Total Item di Gudang (jumlah jenis barang yang dimiliki)
  // 2. Stok Menipis berdasarkan SOP yang diatur di Pengaturan Proyek (stock > 0 && stock <= sopLowStockThreshold)
  // 3. Jenis Barang Habis (stock === 0, menampilkan jenis barang apa saja yang habis)
  // 4. Total Unit To-Buy (jumlah total unit barang di daftar belanja, bukan jenis atau rupiah)
  const kpiSummary = useMemo(() => {
    const totalItemTypes = filteredInventory.length;
    const totalAvailableUnits = filteredInventory.reduce(
      (acc, item) => acc + item.stock_available,
      0
    );
    const lowStockItems = filteredInventory.filter(
      (item) =>
        item.stock_available > 0 &&
        item.stock_available <= sopLowStockThreshold
    );
    const outOfStockItems = filteredInventory.filter(
      (item) => item.stock_available === 0
    );
    const totalToBuyUnits = toBuyList.reduce(
      (acc, item) => acc + item.qty_requested,
      0
    );

    return {
      totalItemTypes,
      totalAvailableUnits,
      lowStockItems,
      outOfStockItems,
      totalToBuyUnits,
    };
  }, [filteredInventory, sopLowStockThreshold, toBuyList]);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPinId || !selectedInvId || qtyInput <= 0) return;
    onAllocateMaterialToPin({
      pinId: targetPinId,
      inventoryItemId: selectedInvId,
      qtyRequested: qtyInput,
    });
  };

  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddNewInventoryItem({
      itemName: newItemName.trim(),
      department: newItemDept,
      unit: newItemUnit.trim() || 'Unit',
      initialStock: Math.max(0, newItemStock),
    });
    setNewItemName('');
    setShowAddStockForm(false);
  };

  const handleCopyWhatsAppList = async () => {
    const lines = [
      'VONTA PROJECT SHOPPING LIST',
      ...toBuyList.map((item, idx) => {
        const linkedPin = pins.find((p) => p.id === item.pin_id);
        return `${idx + 1}. ${item.item_name} - ${item.qty_requested} ${
          item.unit
        } (Pin ${linkedPin?.pin_code || '#101'})`;
      }),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedWaBanner(true);
      setTimeout(() => setCopiedWaBanner(false), 2000);
    } catch {
      setCopiedWaBanner(true);
      setTimeout(() => setCopiedWaBanner(false), 2000);
    }
  };

  const handleExportCsv = () => {
    const headers = ['No', 'Material', 'Qty', 'Unit', 'Division', 'Pin_Code'];
    const rows = toBuyList.map((item, idx) => {
      const linkedPin = pins.find((p) => p.id === item.pin_id);
      return [
        idx + 1,
        `"${item.item_name.replace(/"/g, '""')}"`,
        item.qty_requested,
        item.unit,
        item.department,
        linkedPin?.pin_code || '-',
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vonta-to-buy-list.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 space-y-5">
      {/* Header & Page Switcher antara Inventory Gudang dan Daftar Belanja */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
            {sectionMode === 'shopping'
              ? 'Shopping list (To buy)'
              : 'Warehouse stock'}
          </h1>
          <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
            {sectionMode === 'shopping'
              ? 'Out-of-stock materials linked to project pins'
              : `Warehouse material stock (Low-stock threshold <= ${sopLowStockThreshold} units)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchSectionMode && (
            <div className="inline-flex rounded-[6px] bg-white dark:bg-[#161F2C] p-0.5 border border-[#E2E6EC] dark:border-[#263346]">
              <button
                type="button"
                onClick={() => onSwitchSectionMode('inventory')}
                className={`h-8 px-3 rounded-[4px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  sectionMode === 'inventory'
                    ? 'bg-[#1B365D] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Warehouse stock</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchSectionMode('shopping')}
                className={`h-8 px-3 rounded-[4px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  sectionMode === 'shopping'
                    ? 'bg-[#1B365D] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Shopping list ({toBuyList.length})</span>
              </button>
            </div>
          )}

          {onOpenSettingsPage && (
            <button
              type="button"
              onClick={onOpenSettingsPage}
              className="h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px] font-medium text-[#141619] dark:text-[#F8FAFC] hover:border-[#1B365D] flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-[#B45309] dark:text-[#D97706]" />
              <span>Low-stock threshold</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. EMPAT KARTU METRIK SESUAI GAMBAR 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Item di Gudang (Jenis Barang yang dimiliki) */}
        <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
            WAREHOUSE MATERIALS
          </div>
          <div className="text-[20px] font-mono font-semibold tabular-nums text-[#141619] dark:text-[#F8FAFC]">
            {kpiSummary.totalItemTypes} materials
          </div>
          <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
            {kpiSummary.totalAvailableUnits} total units available
          </div>
        </div>

        {/* Card 2: Stok Menipis (Diatur SOP di Pengaturan) */}
        <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
              LOW STOCK (&lt;= {sopLowStockThreshold} UNITS)
            </span>
          </div>
          <div className="text-[20px] font-mono font-semibold tabular-nums text-[#CA8A04]">
            {kpiSummary.lowStockItems.length} materials
          </div>
          <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] truncate">
            {kpiSummary.lowStockItems.length > 0
              ? kpiSummary.lowStockItems.map((i) => i.item_name).join(', ')
              : `All materials above ${sopLowStockThreshold} units`}
          </div>
        </div>

        {/* Card 3: Jenis Barang Habis (Menggantikan Antrean Belanja) */}
        <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
            OUT OF STOCK
          </div>
          <div className="text-[20px] font-mono font-semibold tabular-nums text-[#DC2626]">
            {kpiSummary.outOfStockItems.length} out of stock
          </div>
          <div
            className="text-[12px] text-[#475569] dark:text-[#94A3B8] truncate"
            title={kpiSummary.outOfStockItems.map((i) => i.item_name).join(', ')}
          >
            {kpiSummary.outOfStockItems.length > 0
              ? kpiSummary.outOfStockItems.map((i) => i.item_name).join(', ')
              : 'No materials at zero stock'}
          </div>
        </div>

        {/* Card 4: Total Unit To-Buy (Menggantikan Estimasi Biaya) */}
        <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
            TOTAL UNITS TO BUY
          </div>
          <div className="text-[20px] font-mono font-semibold tabular-nums text-[#B45309] dark:text-[#D97706]">
            {kpiSummary.totalToBuyUnits} units
          </div>
          <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
            Across {toBuyList.length} materials to buy
          </div>
        </div>
      </div>

      {/* 2. MODE HALAMAN 1: INVENTORY GUDANG UTAMA (TERPISAH DARI BELANJA) */}
      {sectionMode === 'inventory' && (
        <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E6EC] dark:border-[#263346]">
            <div>
              <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Warehouse Stock ({filteredInventory.length} materials)
              </h2>
              <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                Amber when stock &lt;= {sopLowStockThreshold} units, Red when
                stock is 0.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search materials..."
                  className="h-9 w-52 pl-8 pr-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px]"
                />
              </div>

              {isLeader && (
                <button
                  type="button"
                  onClick={() => setShowAddStockForm((v) => !v)}
                  className="h-9 px-3.5 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[12px] font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Material</span>
                </button>
              )}
            </div>
          </div>

          {showAddStockForm && isLeader && (
            <form
              onSubmit={handleAddStockSubmit}
              className="p-3.5 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end text-[12px]"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium uppercase mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. 20mm Conduit Pipe"
                  className="w-full h-9 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase mb-1">
                  Division
                </label>
                <select
                  value={newItemDept}
                  onChange={(e) =>
                    setNewItemDept(e.target.value as DepartmentOnly)
                  }
                  className="w-full h-9 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C]"
                >
                  {divisions.map((div) => (
                    <option key={div.id} value={div.code}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase mb-1">
                  Initial Stock &amp; Unit
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={newItemStock}
                    onChange={(e) =>
                      setNewItemStock(Number(e.target.value) || 0)
                    }
                    className="w-16 h-9 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono"
                  />
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="h-9 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white font-medium"
              >
                Save to Warehouse
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/70 dark:bg-[#0F141C]/70 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-3 px-3.5">Material Name</th>
                  <th className="py-3 px-3.5">Division</th>
                  <th className="py-3 px-3.5">Warehouse Zone</th>
                  <th className="py-3 px-3.5">Stock Status</th>
                  <th className="py-3 px-3.5">Available Stock</th>
                  <th className="py-3 px-3.5 text-right">Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
                {filteredInventory.map((item) => {
                  const meta = getMaterialCatalogMeta(
                    item.item_name,
                    item.department
                  );
                  const deptMeta = getDepartmentMeta(
                    item.department,
                    divisions
                  );
                  const isOut = item.stock_available === 0;
                  const isLow =
                    item.stock_available > 0 &&
                    item.stock_available <= sopLowStockThreshold;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C] transition-colors"
                    >
                      <td className="py-3 px-3 font-medium text-[#141619] dark:text-[#F8FAFC]">
                        {item.item_name}
                      </td>
                      <td className="py-3 px-3 text-[#475569] dark:text-[#94A3B8]">
                        {deptMeta.label}
                      </td>
                      <td className="py-3 px-3 font-mono text-[12px] text-[#475569] dark:text-[#94A3B8]">
                        {meta.warehouseZone}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                            isOut
                              ? 'bg-[#DC2626]/10 text-[#DC2626]'
                              : isLow
                              ? 'bg-[#CA8A04]/10 text-[#CA8A04]'
                              : 'bg-[#16A34A]/10 text-[#16A34A]'
                          }`}
                        >
                          {isOut
                            ? 'OUT (0 UNITS)'
                            : isLow
                            ? `LOW (<= ${sopLowStockThreshold})`
                            : 'IN STOCK'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold tabular-nums">
                        <span
                          className={
                            isOut
                              ? 'text-[#DC2626]'
                              : isLow
                              ? 'text-[#CA8A04]'
                              : 'text-[#16A34A]'
                          }
                        >
                          {item.stock_available} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isLeader && (
                          <button
                            type="button"
                            onClick={() => onRestockInventoryItem(item.id, 5)}
                            className="h-8 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px] font-mono font-medium hover:border-[#1B365D]"
                          >
                            +5 {item.unit}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODE HALAMAN 2: DAFTAR BELANJA TO-BUY (TERPISAH DARI TABEL GUDANG) */}
      {sectionMode === 'shopping' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Kiri (4 Kolom): Form Klaim Cepat */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
              <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
                <span>Allocate Material to Pin</span>
              </h2>
            </div>

            <form
              onSubmit={handleClaimSubmit}
              className="space-y-3 text-[13px]"
            >
              <div className="space-y-1">
                <label className="block text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
                  Target Pin
                </label>
                <select
                  aria-label="Select target pin"
                  value={targetPinId}
                  onChange={(e) => setTargetPinId(e.target.value)}
                  className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[13px] text-[#141619] dark:text-[#F8FAFC]"
                >
                  {pins.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pin_code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
                  Material
                </label>
                <select
                  aria-label="Select warehouse material"
                  value={selectedInvId}
                  onChange={(e) => setSelectedInvId(e.target.value)}
                  className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[13px] text-[#141619] dark:text-[#F8FAFC]"
                >
                  {inventoryItems.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.item_name} (Stock: {inv.stock_available} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="block text-[11px] font-medium uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={qtyInput}
                    onChange={(e) =>
                      setQtyInput(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono tabular-nums text-[13px]"
                  />
                </div>

                <button
                  type="submit"
                  className="h-9 px-4 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-medium transition-colors shrink-0"
                >
                  Allocate
                </button>
              </div>
            </form>
          </div>

          {/* Kanan (8 Kolom): Tabel To-Buy List */}
          <div className="lg:col-span-8 p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
              <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#B45309] dark:text-[#D97706]" />
                <span>
                  Shopping List ({toBuyList.length} materials /{' '}
                  {kpiSummary.totalToBuyUnits} units)
                </span>
              </h2>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyWhatsAppList}
                  className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium flex items-center gap-1.5 hover:border-[#1B365D]"
                >
                  {copiedWaBanner ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy for WA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-medium flex items-center gap-1.5 hover:border-[#1B365D]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/70 dark:bg-[#0F141C]/70 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Target Pin</th>
                    <th className="py-2.5 px-3">Total Units</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
                  {toBuyList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-[#475569] dark:text-[#94A3B8]"
                      >
                        No items in the shopping list.
                      </td>
                    </tr>
                  ) : (
                    toBuyList.map((item) => {
                      const linkedPin = pins.find((p) => p.id === item.pin_id);
                      const deptMeta = getDepartmentMeta(
                        item.department,
                        divisions
                      );
                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-medium text-[#141619] dark:text-[#F8FAFC]">
                            {item.item_name}
                          </td>
                          <td className="py-2.5 px-3 text-[12px] text-[#475569] dark:text-[#94A3B8]">
                            {deptMeta.shortLabel}
                          </td>
                          <td className="py-2.5 px-3">
                            {linkedPin ? (
                              <button
                                type="button"
                                onClick={() => onJumpToPinOnMap(linkedPin.id)}
                                className="font-mono font-semibold text-[#1B365D] dark:text-[#D97706] hover:underline flex items-center gap-1"
                              >
                                <MapPin className="w-3 h-3" />
                                <span>{linkedPin.pin_code}</span>
                              </button>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="inline-flex items-center gap-1 font-mono tabular-nums">
                              {onUpdateShoppingItemQty && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateShoppingItemQty(
                                      item.id,
                                      Math.max(1, item.qty_requested - 1)
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  className="w-6 h-6 rounded border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              )}
                              <span className="px-1.5 font-semibold">
                                {item.qty_requested} {item.unit}
                              </span>
                              {onUpdateShoppingItemQty && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateShoppingItemQty(
                                      item.id,
                                      item.qty_requested + 1
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  className="w-6 h-6 rounded border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isLeader && (
                              <button
                                type="button"
                                onClick={() =>
                                  onMarkShoppingItemBought(item.id)
                                }
                                className="h-8 px-2.5 rounded-[6px] bg-[#16A34A] hover:bg-emerald-700 text-white text-[12px] font-medium"
                              >
                                Mark Bought
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
