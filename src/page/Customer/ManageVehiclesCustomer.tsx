import Header from '@/components/Header/Header';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { createVehicle, fetchVehicles } from '@/services/features/booking/bookingSlice';
import type { CreateVehicleData, Vehicle } from '@/interfaces/vehicle';
import axiosInstance from '@/services/constant/axiosInstance';
import { VEHICLE_BRANDS_ENDPOINT } from '@/services/constant/apiConfig';
import { Car, Badge, Palette, Battery, Hash, Pencil, Trash2, Info } from 'lucide-react';

function ManageVehiclesCustomer() {
    const dispatch = useAppDispatch();
    const { vehicles, loading, error, createVehicleLoading } = useAppSelector((s) => s.booking);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    const [brands, setBrands] = useState<string[]>([]);

    const [form, setForm] = useState<CreateVehicleData>({
        vehicleInfo: {
            brand: '',
            modelName: '',
            year: new Date().getFullYear(),
            batteryType: '',
            licensePlate: '',
            color: '',
            batteryCapacity: '',
        },
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchVehicles());
    }, [dispatch]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axiosInstance.get(VEHICLE_BRANDS_ENDPOINT);
                const data = res?.data?.data ?? [];
                if (Array.isArray(data)) setBrands(data as string[]);
            } catch (e) {
                // silent fail; keep free-text entry
            }
        };
        fetchBrands();
    }, []);

    const handleOpenAdd = () => {
        setFormError(null);
        setSuccessMsg(null);
        setIsAddOpen(true);
    };

    const handleCloseAdd = () => {
        setIsAddOpen(false);
    };

    const handleChange = (field: keyof CreateVehicleData['vehicleInfo'], value: string | number) => {
        setForm((prev) => ({
            vehicleInfo: {
                ...prev.vehicleInfo,
                [field]: value,
            },
        }));
    };

    const validateForm = (): string | null => {
        const v = form.vehicleInfo;
        if (!v.brand || !v.modelName || !v.licensePlate) return 'Vui lòng nhập hãng xe, dòng xe và biển số.';
        if (!v.year || Number(v.year) < 1970 || Number(v.year) > new Date().getFullYear() + 1) return 'Năm sản xuất không hợp lệ.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errMsg = validateForm();
        if (errMsg) {
            setFormError(errMsg);
            return;
        }
        setFormError(null);
        setSuccessMsg(null);
        const action = await dispatch(createVehicle(form));
        if ((action as any).error) {
            setFormError((action as any).payload || 'Không thể thêm xe.');
        } else {
            setSuccessMsg('Thêm xe thành công!');
            setIsAddOpen(false);
        }
    };

    const totalVehiclesText = useMemo(() => {
        const count = vehicles?.length || 0;
        if (count === 0) return 'Bạn chưa có xe nào. Thêm xe để bắt đầu quản lý.';
        if (count === 1) return 'Bạn có 1 xe đã đăng ký';
        return `Bạn có ${count} xe đã đăng ký`;
    }, [vehicles]);

    const openView = (v: Vehicle) => {
        setSelectedVehicle(v);
        setIsViewOpen(true);
    };
    const openEdit = (v: Vehicle) => {
        setSelectedVehicle(v);
        setIsEditOpen(true);
    };
    const openDelete = (v: Vehicle) => {
        setSelectedVehicle(v);
        setIsDeleteOpen(true);
    };

    const closeAllActionModals = () => {
        setSelectedVehicle(null);
        setIsViewOpen(false);
        setIsEditOpen(false);
        setIsDeleteOpen(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen">
            <Header />
            <div className="pt-16">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Hero header card */}
                    <div className="rounded-3xl bg-gradient-to-b from-white to-primary/5 border border-primary/10 shadow-sm px-6 py-8 mb-8">
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-3xl font-bold mb-2">Quản lý xe</h1>
                            <p className="text-synop-gray-medium mb-5">{totalVehiclesText}</p>
                            <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-white hover:opacity-90 transition shadow">
                                <Car className="w-5 h-5" />
                                Thêm xe
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-700">{error}</div>
                    )}

                    {/* Empty state */}
                    {!loading && vehicles.length === 0 && (
                        <div className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-10 text-center">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow flex items-center justify-center mb-4">
                                <Car className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Chưa có xe nào</h3>
                            <p className="text-synop-gray-medium mb-4">Hãy thêm chiếc xe đầu tiên để bắt đầu quản lý và đặt lịch bảo dưỡng.</p>
                            <button onClick={handleOpenAdd} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-white hover:opacity-90 transition">
                                <Car className="w-5 h-5" /> Thêm xe
                            </button>
                        </div>
                    )}

                    {/* Vehicles list - single column for premium look */}
                    <div className="grid grid-cols-1 gap-6">
                        {loading && vehicles.length === 0 && (
                            <div className="col-span-full text-center text-synop-gray-medium">Đang tải danh sách xe...</div>
                        )}
                        {vehicles.map((vehicle: Vehicle) => {
                            const v = vehicle.vehicleInfo;
                            const model = v?.vehicleModel as any;
                            const brand = model?.brand || (v as any)?.brand || '';
                            const modelName = model?.modelName || (v as any)?.modelName || '';
                            const batteryType = model?.batteryType || (v as any)?.batteryType || '';
                            const batteryCapacity = model?.batteryCapacity || (v as any)?.batteryCapacity || '';
                            const status = vehicle.currentStatus?.isActive ? 'Đang hoạt động' : 'Không hoạt động';
                            return (
                                <div key={vehicle._id} className="rounded-3xl border border-primary/10 bg-gradient-to-br from-white via-white to-primary/5 shadow-sm overflow-hidden">
                                    <div className="flex items-start gap-4 p-6">
                                        <div className="rounded-2xl bg-white shadow p-3">
                                            <Car className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-xl font-semibold">{brand} {modelName}</h3>
                                                    <p className="text-sm text-synop-gray-medium flex items-center gap-1">
                                                        <Badge className="w-4 h-4 text-synop-gray-medium" />
                                                        Biển số • {v?.licensePlate || 'N/A'}
                                                    </p>
                                                </div>
                                                <span className={`text-xs px-3 py-1 rounded-full ${vehicle.currentStatus?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{status}</span>
                                            </div>

                                            {/* Info rows with green accent */}
                                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="rounded-2xl bg-green-50/60 border border-green-100 p-4">
                                                    <div className="text-synop-gray-medium uppercase tracking-wide text-xs">NĂM</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Hash className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-green-700">{v?.year || '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-green-50/60 border border-green-100 p-4">
                                                    <div className="text-synop-gray-medium uppercase tracking-wide text-xs">MÀU</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Palette className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-green-700">{v?.color || '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-green-50/60 border border-green-100 p-4">
                                                    <div className="text-synop-gray-medium uppercase tracking-wide text-xs">LOẠI PIN</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Battery className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-green-700">{batteryType || '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-green-50/60 border border-green-100 p-4">
                                                    <div className="text-synop-gray-medium uppercase tracking-wide text-xs">PIN (kWh)</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Battery className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-green-700">{batteryCapacity || '—'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions - wide pill buttons */}
                                            <div className="mt-6 grid grid-cols-3 gap-3">
                                                <button onClick={() => openView(vehicle)} className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-primary hover:bg-primary/10">
                                                    <Info className="w-4 h-4" /> Chi tiết
                                                </button>
                                                <button onClick={() => openEdit(vehicle)} className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-amber-700 hover:bg-amber-100">
                                                    <Pencil className="w-4 h-4" /> Sửa
                                                </button>
                                                <button onClick={() => openDelete(vehicle)} className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100">
                                                    <Trash2 className="w-4 h-4" /> Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={handleCloseAdd} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold">Thêm xe mới</h2>
                            <p className="text-sm text-synop-gray-medium mt-1">Nhập thông tin xe để quản lý và đặt lịch bảo dưỡng.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-700">{formError}</div>
                            )}
                            {successMsg && (
                                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-green-700">{successMsg}</div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hãng xe</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        value={form.vehicleInfo.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                    >
                                        <option value="">Chọn hãng</option>
                                        {brands.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dòng xe</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder="VD: VF 8"
                                        value={form.vehicleInfo.modelName}
                                        onChange={(e) => handleChange('modelName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Năm sản xuất</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        value={form.vehicleInfo.year}
                                        onChange={(e) => handleChange('year', Number(e.target.value))}
                                        min={1970}
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Biển số</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder="VD: 30G-123.45"
                                        value={form.vehicleInfo.licensePlate}
                                        onChange={(e) => handleChange('licensePlate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Màu xe</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder="VD: Trắng"
                                        value={form.vehicleInfo.color}
                                        onChange={(e) => handleChange('color', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại pin</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder="VD: Lithium-ion"
                                        value={form.vehicleInfo.batteryType}
                                        onChange={(e) => handleChange('batteryType', e.target.value)}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Dung lượng pin (kWh)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder="VD: 82"
                                        value={form.vehicleInfo.batteryCapacity}
                                        onChange={(e) => handleChange('batteryCapacity', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={handleCloseAdd} className="rounded-lg border border-gray-300 px-4 py-2 text-synop-gray-medium hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={createVehicleLoading} className="rounded-lg bg-primary px-4 py-2 text-white hover:opacity-90 disabled:opacity-60">
                                    {createVehicleLoading ? 'Đang lưu...' : 'Lưu xe'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewOpen && selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeAllActionModals} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="rounded-xl bg-primary/10 p-2">
                                <Info className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Chi tiết xe</h2>
                                <p className="text-sm text-synop-gray-medium">Thông tin chi tiết của xe đã chọn</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {(() => {
                                const v = selectedVehicle.vehicleInfo;
                                const model = v?.vehicleModel as any;
                                const brand = model?.brand || (v as any)?.brand || '';
                                const modelName = model?.modelName || (v as any)?.modelName || '';
                                const batteryType = model?.batteryType || (v as any)?.batteryType || '';
                                const batteryCapacity = model?.batteryCapacity || (v as any)?.batteryCapacity || '';
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="rounded-lg border p-3">
                                            <div className="text-synop-gray-medium">Hãng - Dòng</div>
                                            <div className="font-medium">{brand} {modelName}</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-synop-gray-medium">Biển số</div>
                                            <div className="font-medium">{v?.licensePlate || '—'}</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-synop-gray-medium">Năm</div>
                                            <div className="font-medium">{v?.year || '—'}</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-synop-gray-medium">Màu</div>
                                            <div className="font-medium">{v?.color || '—'}</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-synop-gray-medium">Loại pin</div>
                                            <div className="font-medium">{batteryType || '—'}</div>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                            <div className="text-synop-gray-medium">PIN (kWh)</div>
                                            <div className="font-medium">{batteryCapacity || '—'}</div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex items-center justify-end">
                            <button onClick={closeAllActionModals} className="rounded-lg border border-gray-300 px-4 py-2 text-synop-gray-medium hover:bg-gray-50">Đóng</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal (UI only) */}
            {isEditOpen && selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeAllActionModals} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="rounded-xl bg-amber-100 p-2">
                                <Pencil className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Sửa thông tin xe</h2>
                                <p className="text-sm text-synop-gray-medium">Tính năng sẽ được kích hoạt khi BE sẵn sàng</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-amber-800">
                                Hiện tại chỉ demo giao diện. Khi có API cập nhật, form này sẽ được nối để sửa trực tiếp.
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={closeAllActionModals} className="rounded-lg border border-gray-300 px-4 py-2 text-synop-gray-medium hover:bg-gray-50">Đóng</button>
                            <button disabled className="rounded-lg bg-amber-400/60 px-4 py-2 text-white cursor-not-allowed">Lưu (đang tạm khóa)</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm (UI only) */}
            {isDeleteOpen && selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeAllActionModals} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="rounded-xl bg-red-100 p-2">
                                <Trash2 className="w-5 h-5 text-red-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Xóa xe</h2>
                                <p className="text-sm text-synop-gray-medium">Bạn có chắc muốn xóa xe này? Hành động không thể hoàn tác.</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="rounded-lg border p-3 text-sm">
                                {(() => {
                                    const v = selectedVehicle.vehicleInfo;
                                    const model = v?.vehicleModel as any;
                                    const brand = model?.brand || (v as any)?.brand || '';
                                    const modelName = model?.modelName || (v as any)?.modelName || '';
                                    return <div><span className="font-medium">{brand} {modelName}</span> • {v?.licensePlate || ''}</div>;
                                })()}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={closeAllActionModals} className="rounded-lg border border-gray-300 px-4 py-2 text-synop-gray-medium hover:bg-gray-50">Hủy</button>
                            <button disabled className="rounded-lg bg-red-500/70 px-4 py-2 text-white cursor-not-allowed">Xóa (đang tạm khóa)</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

export default ManageVehiclesCustomer;




