import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
  Tag,
  DatePicker,
  Empty,
  message,
  Typography,
  Modal,
  Spin
} from 'antd';
import {
  Eye,
  Download,
  CreditCard,
  Building2,
  Filter,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { getMyPayments } from '../../services/features/payment/paymentSlice';
import PaymentStatus from './PaymentStatus';
import PaymentModal from './PaymentModal';
import { formatCurrencyVND } from '../../lib/paymentUtils';
import { PaymentStatus as PaymentStatusType, Payment } from '../../interfaces/payment';
import { PAYMENT_STATUS_ENDPOINT } from '../../services/constant/apiConfig';
import axiosInstance from '../../services/constant/axiosInstance';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PaymentHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myPayments, pagination, loading } = useAppSelector((state) => state.payment);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusType | 'all'>('all');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Payment detail modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [paymentDetail, setPaymentDetail] = useState<Payment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPayments = React.useCallback(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: pageSize
    };

    // Chỉ thêm sortBy và sortOrder nếu có giá trị
    if (sortBy && sortOrder) {
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format('YYYY-MM-DD');
      params.endDate = dateRange[1].format('YYYY-MM-DD');
    }

    dispatch(getMyPayments(params));
  }, [currentPage, pageSize, statusFilter, sortBy, sortOrder, dateRange, dispatch]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  const handleStatusFilterChange = (value: PaymentStatusType | 'all') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    if (value === 'none') {
      setSortBy('');
      setSortOrder('');
    } else {
      const [newSortBy, newSortOrder] = value.split('-');
      setSortBy(newSortBy);
      setSortOrder(newSortOrder as 'asc' | 'desc');
    }
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateRange(null);
    setSortBy('');
    setSortOrder('');
    setCurrentPage(1);
  };

  const handleViewDetails = async (paymentId: string) => {
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(PAYMENT_STATUS_ENDPOINT(paymentId));
      if (response.data?.success) {
        setPaymentDetail(response.data.data);
        setDetailModalVisible(true);
      } else {
        message.error('Không thể tải chi tiết thanh toán');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      message.error('Lỗi khi tải chi tiết thanh toán');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadReceipt = (paymentId: string) => {
    message.info('Download receipt feature coming soon');
    console.log('Download receipt:', paymentId);
  };

  const handleContinuePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentModalVisible(true);
  };

  const handlePaymentModalCancel = () => {
    setPaymentModalVisible(false);
    setSelectedPayment(null);
  };

  const handlePaymentSuccess = () => {
    message.success('Thanh toán thành công!');
    setPaymentModalVisible(false);
    setSelectedPayment(null);
    // Refresh the payment list
    fetchPayments();
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setPaymentDetail(null);
  };

  // Calculate statistics
  const stats = {
    totalPaid: myPayments.filter(p => p.status === 'paid').length,
    totalPending: myPayments.filter(p => p.status === 'pending').length,
    totalFailed: myPayments.filter(p => ['failed', 'cancelled', 'expired'].includes(p.status)).length,
    totalAmount: myPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.paymentInfo.amount, 0)
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: ['paymentInfo', 'orderCode'],
      key: 'orderCode',
      width: 120,
      render: (orderCode: number) => (
        <Tag color="blue" className="font-mono">
          #{orderCode}
        </Tag>
      ),
    },
    {
      title: 'Dịch vụ & Trung tâm',
      key: 'service',
      width: 200,
      render: (record: Payment) => {
        const appointment = typeof record.appointment === 'object'
          ? record.appointment
          : null;

        if (!appointment) return <Text type="secondary">-</Text>;

        return (
          <div>
            <div className="font-medium text-gray-900 mb-1">
              {typeof appointment.serviceType === 'object'
                ? appointment.serviceType?.name
                : 'Không xác định'}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Building2 className="w-3 h-3 mr-1" />
              <Text type="secondary" className="text-xs">
                {typeof appointment.serviceCenter === 'object'
                  ? appointment.serviceCenter?.name
                  : 'Không xác định'}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số tiền',
      dataIndex: ['paymentInfo', 'amount'],
      key: 'amount',
      width: 120,
      sorter: true,
      render: (amount: number) => (
        <Statistic
          value={amount}
          formatter={(value) => formatCurrencyVND(Number(value))}
          valueStyle={{ color: '#52c41a', fontSize: '14px', fontWeight: 600 }}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PaymentStatusType) => (
        <PaymentStatus status={status} />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      render: (date: string) => (
        <div>
          <div className="font-medium text-gray-900">
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <div className="text-gray-500 text-xs">
            {dayjs(date).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian hẹn',
      key: 'appointmentTime',
      width: 120,
      render: (record: Payment) => {
        const appointment = typeof record.appointment === 'object'
          ? record.appointment
          : null;

        if (!appointment?.appointmentTime) return <Text type="secondary">-</Text>;

        return (
          <div>
            <div className="font-medium text-gray-900">
              {dayjs(appointment.appointmentTime.date).format('DD/MM/YYYY')}
            </div>
            <div className="text-gray-500 text-xs">
              {appointment.appointmentTime.startTime}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (record: Payment) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<Eye className="w-4 h-4" />}
              loading={detailLoading}
              onClick={() => handleViewDetails(record._id)}
            />
          </Tooltip>
          {record.status === 'pending' && record.payosInfo && (
            <Tooltip title="Tiếp tục thanh toán">
              <Button
                type="primary"
                size="small"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => handleContinuePayment(record)}
              >
                Thanh toán
              </Button>
            </Tooltip>
          )}
          {record.status === 'paid' && (
            <Tooltip title="Tải hóa đơn">
              <Button
                type="text"
                size="small"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleDownloadReceipt(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card className="mb-6" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={32} />
              Lịch sử thanh toán
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginTop: '8px' }}>
              Quản lý và theo dõi tất cả các giao dịch thanh toán
            </Text>
          </div>
          <Button
            type="primary"
            ghost
            icon={<RefreshCw size={16} />}
            onClick={fetchPayments}
            loading={loading}
            size="large"
          >
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={stats.totalPaid}
              prefix={<CheckCircle size={16} style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ thanh toán"
              value={stats.totalPending}
              prefix={<Clock size={16} style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Thất bại/Hủy"
              value={stats.totalFailed}
              prefix={<AlertCircle size={16} style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đã thanh toán"
              value={stats.totalAmount}
              prefix={<DollarSign size={16} style={{ color: '#52c41a' }} />}
              formatter={(value) => formatCurrencyVND(Number(value))}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} style={{ color: '#8c8c8c' }} />
              <Text strong>Bộ lọc:</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="failed">Thất bại</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="expired">Hết hạn</Option>
              <Option value="refunded">Đã hoàn tiền</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Sắp xếp"
              value={sortBy && sortOrder ? `${sortBy}-${sortOrder}` : 'none'}
              onChange={handleSortChange}
              style={{ width: '100%' }}
            >
              <Option value="none">Không sắp xếp</Option>
              <Option value="createdAt-desc">Mới nhất</Option>
              <Option value="createdAt-asc">Cũ nhất</Option>
              <Option value="paymentInfo.amount-desc">Số tiền cao</Option>
              <Option value="paymentInfo.amount-asc">Số tiền thấp</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button onClick={clearFilters} icon={<Filter size={16} />}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Payment Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={myPayments}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination?.currentPage || 1,
            total: pagination?.totalItems || 0,
            pageSize: pagination?.itemsPerPage || 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} kết quả`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
            pageSizeOptions: ['10', '20', '50', '100'],
            responsive: true,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu thanh toán"
              />
            ),
          }}
        />
      </Card>

      {/* Payment Modal */}
      {selectedPayment && (
        <PaymentModal
          visible={paymentModalVisible}
          onCancel={handlePaymentModalCancel}
          paymentData={{
            paymentId: selectedPayment._id,
            orderCode: selectedPayment.paymentInfo.orderCode,
            paymentLink: selectedPayment.payosInfo.paymentLink,
            qrCode: selectedPayment.payosInfo.qrCode,
            checkoutUrl: selectedPayment.payosInfo.checkoutUrl,
            amount: selectedPayment.paymentInfo.amount,
            expiresAt: selectedPayment.expiresAt
          }}
          description={selectedPayment.paymentInfo.description}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span>Chi tiết thanh toán</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={700}
        className="payment-detail-modal"
      >
        {paymentDetail ? (
          <div className="space-y-6">
            {/* Payment Info */}
            <Card title="Thông tin thanh toán" size="small">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="mb-3">
                    <Text type="secondary" className="block text-xs">Mã đơn hàng</Text>
                    <Tag color="blue" className="font-mono text-sm">
                      #{paymentDetail.paymentInfo.orderCode}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="mb-3">
                    <Text type="secondary" className="block text-xs">Trạng thái</Text>
                    <PaymentStatus status={paymentDetail.status} />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="mb-3">
                    <Text type="secondary" className="block text-xs">Số tiền</Text>
                    <Text strong className="text-lg text-green-600">
                      {formatCurrencyVND(paymentDetail.paymentInfo.amount)} VND
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="mb-3">
                    <Text type="secondary" className="block text-xs">Phương thức thanh toán</Text>
                    <Text strong>{paymentDetail.paymentMethod.toUpperCase()}</Text>
                  </div>
                </Col>
                <Col xs={24}>
                  <div className="mb-3">
                    <Text type="secondary" className="block text-xs">Mô tả</Text>
                    <Text>{paymentDetail.paymentInfo.description}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Transaction Info */}
            {paymentDetail.transaction && (
              <Card title="Thông tin giao dịch" size="small">
                <Row gutter={[16, 16]}>
                  {paymentDetail.transaction.transactionId && (
                    <Col xs={24} md={12}>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs">Mã giao dịch</Text>
                        <Text className="font-mono text-sm">{paymentDetail.transaction.transactionId}</Text>
                      </div>
                    </Col>
                  )}
                  {paymentDetail.transaction.transactionTime && (
                    <Col xs={24} md={12}>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs">Thời gian giao dịch</Text>
                        <Text>{dayjs(paymentDetail.transaction.transactionTime).format('DD/MM/YYYY HH:mm:ss')}</Text>
                      </div>
                    </Col>
                  )}
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <Text type="secondary" className="block text-xs">Phí giao dịch</Text>
                      <Text>{formatCurrencyVND(paymentDetail.transaction.fee || 0)} VND</Text>
                    </div>
                  </Col>
                  {paymentDetail.transaction.netAmount && (
                    <Col xs={24} md={12}>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs">Số tiền thực nhận</Text>
                        <Text strong className="text-green-600">
                          {formatCurrencyVND(paymentDetail.transaction.netAmount)} VND
                        </Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* Appointment Info */}
            {paymentDetail.appointment && typeof paymentDetail.appointment === 'object' && (
              <Card title="Thông tin lịch hẹn" size="small">
                <Row gutter={[16, 16]}>
                  {paymentDetail.appointment.appointmentTime && (
                    <Col xs={24} md={12}>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs">Ngày hẹn</Text>
                        <Text>{dayjs(paymentDetail.appointment.appointmentTime.date).format('DD/MM/YYYY')}</Text>
                      </div>
                    </Col>
                  )}
                  {paymentDetail.appointment.appointmentTime && (
                    <Col xs={24} md={12}>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs">Thời gian</Text>
                        <Text>
                          {paymentDetail.appointment.appointmentTime.startTime}
                          {paymentDetail.appointment.appointmentTime.endTime &&
                            ` - ${paymentDetail.appointment.appointmentTime.endTime}`
                          }
                        </Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* Webhook Info */}
            {paymentDetail.webhook && (
              <Card title="Thông tin webhook" size="small">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div className="mb-3">
                      <Text type="secondary" className="block text-xs">Trạng thái webhook</Text>
                      <Tag color={paymentDetail.webhook.received ? 'green' : 'orange'}>
                        {paymentDetail.webhook.received ? 'Đã nhận' : 'Chưa nhận'}
                      </Tag>
                    </div>
                  </Col>
                  {paymentDetail.webhook.receivedAt && (
                    <Col xs={24} md={12}>
                      <div className="mb-3">
                        <Text type="secondary" className="block text-xs">Thời gian nhận</Text>
                        <Text>{dayjs(paymentDetail.webhook.receivedAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* Timeline */}
            <Card title="Lịch sử thanh toán" size="small">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <Text strong>Tạo thanh toán</Text>
                    <div className="text-xs text-gray-500">
                      {dayjs(paymentDetail.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                  </div>
                </div>
                {paymentDetail.transaction?.transactionTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <Text strong>Giao dịch thành công</Text>
                      <div className="text-xs text-gray-500">
                        {dayjs(paymentDetail.transaction.transactionTime).format('DD/MM/YYYY HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <Text strong>Cập nhật cuối</Text>
                    <div className="text-xs text-gray-500">
                      {dayjs(paymentDetail.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentHistory;
