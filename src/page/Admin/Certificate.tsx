import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Card,
  Tag,
  Space,
  Typography,
  Select,
} from "antd";
import {
  fetchTechnicians,
  StaffUser,
} from "../../services/features/admin/technicianService";
import {
  PlusOutlined,
  EditOutlined,
  FilePdfOutlined,
  UserOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  NumberOutlined,
  ToolOutlined,
  LinkOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  fetchCertificates,
  createCertificate,
  updateCertificate,
} from "../../services/features/admin/certificateService";

import { Certificate } from "../../interfaces/certificate";

function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [form] = Form.useForm();
  const [technicians, setTechnicians] = useState<StaffUser[]>([]);

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
    } catch (err) {
      message.error("Lỗi tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

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
        issueDate: record.issueDate ? record.issueDate.slice(0, 10) : undefined,
        expiryDate: record.expiryDate
          ? record.expiryDate.slice(0, 10)
          : undefined,
        certificateNumber: record.certificateNumber,
        specialization: record.specialization,
        status: record.status,
        documentUrl: record.documentUrl,
        // Không set technicianId khi sửa
      });
    } catch {
      setTechnicians([]);
      message.error("Không lấy được danh sách kỹ thuật viên");
    } finally {
      setLoading(false);
      setModalOpen(true);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        // Khi update, không gửi technicianId nữa
        const { technicianId, ...updateValues } = values;
        await updateCertificate(editing._id, updateValues);
        message.success("Cập nhật thành công");
      } else {
        const createPayload = {
          technicianId: values.technicianId,
          certificateName: values.certificateName,
          issuingAuthority: values.issuingAuthority,
          issueDate: values.issueDate,
          expiryDate: values.expiryDate,
          certificateNumber: values.certificateNumber,
          specialization: values.specialization,
          documentUrl: values.documentUrl,
        };
        await createCertificate(createPayload);
        message.success("Tạo mới thành công");
      }
      setModalOpen(false);
      await fetchData(true);
    } catch {
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

  const columns = [
    {
      title: (
        <>
          <SafetyCertificateOutlined style={{ color: "#1890ff" }} /> Tên chứng
          chỉ
        </>
      ),
      dataIndex: "certificateName",
      key: "certificateName",
      render: (text: string) => (
        <Typography.Text strong style={{ color: "#1890ff" }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: (
        <>
          <BankOutlined style={{ color: "#52c41a" }} /> Cơ quan cấp
        </>
      ),
      dataIndex: "issuingAuthority",
      key: "issuingAuthority",
    },
    {
      title: (
        <>
          <CalendarOutlined style={{ color: "#fa8c16" }} /> Ngày cấp
        </>
      ),
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: (
        <>
          <CalendarOutlined style={{ color: "#fa8c16" }} /> Ngày hết hạn
        </>
      ),
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: (
        <>
          <NumberOutlined style={{ color: "#722ed1" }} /> Số chứng chỉ
        </>
      ),
      dataIndex: "certificateNumber",
      key: "certificateNumber",
    },
    {
      title: (
        <>
          <ToolOutlined style={{ color: "#13c2c2" }} /> Chuyên môn
        </>
      ),
      dataIndex: "specialization",
      key: "specialization",
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
      title: (
        <>
          <FilePdfOutlined style={{ color: "#eb2f96" }} /> File
        </>
      ),
      dataIndex: "documentUrl",
      key: "documentUrl",
      render: (url: string, record: Certificate) =>
        url ? (
          <Tooltip title="Tải về">
            <Button
              type="link"
              icon={
                <DownloadOutlined style={{ color: "#1890ff", fontSize: 16 }} />
              }
              onClick={() =>
                handleDownloadPdf(
                  url,
                  `${record.certificateName || "certificate"}.pdf`
                )
              }
            />
          </Tooltip>
        ) : (
          <Typography.Text type="secondary">Không có file</Typography.Text>
        ),
    },
    {
      title: (
        <>
          <UserOutlined style={{ color: "#52c41a" }} /> Kỹ thuật viên
        </>
      ),
      dataIndex: "technicianId",
      key: "technicianId",
      render: (technicianId: string) => {
        const found = technicians.find((t) => t._id === technicianId);
        const name = found?.fullName || "";
        return (
          <Typography.Text
            style={{ color: "#52c41a", fontWeight: 500, fontSize: 15 }}
          >
            {name || "Không rõ"}
          </Typography.Text>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Certificate) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 32,
        background: "linear-gradient(135deg, #f8fafc 60%, #e6f7ff 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined
              style={{ color: "#1890ff", fontSize: 28 }}
            />
            <Typography.Title
              level={3}
              style={{
                margin: 0,
                color: "#1890ff",
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              Quản lý chứng chỉ kỹ thuật viên
            </Typography.Title>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Thêm chứng chỉ
          </Button>
        }
        style={{
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
          border: "none",
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          marginTop: 32,
          marginBottom: 32,
          background: "#fff",
        }}
        bodyStyle={{ padding: 0, borderRadius: 18 }}
      >
        <div style={{ padding: 28, background: "#f4faff", borderRadius: 14 }}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={certificates}
            loading={loading}
            pagination={{
              pageSize: 10,
              style: { marginTop: 16 },
              size: "default",
              showLessItems: true,
            }}
            style={{
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
              fontSize: 15,
            }}
          />
        </div>
      </Card>

      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
            <Typography.Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              {editing ? "Cập nhật chứng chỉ" : "Thêm chứng chỉ mới"}
            </Typography.Title>
          </Space>
        }
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        width={520}
        style={{ top: 40 }}
        okText={editing ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
            borderRadius: 6,
            fontWeight: 600,
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
        bodyStyle={{ padding: 24, borderRadius: 12, background: "#f8fafc" }}
      >
  <Form form={form} layout="vertical">
          <Form.Item
            name="certificateName"
            label={
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
                <span>Tên chứng chỉ</span>
              </Space>
            }
            rules={[
              { required: true, message: "Tên chứng chỉ là bắt buộc" },
              { max: 100, message: "Tối đa 100 ký tự" },
            ]}
          >
            <Input
              placeholder="Nhập tên chứng chỉ"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="issuingAuthority"
            label={
              <Space>
                <BankOutlined style={{ color: "#52c41a" }} />
                <span>Cơ quan cấp</span>
              </Space>
            }
            rules={[{ max: 100, message: "Tối đa 100 ký tự" }]}
          >
            <Input
              placeholder="Nhập cơ quan cấp"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="issueDate"
            label={
              <Space>
                <CalendarOutlined style={{ color: "#fa8c16" }} />
                <span>Ngày cấp</span>
              </Space>
            }
            rules={[{ required: true, message: "Ngày cấp là bắt buộc" }]}
          >
            <Input type="date" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label={
              <Space>
                <CalendarOutlined style={{ color: "#fa8c16" }} />
                <span>Ngày hết hạn</span>
              </Space>
            }
          >
            <Input type="date" style={{ borderRadius: "6px" }} />
          </Form.Item>

          <Form.Item
            name="certificateNumber"
            label={
              <Space>
                <NumberOutlined style={{ color: "#722ed1" }} />
                <span>Số chứng chỉ</span>
              </Space>
            }
            rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
          >
            <Input
              placeholder="Nhập số chứng chỉ"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="specialization"
            label={
              <Space>
                <ToolOutlined style={{ color: "#13c2c2" }} />
                <span>Chuyên môn</span>
              </Space>
            }
            rules={[{ max: 100, message: "Tối đa 100 ký tự" }]}
          >
            <Input
              placeholder="Nhập chuyên môn"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="documentUrl"
            label={
              <Space>
                <LinkOutlined style={{ color: "#eb2f96" }} />
                <span>Link file</span>
              </Space>
            }
            rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}
          >
            <Input
              placeholder="Nhập link file PDF"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          {/*
            Khi tạo mới thì cho chọn kỹ thuật viên, khi sửa thì không cho sửa technicianId nữa
          */}
          {!editing && (
            <Form.Item
              name="technicianId"
              label={
                <Space>
                  <UserOutlined style={{ color: "#52c41a" }} />
                  <span>Kỹ thuật viên</span>
                </Space>
              }
              rules={[{ required: true, message: "Kỹ thuật viên là bắt buộc" }]}
            >
              <Select
                showSearch
                placeholder="Chọn kỹ thuật viên"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const label =
                    typeof option?.label === "string" ? option.label : "";
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
                style={{ borderRadius: "6px" }}
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
    </div>
  );
}

export default CertificatePage;
