import React, { useState, useEffect } from 'react';
import { Card, Steps, Button } from 'antd';
import {
    Car,
    Building2,
    Wrench,
    Calendar,
    Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { resetBooking } from '../../services/features/booking/bookingSlice';
import { clearCurrentPayment } from '../../services/features/payment/paymentSlice';
import Step1VehicleSelection from '../../components/Booking/Step1VehicleSelection';
import Step2ServiceCenterSelection from '../../components/Booking/Step2ServiceCenterSelection';
import Step3ServiceSelection from '../../components/Booking/Step3ServiceSelection';
import Step4DateTimeAndDetails from '../../components/Booking/Step4DateTimeAndDetails';

const BookingPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentStep, selectedVehicle, selectedServiceCenter, selectedService } = useAppSelector((state) => state.booking);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Clear payment state when starting new booking
    useEffect(() => {
        dispatch(clearCurrentPayment());
    }, [dispatch]);

    const steps = [
        {
            title: 'Chọn xe',
            description: 'Chọn xe hoặc thêm xe mới',
            icon: <Car className="w-5 h-5" />,
            status: 'wait' as const,
        },
        {
            title: 'Chọn trung tâm',
            description: 'Tìm trung tâm dịch vụ',
            icon: <Building2 className="w-5 h-5" />,
            status: 'wait' as const,
        },
        {
            title: 'Chọn dịch vụ',
            description: 'Dịch vụ tương thích',
            icon: <Wrench className="w-5 h-5" />,
            status: 'wait' as const,
        },
        {
            title: 'Thông tin cuối',
            description: 'Ngày giờ & chi tiết',
            icon: <Calendar className="w-5 h-5" />,
            status: 'wait' as const,
        },
    ];

    useEffect(() => {
        setCurrentStepIndex(currentStep - 1);
    }, [currentStep]);

    const updateStepStatus = () => {
        return steps.map((step, index) => {
            if (index < currentStepIndex) {
                return { ...step, status: 'finish' as const };
            } else if (index === currentStepIndex) {
                return { ...step, status: 'process' as const };
            } else {
                return { ...step, status: 'wait' as const };
            }
        });
    };

    const scrollTop = () => requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            scrollTop();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
            scrollTop();
        }
    };

    const handleStepClick = (step: number) => {
        // Only allow going back to previous steps
        if (step <= currentStepIndex) {
            setCurrentStepIndex(step);
            scrollTop();
        }
    };

    const handleBackToHome = () => {
        dispatch(clearCurrentPayment()); // Clear payment state
        dispatch(resetBooking());
        navigate('/');
    };

    const renderStepContent = () => {
        switch (currentStepIndex) {
            case 0:
                return <Step1VehicleSelection onNext={handleNext} />;
            case 1:
                return <Step2ServiceCenterSelection onNext={handleNext} onPrev={handlePrev} />;
            case 2:
                return <Step3ServiceSelection onNext={handleNext} onPrev={handlePrev} />;
            case 3:
                return <Step4DateTimeAndDetails onPrev={handlePrev} />;
            default:
                return <Step1VehicleSelection onNext={handleNext} />;
        }
    };

    const canProceedToStep = (stepIndex: number) => {
        switch (stepIndex) {
            case 0:
                return true; // Always can start
            case 1:
                return !!selectedVehicle;
            case 2:
                return !!selectedVehicle && !!selectedServiceCenter;
            case 3:
                return !!selectedVehicle && !!selectedServiceCenter && !!selectedService;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Đặt lịch bảo dưỡng</h1>
                            <p className="text-gray-600 mt-2">Đặt lịch bảo dưỡng xe điện một cách dễ dàng</p>
                        </div>
                        <Button
                            icon={<Home className="w-4 h-4" />}
                            onClick={handleBackToHome}
                            className="flex items-center space-x-2"
                        >
                            Về trang chủ
                        </Button>
                    </div>

                    {/* Progress Steps */}
                    <Card className="mb-8">
                        <Steps
                            current={currentStepIndex}
                            items={updateStepStatus().map((step, index) => ({
                                title: (
                                    <div className="flex items-center space-x-2">
                                        {step.icon}
                                        <span className={index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'}>
                                            {step.title}
                                        </span>
                                    </div>
                                ),
                                description: step.description,
                                status: step.status,
                                onClick: () => handleStepClick(index),
                                className: `cursor-pointer ${canProceedToStep(index) ? 'hover:bg-gray-50' : 'cursor-not-allowed'}`,
                            }))}
                            className="w-full"
                        />
                    </Card>
                </div>

                {/* Step Content */}
                <Card className="min-h-[600px]">
                    <div className="p-6">
                        {renderStepContent()}
                    </div>
                </Card>

                {/* Progress Indicator */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                        <span>Bước {currentStepIndex + 1} / {steps.length}</span>
                        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Cần hỗ trợ? Liên hệ hotline: <span className="font-semibold text-blue-600">1900 1234</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;