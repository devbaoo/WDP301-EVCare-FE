import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Select, Pagination, Space, Tooltip } from 'antd';
import { 
  Eye, 
  Download, 
  CreditCard, 
  Building2,
  Filter
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import { getMyPayments } from '../../services/features/payment/paymentSlice';
import PaymentStatus from './PaymentStatus';
import { formatCurrencyVND } from '../../lib/paymentUtils';
import { PaymentStatus as PaymentStatusType } from '../../interfaces/payment';
import dayjs from 'dayjs';

const { Option } = Select;

const PaymentHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myPayments, pagination, loading } = useAppSelector((state) => state.payment);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusType | 'all'>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPayments();
  }, [currentPage, pageSize, statusFilter, sortBy, sortOrder]);

  const fetchPayments = () => {
    const params = {
      page: currentPage,
      limit: pageSize,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy,
      sortOrder
    };
    
    dispatch(getMyPayments(params));
  };

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
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const handleViewDetails = (paymentId: string) => {
    // TODO: Navigate to payment details page
    console.log('View payment details:', paymentId);
  };

  const handleDownloadReceipt = (paymentId: string) => {
    // TODO: Download payment receipt
    console.log('Download receipt:', paymentId);
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: ['paymentInfo', 'orderCode'],
      key: 'orderCode',
      render: (orderCode: number) => (
        <span className="font-mono font-medium text-blue-600">
          #{orderCode}
        </span>
      ),
    },
    {
      title: 'Dịch vụ',
      key: 'service',
      render: (record: any) => {
        const appointment = typeof record.appointment === 'object' 
          ? record.appointment 
          : null;
        
        if (!appointment) return '-';
        
        return (
          <div>
            <div className="font-medium text-gray-900">
              {appointment.serviceType?.name || 'Không xác định'}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Building2 className="w-3 h-3 mr-1" />
              {appointment.serviceCenter?.name || 'Không xác định'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số tiền',
      dataIndex: ['paymentInfo', 'amount'],
      key: 'amount',
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrencyVND(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: PaymentStatusType) => (
        <PaymentStatus status={status} />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div className="text-sm">
          <div className="font-medium">
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <div className="text-gray-500">
            {dayjs(date).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian hẹn',
      key: 'appointmentTime',
      render: (record: any) => {
        const appointment = typeof record.appointment === 'object' 
          ? record.appointment 
          : null;
        
        if (!appointment?.appointmentTime) return '-';
        
        return (
          <div className="text-sm">
            <div className="font-medium">
              {dayjs(appointment.appointmentTime.date).format('DD/MM/YYYY')}
            </div>
            <div className="text-gray-500">
              {appointment.appointmentTime.startTime}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => handleViewDetails(record._id)}
            />
          </Tooltip>
          {record.status === 'paid' && (
            <Tooltip title="Tải hóa đơn">
              <Button
                type="text"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
            Lịch sử thanh toán
          </h2>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi tất cả các giao dịch thanh toán
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
          </div>
          
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: 150 }}
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">Chờ thanh toán</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="failed">Thất bại</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="expired">Hết hạn</Option>
            <Option value="refunded">Đã hoàn tiền</Option>
          </Select>

          <Select
            placeholder="Sắp xếp"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            style={{ width: 200 }}
          >
            <Option value="createdAt-desc">Mới nhất</Option>
            <Option value="createdAt-asc">Cũ nhất</Option>
            <Option value="amount-desc">Số tiền cao</Option>
            <Option value="amount-asc">Số tiền thấp</Option>
          </Select>

          <Button onClick={fetchPayments} loading={loading}>
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Payment Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={myPayments}
          loading={loading}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 800 }}
        />
        
        {pagination && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Hiển thị {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} của {pagination.totalItems} kết quả
            </div>
            <Pagination
              current={pagination.currentPage}
              total={pagination.totalItems}
              pageSize={pagination.itemsPerPage}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} của ${total}`
              }
            />
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {myPayments.filter(p => p.status === 'paid').length}
          </div>
          <div className="text-sm text-gray-600">Đã thanh toán</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {myPayments.filter(p => p.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Chờ thanh toán</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {myPayments.filter(p => ['failed', 'cancelled', 'expired'].includes(p.status)).length}
          </div>
          <div className="text-sm text-gray-600">Thất bại/Hủy</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrencyVND(
              myPayments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.paymentInfo.amount, 0)
            )}
          </div>
          <div className="text-sm text-gray-600">Tổng đã thanh toán</div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentHistory;
