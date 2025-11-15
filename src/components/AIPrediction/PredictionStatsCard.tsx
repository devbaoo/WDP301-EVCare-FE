import React from "react";
import { Card, Row, Col, Statistic, Progress, Typography, Divider } from "antd";
import {
    ExclamationCircleOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { AIPredictionStats } from "../../interfaces/aiPrediction";
import dayjs from "dayjs";

const { Text } = Typography;

interface PredictionStatsCardProps {
    stats: AIPredictionStats;
    loading?: boolean;
}

const PredictionStatsCard: React.FC<PredictionStatsCardProps> = ({
    stats,
    loading = false,
}) => {
    const totalRiskParts = stats.criticalRiskParts + stats.highRiskParts + stats.mediumRiskParts;
    const riskPercentage = stats.totalParts > 0 ? (totalRiskParts / stats.totalParts) * 100 : 0;

    const getRiskStatus = () => {
        if (riskPercentage > 50) return { color: "#ff4d4f", status: "exception" };
        if (riskPercentage > 25) return { color: "#fa8c16", status: "normal" };
        return { color: "#52c41a", status: "success" };
    };

    const riskStatus = getRiskStatus();

    return (
        <Card title="Tổng quan rủi ro tồn kho" loading={loading}>
            <Row gutter={[24, 24]}>
                {/* Risk Overview */}
                <Col xs={24} lg={12}>
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                        <Progress
                            type="circle"
                            percent={Math.round(riskPercentage)}
                            strokeColor={riskStatus.color}
                            status={riskStatus.status as any}
                            format={(percent) => `${percent}%`}
                            size={120}
                        />
                        <div style={{ marginTop: "8px" }}>
                            <Text strong>Tỷ lệ rủi ro tổng thể</Text>
                        </div>
                    </div>
                </Col>

                {/* Risk Breakdown */}
                <Col xs={24} lg={12}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Statistic
                                title="Rủi ro cực cao"
                                value={stats.criticalRiskParts}
                                valueStyle={{ color: "#ff4d4f" }}
                                prefix={<ExclamationCircleOutlined />}
                            />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="Rủi ro cao"
                                value={stats.highRiskParts}
                                valueStyle={{ color: "#fa8c16" }}
                                prefix={<WarningOutlined />}
                            />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="Rủi ro trung bình"
                                value={stats.mediumRiskParts}
                                valueStyle={{ color: "#faad14" }}
                                prefix={<WarningOutlined />}
                            />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="Rủi ro thấp"
                                value={stats.lowRiskParts}
                                valueStyle={{ color: "#52c41a" }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Divider />

            {/* Inventory Issues */}
            <Row gutter={[24, 16]}>
                <Col xs={12} sm={8}>
                    <Statistic
                        title="Tổng phụ tùng"
                        value={stats.totalParts}
                        valueStyle={{ color: "#1890ff" }}
                    />
                </Col>
                <Col xs={12} sm={8}>
                    <Statistic
                        title="Dự trữ quá mức"
                        value={stats.overStockedItems}
                        valueStyle={{ color: "#fa8c16" }}
                    />
                </Col>
                <Col xs={12} sm={8}>
                    <Statistic
                        title="Thiếu hàng"
                        value={stats.underStockedItems}
                        valueStyle={{ color: "#ff4d4f" }}
                    />
                </Col>
            </Row>

            <Divider />

            {/* Financial Impact */}
            <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                    <Statistic
                        title="Tiết kiệm tiềm năng"
                        value={stats.potentialSavings}
                        precision={0}
                        suffix="VNĐ"
                        valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                        prefix={<DollarOutlined />}
                        formatter={(value) => `${Number(value).toLocaleString()}`}
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <Statistic
                        title="Độ tin cậy trung bình"
                        value={Math.round(stats.averageConfidence * 100)}
                        suffix="%"
                        valueStyle={{
                            color: stats.averageConfidence > 0.7 ? "#52c41a" :
                                stats.averageConfidence > 0.5 ? "#faad14" : "#ff4d4f"
                        }}
                    />
                </Col>
            </Row>

            <Divider />

            {/* Timestamps */}
            <Row gutter={[24, 8]}>
                <Col xs={24} sm={12}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        Cập nhật lần cuối: {dayjs(stats.lastUpdated).format("DD/MM/YYYY HH:mm")}
                    </Text>
                </Col>
                <Col xs={24} sm={12}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        Có hiệu lực đến: {dayjs(stats.validUntil).format("DD/MM/YYYY HH:mm")}
                    </Text>
                </Col>
            </Row>
        </Card>
    );
};

export default PredictionStatsCard;
