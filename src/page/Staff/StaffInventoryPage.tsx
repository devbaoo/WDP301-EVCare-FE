import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BoxPlotOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  fetchInventoryById,
  fetchInventoryItems,
  fetchInventoryStats,
  fetchInventoryTransactions,
  fetchLowStockInventory,
  createInventoryTransaction,
  createInventoryItem,
  updateInventoryItem,
  resetInventoryError,
  clearSelectedInventoryItem,
} from "@/services/features/inventory/inventorySlice";
import { fetchServiceCenters } from "@/services/features/serviceCenter/serviceCenterSlice";
import { fetchParts } from "@/services/features/parts/partsSlice";
import {
  InventoryFilterParams,
  InventoryItem,
  InventoryPayload,
  InventoryReferenceType,
  InventoryTransactionPayload,
} from "@/interfaces/parts";

type TransactionFormValues = {
  transactionType: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  unitCost?: number;
  referenceType?: InventoryReferenceType;
  referenceId?: string;
  notes?: string;
};

type InventoryFormValues = {
  centerId: string;
  partId: string;
  currentStock: number;
  minStockLevel: number;
  reorderPoint: number;
  maxStockLevel: number;
  costPerUnit?: number;
  location?: string;
};

const { Title, Text } = Typography;
const { Option } = Select;

const StaffInventoryPage = () => {
  const referenceTypeOptions: { value: InventoryReferenceType; label: string }[] = useMemo(
    () => [
      { value: "service", label: "Dịch vụ" },
      { value: "purchase", label: "Mua hàng" },
      { value: "adjustment", label: "Điều chỉnh" },
      { value: "transfer", label: "Chuyển kho" },
    ],
    []
  );

  const dispatch = useAppDispatch();
  const {
    items,
    lowStockItems,
    statsByCenter,
    selectedItem,
    transactions,
    loading,
    fetchItemLoading,
    fetchLowStockLoading,
    statsLoading,
    fetchTransactionsLoading,
    createLoading,
    updateLoading,
    transactionLoading,
    error,
  } = useAppSelector((state) => state.inventory);
  const { serviceCenters } = useAppSelector((state) => state.serviceCenter);
  const { parts } = useAppSelector((state) => state.parts);

  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedPartId, setSelectedPartId] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const filterRef = useRef<InventoryFilterParams>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [activeInventory, setActiveInventory] = useState<InventoryItem | null>(null);
  const [transactionForm] = Form.useForm<TransactionFormValues>();
  const [createInventoryForm] = Form.useForm<InventoryFormValues>();
  const [updateInventoryForm] = Form.useForm<InventoryFormValues>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [transactionsInventoryId, setTransactionsInventoryId] = useState<string | null>(
    null
  );

  const notifyError = useCallback((err: unknown, fallback: string) => {
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
  }, []);

  const buildFilters = useCallback((): InventoryFilterParams => {
    const params: InventoryFilterParams = {};
    if (selectedCenter) {
      params.centerId = selectedCenter;
    }
    if (selectedPartId !== "all") {
      params.partId = selectedPartId;
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (lowStockOnly) {
      params.lowStock = true;
    }
    filterRef.current = params;
    return params;
  }, [selectedCenter, selectedPartId, statusFilter, lowStockOnly]);

  const refreshInventory = useCallback(() => {
    const params = buildFilters();
    dispatch(fetchInventoryItems(params));
  }, [buildFilters, dispatch]);

  useEffect(() => {
    dispatch(fetchServiceCenters({ page: 1, limit: 1000 }));
    dispatch(fetchParts(undefined));
    return () => {
      dispatch(clearSelectedInventoryItem());
    };
  }, [dispatch]);

  useEffect(() => {
    if (serviceCenters.length > 0 && !selectedCenter) {
      setSelectedCenter(serviceCenters[0]._id);
    }
  }, [serviceCenters, selectedCenter]);

  useEffect(() => {
    if (!selectedCenter) {
      return;
    }
    refreshInventory();
  }, [selectedCenter, selectedPartId, statusFilter, lowStockOnly, refreshInventory]);

  useEffect(() => {
    if (!selectedCenter) {
      return;
    }
    dispatch(fetchInventoryStats(selectedCenter));
    dispatch(fetchLowStockInventory(selectedCenter));
  }, [selectedCenter, dispatch]);

  useEffect(() => {
    if (!error) {
      return;
    }
    message.error(error);
    dispatch(resetInventoryError());
  }, [error, dispatch]);

  const centerStats = selectedCenter ? statsByCenter[selectedCenter] : undefined;

  const filteredByLocation = useMemo(() => {
    if (!searchLocation.trim()) {
      return items;
    }
    const keyword = searchLocation.trim().toLowerCase();
    return items.filter((item) => {
      const location = item.location ?? "";
      return location.toLowerCase().includes(keyword);
    });
  }, [items, searchLocation]);

  const partOptions = useMemo(() => {
    return parts.map((part) => ({ value: part._id, label: `${part.partNumber} - ${part.partName}` }));
  }, [parts]);

  const handleOpenDrawer = (item: InventoryItem) => {
    setActiveInventory(item);
    setDrawerOpen(true);
    dispatch(fetchInventoryById(item._id));
    setTransactionsInventoryId(item._id);
    dispatch(fetchInventoryTransactions({ inventoryId: item._id }));
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setActiveInventory(null);
    setTransactionsInventoryId(null);
  };

  const handleOpenTransactionModal = (item: InventoryItem) => {
    setActiveInventory(item);
    transactionForm.resetFields();
    transactionForm.setFieldsValue({ transactionType: "in", quantity: 1 });
    setTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setTransactionModalOpen(false);
    transactionForm.resetFields();
  };

  const handleOpenCreateModal = () => {
    const defaultCenter = selectedCenter || serviceCenters[0]?._id;
    const defaultPart = partOptions[0]?.value;
    createInventoryForm.resetFields();
    createInventoryForm.setFieldsValue({
      centerId: defaultCenter,
      partId: defaultPart,
      currentStock: 0,
      minStockLevel: 0,
      reorderPoint: 0,
      maxStockLevel: 0,
      costPerUnit: undefined,
      location: undefined,
    } as Partial<InventoryFormValues>);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    createInventoryForm.resetFields();
  };

  const handleSubmitTransaction = async () => {
    if (!activeInventory) {
      return;
    }
    try {
      const values = await transactionForm.validateFields();
      const payload: InventoryTransactionPayload = {
        inventoryId: activeInventory._id,
        transactionType: values.transactionType,
        quantity: Number(values.quantity) || 0,
      };
      if (values.unitCost !== undefined) {
        payload.unitCost = Number(values.unitCost);
      }
      if (values.referenceType) {
        payload.referenceType = values.referenceType;
      }
      if (values.referenceId) {
        payload.referenceId = values.referenceId;
      }
      if (values.notes) {
        payload.notes = values.notes;
      }

      const action = await dispatch(createInventoryTransaction(payload)).unwrap();
      message.success(action.message || "Tạo giao dịch tồn kho thành công");
      setTransactionModalOpen(false);
      transactionForm.resetFields();
      refreshInventory();
      if (selectedCenter) {
        dispatch(fetchInventoryStats(selectedCenter));
        dispatch(fetchLowStockInventory(selectedCenter));
      }
      dispatch(fetchInventoryTransactions({ inventoryId: activeInventory._id }));
    } catch (err) {
      notifyError(err, "Không thể tạo giao dịch tồn kho");
    }
  };

  const handleCreateInventory = async () => {
    try {
      const values = await createInventoryForm.validateFields();
      const payload: InventoryPayload = {
        centerId: values.centerId,
        partId: values.partId,
        currentStock: Number(values.currentStock) || 0,
        minStockLevel: Number(values.minStockLevel) || 0,
        reorderPoint: Number(values.reorderPoint) || 0,
        maxStockLevel: Number(values.maxStockLevel) || 0,
        costPerUnit:
          values.costPerUnit === undefined
            ? undefined
            : Number(values.costPerUnit),
        location: values.location,
      };

      const action = await dispatch(createInventoryItem(payload)).unwrap();
      message.success(action.message || "Tạo tồn kho thành công");
      setCreateModalOpen(false);
      createInventoryForm.resetFields();
      if (!selectedCenter && payload.centerId) {
        setSelectedCenter(payload.centerId);
      }
      refreshInventory();
      if (payload.centerId) {
        dispatch(fetchInventoryStats(payload.centerId));
        dispatch(fetchLowStockInventory(payload.centerId));
      }
    } catch (err) {
      notifyError(err, "Không thể tạo tồn kho");
    }
  };

  const handleUpdateInventory = async () => {
    if (!currentInventory) {
      return;
    }
    try {
      const values = await updateInventoryForm.validateFields();
      const updatePayload: Partial<InventoryPayload> = {
        currentStock: Number(values.currentStock) || 0,
        minStockLevel: Number(values.minStockLevel) || 0,
        reorderPoint: Number(values.reorderPoint) || 0,
        maxStockLevel: Number(values.maxStockLevel) || 0,
      };
      if (values.costPerUnit !== undefined) {
        updatePayload.costPerUnit = Number(values.costPerUnit);
      }
      if (values.location !== undefined) {
        updatePayload.location = values.location;
      }

      const action = await dispatch(
        updateInventoryItem({ inventoryId: currentInventory._id, payload: updatePayload })
      ).unwrap();
      message.success(action.message || "Cập nhật tồn kho thành công");
      refreshInventory();
      if (selectedCenter) {
        dispatch(fetchInventoryStats(selectedCenter));
        dispatch(fetchLowStockInventory(selectedCenter));
      }
    } catch (err) {
      notifyError(err, "Không thể cập nhật tồn kho");
    }
  };

  const inventoryColumns = [
    {
      title: "Trung tâm",
      key: "center",
      render: (record: InventoryItem) => {
        const center =
          typeof record.centerId === "string"
            ? serviceCenters.find((c) => c._id === record.centerId)
            : record.centerId;
        if (!center) {
          return <Text type="secondary">Không xác định</Text>;
        }
        if ("address" in center && center.address) {
          const serviceCenter = center as typeof serviceCenters[number];
          const address = serviceCenter.address;
          return (
            <div>
              <div className="font-medium">{serviceCenter.name}</div>
              <div className="text-xs text-gray-500">
                {address.street}, {address.ward}, {address.district}
              </div>
            </div>
          );
        }
        const centerRef = center as { name: string; location?: string };
        return (
          <div>
            <div className="font-medium">{centerRef.name}</div>
            {centerRef.location && (
              <div className="text-xs text-gray-500">{centerRef.location}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Phụ tùng",
      key: "part",
      render: (record: InventoryItem) => {
        const part =
          typeof record.partId === "string"
            ? parts.find((p) => p._id === record.partId)
            : record.partId;
        if (!part) {
          return <Text type="secondary">Không xác định</Text>;
        }
        const partNumber = (part as { partNumber?: string }).partNumber ?? "--";
        const partName = (part as { partName?: string }).partName ?? "--";
        const category = (part as { category?: string }).category;
        const isCritical = Boolean((part as { isCritical?: boolean }).isCritical);
        return (
          <div>
            <div className="font-medium">{partName}</div>
            <div className="text-xs text-gray-500">{partNumber}</div>
            {category && <Tag color="blue">{category}</Tag>}
            {isCritical && (
              <Tag color="red" className="ml-1">
                Quan trọng
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Tồn kho hiện tại",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: "Mức tồn kho",
      key: "thresholds",
      render: (record: InventoryItem) => (
        <div className="space-y-1 text-xs">
          <div>Tối thiểu: {record.minStockLevel}</div>
          <div>Điểm đặt hàng: {record.reorderPoint}</div>
          <div>Tối đa: {record.maxStockLevel}</div>
        </div>
      ),
    },
    {
      title: "Thông tin thêm",
      key: "meta",
      render: (record: InventoryItem) => (
        <div className="space-y-1 text-xs">
          <div>Chi phí: {record.costPerUnit ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.costPerUnit) : "--"}</div>
          <div>Vị trí: {record.location || "--"}</div>
          <div>Cập nhật: {dayjs(record.updatedAt).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          available: "green",
          out_of_stock: "red",
          discontinued: "gray",
        };
        return <Tag color={colorMap[status] || "blue"}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      render: (_: unknown, record: InventoryItem) => (
        <Space>
          <Button type="link" icon={<InfoCircleOutlined />} onClick={() => handleOpenDrawer(record)}>
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<ShoppingOutlined />}
            onClick={() => handleOpenTransactionModal(record)}
          >
            Giao dịch
          </Button>
        </Space>
      ),
    },
  ];

  const currentInventory = selectedItem ?? activeInventory ?? null;

  const inventoryTransactions = useMemo(() => {
    if (!transactionsInventoryId) {
      return [];
    }
    return transactions.filter((transaction) => {
      const invId =
        typeof transaction.inventoryId === "string"
          ? transaction.inventoryId
          : transaction.inventoryId._id;
      return invId === transactionsInventoryId;
    });
  }, [transactions, transactionsInventoryId]);

  useEffect(() => {
    if (!currentInventory) {
      return;
    }
    updateInventoryForm.setFieldsValue({
      centerId:
        typeof currentInventory.centerId === "string"
          ? currentInventory.centerId
          : currentInventory.centerId._id,
      partId:
        typeof currentInventory.partId === "string"
          ? currentInventory.partId
          : currentInventory.partId._id,
      currentStock: currentInventory.currentStock,
      minStockLevel: currentInventory.minStockLevel,
      reorderPoint: currentInventory.reorderPoint,
      maxStockLevel: currentInventory.maxStockLevel,
      costPerUnit: currentInventory.costPerUnit,
      location: currentInventory.location,
    } as InventoryFormValues);
  }, [currentInventory, updateInventoryForm]);

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="mb-1">
          Quản lý tồn kho phụ tùng
        </Title>
        <Text type="secondary">
          Theo dõi số lượng phụ tùng tại các trung tâm dịch vụ và ghi nhận giao dịch nhập/xuất
        </Text>
      </div>

      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Select
              className="w-full"
              value={selectedCenter || undefined}
              placeholder="Chọn trung tâm"
              onChange={(value) => setSelectedCenter(value)}
            >
              {serviceCenters.map((center) => (
                <Option key={center._id} value={center._id}>
                  {center.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              className="w-full"
              value={selectedPartId}
              onChange={(value) => setSelectedPartId(value)}
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[{ value: "all", label: "Tất cả phụ tùng" }, ...partOptions]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              className="w-full"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="available">Còn hàng</Option>
              <Option value="out_of_stock">Hết hàng</Option>
              <Option value="discontinued">Ngừng kinh doanh</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo vị trí (ví dụ: Kệ A-12)"
              value={searchLocation}
              onChange={(event) => setSearchLocation(event.target.value)}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-3" align="middle">
          <Col xs={24} md={8}>
            <Space>
              <Switch checked={lowStockOnly} onChange={(checked) => setLowStockOnly(checked)} />
              <span>Chỉ hiển thị tồn kho thấp</span>
            </Space>
          </Col>
          <Col xs={24} md={16} className="flex justify-end gap-3">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
              Thêm tồn kho
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refreshInventory}>
              Tải lại
            </Button>
          </Col>
        </Row>
      </Card>

      {selectedCenter && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card loading={statsLoading}>
              <Space direction="vertical">
                <Space align="center">
                  <BoxPlotOutlined className="text-xl text-blue-500" />
                  <Text strong>Tổng mặt hàng</Text>
                </Space>
                <Title level={3} className="m-0">
                  {centerStats?.totalItems ?? 0}
                </Title>
                <Text type="secondary">Số mặt hàng quản lý tại trung tâm</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card loading={statsLoading}>
              <Space direction="vertical">
                <Space align="center">
                  <ShoppingOutlined className="text-xl text-green-500" />
                  <Text strong>Tổng tồn kho</Text>
                </Space>
                <Title level={3} className="m-0">
                  {centerStats?.totalStock ?? 0}
                </Title>
                <Text type="secondary">Số lượng phụ tùng đang có sẵn</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card loading={statsLoading}>
              <Space direction="vertical">
                <Space align="center">
                  <WarningOutlined className="text-xl text-orange-500" />
                  <Text strong>Cảnh báo</Text>
                </Space>
                <div className="flex items-baseline gap-4">
                  <div>
                    <Title level={4} className="m-0 text-orange-500">
                      {centerStats?.lowStockItems ?? 0}
                    </Title>
                    <Text type="secondary">Thiếu hàng</Text>
                  </div>
                  <div>
                    <Title level={4} className="m-0 text-red-500">
                      {centerStats?.outOfStockItems ?? 0}
                    </Title>
                    <Text type="secondary">Hết hàng</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <Card title="Danh sách tồn kho">
        <Table
          rowKey="_id"
          columns={inventoryColumns}
          dataSource={filteredByLocation}
          loading={loading || fetchItemLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card
        title="Cảnh báo tồn kho thấp"
        extra={<Text type="secondary">Tự động cập nhật theo trung tâm</Text>}
        loading={fetchLowStockLoading}
      >
        {lowStockItems.length === 0 ? (
          <Text type="secondary">Không có cảnh báo tồn kho thấp</Text>
        ) : (
          <List
            dataSource={lowStockItems}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <WarningOutlined className="text-orange-500" />
                      <span>
                        {typeof item.partId === "string"
                          ? item.partId
                          : `${item.partId.partNumber} - ${item.partId.partName}`}
                      </span>
                    </Space>
                  }
                  description={
                    <div className="text-sm text-gray-500">
                      Tồn kho: {item.currentStock} | Điểm đặt hàng: {item.reorderPoint}
                    </div>
                  }
                />
                <Button type="link" onClick={() => handleOpenDrawer(item)}>
                  Xem chi tiết
                </Button>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Drawer
        title="Chi tiết tồn kho"
        width={520}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        destroyOnHidden
      >
        {!currentInventory ? (
          <Spin />
        ) : (
          <div className="space-y-4">
            <Form form={updateInventoryForm} layout="vertical">
              <Form.Item label="Trung tâm" name="centerId">
                <Select disabled>
                  {serviceCenters.map((center) => (
                    <Option key={center._id} value={center._id}>
                      {center.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Phụ tùng" name="partId">
                <Select disabled showSearch optionFilterProp="label">
                  {partOptions.map((option) => (
                    <Option key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Tồn kho hiện tại"
                    name="currentStock"
                    rules={[{ required: true, message: "Nhập tồn kho hiện tại" }]}
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Chi phí mỗi đơn vị"
                    name="costPerUnit"
                    tooltip="Đơn giá nhập kho"
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    label="Tồn kho tối thiểu"
                    name="minStockLevel"
                    rules={[{ required: true, message: "Nhập tồn kho tối thiểu" }]}
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Điểm đặt hàng"
                    name="reorderPoint"
                    rules={[{ required: true, message: "Nhập điểm đặt hàng" }]}
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Tồn kho tối đa"
                    name="maxStockLevel"
                    rules={[{ required: true, message: "Nhập tồn kho tối đa" }]}
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Vị trí kho" name="location">
                <Input placeholder="Ví dụ: Kệ A-12" />
              </Form.Item>
              <Form.Item label="Cập nhật lần cuối">
                <Input value={dayjs(currentInventory.updatedAt).format("DD/MM/YYYY HH:mm")} disabled />
              </Form.Item>
              <div className="flex justify-end">
                <Button type="primary" onClick={handleUpdateInventory} loading={updateLoading}>
                  Lưu thay đổi
                </Button>
              </div>
            </Form>

            <Divider orientation="left">Giao dịch gần đây</Divider>
            {fetchTransactionsLoading ? (
              <Spin />
            ) : inventoryTransactions.length === 0 ? (
              <Text type="secondary">Chưa có giao dịch nào</Text>
            ) : (
              <List
                dataSource={inventoryTransactions}
                renderItem={(transaction) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="blue">{transaction.transactionType}</Tag>
                          <span>{dayjs(transaction.transactionDate).format("DD/MM/YYYY HH:mm")}</span>
                        </Space>
                      }
                      description={
                        <div className="text-sm text-gray-500 space-y-1">
                          <div>Số lượng: {transaction.quantity}</div>
                          {transaction.unitCost !== undefined && (
                            <div>
                              Đơn giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(transaction.unitCost)}
                            </div>
                          )}
                          {transaction.referenceType && (
                            <div>Tham chiếu: {transaction.referenceType}</div>
                          )}
                          {transaction.notes && <div>Ghi chú: {transaction.notes}</div>}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title="Thêm tồn kho mới"
        open={createModalOpen}
        onCancel={handleCloseCreateModal}
        onOk={handleCreateInventory}
        confirmLoading={createLoading}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={createInventoryForm} layout="vertical">
          <Form.Item
            label="Trung tâm"
            name="centerId"
            rules={[{ required: true, message: "Chọn trung tâm" }]}
          >
            <Select placeholder="Chọn trung tâm">
              {serviceCenters.map((center) => (
                <Option key={center._id} value={center._id}>
                  {center.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Phụ tùng"
            name="partId"
            rules={[{ required: true, message: "Chọn phụ tùng" }]}
          >
            <Select
              showSearch
              placeholder="Chọn phụ tùng"
              optionFilterProp="label"
              options={partOptions}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Tồn kho hiện tại"
                name="currentStock"
                rules={[{ required: true, message: "Nhập tồn kho hiện tại" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Chi phí mỗi đơn vị" name="costPerUnit">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label="Tồn kho tối thiểu"
                name="minStockLevel"
                rules={[{ required: true, message: "Nhập tồn kho tối thiểu" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Điểm đặt hàng"
                name="reorderPoint"
                rules={[{ required: true, message: "Nhập điểm đặt hàng" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tồn kho tối đa"
                name="maxStockLevel"
                rules={[{ required: true, message: "Nhập tồn kho tối đa" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Vị trí kho" name="location">
            <Input placeholder="Ví dụ: Kệ A-12" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Ghi nhận giao dịch tồn kho"
        open={transactionModalOpen}
        onCancel={handleCloseTransactionModal}
        onOk={handleSubmitTransaction}
        confirmLoading={transactionLoading}
        okText="Ghi nhận"
        cancelText="Hủy"
      >
        {!activeInventory ? (
          <Text type="secondary">Chọn một mục tồn kho để ghi nhận giao dịch</Text>
        ) : (
          <Form form={transactionForm} layout="vertical">
            <Form.Item label="Loại giao dịch" name="transactionType" rules={[{ required: true, message: "Chọn loại giao dịch" }]}>
              <Select>
                <Option value="in">Nhập kho</Option>
                <Option value="out">Xuất kho</Option>
                <Option value="adjustment">Điều chỉnh</Option>
                <Option value="transfer">Chuyển kho</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: "Nhập số lượng" }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item label="Đơn giá" name="unitCost">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="Loại tham chiếu" name="referenceType">
              <Select
                placeholder="Chọn loại tham chiếu"
                allowClear
                options={referenceTypeOptions}
              />
            </Form.Item>
            <Form.Item label="Mã tham chiếu" name="referenceId">
              <Input placeholder="Nhập ID liên quan (nếu có)" />
            </Form.Item>
            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} placeholder="Ghi chú bổ sung" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default StaffInventoryPage;
