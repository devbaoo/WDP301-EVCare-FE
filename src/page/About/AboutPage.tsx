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
            title: "Reliable Service",
            description: "Professional maintenance and repair services with certified technicians"
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Quality Assurance",
            description: "High-quality parts and equipment for all electric vehicle models"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "Customer Focus",
            description: "Dedicated to providing exceptional customer service and support"
        },
        {
            icon: <Lightbulb className="w-8 h-8" />,
            title: "Innovation",
            description: "Staying ahead with the latest EV technology and service methods"
        }
    ];

    const values = [
        "Environmental Responsibility",
        "Customer Satisfaction",
        "Technical Excellence",
        "Transparency & Trust",
        "Continuous Improvement",
        "Community Support"
    ];

    const stats = [
        { number: "500+", label: "Happy Customers" },
        { number: "50+", label: "Service Centers" },
        { number: "99%", label: "Satisfaction Rate" },
        { number: "24/7", label: "Customer Support" }
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
                                About EV Care
                            </Title>
                            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                We are dedicated to providing comprehensive electric vehicle maintenance and repair services,
                                ensuring your EV runs smoothly while contributing to a sustainable future.
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
                                            Our Mission
                                        </Title>
                                        <Paragraph className="text-gray-600 text-lg leading-relaxed">
                                            To revolutionize electric vehicle maintenance by providing accessible, reliable, and
                                            eco-friendly service solutions that empower EV owners to embrace sustainable transportation
                                            with confidence and peace of mind.
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
                                            Our Vision
                                        </Title>
                                        <Paragraph className="text-gray-600 text-lg leading-relaxed">
                                            To become the leading electric vehicle service network, creating a sustainable ecosystem
                                            where EV maintenance is seamless, affordable, and environmentally responsible, contributing
                                            to a cleaner future for generations to come.
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
                            Why Choose EV Care?
                        </Title>
                        <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
                            We combine cutting-edge technology with exceptional service to deliver the best EV maintenance experience.
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
                                    Our Core Values
                                </Title>
                                <Paragraph className="text-gray-600 text-lg mb-8">
                                    These fundamental principles guide everything we do and shape our commitment to excellence.
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
                                            Committed to Excellence
                                        </Title>
                                        <Paragraph className="text-gray-600">
                                            Every interaction, every service, every moment is guided by our unwavering commitment to excellence.
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
                            Ready to Experience EV Care?
                        </Title>
                        <Paragraph className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust EV Care for their electric vehicle maintenance needs.
                        </Paragraph>
                        <Space size="large">
                            <Button
                                type="primary"
                                size="large"
                                className="bg-white text-blue-600 border-0 hover:bg-gray-100 h-12 px-8 rounded-full"
                                icon={<ArrowRight className="w-5 h-5" />}
                                onClick={() => window.location.href = '/service-centers'}
                            >
                                Find Service Centers
                            </Button>
                        </Space>
                    </motion.div>
                </div>
            </motion.section>

        </motion.div>
    );
}
