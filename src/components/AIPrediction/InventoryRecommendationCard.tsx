import React from "react";
import { Card, Tag, Progress, Tooltip, Typography, Row, Col, Statistic } from "antd";
import { InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { InventoryRecommendation } from "../../interfaces/aiPrediction";

const { Text, Paragraph } = Typography;

interface InventoryRecommendationCardProps {
    recommendation: InventoryRecommendation;
    onClick?: () => void;
}

const InventoryRecommendationCard: React.FC<InventoryRecommendationCardProps> = ({
    recommendation,
    onClick,
}) => {
    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case "critical":
                return "#ff4d4f";
            case "high":
                return "#fa8c16";
            case "medium":
                return "#faad14";
            case "low":
                return "#52c41a";
            default:
                return "#d9d9d9";
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

    const getRiskIcon = (riskLevel: string) => {
        if (riskLevel === "critical" || riskLevel === "high") {
            return <ExclamationCircleOutlined style={{ color: getRiskColor(riskLevel) }} />;
        }
        return <InfoCircleOutlined style={{ color: getRiskColor(riskLevel) }} />;
    };

    const getStockStatus = () => {
        const { currentStock, recommendedMinStock, recommendedMaxStock } = recommendation;

        if (currentStock < recommendedMinStock) {
            return { status: "low", text: "Thiếu hàng", color: "#ff4d4f" };
        } else if (currentStock > recommendedMaxStock) {
            return { status: "high", text: "Dự trữ quá mức", color: "#fa8c16" };
        } else {
            return { status: "normal", text: "Bình thường", color: "#52c41a" };
        }
    };

    const stockStatus = getStockStatus();

    return (
        <Card
            hoverable={!!onClick}
            onClick={onClick}
            style={{ marginBottom: "16px" }}
            bodyStyle={{ padding: "16px" }}
        >
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                    <div>
                        <Text strong style={{ fontSize: "16px" }}>
                            {recommendation.partName}
                        </Text>
                        <div style={{ marginTop: "4px" }}>
                            <Tag color={getRiskColor(recommendation.riskLevel)} icon={getRiskIcon(recommendation.riskLevel)}>
                                {getRiskText(recommendation.riskLevel)}
                            </Tag>
                            <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                    <Row gutter={[8, 8]}>
                        <Col span={8}>
                            <Statistic
                                title="Hiện tại"
                                value={recommendation.currentStock}
                                valueStyle={{ fontSize: "14px" }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Tối thiểu"
                                value={recommendation.recommendedMinStock}
                                valueStyle={{ fontSize: "14px", color: "#1890ff" }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Tối đa"
                                value={recommendation.recommendedMaxStock}
                                valueStyle={{ fontSize: "14px", color: "#52c41a" }}
                            />
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} sm={12} md={4}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            Độ tin cậy
                        </Text>
                        <Progress
                            percent={Math.round(recommendation.confidence * 100)}
                            size="small"
                            status={
                                recommendation.confidence > 0.7
                                    ? "success"
                                    : recommendation.confidence > 0.5
                                        ? "normal"
                                        : "exception"
                            }
                            showInfo={false}
                        />
                        <Text style={{ fontSize: "12px" }}>
                            {Math.round(recommendation.confidence * 100)}%
                        </Text>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={4}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            Dự đoán 30 ngày
                        </Text>
                        <div>
                            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                                {recommendation.predictedDemand.next30Days}
                            </Text>
                        </div>
                    </div>
                </Col>
            </Row>

            {recommendation.reasoning && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                    <Tooltip title="Lý do khuyến nghị">
                        <InfoCircleOutlined style={{ marginRight: "4px", color: "#1890ff" }} />
                    </Tooltip>
                    <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: "xem thêm" }}
                        style={{ margin: 0, fontSize: "13px", color: "#666" }}
                    >
                        {recommendation.reasoning}
                    </Paragraph>
                </div>
            )}
        </Card>
    );
};

export default InventoryRecommendationCard;
