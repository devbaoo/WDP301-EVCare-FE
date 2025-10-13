import { motion } from "framer-motion";
import { Card, Row, Col, Typography, Form, Input, Button, message } from "antd";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    MessageCircle,
    Headphones,
    Mail as MailIcon
} from "lucide-react";
import { useState } from "react";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function ContactPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const contactInfo = [
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Điện thoại",
            details: "+1 (555) 123-4567",
            description: "Thứ 2-6 8:00-18:00, Thứ 7 9:00-16:00"
        },
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email",
            details: "support@evcare.com",
            description: "Phản hồi trong vòng 24 giờ"
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Trụ sở",
            details: "Vinhome Grand Park, Quận 9",
            description: "Đến trực tiếp để được hỗ trợ"
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Giờ làm việc",
            details: "Thứ 2-6: 8:00 - 18:00",
            description: "Thứ 7: 9:00 - 16:00, Chủ nhật: Nghỉ"
        }
    ];

    const openGoogleMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const supportOptions = [
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Trò chuyện trực tuyến",
            description: "Nhận hỗ trợ ngay từ đội ngũ của chúng tôi",
            action: "Bắt đầu chat",
            available: true
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: "Hỗ trợ qua điện thoại",
            description: "Trao đổi trực tiếp với chuyên gia",
            action: "Gọi ngay",
            available: true
        },
        {
            icon: <MailIcon className="w-8 h-8" />,
            title: "Hỗ trợ qua email",
            description: "Gửi cho chúng tôi nội dung chi tiết",
            action: "Gửi email",
            available: true
        }
    ];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            message.success('Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm.');
            form.resetFields();
        } catch {
            message.error('Gửi tin nhắn thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

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
                                Liên hệ với chúng tôi
                            </Title>
                            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                Có câu hỏi về dịch vụ xe điện? Chúng tôi luôn sẵn sàng hỗ trợ!
                                Liên hệ đội ngũ của chúng tôi để được tư vấn, hỗ trợ hoặc góp ý.
                            </Paragraph>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="py-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Row gutter={[32, 32]}>
                        {contactInfo.map((info, index) => (
                            <Col xs={24} sm={12} lg={6} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                >
                                    <Card
                                        className="h-full text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0"
                                    >
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                            {info.icon}
                                        </div>
                                        <Title level={4} className="text-lg font-semibold text-gray-800 mb-2">
                                            {info.title}
                                        </Title>
                                        {info.title === 'Headquarters' ? (
                                            <a
                                                onClick={() => openGoogleMaps(info.details)}
                                                className="text-gray-700 block mb-2 font-semibold hover:text-blue-600 hover:underline cursor-pointer"
                                            >
                                                {info.details}
                                            </a>
                                        ) : (
                                            <Text strong className="text-gray-700 block mb-2">
                                                {info.details}
                                            </Text>
                                        )}
                                        <Text type="secondary" className="text-sm">
                                            {info.description}
                                        </Text>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </motion.section>

            {/* Support Options */}
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
                            Nhận hỗ trợ
                        </Title>
                        <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Chọn hình thức hỗ trợ phù hợp nhất với bạn. Chúng tôi luôn sẵn sàng!
                        </Paragraph>
                    </motion.div>

                    <Row gutter={[32, 32]}>
                        {supportOptions.map((option, index) => (
                            <Col xs={24} lg={8} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                                >
                                    <Card className="h-full text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                            {option.icon}
                                        </div>
                                        <Title level={4} className="text-lg font-semibold text-gray-800 mb-3">
                                            {option.title}
                                        </Title>
                                        <Paragraph className="text-gray-600 mb-4">
                                            {option.description}
                                        </Paragraph>
                                        <Button
                                            type="primary"
                                            className="w-full"
                                            disabled={!option.available}
                                        >
                                            {option.action}
                                        </Button>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </motion.section>

            {/* Contact Form */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="py-16"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Row gutter={[48, 48]} align="top">
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <Title level={2} className="text-3xl font-bold text-gray-800 mb-6">
                                    Gửi tin nhắn cho chúng tôi
                                </Title>
                                <Paragraph className="text-gray-600 text-lg mb-8">
                                    Có câu hỏi cụ thể hoặc cần hỗ trợ chi tiết? Điền biểu mẫu bên dưới
                                    và chúng tôi sẽ phản hồi sớm nhất có thể.
                                </Paragraph>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <Text strong className="text-gray-800 block">Phản hồi nhanh</Text>
                                            <Text type="secondary">Thường phản hồi trong 24 giờ</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Headphones className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <Text strong className="text-gray-800 block">Hỗ trợ từ chuyên gia</Text>
                                            <Text type="secondary">Đội ngũ am hiểu sâu về xe điện</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MailIcon className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <Text strong className="text-gray-800 block">Theo dõi xử lý</Text>
                                            <Text type="secondary">Chúng tôi theo sát cho tới khi vấn đề được giải quyết</Text>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                            >
                                <Card className="shadow-lg border-0">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={handleSubmit}
                                        size="large"
                                    >
                                        <Form.Item
                                            name="name"
                                            label="Họ và tên"
                                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                        >
                                            <Input placeholder="Nhập họ và tên" />
                                        </Form.Item>

                                        <Form.Item
                                            name="email"
                                            label="Địa chỉ Email"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập email' },
                                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                                            ]}
                                        >
                                            <Input placeholder="Nhập địa chỉ email" />
                                        </Form.Item>

                                        <Form.Item
                                            name="phone"
                                            label="Số điện thoại (không bắt buộc)"
                                        >
                                            <Input placeholder="Nhập số điện thoại" />
                                        </Form.Item>

                                        <Form.Item
                                            name="subject"
                                            label="Chủ đề"
                                            rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
                                        >
                                            <Input placeholder="Nội dung liên quan đến?" />
                                        </Form.Item>

                                        <Form.Item
                                            name="message"
                                            label="Nội dung"
                                            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                        >
                                            <TextArea
                                                rows={6}
                                                placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                                                showCount
                                                maxLength={1000}
                                            />
                                        </Form.Item>

                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                className="w-full h-12 rounded-full"
                                                icon={<Send className="w-5 h-5" />}
                                            >
                                                Gửi tin nhắn
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </motion.section>

            {/* Map Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="py-16 bg-gray-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="text-center mb-12"
                    >
                        <Title level={2} className="text-3xl font-bold text-gray-800 mb-4">
                            Ghé thăm trụ sở của chúng tôi
                        </Title>
                        <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Đến văn phòng chính để được hỗ trợ và tư vấn trực tiếp.
                        </Paragraph>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <Card className="shadow-lg border-0">
                            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <Text className="text-gray-600 text-lg">Bản đồ tương tác</Text>
                                    <Paragraph className="text-gray-500 mt-2">
                                        Vinhome Grand Park, Thành phố, Thủ Đức, Hồ Chí Minh 700000, Việt Nam
                                    </Paragraph>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </motion.section>

        </motion.div>
    );
}
