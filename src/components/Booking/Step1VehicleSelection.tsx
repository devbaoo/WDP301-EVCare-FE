import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, message, Spin } from 'antd';
import { Car, Plus, Check, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { fetchVehicles, createVehicle, setSelectedVehicle } from '../../services/features/booking/bookingSlice';
import { Vehicle, CreateVehicleData } from '../../interfaces/vehicle';
import axiosInstance from '../../services/constant/axiosInstance';
import { VEHICLE_BRANDS_ENDPOINT } from '../../services/constant/apiConfig';

interface Step1VehicleSelectionProps {
    onNext: () => void;
}

const Step1VehicleSelection: React.FC<Step1VehicleSelectionProps> = ({ onNext }) => {
    const dispatch = useAppDispatch();
    const { vehicles, selectedVehicle, loading, createVehicleLoading } = useAppSelector((state) => state.booking);
    const { user } = useAppSelector((state) => state.auth);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState<CreateVehicleData>({
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

    const [brands, setBrands] = useState<string[]>([]);

    // Battery type now free text input

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchVehicles());
        }
    }, [dispatch, user?.id]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await axiosInstance.get(VEHICLE_BRANDS_ENDPOINT);
                if (res.data?.success && Array.isArray(res.data.data)) {
                    setBrands(res.data.data as string[]);
                }
            } catch {
                // fallback: leave brands empty
            }
        };
        fetchBrands();
    }, []);

    const handleSelectVehicle = (vehicle: Vehicle) => {
        // Toggle select: if clicking the same vehicle, unselect it
        if (selectedVehicle?._id === vehicle._id) {
            dispatch(setSelectedVehicle(null));
        } else {
            dispatch(setSelectedVehicle(vehicle));
        }
    };

    const handleCreateVehicle = async () => {
        // Validations
        const { brand, modelName, batteryType, licensePlate, color } = formData.vehicleInfo;
        if (!brand || !modelName || !batteryType || !licensePlate || !color) {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        // License plate: 1-2 digits + 1 letter + '-' + 4-5 digits (e.g., 30A-12345 or 9B-1234)
        const plateOk = /^\d{1,2}[A-Z]-\d{4,5}$/.test(licensePlate.trim());
        if (!plateOk) {
            message.error('Biển số phải có định dạng: (VD: 30A-12345 hoặc 9B-1234)');
            return;
        }

        try {
            await dispatch(createVehicle(formData)).unwrap();
            message.success('Thêm xe thành công!');
            setShowCreateForm(false);
            setFormData({
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
        } catch (error: unknown) {
            message.error((error as string) || 'Có lỗi xảy ra khi thêm xe');
        }
    };

    const handleNext = () => {
        if (!selectedVehicle) {
            message.error('Vui lòng chọn xe hoặc tạo xe mới');
            return;
        }
        onNext();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn xe của bạn</h2>
                <p className="text-gray-600">Chọn xe hiện có hoặc thêm xe mới để đặt lịch bảo dưỡng</p>
            </div>

            {/* Existing Vehicles */}
            {vehicles.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Xe hiện có</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vehicles.map((vehicle) => (
                            <Card
                                key={vehicle._id}
                                hoverable
                                className={`cursor-pointer transition-all duration-200 ${selectedVehicle?._id === vehicle._id
                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                    : 'hover:shadow-lg'
                                    }`}
                                onClick={() => handleSelectVehicle(vehicle)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Car className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {vehicle.vehicleInfo.vehicleModel.brand} {vehicle.vehicleInfo.vehicleModel.modelName}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {vehicle.vehicleInfo.licensePlate} • {vehicle.vehicleInfo.year}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {vehicle.vehicleInfo.color} • {vehicle.vehicleInfo.vehicleModel.batteryType}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedVehicle?._id === vehicle._id && (
                                        <Check className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Add New Vehicle Button */}
            <div className="text-center">
                <Button
                    type="dashed"
                    size="large"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-500"
                >
                    {showCreateForm ? 'Hủy thêm xe' : 'Thêm xe mới'}
                </Button>
            </div>

            {/* Create Vehicle Form */}
            {showCreateForm && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe mới</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hãng xe *
                            </label>
                            <Select
                                placeholder="Chọn hãng xe"
                                value={formData.vehicleInfo.brand}
                                onChange={(value) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, brand: value }
                                })}
                                className="w-full"
                                options={brands.map(brand => ({ label: brand, value: brand }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên mẫu xe *
                            </label>
                            <Input
                                placeholder="Nhập tên mẫu xe"
                                value={formData.vehicleInfo.modelName}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, modelName: e.target.value }
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Năm sản xuất
                            </label>
                            <Input
                                type="number"
                                placeholder="2023"
                                value={formData.vehicleInfo.year}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, year: parseInt(e.target.value) || new Date().getFullYear() }
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại pin *
                            </label>
                            <Input
                                placeholder="Ví dụ: LFP, NMC..."
                                value={formData.vehicleInfo.batteryType}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, batteryType: e.target.value }
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Biển số xe *
                            </label>
                            <Input
                                placeholder="30A-12345"
                                value={formData.vehicleInfo.licensePlate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, licensePlate: e.target.value }
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Màu sắc *
                            </label>
                            <Input
                                placeholder="Ví dụ: White"
                                value={formData.vehicleInfo.color}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, color: e.target.value }
                                })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dung lượng pin (kWh)
                            </label>
                            <Input
                                placeholder="77"
                                value={formData.vehicleInfo.batteryCapacity}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vehicleInfo: { ...formData.vehicleInfo, batteryCapacity: e.target.value }
                                })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button onClick={() => setShowCreateForm(false)}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            loading={createVehicleLoading}
                            onClick={handleCreateVehicle}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Thêm xe
                        </Button>
                    </div>
                </Card>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-6">
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRight className="w-5 h-5" />}
                    onClick={handleNext}
                    disabled={!selectedVehicle}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Tiếp theo
                </Button>
            </div>
        </div>
    );
};

export default Step1VehicleSelection;
