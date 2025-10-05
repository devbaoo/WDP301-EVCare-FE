import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  clearCompatibleParts,
  clearSelectedPart,
  createPart,
  deletePart,
  fetchPartById,
  fetchParts,
  fetchVehicleModels,
  resetPartsError,
  updatePart,
} from "@/services/features/parts/partsSlice";
import {
  CompatibleModel,
  Part,
  PartFilterParams,
  PartPayload,
} from "@/interfaces/parts";

type PartFormValues = {
  partNumber: string;
  partName: string;
  category: string;
  description?: string;
  compatibleModels?: string[];
  unitPrice: number;
  supplierName?: string;
  supplierContact?: string;
  leadTimeDays?: number;
  isCritical: boolean;
};

const { Title, Text } = Typography;
const { Option } = Select;

const extractCompatibleModelIds = (models: Part["compatibleModels"]) =>
  models
    .map((model) => (typeof model === "string" ? model : model?._id))
    .filter((id): id is string => typeof id === "string" && id.length > 0);

const StaffPartsPage = () => {
  const dispatch = useAppDispatch();
  const {
    parts,
    loading,
    fetchPartLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    vehicleModels,
    fetchVehicleModelsLoading,
    error,
  } = useAppSelector((state) => state.parts);

  const vehicleModelList = useMemo(
    () => (Array.isArray(vehicleModels) ? vehicleModels : []),
    [vehicleModels]
  );

  const [partNumberFilter, setPartNumberFilter] = useState("");
  const [partNameFilter, setPartNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [criticalFilter, setCriticalFilter] = useState<"all" | "critical" | "nonCritical">(
    "all"
  );

  const paramsRef = useRef<PartFilterParams>({});

  const [form] = Form.useForm<PartFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  const fetchPartsWithParams = useCallback(
    (params?: PartFilterParams) => {
      dispatch(fetchParts(params));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchPartsWithParams();
    dispatch(fetchVehicleModels());
    return () => {
      dispatch(clearSelectedPart());
      dispatch(clearCompatibleParts());
    };
  }, [dispatch, fetchPartsWithParams]);

  useEffect(() => {
    if (!error) {
      return;
    }
    message.error(error);
    dispatch(resetPartsError());
  }, [error, dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params: PartFilterParams = {};
      if (partNumberFilter.trim()) {
        params.partNumber = partNumberFilter.trim();
      }
      if (partNameFilter.trim()) {
        params.partName = partNameFilter.trim();
      }
      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }
      if (criticalFilter !== "all") {
        params.isCritical = criticalFilter === "critical";
      }
      paramsRef.current = params;
      fetchPartsWithParams(params);
    }, 400);

    return () => clearTimeout(handler);
  }, [partNumberFilter, partNameFilter, categoryFilter, criticalFilter, fetchPartsWithParams]);

  const handleResetFilters = () => {
    setPartNumberFilter("");
    setPartNameFilter("");
    setCategoryFilter("all");
    setCriticalFilter("all");
    paramsRef.current = {};
    fetchPartsWithParams();
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    parts.forEach((part) => {
      if (part.category) {
        set.add(part.category);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [parts]);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPart(null);
    form.resetFields();
    form.setFieldsValue({ isCritical: false, compatibleModels: [] });
    setModalOpen(true);
  };

  const openEditModal = async (part: Part) => {
    setModalMode("edit");
    setSelectedPart(part);
    form.setFieldsValue({
      partNumber: part.partNumber,
      partName: part.partName,
      category: part.category,
      description: part.description,
      unitPrice: part.unitPrice,
      compatibleModels: extractCompatibleModelIds(part.compatibleModels),
      supplierName: part.supplierInfo?.name,
      supplierContact: part.supplierInfo?.contact,
      leadTimeDays: part.supplierInfo?.leadTimeDays,
      isCritical: part.isCritical,
    });
    setModalOpen(true);
    dispatch(fetchPartById(part._id));
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedPart(null);
    form.resetFields();
  };

  const buildPayload = (values: PartFormValues): PartPayload => {
    const payload: PartPayload = {
      partNumber: values.partNumber,
      partName: values.partName,
      category: values.category,
      unitPrice: Number(values.unitPrice) || 0,
      isCritical: values.isCritical,
    };

    if (values.description) {
      payload.description = values.description;
    }

    if (values.compatibleModels && values.compatibleModels.length > 0) {
      payload.compatibleModels = values.compatibleModels;
    }

    if (
      values.supplierName ||
      values.supplierContact ||
      typeof values.leadTimeDays === "number"
    ) {
      payload.supplierInfo = {
        name: values.supplierName ?? "",
        contact: values.supplierContact ?? "",
        leadTimeDays: values.leadTimeDays ?? 0,
      };
    }

    return payload;
  };

  const notifyError = (err: unknown, fallback: string) => {
    if (!err) {
      message.error(fallback);
      return;
    }
    if (typeof err === "string") {
      message.error(err);
      return;
    }
    if (err instanceof Error) {
      message.error(err.message || fallback);
      return;
    }
    const maybeMessage = (err as { message?: string }).message;
    message.error(maybeMessage || fallback);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildPayload(values);

      if (modalMode === "create") {
        const action = await dispatch(createPart(payload)).unwrap();
        message.success(action.message || "Tạo phụ tùng thành công");
      } else if (selectedPart) {
        const action = await dispatch(
          updatePart({ partId: selectedPart._id, payload })
        ).unwrap();
        message.success(action.message || "Cập nhật phụ tùng thành công");
      }

      setModalOpen(false);
      form.resetFields();
      fetchPartsWithParams(paramsRef.current);
    } catch (err) {
      notifyError(err, "Không thể lưu phụ tùng");
    }
  };

  const handleDeletePart = async (part: Part) => {
    try {
      const action = await dispatch(deletePart(part._id)).unwrap();
      message.success(action.message || "Xóa phụ tùng thành công");
      if (selectedPart && selectedPart._id === part._id) {
        setSelectedPart(null);
      }
      fetchPartsWithParams(paramsRef.current);
    } catch (err) {
      notifyError(err, "Không thể xóa phụ tùng");
    }
  };

  const columns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "partNumber",
      key: "partNumber",
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "partName",
      key: "partName",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Quan trọng",
      dataIndex: "isCritical",
      key: "isCritical",
      render: (critical: boolean) => (
        <Tag color={critical ? "red" : "default"}>
          {critical ? "Quan trọng" : "Thông thường"}
        </Tag>
      ),
    },
    {
      title: "Giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price ?? 0),
    },
    {
      title: "Nhà cung cấp",
      key: "supplier",
      render: (_: unknown, record: Part) => {
        if (!record.supplierInfo) {
          return <Text type="secondary">Không có</Text>;
        }
        return (
          <div>
            <div className="font-medium">{record.supplierInfo.name}</div>
            <div className="text-xs text-gray-500">{record.supplierInfo.contact}</div>
            <div className="text-xs text-gray-400">
              Thời gian giao: {record.supplierInfo.leadTimeDays} ngày
            </div>
          </div>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 250,
      render: (value?: string) => value || <Text type="secondary">---</Text>,
    },
    {
      title: "Tương thích",
      key: "compatibleModels",
      render: (_: unknown, record: Part) => {
        if (!record.compatibleModels || record.compatibleModels.length === 0) {
          return <Text type="secondary">---</Text>;
        }

        const labels = record.compatibleModels
          .map((model) => {
            if (typeof model === "string") {
              const match = vehicleModelList.find((item) => item._id === model);
              return match ? `${match.brand} ${match.modelName}` : model;
            }
            const typed = model as CompatibleModel;
            const fromVehicleList = vehicleModelList.find((item) => item._id === typed._id);
            if (fromVehicleList) {
              return `${fromVehicleList.brand} ${fromVehicleList.modelName}`;
            }
            const brand = typed.brand ? `${typed.brand}` : "";
            const modelName = (typed as { model?: string }).model || "";
            const year = typeof typed.year === "number" ? ` (${typed.year})` : "";
            const label = `${brand} ${modelName}`.trim();
            return label ? `${label}${year}` : `#${typed._id ?? "model"}`;
          })
          .filter(Boolean);

        const display = labels.slice(0, 3).join(", ");
        const extraCount = labels.length - 3;

        return (
          <Space size={4} wrap>
            <span>{display}</span>
            {extraCount > 0 && <Tag color="blue">+{extraCount}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      render: (_: unknown, record: Part) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa phụ tùng"
            description="Bạn có chắc chắn muốn xóa phụ tùng này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeletePart(record)}
          >
            <Button
              type="link"
              danger
              loading={deleteLoading}
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="mb-1">
          Quản lý phụ tùng
        </Title>
        <Text type="secondary">
          Theo dõi danh sách phụ tùng, quản lý trạng thái quan trọng và thông tin nhà
          cung cấp
        </Text>
      </div>

      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo mã phụ tùng"
              prefix={<SearchOutlined />}
              allowClear
              value={partNumberFilter}
              onChange={(event) => setPartNumberFilter(event.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo tên phụ tùng"
              prefix={<SearchOutlined />}
              allowClear
              value={partNameFilter}
              onChange={(event) => setPartNameFilter(event.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              allowClear={false}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả danh mục</Option>
              {uniqueCategories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={criticalFilter}
              onChange={(value) => setCriticalFilter(value)}
              className="w-full"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="critical">Quan trọng</Option>
              <Option value="nonCritical">Không quan trọng</Option>
            </Select>
          </Col>
        </Row>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button icon={<ReloadOutlined />} onClick={() => fetchPartsWithParams(paramsRef.current)}>
            Làm mới
          </Button>
          <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm phụ tùng
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={parts}
          loading={loading || fetchPartLoading}
          scroll={{ x: 960 }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title={modalMode === "create" ? "Thêm phụ tùng" : "Cập nhật phụ tùng"}
        open={modalOpen}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        confirmLoading={createLoading || updateLoading}
        okText={modalMode === "create" ? "Tạo" : "Lưu"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isCritical: false, compatibleModels: [] }}
        >
          <Form.Item
            label="Mã phụ tùng"
            name="partNumber"
            rules={[{ required: true, message: "Vui lòng nhập mã phụ tùng" }]}
          >
            <Input placeholder="Ví dụ: BT-12345" />
          </Form.Item>
          <Form.Item
            label="Tên phụ tùng"
            name="partName"
            rules={[{ required: true, message: "Vui lòng nhập tên phụ tùng" }]}
          >
            <Input placeholder="Ví dụ: Mô-đun Pin EV" />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: "Vui lòng nhập danh mục" }]}
          >
            <Input placeholder="Ví dụ: battery" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết phụ tùng" />
          </Form.Item>
          <Form.Item
            label="Giá"
            name="unitPrice"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item label="Mẫu xe tương thích" name="compatibleModels">
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn mẫu xe"
              options={vehicleModelList.map((model) => ({
                label: `${model.brand} ${model.modelName} (${model.yearFrom}-${model.yearTo})`,
                value: model._id,
              }))}
              loading={fetchVehicleModelsLoading}
              optionFilterProp="label"
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Tên nhà cung cấp" name="supplierName">
                <Input placeholder="Tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Liên hệ nhà cung cấp" name="supplierContact">
                <Input placeholder="Email hoặc số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Thời gian giao (ngày)" name="leadTimeDays">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item label="Đánh dấu quan trọng" name="isCritical" valuePropName="checked">
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPartsPage;
