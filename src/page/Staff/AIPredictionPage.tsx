import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    Alert,
    Tabs,
    Statistic,
    Table,
    Tag,
    Progress,
    Space,
    Typography,
    Modal,
    Empty,
} from "antd";
import {
    ReloadOutlined,
    RobotOutlined,
    BarChartOutlined,
    HistoryOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import {
    generateAIPrediction,
    regenerateAIPrediction,
    fetchLatestPrediction,
    fetchPredictionHistory,
    fetchPredictionStats,
    clearError,
} from "../../services/features/aiPrediction/aiPredictionSlice";
import { AIPrediction } from "../../interfaces/aiPrediction";
import InventoryRecommendationCard from "../../components/AIPrediction/InventoryRecommendationCard";
import PredictionStatsCard from "../../components/AIPrediction/PredictionStatsCard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AIPredictionPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        latestPrediction,
        predictionHistory,
        stats,
        loading,
        generateLoading,
        regenerateLoading,
        historyLoading,
        statsLoading,
        error,
        pagination,
    } = useAppSelector((state) => state.aiPrediction);

    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("overview");
    const [historyPage, setHistoryPage] = useState(1);
    const [selectedPrediction, setSelectedPrediction] = useState<AIPrediction | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Get center ID from user (assuming staff has centerId)
    const centerId = (user as any)?.centerId || "68ebe63f934e3c87544b83ad"; // fallback for demo

    useEffect(() => {
        if (centerId) {
            dispatch(fetchLatestPrediction(centerId));
            dispatch(fetchPredictionStats(centerId));
        }
    }, [dispatch, centerId]);

    useEffect(() => {
        if (activeTab === "history" && centerId) {
            dispatch(fetchPredictionHistory({ centerId, page: historyPage, limit: 10 }));
        }
    }, [dispatch, activeTab, centerId, historyPage]);

    const handleGenerate = () => {
        if (centerId) {
            dispatch(generateAIPrediction(centerId));
        }
    };

    const handleRegenerate = () => {
        Modal.confirm({
            title: "Xác nhận tạo lại dự đoán",
            content: "Bạn có chắc chắn muốn tạo lại dự đoán AI? Dự đoán hiện tại sẽ bị thay thế.",
            icon: <ExclamationCircleOutlined />,
            onOk: () => {
                if (centerId) {
                    dispatch(regenerateAIPrediction(centerId));
                }
            },
        });
    };

    const handleViewDetail = (prediction: AIPrediction) => {
        setSelectedPrediction(prediction);
        setDetailModalVisible(true);
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case "critical":
                return "red";
            case "high":
                return "orange";
            case "medium":
                return "yellow";
            case "low":
                return "green";
            default:
                return "default";
        }
    };

    const getRiskText = (riskLevel: string) => {
        switch (riskLevel) {
            case "critical":
                return "Cực kỳ quan trọng";
            case "high":
                return "Cao";
            case "medium":
                return "Trung bình";
            case "low":
                return "Thấp";
            default:
                return riskLevel;
        }
    };

    const inventoryColumns = [
        {
            title: "Tên phụ tùng",
            dataIndex: "partName",
            key: "partName",
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Tồn kho hiện tại",
            dataIndex: "currentStock",
            key: "currentStock",
            render: (value: number) => <Text>{value.toLocaleString()}</Text>,
        },
        {
            title: "Khuyến nghị tối thiểu",
            dataIndex: "recommendedMinStock",
            key: "recommendedMinStock",
            render: (value: number) => <Text>{value.toLocaleString()}</Text>,
        },
        {
            title: "Khuyến nghị tối đa",
            dataIndex: "recommendedMaxStock",
            key: "recommendedMaxStock",
            render: (value: number) => <Text>{value.toLocaleString()}</Text>,
        },
        {
            title: "Mức độ rủi ro",
            dataIndex: "riskLevel",
            key: "riskLevel",
            render: (riskLevel: string) => (
                <Tag color={getRiskColor(riskLevel)}>{getRiskText(riskLevel)}</Tag>
            ),
        },
        {
            title: "Độ tin cậy",
            dataIndex: "confidence",
            key: "confidence",
            render: (confidence: number) => (
                <Progress
                    percent={Math.round(confidence * 100)}
                    size="small"
                    status={confidence > 0.7 ? "success" : confidence > 0.5 ? "normal" : "exception"}
                />
            ),
        },
        {
            title: "Dự đoán 30 ngày",
            dataIndex: ["predictedDemand", "next30Days"],
            key: "predicted30Days",
            render: (value: number) => <Text>{value}</Text>,
        },
    ];

    const historyColumns = [
        {
            title: "Thời gian tạo",
            dataIndex: "generatedAt",
            key: "generatedAt",
            render: (date: string) => (
                <div>
                    <div>{dayjs(date).format("DD/MM/YYYY HH:mm")}</div>
                    <Text type="secondary">{dayjs(date).fromNow()}</Text>
                </div>
            ),
        },
        {
            title: "Loại dự đoán",
            dataIndex: "predictionType",
            key: "predictionType",
            render: (type: string) => {
                const typeMap: { [key: string]: string } = {
                    inventory_optimization: "Tối ưu tồn kho",
                    demand_forecast: "Dự báo nhu cầu",
                    stock_optimization: "Tối ưu kho",
                };
                return <Tag>{typeMap[type] || type}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const statusMap: { [key: string]: { text: string; color: string } } = {
                    active: { text: "Hoạt động", color: "green" },
                    expired: { text: "Hết hạn", color: "red" },
                    inactive: { text: "Không hoạt động", color: "default" },
                };
                const statusInfo = statusMap[status] || { text: status, color: "default" };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_: any, record: AIPrediction) => (
                <Button
                    type="link"
                    onClick={() => handleViewDetail(record)}
                    icon={<InfoCircleOutlined />}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    if (error) {
        return (
            <div style={{ padding: "24px" }}>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={() => dispatch(clearError())}>
                            Đóng
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
                <Title level={2}>
                    <RobotOutlined /> Dự đoán AI tối ưu tồn kho
                </Title>
                <Paragraph type="secondary">
                    Sử dụng trí tuệ nhân tạo để dự đoán nhu cầu và tối ưu hóa tồn kho phụ tùng
                </Paragraph>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                    tab={
                        <span>
                            <BarChartOutlined />
                            Tổng quan
                        </span>
                    }
                    key="overview"
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card
                                title="Hành động"
                                extra={
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<RobotOutlined />}
                                            onClick={handleGenerate}
                                            loading={generateLoading}
                                            disabled={loading}
                                        >
                                            Tạo dự đoán mới
                                        </Button>
                                        {latestPrediction && (
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={handleRegenerate}
                                                loading={regenerateLoading}
                                                disabled={loading}
                                            >
                                                Tạo lại
                                            </Button>
                                        )}
                                    </Space>
                                }
                            />
                        </Col>

                        <Col span={24}>
                            {stats ? (
                                <PredictionStatsCard stats={stats} loading={statsLoading} />
                            ) : (
                                <Card loading={statsLoading}>
                                    <Empty description="Chưa có dữ liệu thống kê" />
                                </Card>
                            )}
                        </Col>

                        <Col span={24}>
                            <Card
                                title="Khuyến nghị tồn kho"
                                loading={loading}
                            >
                                {latestPrediction?.predictions?.inventoryRecommendations ? (
                                    <div>
                                        {latestPrediction.predictions.inventoryRecommendations.map((recommendation) => (
                                            <InventoryRecommendationCard
                                                key={recommendation._id}
                                                recommendation={recommendation}
                                                onClick={() => {
                                                    // Optional: Handle click to show more details
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Empty
                                        description="Chưa có dự đoán nào"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </Col>

                        {latestPrediction && (
                            <Col span={24}>
                                <Card title="Thông tin dự đoán mới nhất">
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12} md={8}>
                                            <Text strong>Thời gian tạo: </Text>
                                            <Text>{dayjs(latestPrediction.generatedAt).format("DD/MM/YYYY HH:mm")}</Text>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Text strong>Có hiệu lực đến: </Text>
                                            <Text>{dayjs(latestPrediction.validUntil).format("DD/MM/YYYY HH:mm")}</Text>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Text strong>Mô hình AI: </Text>
                                            <Text>{latestPrediction.aiModelUsed}</Text>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <HistoryOutlined />
                            Lịch sử dự đoán
                        </span>
                    }
                    key="history"
                >
                    <Card title="Lịch sử dự đoán AI" loading={historyLoading}>
                        <Table
                            dataSource={predictionHistory}
                            columns={historyColumns}
                            rowKey="_id"
                            pagination={{
                                current: historyPage,
                                total: pagination?.total || 0,
                                pageSize: 10,
                                onChange: setHistoryPage,
                                showSizeChanger: false,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} mục`,
                            }}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết dự đoán AI"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedPrediction && (
                    <div>
                        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
                            <Col span={12}>
                                <Text strong>Thời gian tạo: </Text>
                                <Text>{dayjs(selectedPrediction.generatedAt).format("DD/MM/YYYY HH:mm")}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Trạng thái: </Text>
                                <Tag color={selectedPrediction.status === "active" ? "green" : "red"}>
                                    {selectedPrediction.status === "active" ? "Hoạt động" : "Hết hạn"}
                                </Tag>
                            </Col>
                        </Row>

                        {selectedPrediction.predictions?.inventoryRecommendations && (
                            <div>
                                <Title level={4}>Khuyến nghị tồn kho</Title>
                                <Table
                                    dataSource={selectedPrediction.predictions.inventoryRecommendations}
                                    columns={inventoryColumns}
                                    rowKey="_id"
                                    pagination={false}
                                    scroll={{ x: 600 }}
                                    size="small"
                                />
                            </div>
                        )}

                        {selectedPrediction.predictions?.costOptimization && (
                            <div style={{ marginTop: "16px" }}>
                                <Title level={4}>Tối ưu chi phí</Title>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Giá trị tồn kho"
                                            value={selectedPrediction.predictions.costOptimization.totalInventoryValue}
                                            suffix="VNĐ"
                                            formatter={(value) => `${Number(value).toLocaleString()}`}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Tiết kiệm tiềm năng"
                                            value={selectedPrediction.predictions.costOptimization.potentialSavings}
                                            suffix="VNĐ"
                                            formatter={(value) => `${Number(value).toLocaleString()}`}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AIPredictionPage;
