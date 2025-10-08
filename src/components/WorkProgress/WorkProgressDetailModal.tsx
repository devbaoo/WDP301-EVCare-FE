import React from 'react';
import { Modal, Typography, Card, Tag, Space, Timeline, Row, Col, Spin } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ToolOutlined,
    CarOutlined
} from '@ant-design/icons';
import { WorkProgress } from '@/interfaces/workProgress';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface WorkProgressDetailModalProps {
    visible: boolean;
    onCancel: () => void;
    workProgress: WorkProgress | null;
    loading?: boolean;
}

const WorkProgressDetailModal: React.FC<WorkProgressDetailModalProps> = ({
    visible,
    onCancel,
    workProgress,
    loading = false
}) => {
    if (!workProgress) {
        return null;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    const formatDateTime = (dateString: string) => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    };

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            'not_started': 'default',
            'in_progress': 'processing',
            'paused': 'warning',
            'completed': 'success',
            'delayed': 'error',
            'inspection_completed': 'blue',
            'quote_provided': 'orange',
            'quote_approved': 'green',
            'quote_rejected': 'red',
        };
        return statusColors[status] || 'default';
    };

    const getStatusText = (status: string) => {
        const statusTexts: Record<string, string> = {
            'not_started': 'Chưa bắt đầu',
            'in_progress': 'Đang thực hiện',
            'paused': 'Tạm dừng',
            'completed': 'Hoàn thành',
            'delayed': 'Trễ hạn',
            'inspection_completed': 'Đã kiểm tra',
            'quote_provided': 'Đã báo giá',
            'quote_approved': 'Đã duyệt giá',
            'quote_rejected': 'Từ chối giá',
        };
        return statusTexts[status] || status;
    };

    const appointment = workProgress.appointmentId;
    const isAppointmentObject = (appt: typeof appointment): appt is Exclude<typeof appointment, string> => {
        return appt !== null && typeof appt === 'object';
    };

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <FileTextOutlined className="mr-2 text-blue-600" />
                    <Title level={4} className="mb-0">Chi tiết Công việc #{workProgress._id.slice(-8)}</Title>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={900}
            destroyOnHidden
        >
            {loading ? (
                <div className="text-center py-8">
                    <Spin size="large" />
                    <div className="mt-4">
                        <Text>Đang tải chi tiết...</Text>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header Info */}
                    <Card size="small">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <div className="flex items-center">
                                        <UserOutlined className="mr-2 text-gray-500" />
                                        <Text strong>Kỹ thuật viên:</Text>
                                        <Text>{typeof workProgress.technicianId === 'object' ? workProgress.technicianId.email : workProgress.technicianId}</Text>
                                    </div>
                                    <div className="flex items-center">
                                        <CalendarOutlined className="mr-2 text-gray-500" />
                                        <Text strong>Ngày dịch vụ:</Text>
                                        <Text>{formatDate(workProgress.serviceDate)}</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space direction="vertical" size="small">
                                    <div className="flex items-center">
                                        <Text strong>Trạng thái:</Text>
                                        <Tag color={getStatusColor(workProgress.currentStatus)}>
                                            {getStatusText(workProgress.currentStatus)}
                                        </Tag>
                                    </div>
                                    <div className="flex items-center">
                                        <Text strong>Tiến độ:</Text>
                                        <Text>{workProgress.progressPercentage || 0}%</Text>
                                    </div>
                                </Space>
                            </Col>
                        </Row>
                    </Card>

                    {/* Appointment Details */}
                    {isAppointmentObject(appointment) && (
                        <Card size="small" title={<><CarOutlined className="mr-2" />Thông tin lịch hẹn</>}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Space direction="vertical" size="small">
                                        <div>
                                            <Text strong>Thời gian hẹn:</Text>
                                            <br />
                                            <Text>{formatDateTime(appointment.appointmentTime?.date)} - {appointment.appointmentTime?.startTime}</Text>
                                        </div>
                                        {appointment.serviceDetails && (
                                            <div>
                                                <Text strong>Mô tả dịch vụ:</Text>
                                                <br />
                                                <Text>{appointment.serviceDetails.description}</Text>
                                            </div>
                                        )}
                                    </Space>
                                </Col>
                                <Col span={12}>
                                    <Space direction="vertical" size="small">
                                        {appointment.payment && (
                                            <div>
                                                <Text strong>Thanh toán cọc:</Text>
                                                <br />
                                                <Space>
                                                    <Tag color={appointment.payment.status === 'paid' ? 'green' : 'orange'}>
                                                        {appointment.payment.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                    </Tag>
                                                    <Text>{formatCurrency(appointment.payment.amount)}</Text>
                                                </Space>
                                            </div>
                                        )}
                                        {appointment.confirmation && appointment.confirmation.isConfirmed && (
                                            <div>
                                                <Text strong>Xác nhận:</Text>
                                                <br />
                                                <Tag color="green">Đã xác nhận</Tag>
                                            </div>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* Inspection & Quote */}
                    {(workProgress.inspection || workProgress.quote) && (
                        <Card size="small" title={<><ToolOutlined className="mr-2" />Kiểm tra & Báo giá</>}>
                            <Row gutter={[16, 16]}>
                                {workProgress.inspection && (
                                    <Col span={12}>
                                        <Space direction="vertical" size="small" className="w-full">
                                            <Text strong>Kết quả kiểm tra:</Text>
                                            {workProgress.inspection.vehicleCondition && (
                                                <div>
                                                    <Text strong>Tình trạng xe:</Text>
                                                    <br />
                                                    <Text>{workProgress.inspection.vehicleCondition}</Text>
                                                </div>
                                            )}
                                            {workProgress.inspection.diagnosisDetails && (
                                                <div>
                                                    <Text strong>Chuẩn đoán:</Text>
                                                    <br />
                                                    <Text>{workProgress.inspection.diagnosisDetails}</Text>
                                                </div>
                                            )}
                                            {workProgress.inspection.inspectionNotes && (
                                                <div>
                                                    <Text strong>Ghi chú kiểm tra:</Text>
                                                    <br />
                                                    <Text>{workProgress.inspection.inspectionNotes}</Text>
                                                </div>
                                            )}
                                        </Space>
                                    </Col>
                                )}
                                {workProgress.quote && (
                                    <Col span={12}>
                                        <Space direction="vertical" size="small" className="w-full">
                                            <Text strong>Báo giá:</Text>
                                            {workProgress.quote.quoteAmount && (
                                                <div>
                                                    <Text strong>Số tiền:</Text>
                                                    <br />
                                                    <Text className="text-lg text-green-600">{formatCurrency(workProgress.quote.quoteAmount)}</Text>
                                                </div>
                                            )}
                                            {workProgress.quote.quoteDetails && (
                                                <div>
                                                    <Text strong>Chi tiết:</Text>
                                                    <br />
                                                    {typeof workProgress.quote.quoteDetails === 'string' ? (
                                                        <Text>{workProgress.quote.quoteDetails}</Text>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {(() => {
                                                                type QuoteItem = { partId?: string; name?: string; quantity?: number; unitPrice?: number };
                                                                const details = workProgress.quote!.quoteDetails as unknown as { items?: QuoteItem[] };
                                                                const items = Array.isArray(details?.items) ? details.items : [];
                                                                if (items.length > 0) {
                                                                    return items.map((it, idx) => {
                                                                        const qty = Number(it?.quantity || 0);
                                                                        const price = Number(it?.unitPrice || 0);
                                                                        const line = `${it?.name || it?.partId || 'Mục'}: ${qty} x ${formatCurrency(price)} = ${formatCurrency(qty * price)}`;
                                                                        return <div key={idx}><Text>{line}</Text></div>;
                                                                    });
                                                                }
                                                                return <Text>-</Text>;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {workProgress.quote.quoteStatus && (
                                                <div>
                                                    <Text strong>Trạng thái:</Text>
                                                    <br />
                                                    <Tag color={workProgress.quote.quoteStatus === 'approved' ? 'green' : 'orange'}>
                                                        {workProgress.quote.quoteStatus === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                                    </Tag>
                                                </div>
                                            )}
                                        </Space>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    )}

                    {/* Payment Details */}
                    {workProgress.paymentDetails && (
                        <Card size="small" title={<><DollarOutlined className="mr-2" />Chi tiết thanh toán</>}>
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Space direction="vertical" size="small">
                                        <Text strong>Phương thức:</Text>
                                        <Text>{workProgress.paymentDetails.paymentMethod}</Text>
                                    </Space>
                                </Col>
                                <Col span={8}>
                                    <Space direction="vertical" size="small">
                                        <Text strong>Số tiền:</Text>
                                        <Text>{formatCurrency(workProgress.paymentDetails.paidAmount)}</Text>
                                    </Space>
                                </Col>
                                <Col span={8}>
                                    <Space direction="vertical" size="small">
                                        <Text strong>Trạng thái:</Text>
                                        <Tag color={workProgress.paymentDetails.paymentStatus === 'paid' ? 'green' : 'orange'}>
                                            {workProgress.paymentDetails.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                        </Tag>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    )}

                    {/* Milestones */}
                    {workProgress.milestones && workProgress.milestones.length > 0 && (
                        <Card size="small" title={<><CheckCircleOutlined className="mr-2" />Các bước thực hiện</>}>
                            <Timeline
                                items={workProgress.milestones.map((milestone) => ({
                                    dot: milestone.status === 'completed' ?
                                        <CheckCircleOutlined className="text-green-600" /> :
                                        <ExclamationCircleOutlined className="text-gray-400" />,
                                    children: (
                                        <div>
                                            <Text strong>{milestone.name}</Text>
                                            <br />
                                            <Text type="secondary">{milestone.description}</Text>
                                            <br />
                                            <Tag color={milestone.status === 'completed' ? 'green' : 'default'}>
                                                {milestone.status === 'completed' ? 'Hoàn thành' : 'Chờ thực hiện'}
                                            </Tag>
                                        </div>
                                    )
                                }))}
                            />
                        </Card>
                    )}

                    {/* Notes */}
                    {workProgress.notes && (
                        <Card size="small" title={<><FileTextOutlined className="mr-2" />Ghi chú</>}>
                            <Text>{workProgress.notes}</Text>
                        </Card>
                    )}

                    {/* Completion Details */}
                    {isAppointmentObject(appointment) && appointment.completion && appointment.completion.isCompleted && (
                        <Card size="small" title={<><CheckCircleOutlined className="mr-2" />Hoàn thành</>}>
                            <Space direction="vertical" size="small" className="w-full">
                                {appointment.completion.workDone && (
                                    <div>
                                        <Text strong>Công việc đã thực hiện:</Text>
                                        <br />
                                        <Text>{appointment.completion.workDone}</Text>
                                    </div>
                                )}
                                {appointment.completion.recommendations && (
                                    <div>
                                        <Text strong>Khuyến nghị:</Text>
                                        <br />
                                        <Text>{appointment.completion.recommendations}</Text>
                                    </div>
                                )}
                                {appointment.completion.completedAt && (
                                    <div>
                                        <Text strong>Hoàn thành lúc:</Text>
                                        <br />
                                        <Text>{formatDateTime(appointment.completion.completedAt)}</Text>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    )}

                    {/* Created At */}
                    <Card size="small">
                        <Text type="secondary">
                            Tạo lúc: {workProgress.createdAt ? formatDateTime(workProgress.createdAt) : 'N/A'}
                        </Text>
                    </Card>
                </div>
            )}
        </Modal>
    );
};

export default WorkProgressDetailModal;
