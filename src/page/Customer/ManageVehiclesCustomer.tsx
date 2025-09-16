import Header from '@/components/Header/Header';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { createVehicle, fetchVehicles, updateVehicle, deleteVehicle, mergeLocalVehicleFields } from '@/services/features/vehicle/vehicleSlice';
import type { CreateVehicleData, Vehicle } from '@/interfaces/vehicle';
import axiosInstance from '@/services/constant/axiosInstance';
import { VEHICLE_BRANDS_ENDPOINT } from '@/services/constant/apiConfig';
import { Car, Badge, Palette, Battery, Hash, Pencil, Trash2, Info } from 'lucide-react';

function ManageVehiclesCustomer() {
    const dispatch = useAppDispatch();
    const { vehicles, loading, error, createVehicleLoading } = useAppSelector((s) => s.vehicle);

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

    // Edit form fields (aligned with BE: vehicleInfo fields + currentStatus + notes)
    const [editPlate, setEditPlate] = useState<string>('');
    const [editColor, setEditColor] = useState<string>('');
    const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
    const [editBrand, setEditBrand] = useState<string>('');
    const [editModelName, setEditModelName] = useState<string>('');
    const [editBatteryType, setEditBatteryType] = useState<string>('');
    const [editBatteryCapacity, setEditBatteryCapacity] = useState<string>('');
    // Các trường currentStatus (km, %pin, trạng thái) KHÔNG cập nhật vì BE chưa công bố API đó
    const [editSaving, setEditSaving] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        const errors: Record<string, string> = {};
        if (!v.brand) errors.brand = 'Bắt buộc';
        if (!v.modelName) errors.modelName = 'Bắt buộc';
        if (!v.licensePlate) errors.licensePlate = 'Bắt buộc';
        if (!v.color) errors.color = 'Bắt buộc';
        if (!v.batteryType) errors.batteryType = 'Bắt buộc';
        if (!v.batteryCapacity) errors.batteryCapacity = 'Bắt buộc';
        if (!v.year) errors.year = 'Bắt buộc';
        const y = Number(v.year);
        if (v.year && (y < 1970 || y > new Date().getFullYear() + 1)) errors.year = 'Năm không hợp lệ';
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return 'Vui lòng điền đầy đủ thông tin.';
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
            // Đồng bộ lại danh sách từ BE để tránh trạng thái lệch
            dispatch(fetchVehicles());
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
        // prefill editable fields from BE model
        setEditPlate(v.vehicleInfo?.licensePlate || '');
        setEditColor(v.vehicleInfo?.color || '');
        setEditYear(v.vehicleInfo?.year || new Date().getFullYear());
        const vi: any = v.vehicleInfo || {};
        const vm: any = vi.vehicleModel || {};
        setEditBrand(vm.brand || vi.brand || '');
        setEditModelName(vm.modelName || vi.modelName || '');
        setEditBatteryType(vm.batteryType || vi.batteryType || '');
        setEditBatteryCapacity(String(vm.batteryCapacity || vi.batteryCapacity || ''));
        // notes không còn dùng
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

    const saveEdit = async () => {
        if (!selectedVehicle) return;
        // Basic validation
        if (!editPlate) {
            alert('Vui lòng nhập biển số');
            return;
        }
        if (editYear < 1970 || editYear > new Date().getFullYear() + 1) {
            alert('Năm sản xuất không hợp lệ');
            return;
        }
        setEditSaving(true);
        const parsedCapacity = editBatteryCapacity !== '' && !Number.isNaN(Number(editBatteryCapacity))
            ? Number(editBatteryCapacity)
            : editBatteryCapacity || undefined;
        // BE persists licensePlate, color, year directly in vehicleInfo; brand/model/battery fields are tied to vehicleModel when adding
        const payload = {
            'vehicleInfo.licensePlate': editPlate,
            'vehicleInfo.color': editColor,
            'vehicleInfo.year': editYear,
        } as Record<string, unknown>;
        const action = await dispatch(updateVehicle({ vehicleId: selectedVehicle._id, updateData: payload }));
        setEditSaving(false);
        if ((action as any).error) {
            alert((action as any).payload || 'Cập nhật thất bại');
        } else {
            // Locally merge display fields so list/detail reflect edits without BE changes
            dispatch(mergeLocalVehicleFields({
                vehicleId: selectedVehicle._id,
                fields: {
                    brand: editBrand,
                    modelName: editModelName,
                    batteryType: editBatteryType,
                    batteryCapacity: parsedCapacity as any,
                },
            }));
            setIsEditOpen(false);
            // No immediate refetch to avoid overwriting local display fields
        }
    };

    const confirmDelete = async () => {
        if (!selectedVehicle) return;
        setDeleteLoading(true);
        const action = await dispatch(deleteVehicle(selectedVehicle._id));
        setDeleteLoading(false);
        if ((action as any).error) {
            alert((action as any).payload || 'Xóa thất bại');
        } else {
            setIsDeleteOpen(false);
            dispatch(fetchVehicles());
        }
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

                    {/* Khi chưa có xe, chỉ hiển thị hero phía trên theo yêu cầu */}

                    {/* Vehicles list - single column for premium look */}
                    <div className="grid grid-cols-1 gap-6">
                        {loading && vehicles.length === 0 && (
                            <div className="col-span-full text-center text-synop-gray-medium">Đang tải danh sách xe...</div>
                        )}
                        {vehicles.map((vehicle: Vehicle) => {
                            const v = vehicle.vehicleInfo;
                            const model = v?.vehicleModel as any;
                            // Ưu tiên các trường lưu trực tiếp trong vehicleInfo để phản ánh cập nhật
                            const brand = (v as any)?.brand || model?.brand || '';
                            const modelName = (v as any)?.modelName || model?.modelName || '';
                            const batteryType = (v as any)?.batteryType || model?.batteryType || '';
                            const batteryCapacity = (v as any)?.batteryCapacity || model?.batteryCapacity || '';
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

                                            {/* Info rows with green accent (chỉ trường công bố từ BE) */}
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
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.brand ? 'border-red-400' : 'border-gray-300'}`}
                                        value={form.vehicleInfo.brand}
                                        onChange={(e) => handleChange('brand', e.target.value)}
                                    >
                                        <option value="">Chọn hãng</option>
                                        {brands.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.brand && <p className="mt-1 text-xs text-red-600">{fieldErrors.brand}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dòng xe</label>
                                    <input
                                        type="text"
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.modelName ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="VD: VF 8"
                                        value={form.vehicleInfo.modelName}
                                        onChange={(e) => handleChange('modelName', e.target.value)}
                                    />
                                    {fieldErrors.modelName && <p className="mt-1 text-xs text-red-600">{fieldErrors.modelName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Năm sản xuất</label>
                                    <input
                                        type="number"
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.year ? 'border-red-400' : 'border-gray-300'}`}
                                        value={form.vehicleInfo.year}
                                        onChange={(e) => handleChange('year', Number(e.target.value))}
                                        min={1970}
                                        max={new Date().getFullYear() + 1}
                                    />
                                    {fieldErrors.year && <p className="mt-1 text-xs text-red-600">{fieldErrors.year}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Biển số</label>
                                    <input
                                        type="text"
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.licensePlate ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="VD: 30G-123.45"
                                        value={form.vehicleInfo.licensePlate}
                                        onChange={(e) => handleChange('licensePlate', e.target.value)}
                                    />
                                    {fieldErrors.licensePlate && <p className="mt-1 text-xs text-red-600">{fieldErrors.licensePlate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Màu xe</label>
                                    <input
                                        type="text"
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.color ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="VD: Trắng"
                                        value={form.vehicleInfo.color}
                                        onChange={(e) => handleChange('color', e.target.value)}
                                    />
                                    {fieldErrors.color && <p className="mt-1 text-xs text-red-600">{fieldErrors.color}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại pin</label>
                                    <input
                                        type="text"
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.batteryType ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="VD: Lithium-ion"
                                        value={form.vehicleInfo.batteryType}
                                        onChange={(e) => handleChange('batteryType', e.target.value)}
                                    />
                                    {fieldErrors.batteryType && <p className="mt-1 text-xs text-red-600">{fieldErrors.batteryType}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Dung lượng pin (kWh)</label>
                                    <input
                                        type="text"
                                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.batteryCapacity ? 'border-red-400' : 'border-gray-300'}`}
                                        placeholder="VD: 82"
                                        value={form.vehicleInfo.batteryCapacity}
                                        onChange={(e) => handleChange('batteryCapacity', e.target.value)}
                                    />
                                    {fieldErrors.batteryCapacity && <p className="mt-1 text-xs text-red-600">{fieldErrors.batteryCapacity}</p>}
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
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
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
                                const v = selectedVehicle.vehicleInfo as any;
                                const model = v?.vehicleModel as any;
                                const brand = v?.brand || model?.brand || '';
                                const modelName = v?.modelName || model?.modelName || '';
                                const batteryType = v?.batteryType || model?.batteryType || '';
                                const batteryCapacity = v?.batteryCapacity || model?.batteryCapacity || '';
                                // status bỏ hiển thị theo yêu cầu
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><div className="text-synop-gray-medium">Hãng - Dòng</div><div className="font-medium">{brand} {modelName}</div></div>
                                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><div className="text-synop-gray-medium">Biển số</div><div className="font-medium">{v?.licensePlate || '—'}</div></div>
                                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><div className="text-synop-gray-medium">Năm</div><div className="font-medium">{v?.year || '—'}</div></div>
                                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><div className="text-synop-gray-medium">Màu</div><div className="font-medium">{v?.color || '—'}</div></div>
                                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><div className="text-synop-gray-medium">Loại pin</div><div className="font-medium">{batteryType || '—'}</div></div>
                                        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><div className="text-synop-gray-medium">PIN (kWh)</div><div className="font-medium">{batteryCapacity || '—'}</div></div>
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

            {/* Edit Modal */}
            {isEditOpen && selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeAllActionModals} />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <div className="rounded-xl bg-amber-100 p-2">
                                <Pencil className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Sửa thông tin xe</h2>
                                <p className="text-sm text-synop-gray-medium">Cập nhật thông tin cơ bản, tình trạng và ghi chú</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Thống nhất label/field giống form Add. Tất cả các ô đều chỉnh sửa được theo yêu cầu */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Hãng xe */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Hãng xe</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        value={editBrand}
                                        onChange={(e) => setEditBrand(e.target.value)}
                                    >
                                        <option value="">Chọn hãng</option>
                                        {brands.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Dòng xe */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dòng xe</label>
                                    <input value={editModelName} onChange={(e) => setEditModelName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                {/* Năm sản xuất */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Năm sản xuất</label>
                                    <input type="number" value={editYear} min={1970} max={new Date().getFullYear() + 1} onChange={(e) => setEditYear(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                {/* Biển số */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Biển số</label>
                                    <input value={editPlate} onChange={(e) => setEditPlate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                {/* Màu xe */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Màu xe</label>
                                    <input value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                {/* Loại pin */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Loại pin</label>
                                    <input value={editBatteryType} onChange={(e) => setEditBatteryType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                {/* Dung lượng pin (kWh) */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Dung lượng pin (kWh)</label>
                                    <input value={editBatteryCapacity} onChange={(e) => setEditBatteryCapacity(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>
                            {/* Các trường currentStatus không cho chỉnh vì BE chưa công bố cập nhật */}
                            {/* Ghi chú đã bỏ theo yêu cầu */}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={closeAllActionModals} className="rounded-lg border border-gray-300 px-4 py-2 text-synop-gray-medium hover:bg-gray-50">Hủy</button>
                            <button onClick={saveEdit} disabled={editSaving} className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60">{editSaving ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm */}
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
                                    const v = selectedVehicle.vehicleInfo as any;
                                    const model = v?.vehicleModel as any;
                                    const brand = v?.brand || model?.brand || '';
                                    const modelName = v?.modelName || model?.modelName || '';
                                    return <div><span className="font-medium">{brand} {modelName}</span> • {v?.licensePlate || ''}</div>;
                                })()}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button onClick={closeAllActionModals} className="rounded-lg border border-gray-300 px-4 py-2 text-synop-gray-medium hover:bg-gray-50">Hủy</button>
                            <button onClick={confirmDelete} disabled={deleteLoading} className="rounded-lg bg-red-500 px-4 py-2 text-white hover:opacity-90 disabled:opacity-60">{deleteLoading ? 'Đang xóa...' : 'Xóa'}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

export default ManageVehiclesCustomer;




