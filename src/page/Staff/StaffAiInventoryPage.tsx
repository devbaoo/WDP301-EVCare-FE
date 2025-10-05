import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  List,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ApiOutlined,
  BarChartOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenters } from "@/services/features/serviceCenter/serviceCenterSlice";
import {
  applyAiRecommendations,
  clearAiApplyResults,
  createDemandForecast,
  createStockOptimization,
  fetchAiPredictions,
  resetAiError,
} from "@/services/features/ai/aiSlice";
import { fetchParts } from "@/services/features/parts/partsSlice";
import { AiPrediction } from "@/interfaces/parts";

const { Title, Text } = Typography;
const { Option } = Select;

const predictionTypeLabels: Record<string, string> = {
  demand_forecast: "Dự báo nhu cầu",
  failure_prediction: "Dự đoán hư hỏng",
  stock_optimization: "Tối ưu tồn kho",
};

const predictionPeriodLabels: Record<string, string> = {
  "1_month": "1 tháng",
  "3_months": "3 tháng",
  "6_months": "6 tháng",
};

const StaffAiInventoryPage = () => {
  const dispatch = useAppDispatch();
  const { serviceCenters } = useAppSelector((state) => state.serviceCenter);
  const { parts } = useAppSelector((state) => state.parts);
  const {
    predictions,
    latestDemandForecast,
    latestStockOptimization,
    applyResults,
    loading,
    fetchPredictionLoading,
    demandForecastLoading,
    stockOptimizationLoading,
    applyRecommendationsLoading,
    error,
  } = useAppSelector((state) => state.ai);

  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [filterType, setFilterType] = useState<string | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<string | "all">("all");
  const [forecastPeriod, setForecastPeriod] = useState<string>("1_month");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRecommendationIds, setSelectedRecommendationIds] = useState<string[]>([]);

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

  const loadPredictions = useCallback(() => {
    const params: {
      centerId?: string;
      predictionType?: string;
      predictionPeriod?: string;
    } = {};
    if (selectedCenter) {
      params.centerId = selectedCenter;
    }
    if (filterType !== "all") {
      params.predictionType = filterType;
    }
    if (filterPeriod !== "all") {
      params.predictionPeriod = filterPeriod;
    }
    dispatch(fetchAiPredictions(params));
  }, [dispatch, selectedCenter, filterType, filterPeriod]);

  useEffect(() => {
    dispatch(fetchServiceCenters({ page: 1, limit: 1000 }));
    dispatch(fetchParts(undefined));
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
    loadPredictions();
  }, [selectedCenter, filterType, filterPeriod, loadPredictions]);

  useEffect(() => {
    if (!error) {
      return;
    }
    message.error(error);
    dispatch(resetAiError());
  }, [error, dispatch]);

  const filteredPredictions = useMemo(() => {
    return predictions.filter((prediction) => {
      const matchCenter = selectedCenter ? prediction.centerId === selectedCenter || (typeof prediction.centerId !== "string" && prediction.centerId?._id === selectedCenter) : true;
      const matchType = filterType === "all" ? true : prediction.predictionType === filterType;
      const matchPeriod = filterPeriod === "all" ? true : prediction.predictionPeriod === filterPeriod;
      return matchCenter && matchType && matchPeriod;
    });
  }, [predictions, selectedCenter, filterType, filterPeriod]);

  const stockOptimizationOptions = useMemo(() => {
    return predictions
      .filter(
        (prediction) =>
          prediction.predictionType === "stock_optimization" &&
          (prediction.centerId === selectedCenter ||
            (typeof prediction.centerId !== "string" && prediction.centerId?._id === selectedCenter))
      )
      .map((prediction) => ({
        label: `${prediction.partId && typeof prediction.partId !== "string" ? prediction.partId.partName : "Phụ tùng"} - ${prediction.predictedValue ?? "?"}`,
        value: prediction._id,
      }));
  }, [predictions, selectedCenter]);

  const findCenterName = useCallback(
    (prediction: AiPrediction) => {
      if (typeof prediction.centerId === "string") {
        const center = serviceCenters.find((c) => c._id === prediction.centerId);
        return center?.name || prediction.centerId;
      }
      return prediction.centerId?.name ?? "--";
    },
    [serviceCenters]
  );

  const findPartInfo = useCallback(
    (prediction: AiPrediction) => {
      if (!prediction.partId) {
        return "--";
      }
      if (typeof prediction.partId === "string") {
        const part = parts.find((p) => p._id === prediction.partId);
        return part ? `${part.partNumber} - ${part.partName}` : prediction.partId;
      }
      return `${prediction.partId.partNumber} - ${prediction.partId.partName}`;
    },
    [parts]
  );

  const columns = [
    {
      title: "Trung tâm",
      key: "center",
      render: (record: AiPrediction) => <span className="font-medium">{findCenterName(record)}</span>,
    },
    {
      title: "Phụ tùng",
      key: "part",
      render: (record: AiPrediction) => <span>{findPartInfo(record)}</span>,
    },
    {
      title: "Loại",
      dataIndex: "predictionType",
      key: "predictionType",
      render: (type: string) => <Tag color={type === "stock_optimization" ? "purple" : type === "demand_forecast" ? "green" : "blue"}>{predictionTypeLabels[type] || type}</Tag>,
    },
    {
      title: "Giá trị dự đoán",
      dataIndex: "predictedValue",
      key: "predictedValue",
      render: (value?: number) => (value !== undefined ? value : "--"),
    },
    {
      title: "Độ tin cậy",
      dataIndex: "confidenceScore",
      key: "confidenceScore",
      render: (value?: number) => (value !== undefined ? `${Math.round(value * 100)}%` : "--"),
    },
    {
      title: "Giai đoạn",
      dataIndex: "predictionPeriod",
      key: "predictionPeriod",
      render: (period?: string) => (period ? predictionPeriodLabels[period] || period : "--"),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => dayjs(createdAt).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const handleCreateForecast = async () => {
    if (!selectedCenter) {
      message.warning("Vui lòng chọn trung tâm dịch vụ");
      return;
    }
    try {
      const action = await dispatch(
        createDemandForecast({ centerId: selectedCenter, predictionPeriod: forecastPeriod })
      ).unwrap();
      message.success(action.message || "Tạo dự báo nhu cầu thành công");
      loadPredictions();
    } catch (err) {
      notifyError(err, "Không thể tạo dự báo nhu cầu");
    }
  };

  const handleCreateOptimization = async () => {
    if (!selectedCenter) {
      message.warning("Vui lòng chọn trung tâm dịch vụ");
      return;
    }
    try {
      const action = await dispatch(
        createStockOptimization({ centerId: selectedCenter })
      ).unwrap();
      message.success(action.message || "Tạo tối ưu tồn kho thành công");
      loadPredictions();
    } catch (err) {
      notifyError(err, "Không thể tạo tối ưu tồn kho");
    }
  };

  const handleOpenApplyModal = () => {
    if (!selectedCenter) {
      message.warning("Vui lòng chọn trung tâm dịch vụ");
      return;
    }
    setApplyModalOpen(true);
    dispatch(clearAiApplyResults());
    setSelectedRecommendationIds([]);
  };

  const handleApplyRecommendations = async () => {
    if (!selectedCenter) {
      message.warning("Vui lòng chọn trung tâm dịch vụ");
      return;
    }
    if (selectedRecommendationIds.length === 0) {
      message.warning("Chọn ít nhất một khuyến nghị để áp dụng");
      return;
    }
    try {
      const action = await dispatch(
        applyAiRecommendations({ centerId: selectedCenter, predictionIds: selectedRecommendationIds })
      ).unwrap();
      message.success(action.message || "Áp dụng khuyến nghị thành công");
      setApplyModalOpen(false);
      loadPredictions();
    } catch (err) {
      notifyError(err, "Không thể áp dụng khuyến nghị AI");
    }
  };

  const latestForecast = latestDemandForecast.length > 0 ? latestDemandForecast[0] : null;
  const latestOptimization = latestStockOptimization.length > 0 ? latestStockOptimization[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="mb-1">
          Tối ưu tồn kho bằng AI
        </Title>
        <Text type="secondary">
          Theo dõi dự đoán AI và áp dụng khuyến nghị tồn kho cho trung tâm dịch vụ
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
              loading={serviceCenters.length === 0}
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
              value={filterType}
              onChange={(value) => setFilterType(value)}
            >
              <Option value="all">Tất cả loại dự đoán</Option>
              <Option value="demand_forecast">Dự báo nhu cầu</Option>
              <Option value="stock_optimization">Tối ưu tồn kho</Option>
              <Option value="failure_prediction">Dự đoán hư hỏng</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              className="w-full"
              value={filterPeriod}
              onChange={(value) => setFilterPeriod(value)}
            >
              <Option value="all">Tất cả giai đoạn</Option>
              <Option value="1_month">1 tháng</Option>
              <Option value="3_months">3 tháng</Option>
              <Option value="6_months">6 tháng</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button icon={<ReloadOutlined />} onClick={loadPredictions} disabled={!selectedCenter}>
              Làm mới danh sách
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} md={8}>
            <Card size="small" loading={demandForecastLoading}>
              <Space align="start">
                <BarChartOutlined className="text-2xl text-blue-500" />
                <div>
                  <Text strong>Dự báo nhu cầu mới nhất</Text>
                  <div className="text-sm text-gray-500">
                    {latestForecast
                      ? `${findPartInfo(latestForecast)} • ${latestForecast.predictedValue} (độ tin cậy ${
                          latestForecast.confidenceScore
                            ? `${Math.round(latestForecast.confidenceScore * 100)}%`
                            : "--"
                        })`
                      : "Chưa có dữ liệu"}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" loading={stockOptimizationLoading}>
              <Space align="start">
                <RobotOutlined className="text-2xl text-purple-500" />
                <div>
                  <Text strong>Tối ưu tồn kho gần nhất</Text>
                  <div className="text-sm text-gray-500">
                    {latestOptimization
                      ? `${findPartInfo(latestOptimization)} • Khuyến nghị ${
                          latestOptimization.predictedValue ?? "--"
                        }`
                      : "Chưa có dữ liệu"}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small">
              <Space direction="vertical" className="w-full">
                <Space>
                  <ThunderboltOutlined className="text-xl text-orange-500" />
                  <Text strong>Tạo dự báo & tối ưu</Text>
                </Space>
                <Space direction="vertical" className="w-full">
                  <Select
                    value={forecastPeriod}
                    onChange={(value) => setForecastPeriod(value)}
                    className="w-full"
                  >
                    <Option value="1_month">1 tháng</Option>
                    <Option value="3_months">3 tháng</Option>
                    <Option value="6_months">6 tháng</Option>
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleCreateForecast}
                    loading={demandForecastLoading}
                    disabled={!selectedCenter}
                  >
                    Tạo dự báo nhu cầu
                  </Button>
                  <Button
                    onClick={handleCreateOptimization}
                    loading={stockOptimizationLoading}
                    disabled={!selectedCenter}
                  >
                    Tạo tối ưu tồn kho
                  </Button>
                  <Button
                    type="dashed"
                    icon={<ApiOutlined />}
                    onClick={handleOpenApplyModal}
                    disabled={stockOptimizationOptions.length === 0 || !selectedCenter}
                  >
                    Áp dụng khuyến nghị AI
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="Danh sách dự đoán AI">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredPredictions}
          loading={loading || fetchPredictionLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          expandable={{
            expandedRowRender: (record: AiPrediction) => (
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(record.inputData, null, 2)}
              </pre>
            ),
            rowExpandable: (record) => Boolean(record.inputData),
          }}
        />
      </Card>

      <Modal
        title="Áp dụng khuyến nghị AI"
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        onOk={handleApplyRecommendations}
        confirmLoading={applyRecommendationsLoading}
        okText="Áp dụng"
        cancelText="Hủy"
      >
        <Space direction="vertical" className="w-full">
          <Text>Chọn các khuyến nghị tối ưu tồn kho muốn áp dụng cho trung tâm.</Text>
          <Select
            mode="multiple"
            className="w-full"
            placeholder="Chọn khuyến nghị"
            value={selectedRecommendationIds}
            onChange={setSelectedRecommendationIds}
            options={stockOptimizationOptions}
          />
        </Space>
      </Modal>

      {applyResults.length > 0 && (
        <Card title="Kết quả áp dụng khuyến nghị" className="border-green-200">
          <List
            dataSource={applyResults}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <RobotOutlined className="text-green-500" />
                      <span>
                        {typeof item.partId === "string"
                          ? item.partId
                          : `${item.partId.partNumber} - ${item.partId.partName}`}
                      </span>
                    </Space>
                  }
                  description={
                    <div className="text-sm text-gray-500">
                      Tồn kho: {item.currentStock} • Tối thiểu: {item.minStockLevel} • Điểm đặt hàng: {item.reorderPoint}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default StaffAiInventoryPage;
