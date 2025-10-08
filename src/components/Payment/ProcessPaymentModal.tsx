import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Input, Button, message, Alert, Typography, Divider } from 'antd';
import { DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { processPayment } from '@/services/features/technician/workProgressSlice';
import { ProcessPaymentPayload, WorkProgress } from '@/interfaces/workProgress';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProcessPaymentModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
    workProgress: WorkProgress | null;
}

const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    workProgress
}) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { processPaymentLoading, error } = useAppSelector((state) => state.workProgress);
    const { user } = useAppSelector((state) => state.auth);

    const [quoteAmount, setQuoteAmount] = useState<number>(0);

    useEffect(() => {
        if (workProgress && visible) {
            // Get quote amount from work progress
            const amount = workProgress.quote?.quoteAmount ||
                (workProgress.appointmentId && typeof workProgress.appointmentId === 'object'
                    ? workProgress.appointmentId.inspectionAndQuote?.quoteAmount
                    : 0) || 0;

            setQuoteAmount(amount);

            // Set form initial values
            form.setFieldsValue({
                paidAmount: amount,
                notes: ''
            });
        }
    }, [workProgress, visible, form]);

    type FormValues = { paidAmount: number; notes?: string };
    const handleSubmit = async (values: FormValues) => {
        if (!workProgress || !user?.id) {
            message.error('Thiếu thông tin cần thiết');
            return;
        }

        const payload: ProcessPaymentPayload = {
            staffId: user.id,
            paidAmount: values.paidAmount,
            notes: values.notes
        };

        try {
            const result = await dispatch(processPayment({
                workProgressId: workProgress._id,
                payload
            })).unwrap();

            if (result.success) {
                message.success('Xử lý thanh toán thành công!');
                form.resetFields();
                onSuccess?.();
                onCancel();
            }
        } catch {
            message.error('Xử lý thanh toán thất bại');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (!workProgress) {
        return null;
    }

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <DollarOutlined className="mr-2 text-green-600" />
                    <Title level={4} className="mb-0">Xử lý Thanh toán</Title>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <div className="space-y-4">
                {/* Work Progress Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <Text strong>Thông tin công việc:</Text>
                    <div className="mt-2 space-y-1">
                        <Text>ID: {workProgress._id.slice(-8)}</Text>
                        <br />
                        <Text>Kỹ thuật viên: {typeof workProgress.technicianId === 'object' ? workProgress.technicianId.email : workProgress.technicianId}</Text>
                        <br />
                        <Text>Ngày dịch vụ: {new Date(workProgress.serviceDate).toLocaleDateString('vi-VN')}</Text>
                    </div>
                </div>

                {/* Quote Amount Display */}
                {quoteAmount > 0 && (
                    <Alert
                        message="Số tiền báo giá"
                        description={
                            <div>
                                <Text strong className="text-lg text-green-600">
                                    {formatCurrency(quoteAmount)}
                                </Text>
                            </div>
                        }
                        type="info"
                        icon={<InfoCircleOutlined />}
                        showIcon
                    />
                )}

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                    />
                )}

                <Divider />

                {/* Payment Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={processPaymentLoading}
                >
                    <Form.Item
                        label={
                            <Text strong>
                                <DollarOutlined className="mr-1" />
                                Số tiền thanh toán
                            </Text>
                        }
                        name="paidAmount"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền thanh toán' },
                            { type: 'number', min: 0, message: 'Số tiền phải lớn hơn 0' }
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập số tiền thanh toán"
                            addonAfter="VND"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>Ghi chú</Text>}
                        name="notes"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập ghi chú về thanh toán (tùy chọn)"
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end space-x-2">
                            <Button onClick={handleCancel} size="large">
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={processPaymentLoading}
                                size="large"
                                className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            >
                                <DollarOutlined className="mr-1" />
                                Xử lý Thanh toán
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default ProcessPaymentModal;
