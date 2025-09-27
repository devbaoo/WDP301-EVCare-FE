import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Tag,
  Space,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Pagination,
} from "antd";
import {
  fetchTechnicians,
  StaffUser,
} from "../../services/features/admin/technicianService";
import {
  PlusOutlined,
  EditOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  fetchCertificates,
  createCertificate,
  updateCertificate,
} from "../../services/features/admin/certificateService";
import { Certificate } from "../../interfaces/certificate";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { RangePickerProps } from "antd/es/date-picker";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [form] = Form.useForm();
  const [technicians, setTechnicians] = useState<StaffUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async (withTechnicians = false) => {
    setLoading(true);
    try {
      let techs = technicians;
      if (withTechnicians || technicians.length === 0) {
        try {
          techs = await fetchTechnicians();
          setTechnicians(techs);
        } catch {
          techs = [];
          setTechnicians([]);
        }
      }

      const data = await fetchCertificates();
      let arr: Certificate[] = [];
      if (Array.isArray(data)) {
        arr = data;
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as any).data)
      ) {
        arr = (data as any).data;
      }

      const mapped = arr.map((cert) => {
        let technicianId = "";
        if (typeof cert.technicianId === "string") {
          technicianId = cert.technicianId;
        } else if (cert.technicianId && typeof cert.technicianId === "object") {
          technicianId = (cert.technicianId as any)._id || "";
        }

        return {
          ...cert,
          technicianId: technicianId,
        };
      });

      setCertificates(mapped);
      setFilteredCertificates(mapped);
    } catch (err) {
      message.error("Lỗi tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  useEffect(() => {
    const filtered = certificates.filter((cert) => {
      const matchesSearch = cert.certificateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuingAuthority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" ||
        getStatusText(cert.status || "", cert.expiryDate).toLowerCase() === statusFilter;

      // Fix date filter logic
      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const [start, end] = dateRange;
        const issueDate = cert.issueDate ? dayjs(cert.issueDate) : null;
        const expiryDate = cert.expiryDate ? dayjs(cert.expiryDate) : null;

        matchesDate = (issueDate && issueDate.isBetween(start, end, 'day', '[]')) ||
          (expiryDate && expiryDate.isBetween(start, end, 'day', '[]')) ||
          (!issueDate && !expiryDate && statusFilter === "all");
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
    setFilteredCertificates(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange, certificates]);

  const handleAdd = async () => {
    setEditing(null);
    form.resetFields();
    setLoading(true);
    try {
      const techs = await fetchTechnicians();
      setTechnicians(techs);
    } catch {
      setTechnicians([]);
      message.error("Không lấy được danh sách kỹ thuật viên");
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  };

  const handleEdit = async (record: Certificate) => {
    setEditing(record);
    setLoading(true);
    try {
      const techs = await fetchTechnicians();
      setTechnicians(techs);
      form.setFieldsValue({
        certificateName: record.certificateName,
        issuingAuthority: record.issuingAuthority,
        issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
        expiryDate: record.expiryDate ? dayjs(record.expiryDate) : undefined,
        certificateNumber: record.certificateNumber,
        specialization: record.specialization,
        status: record.status,
        documentUrl: record.documentUrl,
      });
    } catch {
      setTechnicians([]);
      message.error("Không lấy được danh sách kỹ thuật viên");
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  };

  const handleViewDetail = (record: Certificate) => {
    setSelectedCertificate(record);
    setDetailModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const processedValues = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : undefined,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      };

      if (editing) {
        const { technicianId, ...updateValues } = processedValues;
        await updateCertificate(editing._id, updateValues);
        message.success("Cập nhật thành công");
      } else {
        const createPayload = {
          technicianId: processedValues.technicianId,
          certificateName: processedValues.certificateName,
          issuingAuthority: processedValues.issuingAuthority,
          issueDate: processedValues.issueDate,
          expiryDate: processedValues.expiryDate,
          certificateNumber: processedValues.certificateNumber,
          specialization: processedValues.specialization,
          documentUrl: processedValues.documentUrl,
        };
        await createCertificate(createPayload);
        message.success("Tạo mới thành công");
      }
      setModalOpen(false);
      await fetchData(true);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, expiryDate?: string) => {
    const now = new Date();
    let realStatus = status;
    if (expiryDate && new Date(expiryDate) < now) realStatus = "expired";
    switch (realStatus) {
      case "active":
        return "green";
      case "expired":
        return "red";
      case "revoked":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string, expiryDate?: string) => {
    const now = new Date();
    let realStatus = status;
    if (expiryDate && new Date(expiryDate) < now) realStatus = "expired";
    switch (realStatus) {
      case "active":
        return "Hoạt động";
      case "expired":
        return "Hết hạn";
      case "revoked":
        return "Bị thu hồi";
      default:
        return status;
    }
  };

  const handleDownloadPdf = (url: string, fileName: string) => {
    if (!url) {
      message.warning("Không có file để tải");
      return;
    }
    if (url.startsWith("file://")) {
      message.error(
        "Không thể tải file nội bộ. Vui lòng sử dụng link file từ server hoặc cloud."
      );
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "certificate.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error("Lỗi khi tải file");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange(null);
  };

  // Fix date range handler
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  // Pagination
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div className="text-sm font-medium text-gray-900 bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
          {(currentPage - 1) * pageSize + index + 1}
        </div>
      ),
    },
    {
      title: "Tên chứng chỉ",
      dataIndex: "certificateName",
      key: "certificateName",
      render: (text: string) => (
        <Typography.Text strong className="text-blue-600">
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Cơ quan cấp",
      dataIndex: "issuingAuthority",
      key: "issuingAuthority",
    },
    {
      title: "Ngày cấp",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_: string, record: Certificate) => (
        <Tag color={getStatusColor(record.status || "", record.expiryDate)}>
          {getStatusText(record.status || "", record.expiryDate)}
        </Tag>
      ),
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technicianId",
      key: "technicianId",
      render: (technicianId: string) => {
        const found = technicians.find((t) => t._id === technicianId);
        const name = found?.fullName || "";
        return (
          <Typography.Text className="text-green-600 font-medium">
            {name || "Không rõ"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: Certificate) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <SafetyCertificateOutlined className="text-3xl" />
              <h1 className="text-3xl md:text-4xl font-bold">Quản lý chứng chỉ kỹ thuật viên</h1>
            </div>
            <p className="mt-2 opacity-90 flex items-center gap-2">
              <InfoCircleOutlined />
              Quản lý và theo dõi chứng chỉ của các kỹ thuật viên
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Filter Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <FilterOutlined />
                Bộ lọc tìm kiếm
              </h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ReloadOutlined />
                Xóa bộ lọc
              </button>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <SearchOutlined />
                  Tìm kiếm
                </label>
                <Input
                  placeholder="Tìm theo tên, cơ quan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <SafetyCertificateOutlined />
                  Trạng thái
                </label>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-full"
                  placeholder="Tất cả trạng thái"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="hoạt động">Hoạt động</Option>
                  <Option value="hết hạn">Hết hạn</Option>
                  <Option value="bị thu hồi">Bị thu hồi</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CalendarOutlined />
                  Khoảng thời gian
                </label>
                <RangePicker
                  className="w-full"
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg w-full text-center h-full flex flex-col justify-center">
                  <div className="text-sm font-medium">Tổng số chứng chỉ</div>
                  <div className="text-2xl font-bold">{filteredCertificates.length}</div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Action Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-gray-700">
              Danh sách chứng chỉ ({filteredCertificates.length})
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              className="bg-green-600 border-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              Thêm chứng chỉ
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-gray-600 flex items-center gap-2">
                <ReloadOutlined />
                Đang tải dữ liệu...
              </p>
            </div>
          )}

          {/* Certificates Table */}
          {!loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                          style={{ width: column.width }}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedCertificates.map((certificate, index) => (
                      <tr key={certificate._id} className="hover:bg-blue-50 transition-all duration-200">
                        {columns.map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                            {column.render
                              ? column.render(
                                certificate[column.dataIndex as keyof Certificate],
                                certificate,
                                index
                              )
                              : certificate[column.dataIndex as keyof Certificate]
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {paginatedCertificates.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <SearchOutlined className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy chứng chỉ</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all" || dateRange
                      ? "Hãy thử điều chỉnh bộ lọc tìm kiếm để xem kết quả khác."
                      : "Chưa có chứng chỉ nào được thêm vào hệ thống."
                    }
                  </p>
                </div>
              )}

              {/* Pagination */}
              {paginatedCertificates.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
                      {Math.min(currentPage * pageSize, filteredCertificates.length)} trên tổng số{' '}
                      {filteredCertificates.length} chứng chỉ
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredCertificates.length}
                      onChange={(page, size) => {
                        setCurrentPage(page);
                        if (size) setPageSize(size);
                      }}
                      showSizeChanger
                      showQuickJumper
                      pageSizeOptions={['10', '20', '50', '100']}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Certificate Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-blue-600" />
            <span className="text-xl font-semibold">
              {editing ? "Cập nhật chứng chỉ" : "Thêm chứng chỉ mới"}
            </span>
          </div>
        }
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        width={600}
        okText={editing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="space-y-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="certificateName"
                label="Tên chứng chỉ"
                rules={[
                  { required: true, message: "Tên chứng chỉ là bắt buộc" },
                  { max: 100, message: "Tối đa 100 ký tự" },
                ]}
              >
                <Input placeholder="Nhập tên chứng chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="issuingAuthority"
                label="Cơ quan cấp"
                rules={[
                  { required: true, message: "Cơ quan cấp là bắt buộc" },
                  { max: 100, message: "Tối đa 100 ký tự" }
                ]}
              >
                <Input placeholder="Nhập cơ quan cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="issueDate"
                label="Ngày cấp"
                rules={[{ required: true, message: "Ngày cấp là bắt buộc" }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[{ required: true, message: "Ngày hết hạn là bắt buộc" }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="certificateNumber"
                label="Số chứng chỉ"
                rules={[
                  { required: true, message: "Số chứng chỉ là bắt buộc" },
                  { max: 50, message: "Tối đa 50 ký tự" }
                ]}
              >
                <Input placeholder="Nhập số chứng chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Chuyên môn"
                rules={[
                  { required: true, message: "Chuyên môn là bắt buộc" },
                  { max: 100, message: "Tối đa 100 ký tự" }
                ]}
              >
                <Input placeholder="Nhập chuyên môn" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="documentUrl"
            label="Link file PDF"
            rules={[
              { required: true, message: "Link file PDF là bắt buộc" },
              { max: 255, message: "Tối đa 255 ký tự" },
              {
                type: 'url',
                message: 'Vui lòng nhập URL hợp lệ',
              }
            ]}
          >
            <Input placeholder="Nhập link file PDF" />
          </Form.Item>

          {!editing && (
            <Form.Item
              name="technicianId"
              label="Kỹ thuật viên"
              rules={[{ required: true, message: "Kỹ thuật viên là bắt buộc" }]}
            >
              <Select
                showSearch
                placeholder="Chọn kỹ thuật viên"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label = typeof option?.label === "string" ? option.label : "";
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {technicians.map((tech) => (
                  <Select.Option key={tech._id} value={tech._id}>
                    {tech.fullName || tech.email || tech._id}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <InfoCircleOutlined className="text-blue-600" />
            <span className="text-xl font-semibold">Chi tiết chứng chỉ</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          <Button onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>
        }
        width={600}
      >
        {selectedCertificate && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tên chứng chỉ</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCertificate.certificateName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cơ quan cấp</label>
                    <p className="text-gray-900">{selectedCertificate.issuingAuthority || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Số chứng chỉ</label>
                    <p className="text-gray-900">{selectedCertificate.certificateNumber || "N/A"}</p>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày cấp</label>
                    <p className="text-gray-900">
                      {selectedCertificate.issueDate ? dayjs(selectedCertificate.issueDate).format("DD/MM/YYYY") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày hết hạn</label>
                    <p className="text-gray-900">
                      {selectedCertificate.expiryDate ? dayjs(selectedCertificate.expiryDate).format("DD/MM/YYYY") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                    <Tag color={getStatusColor(selectedCertificate.status || "", selectedCertificate.expiryDate)}>
                      {getStatusText(selectedCertificate.status || "", selectedCertificate.expiryDate)}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>

            <div>
              <label className="block text-sm font-medium text-gray-500">Chuyên môn</label>
              <p className="text-gray-900">{selectedCertificate.specialization || "N/A"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Kỹ thuật viên</label>
              <p className="text-green-600 font-medium">
                {technicians.find(t => t._id === selectedCertificate.technicianId)?.fullName || "Không rõ"}
              </p>
            </div>

            {selectedCertificate.documentUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-500">File đính kèm</label>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadPdf(selectedCertificate.documentUrl!, selectedCertificate.certificateName || "certificate")}
                  className="mt-2"
                >
                  Tải file PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CertificatePage;