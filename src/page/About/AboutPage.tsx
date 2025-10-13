import { motion } from "framer-motion";
import { Card, Row, Col, Typography, Space, Button } from "antd";
import {
    Users,
    Target,
    Award,
    Shield,
    Heart,
    Lightbulb,
    CheckCircle,
    ArrowRight
} from "lucide-react";

const { Title, Paragraph } = Typography;

export default function AboutPage() {
    const features = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Dịch vụ đáng tin cậy",
            description: "Bảo dưỡng và sửa chữa chuyên nghiệp với kỹ thuật viên được chứng nhận"
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Đảm bảo chất lượng",
            description: "Linh kiện và thiết bị chất lượng cao cho mọi dòng xe điện"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Lấy khách hàng làm trọng tâm",
            description: "Tận tâm mang đến dịch vụ và hỗ trợ khách hàng xuất sắc"
        },
        {
            icon: <Lightbulb className="w-8 h-8" />,
            title: "Đổi mới",
            description: "Luôn dẫn đầu với công nghệ và phương pháp dịch vụ xe điện mới nhất"
        }
    ];

    const values = [
        "Trách nhiệm với môi trường",
        "Sự hài lòng của khách hàng",
        "Xuất sắc về kỹ thuật",
        "Minh bạch & Tin cậy",
        "Cải tiến liên tục",
        "Hỗ trợ cộng đồng"
    ];

    const stats = [
        { number: "500+", label: "Khách hàng hài lòng" },
        { number: "50+", label: "Trung tâm dịch vụ" },
        { number: "99%", label: "Mức độ hài lòng" },
        { number: "24/7", label: "Hỗ trợ khách hàng" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-white"
        >

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-green-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Title level={1} className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                                Về EV Care
                            </Title>
                            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                Chúng tôi mang đến dịch vụ bảo dưỡng và sửa chữa xe điện toàn diện,
                                đảm bảo chiếc xe điện của bạn vận hành êm ái và góp phần vào tương lai bền vững.
                            </Paragraph>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Mission & Vision */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="py-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Row gutter={[48, 48]}>
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <Card className="h-full shadow-lg border-0">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Target className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                                            Sứ mệnh của chúng tôi
                                        </Title>
                                        <Paragraph className="text-gray-600 text-lg leading-relaxed">
                                            Nâng tầm dịch vụ bảo dưỡng xe điện bằng các giải pháp dễ tiếp cận, đáng tin cậy
                                            và thân thiện với môi trường, giúp chủ xe tự tin đồng hành cùng giao thông bền vững.
                                        </Paragraph>
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <Card className="h-full shadow-lg border-0">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Users className="w-8 h-8 text-green-600" />
                                        </div>
                                        <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                                            Tầm nhìn của chúng tôi
                                        </Title>
                                        <Paragraph className="text-gray-600 text-lg leading-relaxed">
                                            Trở thành mạng lưới dịch vụ xe điện hàng đầu, kiến tạo hệ sinh thái bền vững nơi việc
                                            bảo dưỡng xe điện diễn ra thuận tiện, hợp lý chi phí và có trách nhiệm với môi trường,
                                            đóng góp cho một tương lai xanh hơn.
                                        </Paragraph>
                                    </div>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </motion.section>

            {/* Features */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="py-16 bg-gray-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-center mb-12"
                    >
                        <Title level={2} className="text-3xl font-bold text-gray-800 mb-4">
                            Vì sao chọn EV Care?
                        </Title>
                        <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Chúng tôi kết hợp công nghệ tiên tiến với dịch vụ xuất sắc để mang lại trải nghiệm bảo dưỡng xe điện tốt nhất.
                        </Paragraph>
                    </motion.div>

                    <Row gutter={[32, 32]}>
                        {features.map((feature, index) => (
                            <Col xs={24} sm={12} lg={6} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                                >
                                    <Card className="h-full text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                            {feature.icon}
                                        </div>
                                        <Title level={4} className="text-lg font-semibold text-gray-800 mb-3">
                                            {feature.title}
                                        </Title>
                                        <Paragraph className="text-gray-600">
                                            {feature.description}
                                        </Paragraph>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </motion.section>

            {/* Stats */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="py-16 bg-blue-600"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Row gutter={[32, 32]}>
                        {stats.map((stat, index) => (
                            <Col xs={12} sm={6} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-blue-100 text-lg">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </motion.section>

            {/* Values */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="py-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                <Title level={2} className="text-3xl font-bold text-gray-800 mb-6">
                                    Giá trị cốt lõi
                                </Title>
                                <Paragraph className="text-gray-600 text-lg mb-8">
                                    Những nguyên tắc then chốt định hướng mọi hành động và cam kết chất lượng của chúng tôi.
                                </Paragraph>
                                <Space direction="vertical" size="middle" className="w-full">
                                    {values.map((value, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                                            className="flex items-center space-x-3"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700 text-lg">{value}</span>
                                        </motion.div>
                                    ))}
                                </Space>
                            </motion.div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                            >
                                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <Heart className="w-16 h-16 text-red-500" />
                                        </div>
                                        <Title level={3} className="text-2xl font-bold text-gray-800 mb-4">
                                            Cam kết xuất sắc
                                        </Title>
                                        <Paragraph className="text-gray-600">
                                            Mọi tương tác, mọi dịch vụ, mọi khoảnh khắc đều được dẫn dắt bởi cam kết bền bỉ về chất lượng.
                                        </Paragraph>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="py-16 bg-gradient-to-r from-blue-600 to-green-600"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <Title level={2} className="text-3xl font-bold text-white mb-4">
                            Sẵn sàng trải nghiệm EV Care?
                        </Title>
                        <Paragraph className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Hãy cùng hàng nghìn khách hàng tin tưởng EV Care cho nhu cầu bảo dưỡng xe điện của bạn.
                        </Paragraph>
                        <Space size="large">
                            <Button
                                type="primary"
                                size="large"
                                className="bg-white text-blue-600 border-0 hover:bg-gray-100 h-12 px-8 rounded-full"
                                icon={<ArrowRight className="w-5 h-5" />}
                                onClick={() => window.location.href = '/service-centers'}
                            >
                                Tìm trung tâm dịch vụ
                            </Button>
                        </Space>
                    </motion.div>
                </div>
            </motion.section>

        </motion.div>
    );
}
