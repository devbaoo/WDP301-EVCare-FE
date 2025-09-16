import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Spin, message, Collapse, Badge, Space, Popover, Checkbox, Pagination } from 'antd';
import {
    Wrench,
    Clock,
    DollarSign,
    Star,
    ArrowRight,
    ArrowLeft,
    Search,
    Check,
    AlertCircle,
    Info
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { fetchCompatibleServices, fetchCompatiblePackages, setSelectedService, setSelectedServicePackage, updateBookingData } from '../../services/features/booking/bookingSlice';
import { ServiceType, ServicePackage } from '../../interfaces/booking';

const { Panel } = Collapse;

interface Step3ServiceSelectionProps {
    onNext: () => void;
    onPrev: () => void;
}

const Step3ServiceSelection: React.FC<Step3ServiceSelectionProps> = ({ onNext, onPrev }) => {
    const dispatch = useAppDispatch();
    const {
        compatibleServices,
        compatiblePackages,
        selectedService,
        selectedServicePackage,
        selectedVehicle,
        loading
    } = useAppSelector((state) => state.booking);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [filterMode, setFilterMode] = useState<'all' | 'services' | 'packages'>('all');
    const [filterOpen, setFilterOpen] = useState(false);
    const [tempFilterMode, setTempFilterMode] = useState<'all' | 'services' | 'packages'>(filterMode);
    const [tempCategory, setTempCategory] = useState<string>('all');
    const isInspectionOnly = useAppSelector((s) => s.booking.bookingData.isInspectionOnly) || false;
    const [servicesPage, setServicesPage] = useState(1);
    const [packagesPage, setPackagesPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        if (selectedVehicle?._id) {
            dispatch(fetchCompatibleServices(selectedVehicle._id));
            dispatch(fetchCompatiblePackages(selectedVehicle._id));
        }
    }, [dispatch, selectedVehicle?._id]);

    const filteredServices = compatibleServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(compatibleServices.map(service => service.category))]
        .filter((c) => c !== 'maintenance');

    // Reset page when filters/search change
    useEffect(() => {
        setServicesPage(1);
        setPackagesPage(1);
    }, [searchTerm, categoryFilter, filterMode]);

    const pagedServices = filteredServices.slice((servicesPage - 1) * pageSize, servicesPage * pageSize);
    const pagedPackages = compatiblePackages.slice((packagesPage - 1) * pageSize, packagesPage * pageSize);

    const handleSelectService = (service: ServiceType) => {
        // Toggle: if clicking the same service, unselect it
        if (selectedService?._id === service._id) {
            dispatch(setSelectedService(null));
            return;
        }
        // Turn off inspection-only when choosing a service
        if (isInspectionOnly) dispatch(updateBookingData({ isInspectionOnly: false }));
        dispatch(setSelectedService(service));
    };

    const handleSelectPackage = (pkg: ServicePackage) => {
        // Toggle: if clicking the same package, unselect it
        if (selectedServicePackage?._id === pkg._id) {
            dispatch(setSelectedServicePackage(null));
            return;
        }
        // Turn off inspection-only when choosing a package
        if (isInspectionOnly) dispatch(updateBookingData({ isInspectionOnly: false }));
        dispatch(setSelectedServicePackage(pkg));
    };

    const handleToggleInspectionOnly = () => {
        const nextVal = !isInspectionOnly;
        dispatch(updateBookingData({ isInspectionOnly: nextVal }));
        if (nextVal) {
            // Clear any selected service or package
            dispatch(setSelectedService(null));
            dispatch(setSelectedServicePackage(null));
        }
    };

    const handleNext = () => {
        if (!selectedService && !selectedServicePackage && !isInspectionOnly) {
            message.error('Vui lòng chọn dịch vụ/gói hoặc chỉ kiểm tra');
            return;
        }
        onNext();
    };

    const formatPrice = (price?: number) => {
        if (typeof price !== 'number' || isNaN(price)) return 'N/A';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDuration = (minutes?: number) => {
        if (typeof minutes !== 'number' || isNaN(minutes)) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const formatPercent = (value?: number) => {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        return `${value}%`;
    };

    const formatPriority = (value?: number) => {
        if (typeof value !== 'number' || isNaN(value)) return 'N/A';
        return `${value}/5`;
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'red';
            default: return 'default';
        }
    };

    const getComplexityText = (complexity: string) => {
        switch (complexity) {
            case 'easy': return 'Dễ';
            case 'medium': return 'Trung bình';
            case 'hard': return 'Khó';
            default: return complexity;
        }
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn dịch vụ</h2>
                <p className="text-gray-600">
                    Dịch vụ tương thích với {selectedVehicle?.vehicleInfo.vehicleModel.brand} {selectedVehicle?.vehicleInfo.vehicleModel.modelName}
                </p>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm dịch vụ..."
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12"
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap items-center">
                        <Popover
                            trigger="click"
                            open={filterOpen}
                            onOpenChange={setFilterOpen}
                            overlayStyle={{ width: 260 }}
                            content={
                                <div className="space-y-3">
                                    <div className="text-sm font-medium text-gray-700">Bộ lọc</div>
                                    <Space direction="vertical">
                                        <Checkbox
                                            checked={tempFilterMode === 'all'}
                                            onChange={() => setTempFilterMode('all')}
                                        >Tất cả</Checkbox>
                                        <Checkbox
                                            checked={tempFilterMode === 'services'}
                                            onChange={() => setTempFilterMode('services')}
                                        >Dịch vụ</Checkbox>
                                        <Checkbox
                                            checked={tempFilterMode === 'packages'}
                                            onChange={() => setTempFilterMode('packages')}
                                        >Gói dịch vụ</Checkbox>
                                        <div className="pt-2 text-xs text-gray-500">Danh mục</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {categories.map(category => (
                                                <Button
                                                    key={category}
                                                    size="small"
                                                    type={tempCategory === category ? 'primary' : 'default'}
                                                    onClick={() => setTempCategory(category)}
                                                >
                                                    {category === 'repair' ? 'Sửa chữa' :
                                                        category === 'inspection' ? 'Kiểm tra' : category}
                                                </Button>
                                            ))}
                                        </div>
                                    </Space>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button size="small" onClick={() => { setTempFilterMode('all'); setTempCategory(categories[0] || ''); }}>Reset</Button>
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => {
                                                setFilterMode(tempFilterMode);
                                                setCategoryFilter(tempCategory || 'all');
                                                setFilterOpen(false);
                                            }}
                                        >OK</Button>
                                    </div>
                                </div>
                            }
                        >
                            <Button className="h-12">Filters</Button>
                        </Popover>
                        {/* Category pills are moved into the Filters popover as requested */}
                    </div>
                </div>
            </div>

            {/* Services List */}
            {filterMode !== 'packages' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Dịch vụ ({filteredServices.length})</h3>
                    </div>
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-12">
                            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy dịch vụ nào</h3>
                            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {pagedServices.map((service) => (
                                    <Card
                                        key={service._id}
                                        hoverable
                                        className={`cursor-pointer transition-all duration-200 ${selectedService?._id === service._id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'hover:shadow-lg'
                                            }`}
                                        onClick={() => handleSelectService(service)}
                                    >
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {service.name}
                                                        </h3>
                                                        {service.isPopular && (
                                                            <Badge count="Phổ biến" style={{ backgroundColor: '#52c41a' }} />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        {service.description}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{formatDuration(service?.serviceDetails?.duration)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            <span>{formatPrice(service?.pricing?.basePrice)}</span>
                                                        </div>
                                                        <Tag color={getComplexityColor(service?.serviceDetails?.complexity || '')}>
                                                            {service?.serviceDetails?.complexity ? getComplexityText(service.serviceDetails.complexity) : 'N/A'}
                                                        </Tag>
                                                    </div>
                                                </div>
                                                {selectedService?._id === service._id && (
                                                    <Check className="w-6 h-6 text-blue-600" />
                                                )}
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {service.tags.map((tag, index) => (
                                                    <Tag key={index} color="blue" className="text-xs">
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </div>

                                            {/* Service Details */}
                                            <Collapse ghost>
                                                <Panel
                                                    header={
                                                        <div className="flex items-center space-x-2">
                                                            <Info className="w-4 h-4" />
                                                            <span className="font-medium">Chi tiết dịch vụ</span>
                                                        </div>
                                                    }
                                                    key="1"
                                                >
                                                    <div className="space-y-4">
                                                        {/* AI Data */}
                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                                                <Star className="w-4 h-4 text-yellow-500" />
                                                                <span>Thông tin AI</span>
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Thời gian trung bình:</span>
                                                                    <span className="font-medium ml-2">{formatDuration(service?.aiData?.averageCompletionTime)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Tỷ lệ thành công:</span>
                                                                    <span className="font-medium ml-2">{formatPercent(service?.aiData?.successRate)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Độ ưu tiên:</span>
                                                                    <span className="font-medium ml-2">{formatPriority(service?.priority)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Required Parts */}
                                                        {service.requiredParts.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                                                    <span className="w-4 h-4 text-blue-500">🔧</span>
                                                                    <span>Phụ tùng cần thiết</span>
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {service.requiredParts.map((part, index) => (
                                                                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                                            <div>
                                                                                <span className="font-medium">{part.partName}</span>
                                                                                <span className="text-sm text-gray-600 ml-2">
                                                                                    ({typeof part.quantity === 'number' ? part.quantity : '—'}x {part.partType || '—'})
                                                                                </span>
                                                                                {part.isOptional && (
                                                                                    <Tag color="orange" className="ml-2">Tùy chọn</Tag>
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium text-blue-600">
                                                                                {formatPrice(part?.estimatedCost)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Safety Requirements */}
                                                        {service.requirements.safetyRequirements.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                                    <span>Yêu cầu an toàn</span>
                                                                </h4>
                                                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                                                    {service.requirements.safetyRequirements.map((req, index) => (
                                                                        <li key={index}>{req}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            {filteredServices.length > pageSize && (
                                <div className="flex justify-center pt-2">
                                    <Pagination
                                        current={servicesPage}
                                        pageSize={pageSize}
                                        total={filteredServices.length}
                                        showSizeChanger={false}
                                        onChange={(p) => setServicesPage(p)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Packages List */}
            {filterMode !== 'services' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Gói dịch vụ phù hợp ({compatiblePackages.length})</h3>
                    </div>
                    {compatiblePackages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Chưa có gói phù hợp cho xe này</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {pagedPackages.map((pkg: ServicePackage) => (
                                    <Card
                                        key={pkg._id}
                                        hoverable
                                        className={`cursor-pointer transition-all duration-200 ${selectedServicePackage?._id === pkg._id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'hover:shadow-lg'
                                            }`}
                                        onClick={() => handleSelectPackage(pkg)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-base font-semibold text-gray-900">{pkg.packageName}</h4>
                                                <p className="text-sm text-gray-600 mb-1">{pkg.description}</p>
                                                <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                                                    <span>Thời hạn: {pkg.durationMonths} tháng</span>
                                                    <span>Tối đa: {pkg.maxServicesPerMonth}/tháng</span>
                                                    <span className="font-semibold text-blue-600">{formatPrice(pkg.price)}</span>
                                                </div>
                                                {pkg.includedServices?.length > 0 && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Bao gồm: {pkg.includedServices.slice(0, 4).map(s => s.name).join(', ')}{pkg.includedServices.length > 4 ? '…' : ''}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedServicePackage?._id === pkg._id && (
                                                <Check className="w-6 h-6 text-blue-600" />
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            {compatiblePackages.length > pageSize && (
                                <div className="flex justify-center pt-2">
                                    <Pagination
                                        current={packagesPage}
                                        pageSize={pageSize}
                                        total={compatiblePackages.length}
                                        showSizeChanger={false}
                                        onChange={(p) => setPackagesPage(p)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Inspection-only Option (bottom) */}
            <Card className={`border-2 ${isInspectionOnly ? 'border-blue-300 bg-blue-50' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Chỉ mang xe tới kiểm tra</h3>
                        <p className="text-sm text-gray-600">Không chọn dịch vụ cụ thể, chỉ kiểm tra tình trạng</p>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={handleToggleInspectionOnly}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${isInspectionOnly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {isInspectionOnly ? 'Đã chọn' : 'Chọn'}
                        </button>
                    </div>
                </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
                <Button
                    size="large"
                    icon={<ArrowLeft className="w-5 h-5" />}
                    onClick={onPrev}
                >
                    Quay lại
                </Button>
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRight className="w-5 h-5" />}
                    onClick={handleNext}
                    disabled={!selectedService && !selectedServicePackage && !isInspectionOnly}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Tiếp theo
                </Button>
            </div>
        </div>
    );
};

export default Step3ServiceSelection;
