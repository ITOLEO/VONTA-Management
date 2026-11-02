import React, { useState, useMemo } from 'react';
import {
  AttendanceRecord,
  DepartmentOnly,
  DivisionRecord,
  InventoryItemRecord,
  MaterialAllocationRecord,
  PinRecord,
  ProfileRecord,
  ProjectRecord,
  SpecialtyDepartment,
  ThemePreference,
  VontaDatabaseState,
} from '../types/schema';
import { DEFAULT_DIVISIONS, getDepartmentMeta } from '../data/initialDatabase';
import {
  Package,
  ShoppingCart,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  Camera,
  UserCheck,
  ArrowLeft,
  Settings,
  Building2,
  Sliders,
  Database,
  Check,
  Clock,
  ClipboardList,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// ============================================================================
// 1. PANEL PENGORDERAN BARANG DI BAWAH BLUEPRINT & CHAT ROOM
// - Mengikuti Divisi yang sedang dibuka di layar kanvas (activeDepartmentFilter)
// - Tidak langsung menampilkan form item mentah, melainkan tombol "Buat Orderan Baru"
// - Di dalam orderan baru terdapat daftar item apa saja yang dipesan sehingga
//   1 Orderan Baru = 1 SR (Marketlist) atau 1 PR yang masuk ke halaman SR & PR.
// ============================================================================
export interface MultiMarketlistRow {
  id: string;
  inventoryItemId: string;
  qty: number;
  orderDate: string;
}

export interface MultiPurchaseRequestRow {
  id: string;
  itemName: string;
  department: DepartmentOnly;
  qty: number;
  unit: string;
  orderDate: string;
  neededDate: string;
}

interface BottomMultiOrderPanelProps {
  selectedPin: PinRecord | undefined;
  pins: PinRecord[];
  inventoryItems: InventoryItemRecord[];
  divisions?: DivisionRecord[];
  activeDepartmentFilter?: SpecialtyDepartment;
  pinAllocations: MaterialAllocationRecord[];
  onSubmitMarketlistBatch: (
    pinId: string,
    rows: { inventoryItemId: string; qty: number; orderDate: string }[]
  ) => void;
  onSubmitPurchaseRequestBatch: (
    pinId: string,
    rows: {
      itemName: string;
      department: DepartmentOnly;
      qty: number;
      unit: string;
      orderDate: string;
      neededDate: string;
    }[]
  ) => void;
}

export const BottomMultiOrderPanel: React.FC<BottomMultiOrderPanelProps> = ({
  selectedPin,
  pins,
  inventoryItems,
  divisions = DEFAULT_DIVISIONS,
  activeDepartmentFilter,
  pinAllocations,
  onSubmitMarketlistBatch,
  onSubmitPurchaseRequestBatch,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultNeededStr = new Date(Date.now() + 3 * 86400000)
    .toISOString()
    .slice(0, 10);

  const effectiveDivisionCode =
    activeDepartmentFilter && activeDepartmentFilter !== 'all'
      ? activeDepartmentFilter
      : selectedPin?.department || divisions[0]?.code || 'listrik';

  const activeDivisionMeta = getDepartmentMeta(
    effectiveDivisionCode,
    divisions
  );

  const divisionPins = useMemo(() => {
    const activeOnly = pins.filter((p) => p.status !== 'resolved');
    const byDiv = activeOnly.filter(
      (p) => p.department === effectiveDivisionCode
    );
    return byDiv.length > 0 ? byDiv : activeOnly;
  }, [pins, effectiveDivisionCode]);

  const divisionInventoryItems = useMemo(() => {
    const byDiv = inventoryItems.filter(
      (inv) => inv.department === effectiveDivisionCode
    );
    return byDiv.length > 0 ? byDiv : inventoryItems;
  }, [inventoryItems, effectiveDivisionCode]);

  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [orderTab, setOrderTab] = useState<'marketlist' | 'pr'>('marketlist');
  const [targetPinId, setTargetPinId] = useState<string>(
    selectedPin?.id || divisionPins[0]?.id || ''
  );

  React.useEffect(() => {
    if (selectedPin?.id && selectedPin.status !== 'resolved') {
      setTargetPinId(selectedPin.id);
    } else if (
      divisionPins.length > 0 &&
      !divisionPins.some((p) => p.id === targetPinId)
    ) {
      setTargetPinId(divisionPins[0].id);
    }
  }, [selectedPin?.id, selectedPin?.status, divisionPins, targetPinId]);

  // State multi-row Marketlist (Ambil Barang Gudang / SR) dalam 1 Orderan Baru
  const [marketRows, setMarketRows] = useState<MultiMarketlistRow[]>([
    {
      id: 'mr-1',
      inventoryItemId: divisionInventoryItems[0]?.id || '',
      qty: 1,
      orderDate: todayStr,
    },
  ]);

  React.useEffect(() => {
    if (divisionInventoryItems.length > 0) {
      setMarketRows((prev) =>
        prev.map((r) =>
          divisionInventoryItems.some((inv) => inv.id === r.inventoryItemId)
            ? r
            : { ...r, inventoryItemId: divisionInventoryItems[0].id }
        )
      );
    }
  }, [divisionInventoryItems]);

  // State multi-row PR (Purchase Request) dalam 1 Orderan Baru
  const [prRows, setPrRows] = useState<MultiPurchaseRequestRow[]>([
    {
      id: 'pr-1',
      itemName: '',
      department: effectiveDivisionCode,
      qty: 2,
      unit: 'Unit',
      orderDate: todayStr,
      neededDate: defaultNeededStr,
    },
  ]);

  React.useEffect(() => {
    setPrRows((prev) =>
      prev.map((r) => ({ ...r, department: effectiveDivisionCode }))
    );
  }, [effectiveDivisionCode]);

  const handleAddMarketRow = () => {
    setMarketRows((prev) => [
      ...prev,
      {
        id: `mr-${Date.now()}-${prev.length}`,
        inventoryItemId: divisionInventoryItems[0]?.id || '',
        qty: 1,
        orderDate: todayStr,
      },
    ]);
  };

  const handleRemoveMarketRow = (rowId: string) => {
    if (marketRows.length <= 1) return;
    setMarketRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleAddPrRow = () => {
    setPrRows((prev) => [
      ...prev,
      {
        id: `pr-${Date.now()}-${prev.length}`,
        itemName: '',
        department: effectiveDivisionCode,
        qty: 1,
        unit: 'Unit',
        orderDate: todayStr,
        neededDate: defaultNeededStr,
      },
    ]);
  };

  const handleRemovePrRow = (rowId: string) => {
    if (prRows.length <= 1) return;
    setPrRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleMarketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPinId) return;
    const valid = marketRows.filter((r) => r.inventoryItemId && r.qty > 0);
    if (valid.length === 0) return;
    onSubmitMarketlistBatch(targetPinId, valid);
    setMarketRows([
      {
        id: `mr-${Date.now()}`,
        inventoryItemId: divisionInventoryItems[0]?.id || '',
        qty: 1,
        orderDate: todayStr,
      },
    ]);
    setIsCreatingOrder(false);
  };

  const handlePrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPinId) return;
    const valid = prRows.filter(
      (r) => r.itemName.trim().length > 0 && r.qty > 0
    );
    if (valid.length === 0) return;
    onSubmitPurchaseRequestBatch(
      targetPinId,
      valid.map((r) => ({
        ...r,
        department: effectiveDivisionCode,
        itemName: r.itemName.trim(),
      }))
    );
    setPrRows([
      {
        id: `pr-${Date.now()}`,
        itemName: '',
        department: effectiveDivisionCode,
        qty: 1,
        unit: 'Unit',
        orderDate: todayStr,
        neededDate: defaultNeededStr,
      },
    ]);
    setIsCreatingOrder(false);
  };

  return (
    <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3.5">
      {/* Header Bar: Mengikuti Divisi yang Sedang Dibuka + Tombol "Buat Orderan Baru" */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1B365D] dark:text-[#D97706]" />
            <div>
              <span className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Material Orders ({activeDivisionMeta.shortLabel})
              </span>
              <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                Each new order creates 1 Store Request (SR) or 1 PR document
                containing its item list.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
            {pinAllocations.length} Orders on Pin
          </span>

          {!isCreatingOrder ? (
            <button
              type="button"
              onClick={() => setIsCreatingOrder(true)}
              className="h-9 px-4 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Order</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreatingOrder(false)}
              className="h-9 px-3.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px] font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#141619] flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Order</span>
            </button>
          )}
        </div>
      </div>

      {/* FORM ORDERAN BARU (HANYA MUNCUL SAAT TOMBOL "BUAT ORDERAN BARU" DIKLIK) */}
      {isCreatingOrder && (
        <div className="pt-3 border-t border-[#E2E6EC] dark:border-[#263346] space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[12px] font-medium text-[#475569] dark:text-[#94A3B8]">
                {activeDivisionMeta.shortLabel} Division Pin:
              </span>
              <select
                aria-label="Select Order Pin"
                value={targetPinId}
                onChange={(e) => setTargetPinId(e.target.value)}
                className="h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] text-[12px] font-mono font-semibold text-[#141619] dark:text-[#F8FAFC]"
              >
                {divisionPins.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.pin_code} - {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilihan Jenis Order: Marketlist (SR) vs PR */}
            <div className="inline-flex rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] p-0.5 border border-[#E2E6EC] dark:border-[#263346]">
              <button
                type="button"
                onClick={() => setOrderTab('marketlist')}
                className={`h-8 px-3 rounded-[4px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  orderTab === 'marketlist'
                    ? 'bg-[#1B365D] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Store Request (1 SR Order)</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderTab('pr')}
                className={`h-8 px-3 rounded-[4px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                  orderTab === 'pr'
                    ? 'bg-[#B45309] text-white'
                    : 'text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Purchase Request (1 PR Order)</span>
              </button>
            </div>
          </div>

          {orderTab === 'marketlist' ? (
            <form onSubmit={handleMarketSubmit} className="space-y-2.5">
              <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                <span>
                  Items in Store Request (SR) Order for{' '}
                  <strong className="text-[#141619] dark:text-[#F8FAFC]">
                    {activeDivisionMeta.shortLabel}
                  </strong>
                  :
                </span>
                <button
                  type="button"
                  onClick={handleAddMarketRow}
                  className="h-7 px-2.5 rounded-[6px] border border-[#1B365D] text-[#1B365D] dark:text-[#D97706] dark:border-[#D97706] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Item to Order</span>
                </button>
              </div>

              <div className="space-y-2">
                {marketRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]"
                  >
                    <div className="md:col-span-6 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#475569] w-5">
                        #{idx + 1}
                      </span>
                      <select
                        aria-label="Warehouse Item Name"
                        value={row.inventoryItemId}
                        onChange={(e) =>
                          setMarketRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, inventoryItemId: e.target.value }
                                : r
                            )
                          )
                        }
                        className="flex-1 h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                      >
                        {divisionInventoryItems.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.item_name} (Stock: {inv.stock_available}{' '}
                            {inv.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-1.5">
                      <label className="text-[11px] text-[#475569] shrink-0">
                        Qty:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={row.qty}
                        onChange={(e) =>
                          setMarketRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? {
                                    ...r,
                                    qty: Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    ),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[12px]"
                      />
                    </div>

                    <div className="md:col-span-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#475569] shrink-0" />
                      <span className="text-[11px] text-[#475569] shrink-0">
                        Order Date:
                      </span>
                      <input
                        type="date"
                        value={row.orderDate}
                        onChange={(e) =>
                          setMarketRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, orderDate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="flex-1 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[11px]"
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={marketRows.length <= 1}
                        onClick={() => handleRemoveMarketRow(row.id)}
                        aria-label="Remove row"
                        className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center text-[#DC2626] disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
                  All {marketRows.length} items above will be bundled into 1 SR
                  Order in SR &amp; PR.
                </span>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[12px] font-semibold cursor-pointer"
                >
                  Save 1 Store Request (SR) ({marketRows.length} Items)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePrSubmit} className="space-y-2.5">
              <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                <span>
                  Items in Purchase Request (PR) Order for{' '}
                  <strong className="text-[#141619] dark:text-[#F8FAFC]">
                    {activeDivisionMeta.shortLabel}
                  </strong>
                  :
                </span>
                <button
                  type="button"
                  onClick={handleAddPrRow}
                  className="h-7 px-2.5 rounded-[6px] border border-[#B45309] text-[#B45309] dark:text-[#D97706] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Item to PR Order</span>
                </button>
              </div>

              <div className="space-y-2">
                {prRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]"
                  >
                    <div className="md:col-span-5 flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-[#475569] w-5">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={row.itemName}
                        onChange={(e) =>
                          setPrRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, itemName: e.target.value }
                                : r
                            )
                          )
                        }
                        placeholder="PR item name..."
                        className="flex-1 h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={row.qty}
                        onChange={(e) =>
                          setPrRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? {
                                    ...r,
                                    qty: Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    ),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-14 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[12px]"
                      />
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          setPrRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, unit: e.target.value }
                                : r
                            )
                          )
                        }
                        placeholder="Unit"
                        className="flex-1 min-w-0 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-1">
                      <span className="text-[10px] text-[#475569] shrink-0">
                        Order:
                      </span>
                      <input
                        type="date"
                        value={row.orderDate}
                        onChange={(e) =>
                          setPrRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, orderDate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full h-8 px-1.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[11px]"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-1">
                      <span className="text-[10px] text-[#B45309] font-semibold shrink-0">
                        Needed:
                      </span>
                      <input
                        type="date"
                        value={row.neededDate}
                        onChange={(e) =>
                          setPrRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, neededDate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full h-8 px-1.5 rounded-[6px] border border-[#B45309]/50 bg-white dark:bg-[#161F2C] font-mono text-[11px]"
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={prRows.length <= 1}
                        onClick={() => handleRemovePrRow(row.id)}
                        aria-label="Remove PR row"
                        className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] flex items-center justify-center text-[#DC2626] disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
                  All {prRows.length} items above will be bundled into 1 PR
                  Order in SR &amp; PR.
                </span>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[12px] font-semibold cursor-pointer"
                >
                  Save 1 Purchase Request (PR) ({prRows.length} Items)
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. HALAMAN KHUSUS SR (STORE REQUEST) & PR (PURCHASE REQUEST) PER DIVISI
// - Menggunakan tombol "Buat Orderan Baru" (1 Order = 1 SR atau 1 PR berisi item-item)
// ============================================================================
interface StoreAndPurchaseRequestViewProps {
  divisions?: DivisionRecord[];
  materialAllocations: MaterialAllocationRecord[];
  inventoryItems: InventoryItemRecord[];
  pins: PinRecord[];
  onJumpToPinOnMap: (pinId: string) => void;
  onSubmitMarketlistBatch: (
    pinId: string,
    rows: { inventoryItemId: string; qty: number; orderDate: string }[]
  ) => void;
  onSubmitPurchaseRequestBatch: (
    pinId: string,
    rows: {
      itemName: string;
      department: DepartmentOnly;
      qty: number;
      unit: string;
      orderDate: string;
      neededDate: string;
    }[]
  ) => void;
}

export const StoreAndPurchaseRequestView: React.FC<
  StoreAndPurchaseRequestViewProps
> = ({
  divisions = DEFAULT_DIVISIONS,
  materialAllocations,
  inventoryItems,
  pins,
  onJumpToPinOnMap,
  onSubmitMarketlistBatch,
  onSubmitPurchaseRequestBatch,
}) => {
  const [activeSubPage, setActiveSubPage] = useState<'SR' | 'PR'>('SR');
  const [selectedDivisionCode, setSelectedDivisionCode] = useState<string>(
    divisions[0]?.code || 'listrik'
  );
  const [isCreatingOrderModalOpen, setIsCreatingOrderModalOpen] =
    useState<boolean>(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultNeededStr = new Date(Date.now() + 3 * 86400000)
    .toISOString()
    .slice(0, 10);

  const divisionPins = useMemo(() => {
    const byDiv = pins.filter((p) => p.department === selectedDivisionCode);
    return byDiv.length > 0 ? byDiv : pins;
  }, [pins, selectedDivisionCode]);

  const divisionInventory = useMemo(() => {
    const byDiv = inventoryItems.filter(
      (i) => i.department === selectedDivisionCode
    );
    return byDiv.length > 0 ? byDiv : inventoryItems;
  }, [inventoryItems, selectedDivisionCode]);

  const [quickPinId, setQuickPinId] = useState<string>(
    divisionPins[0]?.id || ''
  );

  React.useEffect(() => {
    if (
      divisionPins.length > 0 &&
      !divisionPins.some((p) => p.id === quickPinId)
    ) {
      setQuickPinId(divisionPins[0].id);
    }
  }, [divisionPins, quickPinId]);

  const [srDraftItems, setSrDraftItems] = useState<MultiMarketlistRow[]>([
    {
      id: 'sr-row-1',
      inventoryItemId: divisionInventory[0]?.id || '',
      qty: 1,
      orderDate: todayStr,
    },
  ]);

  React.useEffect(() => {
    if (divisionInventory.length > 0) {
      setSrDraftItems((prev) =>
        prev.map((r) =>
          divisionInventory.some((inv) => inv.id === r.inventoryItemId)
            ? r
            : { ...r, inventoryItemId: divisionInventory[0].id }
        )
      );
    }
  }, [divisionInventory]);

  const [prDraftItems, setPrDraftItems] = useState<MultiPurchaseRequestRow[]>([
    {
      id: 'pr-row-1',
      itemName: '',
      department: selectedDivisionCode,
      qty: 2,
      unit: 'Unit',
      orderDate: todayStr,
      neededDate: defaultNeededStr,
    },
  ]);

  // Pisahkan data SR (Store Request / Marketlist) dan PR (Purchase Request)
  const srRecords = useMemo(
    () =>
      materialAllocations.filter(
        (m) =>
          m.request_type === 'SR' ||
          (!m.request_type && m.allocation_status === 'allocated_from_stock')
      ),
    [materialAllocations]
  );

  const prRecords = useMemo(
    () =>
      materialAllocations.filter(
        (m) =>
          m.request_type === 'PR' ||
          (!m.request_type && m.allocation_status === 'to_buy')
      ),
    [materialAllocations]
  );

  const activeRecords = activeSubPage === 'SR' ? srRecords : prRecords;

  const filteredDivisionRecords = useMemo(
    () => activeRecords.filter((r) => r.department === selectedDivisionCode),
    [activeRecords, selectedDivisionCode]
  );

  const selectedDivObj =
    divisions.find((d) => d.code === selectedDivisionCode) || divisions[0];

  const handleCreateBundledOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPinId) return;
    if (activeSubPage === 'SR') {
      const valid = srDraftItems.filter((r) => r.inventoryItemId && r.qty > 0);
      if (valid.length === 0) return;
      onSubmitMarketlistBatch(quickPinId, valid);
      setSrDraftItems([
        {
          id: `sr-row-${Date.now()}`,
          inventoryItemId: divisionInventory[0]?.id || '',
          qty: 1,
          orderDate: todayStr,
        },
      ]);
      setIsCreatingOrderModalOpen(false);
    } else {
      const valid = prDraftItems.filter(
        (r) => r.itemName.trim().length > 0 && r.qty > 0
      );
      if (valid.length === 0) return;
      onSubmitPurchaseRequestBatch(
        quickPinId,
        valid.map((r) => ({
          ...r,
          department: selectedDivisionCode,
          itemName: r.itemName.trim(),
        }))
      );
      setPrDraftItems([
        {
          id: `pr-row-${Date.now()}`,
          itemName: '',
          department: selectedDivisionCode,
          qty: 2,
          unit: 'Unit',
          orderDate: todayStr,
          neededDate: defaultNeededStr,
        },
      ]);
      setIsCreatingOrderModalOpen(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 space-y-5">
      {/* Header & 2 Halaman Khusus: Store Request (SR) vs Purchase Request (PR) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
            {activeSubPage === 'SR'
              ? 'Store Request (SR - Warehouse Withdrawals by Division)'
              : 'Purchase Request (PR - Procurement by Division)'}
          </h1>
          <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
            Each new order is recorded as 1 {activeSubPage} document containing
            its item breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-[6px] bg-white dark:bg-[#161F2C] p-1 border border-[#E2E6EC] dark:border-[#263346]">
            <button
              type="button"
              onClick={() => setActiveSubPage('SR')}
              className={`h-8 px-3.5 rounded-[4px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubPage === 'SR'
                  ? 'bg-[#1B365D] text-white'
                  : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Store Request (SR) ({srRecords.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubPage('PR')}
              className={`h-8 px-3.5 rounded-[4px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
                activeSubPage === 'PR'
                  ? 'bg-[#B45309] text-white'
                  : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Purchase Request (PR) ({prRecords.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingOrderModalOpen((v) => !v)}
            className="h-9 px-4 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order ({activeSubPage})</span>
          </button>
        </div>
      </div>

      {/* GRID KARTU DEPARTEMEN / DIVISI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {divisions.map((div) => {
          const divRecords = activeRecords.filter(
            (r) => r.department === div.code
          );
          const todayCount = divRecords.filter(
            (r) =>
              (r.order_date && r.order_date === todayStr) ||
              r.created_at.slice(0, 10) === todayStr ||
              r.order_date === '2026-10-31'
          ).length;
          const totalUnits = divRecords.reduce(
            (acc, r) => acc + r.qty_requested,
            0
          );
          const isSelected = selectedDivisionCode === div.code;

          return (
            <button
              key={div.id}
              type="button"
              onClick={() => setSelectedDivisionCode(div.code)}
              className={`text-left p-4 rounded-xl border shadow-2xs transition-colors space-y-3 cursor-pointer ${
                isSelected
                  ? 'border-[#1B365D] dark:border-[#D97706] bg-white dark:bg-[#161F2C] ring-1 ring-[#1B365D]/20'
                  : 'border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] hover:border-[#1B365D]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] px-1.5 py-0.5 rounded bg-[#1B365D]/10 dark:bg-white/10 text-[#1B365D] dark:text-[#D97706]">
                    DIVISION {div.short_code}
                  </span>
                  <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC] mt-1">
                    {div.name}
                  </h2>
                </div>

                <span
                  className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                    todayCount > 0
                      ? 'bg-[#16A34A]/15 text-[#16A34A]'
                      : 'bg-[#F8F7F4] dark:bg-[#0F141C] text-[#475569] dark:text-[#94A3B8]'
                  }`}
                >
                  Today: {todayCount} Orders
                </span>
              </div>

              <div className="pt-2 border-t border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between text-[12px]">
                <span className="text-[#475569] dark:text-[#94A3B8]">
                  Total {activeSubPage}:{' '}
                  <strong className="font-mono text-[#141619] dark:text-[#F8FAFC]">
                    {divRecords.length} Orders
                  </strong>
                </span>
                <span className="font-mono font-semibold text-[#B45309] dark:text-[#D97706]">
                  {totalUnits} Units
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* PANEL PEMBUATAN ORDERAN BARU (HANYA MUNCUL JIKA TOMBOL "BUAT ORDERAN BARU" DIKLIK) */}
      {isCreatingOrderModalOpen && (
        <div className="p-5 rounded-xl border border-[#1B365D] dark:border-[#D97706] bg-white dark:bg-[#161F2C] shadow-md space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E6EC] dark:border-[#263346]">
            <div>
              <h3 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                New {activeSubPage} Order - {selectedDivObj?.name} Division
              </h3>
              <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                Add any required items to this order. Saving submits 1{' '}
                {activeSubPage} document.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingOrderModalOpen(false)}
              className="h-8 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[12px] flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <form onSubmit={handleCreateBundledOrder} className="space-y-3 text-[13px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-medium text-[#475569] dark:text-[#94A3B8]">
                  Linked Pin:
                </label>
                <select
                  value={quickPinId}
                  onChange={(e) => setQuickPinId(e.target.value)}
                  className="h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono text-[12px]"
                >
                  {divisionPins.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pin_code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {activeSubPage === 'SR' ? (
                <button
                  type="button"
                  onClick={() =>
                    setSrDraftItems((prev) => [
                      ...prev,
                      {
                        id: `sr-row-${Date.now()}-${prev.length}`,
                        inventoryItemId: divisionInventory[0]?.id || '',
                        qty: 1,
                        orderDate: todayStr,
                      },
                    ])
                  }
                  className="h-8 px-3 rounded-[6px] border border-[#1B365D] text-[#1B365D] dark:text-[#D97706] text-[12px] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item to Order</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setPrDraftItems((prev) => [
                      ...prev,
                      {
                        id: `pr-row-${Date.now()}-${prev.length}`,
                        itemName: '',
                        department: selectedDivisionCode,
                        qty: 1,
                        unit: 'Unit',
                        orderDate: todayStr,
                        neededDate: defaultNeededStr,
                      },
                    ])
                  }
                  className="h-8 px-3 rounded-[6px] border border-[#B45309] text-[#B45309] dark:text-[#D97706] text-[12px] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item to Order</span>
                </button>
              )}
            </div>

            {activeSubPage === 'SR' ? (
              <div className="space-y-2">
                {srDraftItems.map((row, idx) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2.5 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]"
                  >
                    <div className="md:col-span-6 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#475569] w-5">
                        #{idx + 1}
                      </span>
                      <select
                        value={row.inventoryItemId}
                        onChange={(e) =>
                          setSrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, inventoryItemId: e.target.value }
                                : r
                            )
                          )
                        }
                        className="flex-1 h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                      >
                        {divisionInventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.item_name} (Stock: {inv.stock_available}{' '}
                            {inv.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-1.5">
                      <span className="text-[11px] text-[#475569]">Qty:</span>
                      <input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={(e) =>
                          setSrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? {
                                    ...r,
                                    qty: Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    ),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[12px]"
                      />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-1.5">
                      <span className="text-[11px] text-[#475569]">Date:</span>
                      <input
                        type="date"
                        value={row.orderDate}
                        onChange={(e) =>
                          setSrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, orderDate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="flex-1 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[11px]"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={srDraftItems.length <= 1}
                        onClick={() =>
                          setSrDraftItems((prev) =>
                            prev.filter((r) => r.id !== row.id)
                          )
                        }
                        className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] flex items-center justify-center text-[#DC2626] disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {prDraftItems.map((row, idx) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2.5 rounded-[6px] bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]"
                  >
                    <div className="md:col-span-5 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#475569] w-5">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={row.itemName}
                        onChange={(e) =>
                          setPrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, itemName: e.target.value }
                                : r
                            )
                          )
                        }
                        placeholder="Type required item name..."
                        className="flex-1 h-8 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={(e) =>
                          setPrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? {
                                    ...r,
                                    qty: Math.max(
                                      1,
                                      Number(e.target.value) || 1
                                    ),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-14 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[12px]"
                      />
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          setPrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, unit: e.target.value }
                                : r
                            )
                          )
                        }
                        placeholder="Unit"
                        className="flex-1 min-w-0 h-8 px-2 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] text-[12px]"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-1">
                      <span className="text-[10px] text-[#475569]">Order:</span>
                      <input
                        type="date"
                        value={row.orderDate}
                        onChange={(e) =>
                          setPrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, orderDate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full h-8 px-1.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] font-mono text-[11px]"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-1">
                      <span className="text-[10px] text-[#B45309] font-semibold">
                        Needed:
                      </span>
                      <input
                        type="date"
                        value={row.neededDate}
                        onChange={(e) =>
                          setPrDraftItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, neededDate: e.target.value }
                                : r
                            )
                          )
                        }
                        className="w-full h-8 px-1.5 rounded-[6px] border border-[#B45309]/50 bg-white dark:bg-[#161F2C] font-mono text-[11px]"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={prDraftItems.length <= 1}
                        onClick={() =>
                          setPrDraftItems((prev) =>
                            prev.filter((r) => r.id !== row.id)
                          )
                        }
                        className="h-8 w-8 rounded-[6px] border border-[#E2E6EC] flex items-center justify-center text-[#DC2626] disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="h-9 px-5 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white font-semibold text-[12px] cursor-pointer"
              >
                Save {activeSubPage} Order to {selectedDivObj?.name} Division
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL DAFTAR ORDER (1 BARIS = 1 ORDER BERISI ITEM-ITEM DI DALAMNYA) */}
      <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E6EC] dark:border-[#263346]">
          <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#B45309]" />
            <span>
              {activeSubPage} Orders - {selectedDivObj?.name} Division (
              {filteredDivisionRecords.length} Orders)
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/70 dark:bg-[#0F141C]/70 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                <th className="py-2.5 px-3.5">Order Code</th>
                <th className="py-2.5 px-3.5">Items in Order</th>
                <th className="py-2.5 px-3.5">Total Qty</th>
                <th className="py-2.5 px-3.5">Pin</th>
                <th className="py-2.5 px-3.5">Order Date</th>
                {activeSubPage === 'PR' && (
                  <th className="py-2.5 px-3.5">Needed Date</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
              {filteredDivisionRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeSubPage === 'PR' ? 6 : 5}
                    className="py-8 text-center text-[#475569] dark:text-[#94A3B8]"
                  >
                    No {activeSubPage} orders in {selectedDivObj?.name}{' '}
                    Division yet.
                  </td>
                </tr>
              ) : (
                filteredDivisionRecords.map((rec, idx) => {
                  const linkedPin = pins.find((p) => p.id === rec.pin_id);
                  const orderCode =
                    rec.order_code ||
                    `${activeSubPage}-${String(idx + 1).padStart(3, '0')}`;
                  return (
                    <tr key={rec.id}>
                      <td className="py-3 px-3.5 font-mono text-[12px] font-semibold text-[#1B365D] dark:text-[#D97706]">
                        {orderCode}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-[#141619] dark:text-[#F8FAFC]">
                        {rec.order_items && rec.order_items.length > 0 ? (
                          <div className="space-y-1">
                            {rec.order_items.map((item, i) => (
                              <div
                                key={`${rec.id}-item-${i}`}
                                className="text-[12px] flex items-center gap-2"
                              >
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]">
                                  {item.qty} {item.unit}
                                </span>
                                <span>{item.item_name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span>{rec.item_name}</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-semibold">
                        {rec.qty_requested} {rec.unit}
                      </td>
                      <td className="py-3 px-3.5">
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
                      <td className="py-3 px-3.5 font-mono text-[12px] text-[#475569] dark:text-[#94A3B8]">
                        {rec.order_date || rec.created_at.slice(0, 10)}
                      </td>
                      {activeSubPage === 'PR' && (
                        <td className="py-3 px-3.5 font-mono text-[12px] font-semibold text-[#B45309] dark:text-[#D97706]">
                          {rec.needed_date || '2026-11-03'}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. HALAMAN ABSENSI PEKERJA & KONTROL MANUAL OWNER/MANDOR
// ============================================================================
interface AttendanceViewProps {
  activeProfile: ProfileRecord;
  profiles: ProfileRecord[];
  divisions?: DivisionRecord[];
  attendanceRecords: AttendanceRecord[];
  onWorkerSubmitAttendance: (payload: {
    workerCode: string;
    divisionCode: string;
    attendanceType: 'masuk' | 'pulang';
    faceVerified: boolean;
  }) => { ok: boolean; message: string };
  onLeaderManualAttendance: (payload: {
    workerProfileId: string;
    divisionCode: string;
    attendanceType: 'masuk' | 'pulang';
  }) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  activeProfile,
  profiles,
  divisions = DEFAULT_DIVISIONS,
  attendanceRecords,
  onWorkerSubmitAttendance,
  onLeaderManualAttendance,
}) => {
  const isLeader =
    activeProfile.global_role === 'owner' ||
    activeProfile.global_role === 'mandor';

  const workerProfiles = useMemo(
    () => profiles.filter((p) => p.global_role === 'worker'),
    [profiles]
  );

  // Form Absensi Pekerja (Wajib Divisi + Kode Pekerja + Absen Wajah)
  const [selectedDivCode, setSelectedDivCode] = useState<string>('');
  const [attendanceType, setAttendanceType] = useState<'masuk' | 'pulang'>(
    'masuk'
  );
  const [workerCodeInput, setWorkerCodeInput] = useState<string>(
    activeProfile.worker_code || 'TKG-101'
  );
  const [isScanningFace, setIsScanningFace] = useState<boolean>(false);
  const [isFaceVerified, setIsFaceVerified] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Form Absen Manual khusus Owner & Mandor
  const [manualWorkerId, setManualWorkerId] = useState<string>(
    workerProfiles[0]?.id || ''
  );
  const [manualDivCode, setManualDivCode] = useState<string>(
    divisions[0]?.code || 'listrik'
  );
  const [manualType, setManualType] = useState<'masuk' | 'pulang'>('masuk');

  const handleStartFaceScan = () => {
    setIsScanningFace(true);
    setTimeout(() => {
      setIsScanningFace(false);
      setIsFaceVerified(true);
    }, 600);
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDivCode) {
      setFeedbackBanner('Division selection is required.');
      return;
    }
    if (!workerCodeInput.trim()) {
      setFeedbackBanner('Worker Code is required (e.g., TKG-101).');
      return;
    }
    if (!isFaceVerified) {
      setFeedbackBanner('Face verification is required before saving.');
      return;
    }

    const res = onWorkerSubmitAttendance({
      workerCode: workerCodeInput.trim().toUpperCase(),
      divisionCode: selectedDivCode,
      attendanceType,
      faceVerified: isFaceVerified,
    });
    setFeedbackBanner(res.message);
    if (res.ok) {
      setIsFaceVerified(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWorkerId || !manualDivCode) return;
    onLeaderManualAttendance({
      workerProfileId: manualWorkerId,
      divisionCode: manualDivCode,
      attendanceType: manualType,
    });
    setFeedbackBanner('Manual worker attendance recorded by Foreman.');
  };

  // Hitung berapa kali masing-masing pekerja bekerja (berdasarkan jumlah absen masuk)
  const workerWorkCountSummary = useMemo(() => {
    return workerProfiles.map((w) => {
      const workerLogs = attendanceRecords.filter(
        (r) =>
          r.worker_profile_id === w.id ||
          r.worker_code.toUpperCase() === (w.worker_code || '').toUpperCase()
      );
      const masukCount = workerLogs.filter(
        (r) => r.attendance_type === 'masuk'
      ).length;
      const pulangCount = workerLogs.filter(
        (r) => r.attendance_type === 'pulang'
      ).length;
      return {
        worker: w,
        masukCount,
        pulangCount,
        totalLogs: workerLogs.length,
      };
    });
  }, [workerProfiles, attendanceRecords]);

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC]">
            Project Attendance (Division, Worker Code &amp; Face Check)
          </h1>
          <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
            Workers select a division, enter their worker code, and verify their
            face. Owner &amp; Foreman can log manual attendance and track shifts.
          </p>
        </div>
      </div>

      {feedbackBanner && (
        <div className="px-4 py-2.5 rounded-[8px] border border-[#1B365D]/30 bg-[#1B365D]/10 text-[13px] font-medium text-[#1B365D] dark:text-[#D97706] flex items-center justify-between">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-[11px] underline"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* KIRI (5 KOLOM): TERMINAL ABSENSI PEKERJA (KODE PEKERJA + ABSEN WAJAH) */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-4">
          <div className="pb-2.5 border-b border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#B45309] dark:text-[#D97706]" />
              <span>Worker Attendance Terminal (Face &amp; Code)</span>
            </h2>
            <span className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
              TKG-101 to TKG-104
            </span>
          </div>

          <form onSubmit={handleWorkerSubmit} className="space-y-3.5 text-[13px]">
            {/* 1. Pilih Jenis Absen: Masuk / Pulang */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendanceType('masuk')}
                className={`h-9 rounded-[6px] font-semibold text-[12px] border transition-colors ${
                  attendanceType === 'masuk'
                    ? 'bg-[#16A34A] text-white border-[#16A34A]'
                    : 'border-[#E2E6EC] dark:border-[#263346] text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                Check In
              </button>
              <button
                type="button"
                onClick={() => setAttendanceType('pulang')}
                className={`h-9 rounded-[6px] font-semibold text-[12px] border transition-colors ${
                  attendanceType === 'pulang'
                    ? 'bg-[#B45309] text-white border-[#B45309]'
                    : 'border-[#E2E6EC] dark:border-[#263346] text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                Check Out
              </button>
            </div>

            {/* 2. Wajib Pilih Divisi */}
            <div>
              <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                Select Division (Required)
              </label>
              <select
                required
                aria-label="Select Attendance Division"
                value={selectedDivCode}
                onChange={(e) => setSelectedDivCode(e.target.value)}
                className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]"
              >
                <option value="">-- Select Division (Required) --</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.code}>
                    {div.name} ({div.short_code})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Wajib Isi Kode Pekerja */}
            <div>
              <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                Worker Code (Required)
              </label>
              <input
                type="text"
                required
                value={workerCodeInput}
                onChange={(e) => setWorkerCodeInput(e.target.value)}
                placeholder="Example: TKG-101"
                className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono font-semibold uppercase"
              />
              <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-mono text-[#475569] dark:text-[#94A3B8]">
                {workerProfiles.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWorkerCodeInput(w.worker_code || 'TKG-101')}
                    className="px-1.5 py-0.5 rounded bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D]"
                  >
                    {w.worker_code}: {w.full_name.split(' ')[1] || w.full_name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Wajib Absen Wajah (Kamera Biometrik) */}
            <div className="p-3.5 rounded-[8px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                  Face Attendance Verification
                </span>
                {isFaceVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#16A34A]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Face Verified</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#CA8A04]">
                    Not Scanned Yet
                  </span>
                )}
              </div>

              <div className="h-32 rounded-[6px] bg-[#141619] text-white flex flex-col items-center justify-center relative overflow-hidden border border-[#263346]">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D97706] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#D97706]" />
                </div>
                <span className="mt-2 font-mono text-[11px] text-[#94A3B8]">
                  {isScanningFace
                    ? 'Scanning worker face biometrics...'
                    : isFaceVerified
                    ? `Face ID Matched (${workerCodeInput.toUpperCase()})`
                    : 'Position face inside camera frame'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartFaceScan}
                className="w-full h-8 rounded-[6px] border border-[#1B365D] dark:border-[#D97706] text-[#1B365D] dark:text-[#D97706] font-semibold text-[12px] hover:bg-[#1B365D] hover:text-white transition-colors"
              >
                {isFaceVerified
                  ? 'Rescan Face'
                  : 'Capture Face Verification'}
              </button>
            </div>

            <button
              type="submit"
              disabled={!selectedDivCode || !workerCodeInput.trim() || !isFaceVerified}
              className="w-full h-10 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] disabled:opacity-40 text-white font-semibold text-[13px]"
            >
              Confirm {attendanceType === 'masuk' ? 'Check-In' : 'Check-Out'}
            </button>
          </form>
        </div>

        {/* KANAN (7 KOLOM): ABSEN MANUAL OWNER/MANDOR & REKAP BERAPA KALI BEKERJA */}
        <div className="lg:col-span-7 space-y-4">
          {isLeader && (
            <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3">
              <div className="pb-2 border-b border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Manual Worker Attendance (Owner &amp; Foreman)</span>
                </h2>
              </div>

              <form
                onSubmit={handleManualSubmit}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end text-[12px]"
              >
                <div>
                  <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                    Select Worker
                  </label>
                  <select
                    value={manualWorkerId}
                    onChange={(e) => setManualWorkerId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]"
                  >
                    {workerProfiles.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.full_name} ({w.worker_code || 'TKG'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                    Select Division
                  </label>
                  <select
                    value={manualDivCode}
                    onChange={(e) => setManualDivCode(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                    Attendance Type
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) =>
                      setManualType(e.target.value as 'masuk' | 'pulang')
                    }
                    className="w-full h-9 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]"
                  >
                    <option value="masuk">Check In</option>
                    <option value="pulang">Check Out</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="h-9 px-3 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white font-semibold"
                >
                  Log Manually
                </button>
              </form>
            </div>
          )}

          {/* Tabel Rekap Berapa Kali Pekerja Bekerja */}
          <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3">
            <h3 className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
              Worker Attendance Summary (Total Shifts Worked)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/70 dark:bg-[#0F141C]/70 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#475569] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-3">Primary Division</th>
                    <th className="py-2.5 px-3">Total Shifts (Check-In)</th>
                    <th className="py-2.5 px-3">Check-Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[13px]">
                  {workerWorkCountSummary.map((row) => {
                    const deptMeta = getDepartmentMeta(
                      row.worker.specialty_department,
                      divisions
                    );
                    return (
                      <tr key={row.worker.id}>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#1B365D] dark:text-[#D97706]">
                          {row.worker.worker_code || 'TKG'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#141619] dark:text-[#F8FAFC]">
                          {row.worker.full_name}
                        </td>
                        <td className="py-2.5 px-3 text-[#475569] dark:text-[#94A3B8]">
                          {deptMeta.label}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#16A34A]">
                          {row.masukCount} Shifts Worked
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#475569] dark:text-[#94A3B8]">
                          {row.pulangCount} Times
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log Riwayat Absensi Terbaru */}
          <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-2.5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#475569] dark:text-[#94A3B8]">
              Recent Attendance Log ({attendanceRecords.length})
            </h3>
            <div className="max-h-52 overflow-y-auto divide-y divide-[#E2E6EC] dark:divide-[#263346] text-[12px]">
              {attendanceRecords.map((rec) => {
                const deptMeta = getDepartmentMeta(
                  rec.division_code,
                  divisions
                );
                return (
                  <div
                    key={rec.id}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono font-semibold text-[#1B365D] dark:text-[#D97706]">
                        [{rec.worker_code}]
                      </span>{' '}
                      <strong className="text-[#141619] dark:text-[#F8FAFC]">
                        {rec.worker_name}
                      </strong>{' '}
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        ({deptMeta.shortLabel})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold uppercase ${
                          rec.attendance_type === 'masuk'
                            ? 'bg-[#16A34A]/15 text-[#16A34A]'
                            : 'bg-[#B45309]/15 text-[#B45309]'
                        }`}
                      >
                        {rec.attendance_type === 'masuk'
                          ? 'check-in'
                          : 'check-out'}
                      </span>
                      <span className="text-[#475569] dark:text-[#94A3B8]">
                        {rec.verification_method === 'face_scan'
                          ? 'Face OK'
                          : 'Manual Foreman'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. HALAMAN KHUSUS PENGATURAN PROYEK (BUKAN POPUP + ADA NAVBAR TAMBAHAN)
// ============================================================================
interface ProjectSettingsPageProps {
  project: ProjectRecord;
  divisions?: DivisionRecord[];
  theme: ThemePreference;
  onToggleTheme: (nextTheme: 'system' | 'dark' | 'light') => void;
  onAddDivision: (name: string, shortCode: string) => void;
  onUpdateDivisionName: (divisionId: string, nextName: string) => void;
  onUpdateProjectSettings: (payload: {
    sopLowStockThreshold: number;
    terminTargetPercent: number;
    estimatedCountdownLabel: string;
  }) => void;
  onBackToProject: () => void;
  dbState: VontaDatabaseState;
  onResetDatabase: () => void;
}

export const ProjectSettingsPage: React.FC<ProjectSettingsPageProps> = ({
  project,
  divisions = DEFAULT_DIVISIONS,
  onAddDivision,
  onUpdateDivisionName,
  onUpdateProjectSettings,
  onBackToProject,
  onResetDatabase,
}) => {
  const [settingsSubNav, setSettingsSubNav] = useState<
    'divisions' | 'sop_termin' | 'database'
  >('divisions');

  // State tambah divisi baru
  const [newDivName, setNewDivName] = useState<string>('');
  const [newDivShortCode, setNewDivShortCode] = useState<string>('');
  const [editingDivId, setEditingDivId] = useState<string | null>(null);
  const [editingDivName, setEditingDivName] = useState<string>('');

  // State SOP Stok Menipis & Estimasi Waktu Penyelesaian
  const [sopThreshold, setSopThreshold] = useState<number>(
    project.sop_low_stock_threshold ?? 5
  );
  const [terminPercent, setTerminPercent] = useState<number>(
    project.termin_target_percent
  );
  const [countdownLabel, setCountdownLabel] = useState<string>(
    project.estimated_countdown_label || '5 Years 3 Months 2 Days'
  );
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleCreateDivisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivName.trim()) return;
    const code =
      newDivShortCode.trim().toUpperCase() ||
      newDivName.trim().slice(0, 3).toUpperCase();
    onAddDivision(newDivName.trim(), code);
    setNewDivName('');
    setNewDivShortCode('');
  };

  const handleSaveSopSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectSettings({
      sopLowStockThreshold: Math.max(1, sopThreshold),
      terminTargetPercent: Math.min(100, Math.max(10, terminPercent)),
      estimatedCountdownLabel:
        countdownLabel.trim() || '5 Years 3 Months 2 Days',
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col bg-[#F8F7F4] dark:bg-[#0F141C]">
      {/* NAVBAR TAMBAHAN KHUSUS PENGATURAN PROYEK + TOMBOL KEMBALI KE PROJECT */}
      <div className="sticky top-12 z-20 h-12 px-4 sm:px-6 bg-white dark:bg-[#161F2C] border-b border-[#E2E6EC] dark:border-[#263346] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToProject}
            className="h-8 px-3 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project</span>
          </button>

          <div className="h-4 w-[1px] bg-[#E2E6EC] dark:bg-[#263346]" />

          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#B45309] dark:text-[#D97706]" />
            <span className="text-[14px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
              Project Settings: {project.name}
            </span>
          </div>
        </div>

        {/* Sub-Navbar Pengaturan */}
        <nav
          aria-label="Project Settings Navigation"
          className="flex items-center gap-1"
        >
          <button
            type="button"
            onClick={() => setSettingsSubNav('divisions')}
            className={`h-8 px-3 rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
              settingsSubNav === 'divisions'
                ? 'bg-[#1B365D] text-white'
                : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Division Management ({divisions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsSubNav('sop_termin')}
            className={`h-8 px-3 rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
              settingsSubNav === 'sop_termin'
                ? 'bg-[#1B365D] text-white'
                : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stock &amp; Stage Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsSubNav('database')}
            className={`h-8 px-3 rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${
              settingsSubNav === 'database'
                ? 'bg-[#1B365D] text-white'
                : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8F7F4] dark:hover:bg-[#0F141C]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Reset &amp; Database</span>
          </button>
        </nav>
      </div>

      {/* KONTEN HALAMAN PENGATURAN */}
      <div className="max-w-[1120px] w-full mx-auto p-5 space-y-5">
        {settingsSubNav === 'divisions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Form Tambah Divisi Baru */}
            <div className="lg:col-span-5 p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3.5">
              <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Add New Division
              </h2>
              <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                Divisions added here automatically connect to Store Request
                (SR), Purchase Request (PR), 3D/2D Canvas filters, and
                Attendance.
              </p>

              <form
                onSubmit={handleCreateDivisionSubmit}
                className="space-y-3 text-[13px]"
              >
                <div>
                  <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                    Division Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newDivName}
                    onChange={(e) => setNewDivName(e.target.value)}
                    placeholder="Example: Landscape & Garden"
                    className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase mb-1 text-[#475569] dark:text-[#94A3B8]">
                    Short Code (3 Letters)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={newDivShortCode}
                    onChange={(e) => setNewDivShortCode(e.target.value)}
                    placeholder="Example: LND"
                    className="w-full h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-9 rounded-[6px] bg-[#B45309] hover:bg-[#92400E] text-white font-semibold text-[12px] flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Division to Project</span>
                </button>
              </form>
            </div>

            {/* Daftar Divisi Aktif */}
            <div className="lg:col-span-7 p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3">
              <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Project Divisions ({divisions.length})
              </h2>

              <div className="divide-y divide-[#E2E6EC] dark:divide-[#263346]">
                {divisions.map((div) => (
                  <div
                    key={div.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B365D] text-white">
                        {div.short_code}
                      </span>
                      {editingDivId === div.id ? (
                        <input
                          type="text"
                          value={editingDivName}
                          onChange={(e) => setEditingDivName(e.target.value)}
                          className="h-8 px-2.5 rounded-[6px] border border-[#1B365D] bg-[#F8F7F4] dark:bg-[#0F141C] text-[13px]"
                        />
                      ) : (
                        <span className="text-[14px] font-medium text-[#141619] dark:text-[#F8FAFC]">
                          {div.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {editingDivId === div.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (editingDivName.trim()) {
                              onUpdateDivisionName(
                                div.id,
                                editingDivName.trim()
                              );
                            }
                            setEditingDivId(null);
                          }}
                          className="h-7 px-2.5 rounded-[6px] bg-[#16A34A] text-white text-[11px] font-semibold"
                        >
                          Save Name
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDivId(div.id);
                            setEditingDivName(div.name);
                          }}
                          className="h-7 px-2.5 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] text-[11px] font-medium hover:border-[#1B365D]"
                        >
                          Rename Division
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {settingsSubNav === 'sop_termin' && (
          <form
            onSubmit={handleSaveSopSettings}
            className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-4 max-w-[680px]"
          >
            <h2 className="text-[16px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
              Low-Stock Threshold, Stage Target &amp; Completion Countdown
            </h2>

            <div className="space-y-1">
              <label className="block text-[12px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Warehouse Low-Stock Threshold (Units)
              </label>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                Sets the remaining unit count at which an item is flagged as
                &quot;Low Stock&quot; in Inventory.
              </p>
              <input
                type="number"
                min={1}
                max={500}
                value={sopThreshold}
                onChange={(e) =>
                  setSopThreshold(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-40 h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
                Payment Stage Unlock Target (%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={terminPercent}
                onChange={(e) =>
                  setTerminPercent(Math.max(10, Number(e.target.value) || 80))
                }
                className="w-40 h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-semibold text-[#141619] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Estimated Project Completion Countdown</span>
              </label>
              <input
                type="text"
                value={countdownLabel}
                onChange={(e) => setCountdownLabel(e.target.value)}
                placeholder="5 Years 3 Months 2 Days"
                className="w-full max-w-md h-9 px-3 rounded-[6px] border border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4] dark:bg-[#0F141C] font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="h-9 px-4 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[12px] font-semibold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Project Rules</span>
              </button>
              {savedNotice && (
                <span className="text-[12px] font-medium text-[#16A34A]">
                  Project rules saved.
                </span>
              )}
            </div>
          </form>
        )}

        {settingsSubNav === 'database' && (
          <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs space-y-3 max-w-[600px]">
            <h2 className="text-[15px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
              Reset Project Database to Default
            </h2>
            <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
              Restore all pins, divisions, warehouse stock, and attendance logs
              to their initial seed state.
            </p>
            <button
              type="button"
              onClick={onResetDatabase}
              className="h-9 px-4 rounded-[6px] bg-[#DC2626] hover:bg-red-700 text-white text-[12px] font-semibold"
            >
              Reset Database to Seed Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5. HALAMAN HISTORY PENYELESAIAN TITIK PER DIVISI (SAAT MANDOR APPROVE)
// - Saat Mandor menekan Approve, titik pin hilang dari 3D & 2D Blueprint
//   dan langsung masuk ke halaman History ini.
// - Menampilkan pilihan Divisi, serta baris-baris berisi:
//   1. Kode Titik (#103 + judul)
//   2. Divisi
//   3. Dikerjakan Oleh Siapa (Nama Tukang & Email)
//   4. Status (Approve)
//   5. Jumlah Revisi (0x / 1x / 2x Revisi)
//   6. Tombol Preview Before & After Terakhir (jika pernah revisi, Before =
//      gambar sebelum revisi, After = gambar hasil revisi terakhir).
// ============================================================================
interface DivisionHistoryViewProps {
  pins: PinRecord[];
  divisions: DivisionRecord[];
  profiles: ProfileRecord[];
  activeDepartmentFilter?: SpecialtyDepartment;
}

export const DivisionHistoryView: React.FC<DivisionHistoryViewProps> = ({
  pins,
  divisions,
  profiles,
  activeDepartmentFilter,
}) => {
  const initialDivCode =
    activeDepartmentFilter && activeDepartmentFilter !== 'all'
      ? activeDepartmentFilter
      : divisions[0]?.code || 'listrik';

  const [selectedDivCode, setSelectedDivCode] = useState<string>(initialDivCode);
  const [previewPin, setPreviewPin] = useState<PinRecord | null>(null);
  const [sliderPercent, setSliderPercent] = useState<number>(50);

  const approvedPinsAll = useMemo(
    () => pins.filter((p) => p.status === 'resolved'),
    [pins]
  );

  const filteredHistoryPins = useMemo(
    () =>
      approvedPinsAll.filter((p) =>
        selectedDivCode === 'all' ? true : p.department === selectedDivCode
      ),
    [approvedPinsAll, selectedDivCode]
  );

  const getWorkerDisplay = (email?: string | null) => {
    if (!email) return 'Unassigned';
    const found = profiles.find((prof) => prof.email === email);
    return found ? `${found.full_name} (${found.email})` : email;
  };

  return (
    <div className="max-w-[1360px] mx-auto p-5 space-y-5">
      {/* Header Halaman History */}
      <div className="p-5 rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#B45309] dark:text-[#D97706] block">
            COMPLETED WORK ARCHIVE (APPROVED)
          </span>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#141619] dark:text-[#F8FAFC] mt-0.5">
            Completed Pin History by Division
          </h1>
          <p className="text-[12.5px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
            Pins approved by the Foreman automatically move from the 3D/2D
            Blueprint Canvas to this History archive under their division.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-[6px] bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30 font-mono text-[12px] font-semibold">
            {approvedPinsAll.length} Approved Pins
          </span>
        </div>
      </div>

      {/* Pilihan Divisi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {divisions.map((div) => {
          const countInDiv = approvedPinsAll.filter(
            (p) => p.department === div.code
          ).length;
          const isSelected = selectedDivCode === div.code;
          return (
            <button
              key={div.id}
              type="button"
              onClick={() => setSelectedDivCode(div.code)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1B365D] text-white border-[#1B365D] shadow-xs'
                  : 'bg-white dark:bg-[#161F2C] text-[#141619] dark:text-[#F8FAFC] border-[#E2E6EC] dark:border-[#263346] hover:border-[#1B365D]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#1B365D]/10 text-[#1B365D] dark:bg-white/10 dark:text-[#D97706]'
                  }`}
                >
                  {div.short_code}
                </span>
                <span className="font-mono text-[12px] font-bold tabular-nums">
                  {countInDiv} Pins
                </span>
              </div>
              <p className="text-[13px] font-semibold mt-2 truncate">
                {div.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Tabel Baris-Baris History Titik Selesai */}
      <div className="rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E2E6EC] dark:border-[#263346] flex items-center justify-between gap-3 bg-[#F8F7F4] dark:bg-[#0F141C]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <h2 className="text-[13px] font-semibold text-[#141619] dark:text-[#F8FAFC]">
              Division History Rows:{' '}
              {divisions.find((d) => d.code === selectedDivCode)?.name ||
                selectedDivCode.toUpperCase()}
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#475569] dark:text-[#94A3B8]">
            {filteredHistoryPins.length} rows recorded
          </span>
        </div>

        {filteredHistoryPins.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[#475569] dark:text-[#94A3B8]">
            No approved pins in this division yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[#E2E6EC] dark:border-[#263346] bg-[#F8F7F4]/60 dark:bg-[#0F141C]/60 font-mono text-[11px] uppercase text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-3 px-4">Pin Code</th>
                  <th className="py-3 px-4">Division</th>
                  <th className="py-3 px-4">Completed By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Revisions</th>
                  <th className="py-3 px-4 text-right">
                    Latest Before &amp; After Preview
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EC] dark:divide-[#263346]">
                {filteredHistoryPins.map((pin) => {
                  const deptMeta = getDepartmentMeta(pin.department, divisions);
                  return (
                    <tr
                      key={pin.id}
                      className="hover:bg-[#F8F7F4]/60 dark:hover:bg-[#0F141C]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-bold px-2 py-0.5 rounded bg-[#1B365D] text-white">
                            {pin.pin_code}
                          </span>
                          <span className="font-semibold text-[#141619] dark:text-[#F8FAFC]">
                            {pin.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#475569] dark:text-[#94A3B8]">
                        {deptMeta.label}
                      </td>
                      <td className="py-3.5 px-4 text-[#141619] dark:text-[#F8FAFC] font-medium">
                        {getWorkerDisplay(pin.assigned_worker_email)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#16A34A]/15 text-[#16A34A]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] font-semibold">
                        {pin.revision_count > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-[#D97706]/15 text-[#B45309] dark:text-[#D97706]">
                            {pin.revision_count}x Revisions
                          </span>
                        ) : (
                          <span className="text-[#475569] dark:text-[#94A3B8]">
                            0x Revisions
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPin(pin);
                            setSliderPercent(50);
                          }}
                          className="h-8 px-3 rounded-[6px] bg-[#1B365D] hover:bg-[#152a4a] text-white text-[11.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Before &amp; After</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview Before & After Terakhir */}
      {previewPin && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-xl border border-[#E2E6EC] dark:border-[#263346] bg-white dark:bg-[#161F2C] shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-[#1B365D] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold px-2 py-0.5 rounded bg-white/15">
                  {previewPin.pin_code}
                </span>
                <h3 className="text-[14px] font-semibold truncate">
                  {previewPin.title}
                </h3>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#16A34A] text-white font-bold">
                  Approved ({previewPin.revision_count}x Revisions)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPin(null)}
                className="w-8 h-8 rounded-[6px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {(() => {
                const effectiveBeforeUrl =
                  previewPin.revision_count > 0 &&
                  previewPin.before_revision_media_url
                    ? previewPin.before_revision_media_url
                    : previewPin.before_media_url;
                const effectiveAfterUrl =
                  previewPin.after_media_url || previewPin.before_media_url;

                return (
                  <>
                    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-[#E2E6EC] dark:border-[#263346] bg-slate-950 select-none">
                      <img
                        src={effectiveAfterUrl}
                        alt={`After ${previewPin.pin_code}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          clipPath: `inset(0 ${100 - sliderPercent}% 0 0)`,
                        }}
                      >
                        <img
                          src={effectiveBeforeUrl}
                          alt={`Before ${previewPin.pin_code}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      <div
                        style={{ left: `${sliderPercent}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.9)] pointer-events-none flex items-center justify-center"
                      >
                        <div className="w-7 h-7 -ml-3.5 rounded-full bg-[#B45309] text-white border-2 border-white shadow flex items-center justify-center">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[10px] font-bold uppercase">
                        {previewPin.revision_count > 0 &&
                        previewPin.before_revision_media_url
                          ? 'BEFORE (PRE-REVISION)'
                          : 'BEFORE'}
                      </div>
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#16A34A]/90 text-white font-mono text-[10px] font-bold uppercase">
                        {previewPin.revision_count > 0
                          ? 'AFTER (LATEST REVISION)'
                          : 'AFTER (VERIFIED)'}
                      </div>

                      <input
                        type="range"
                        aria-label="Slide Before After History comparison"
                        min={0}
                        max={100}
                        value={sliderPercent}
                        onChange={(e) =>
                          setSliderPercent(Number(e.target.value))
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] p-3.5 rounded-lg bg-[#F8F7F4] dark:bg-[#0F141C] border border-[#E2E6EC] dark:border-[#263346]">
                      <div>
                        <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px]">
                          Completed By:
                        </span>
                        <span className="font-semibold text-[#141619] dark:text-[#F8FAFC]">
                          {getWorkerDisplay(previewPin.assigned_worker_email)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px]">
                          Revision History:
                        </span>
                        <span className="font-mono font-semibold text-[#141619] dark:text-[#F8FAFC]">
                          {previewPin.revision_count}x Revisions
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

