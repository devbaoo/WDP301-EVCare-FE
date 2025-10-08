import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Spin, message, Pagination, Popover, Checkbox, Space } from 'antd';
import { MapPin, Phone, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { fetchServiceCenters, fetchNearbyServiceCenters, setSelectedServiceCenter } from '../../services/features/serviceCenter/serviceCenterSlice';
import { ServiceCenter } from '../../interfaces/serviceCenter';
import RealTimeStatus from '../ServiceCenter/RealTimeStatus';
import { isCurrentlyOpen } from '../../lib/timeUtils';
import { useServiceCenterRatings } from '../../hooks/useServiceCenterRatings';

interface Step2ServiceCenterSelectionProps {
    onNext: () => void;
    onPrev: () => void;
}

const Step2ServiceCenterSelection: React.FC<Step2ServiceCenterSelectionProps> = ({ onNext, onPrev }) => {
    const dispatch = useAppDispatch();
    const { serviceCenters, selectedServiceCenter, loading } = useAppSelector((state) => state.serviceCenter);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterSelection, setFilterSelection] = useState<'all' | 'nearby'>('all');

    // Use the ratings hook
    const { getEnhancedServiceCenters, loading: ratingsLoading } = useServiceCenterRatings(serviceCenters);

    useEffect(() => {
        // Load all centers initially; don't auto-nearby to ensure "Gần tôi" uses latest location on click
        dispatch(fetchServiceCenters({}));
    }, [dispatch]);

    // Get enhanced service centers with ratings
    const enhancedServiceCenters = getEnhancedServiceCenters();

    const filteredServiceCenters = enhancedServiceCenters.filter((center: ServiceCenter) => {
        const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            center.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
            center.address.district.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || center.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const paginatedServiceCenters = filteredServiceCenters.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleSelectServiceCenter = (center: ServiceCenter) => {
        // Don't allow selection of closed centers
        if (!canSelectServiceCenter(center)) {
            return;
        }

        if (selectedServiceCenter?._id === center._id) {
            dispatch(setSelectedServiceCenter(null));
        } else {
            dispatch(setSelectedServiceCenter(center));
        }
    };

    const handleNext = () => {
        if (!selectedServiceCenter) {
            message.error('Vui lòng chọn trung tâm dịch vụ');
            return;
        }

        if (!canSelectServiceCenter(selectedServiceCenter)) {
            message.error('Trung tâm đã chọn hiện không hoạt động. Vui lòng chọn trung tâm khác.');
            return;
        }

        onNext();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'maintenance': return 'orange';
            case 'inactive': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'maintenance': return 'Bảo trì';
            case 'inactive': return 'Tạm dừng';
            default: return status;
        }
    };

    // Check if service center is currently open
    const isServiceCenterOpen = (center: ServiceCenter) => {
        if (!center.operatingHours) return false;
        return isCurrentlyOpen(center.operatingHours);
    };

    // Check if service center can be selected (open and active status)
    const canSelectServiceCenter = (center: ServiceCenter) => {
        return center.status === 'active' && isServiceCenterOpen(center);
    };

    if (loading || ratingsLoading) {
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chọn trung tâm dịch vụ</h2>
                <p className="text-gray-600">Tìm và chọn trung tâm dịch vụ gần bạn nhất</p>
            </div>

            {/* Search + Filter */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Tìm kiếm theo tên, địa chỉ..."
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12"
                        />
                    </div>
                    <div className="flex items-center">
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
                                            checked={filterSelection === 'all'}
                                            onChange={() => setFilterSelection('all')}
                                        >Tất cả</Checkbox>
                                        <Checkbox
                                            checked={filterSelection === 'nearby'}
                                            onChange={() => setFilterSelection('nearby')}
                                        >Gần tôi</Checkbox>
                                    </Space>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button size="small" onClick={() => setFilterSelection('all')}>Reset</Button>
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => {
                                                setFilterOpen(false);
                                                if (filterSelection === 'all') {
                                                    setStatusFilter('all');
                                                    dispatch(fetchServiceCenters({}));
                                                } else {
                                                    if (!navigator.geolocation) {
                                                        message.warning('Trình duyệt không hỗ trợ định vị.');
                                                        return;
                                                    }
                                                    navigator.geolocation.getCurrentPosition(
                                                        (pos) => {
                                                            dispatch(fetchNearbyServiceCenters({
                                                                lat: pos.coords.latitude,
                                                                lng: pos.coords.longitude,
                                                                radius: 20,
                                                            }));
                                                        },
                                                        () => message.warning('Không lấy được vị trí hiện tại. Vui lòng bật quyền định vị.'),
                                                        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
                                                    );
                                                }
                                            }}
                                        >OK</Button>
                                    </div>
                                </div>
                            }
                        >
                            <Button className="h-12">Filters</Button>
                        </Popover>
                    </div>
                </div>
            </div>

            {/* Service Centers List */}
            <div className="space-y-4">
                {filteredServiceCenters.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Không tìm thấy trung tâm nào</h3>
                        <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {paginatedServiceCenters.map((center) => {
                                const canSelect = canSelectServiceCenter(center);
                                const isSelected = selectedServiceCenter?._id === center._id;

                                return (
                                    <Card
                                        key={center._id}
                                        hoverable={canSelect}
                                        className={`transition-all duration-200 ${canSelect
                                            ? `cursor-pointer ${isSelected
                                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                                : 'hover:shadow-lg'
                                            }`
                                            : 'cursor-not-allowed opacity-60'
                                            }`}
                                        onClick={() => canSelect && handleSelectServiceCenter(center)}
                                    >
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {center.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {center.description}
                                                    </p>
                                                </div>
                                                <Tag color={getStatusColor(center.status)} className="ml-2">
                                                    {getStatusText(center.status)}
                                                </Tag>
                                            </div>

                                            {/* Address */}
                                            <div className="flex items-start space-x-2">
                                                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm text-gray-600">
                                                    <p className="font-medium">{center.address.street}</p>
                                                    <p>{center.address.ward}, {center.address.district}, {center.address.city}</p>
                                                </div>
                                            </div>

                                            {/* Contact */}
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">{center.contact.phone}</span>
                                            </div>


                                            {/* Operating Hours */}
                                            <div className="flex items-center space-x-2">

                                                <RealTimeStatus
                                                    operatingHours={center.operatingHours}
                                                    className="text-sm"
                                                    showNextOpening={true}
                                                />
                                            </div>

                                            {/* Services Preview */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="flex flex-wrap gap-1">
                                                    {center.services.slice(0, 3).map((service) => (
                                                        <Tag key={service._id} color="blue" className="text-xs">
                                                            {service.name}
                                                        </Tag>
                                                    ))}
                                                    {center.services.length > 3 && (
                                                        <Tag color="default" className="text-xs">
                                                            +{center.services.length - 3}
                                                        </Tag>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Disabled message for closed centers */}
                                            {!canSelect && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <div className="text-center py-2">
                                                        <div className="text-sm text-red-600 font-medium">
                                                            {center.status !== 'active'
                                                                ? 'Trung tâm tạm dừng hoạt động'
                                                                : 'Trung tâm đang đóng cửa'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-4">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filteredServiceCenters.length}
                                showSizeChanger={false}
                                onChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                )}
            </div>

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
                    disabled={!selectedServiceCenter}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Tiếp theo
                </Button>
            </div>
        </div>
    );
};

export default Step2ServiceCenterSelection;