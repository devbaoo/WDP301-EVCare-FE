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
            title: "Phone",
            details: "+1 (555) 123-4567",
            description: "Mon-Fri 8AM-6PM, Sat 9AM-4PM"
        },
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email",
            details: "support@evcare.com",
            description: "We'll respond within 24 hours"
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Headquarters",
            details: "Vinhome Grand Park, Quận 9",
            description: "Visit us for in-person support"
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Business Hours",
            details: "Mon-Fri: 8:00 AM - 6:00 PM",
            description: "Sat: 9:00 AM - 4:00 PM, Sun: Closed"
        }
    ];

    const openGoogleMaps = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const supportOptions = [
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Live Chat",
            description: "Get instant support from our team",
            action: "Start Chat",
            available: true
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: "Phone Support",
            description: "Speak directly with our experts",
            action: "Call Now",
            available: true
        },
        {
            icon: <MailIcon className="w-8 h-8" />,
            title: "Email Support",
            description: "Send us a detailed message",
            action: "Send Email",
            available: true
        }
    ];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            message.success('Your message has been sent successfully! We\'ll get back to you soon.');
            form.resetFields();
        } catch {
            message.error('Failed to send message. Please try again.');
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
                                Contact Us
                            </Title>
                            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                Have questions about our EV services? We're here to help!
                                Reach out to our friendly team for support, inquiries, or feedback.
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
                            Get Support
                        </Title>
                        <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Choose the support option that works best for you. We're here to help!
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
                                    Send us a Message
                                </Title>
                                <Paragraph className="text-gray-600 text-lg mb-8">
                                    Have a specific question or need detailed support? Fill out the form below
                                    and we'll get back to you as soon as possible.
                                </Paragraph>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <Text strong className="text-gray-800 block">Quick Response</Text>
                                            <Text type="secondary">We typically respond within 24 hours</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Headphones className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <Text strong className="text-gray-800 block">Expert Support</Text>
                                            <Text type="secondary">Our team has extensive EV knowledge</Text>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MailIcon className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <Text strong className="text-gray-800 block">Follow-up</Text>
                                            <Text type="secondary">We'll follow up until your issue is resolved</Text>
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
                                            label="Full Name"
                                            rules={[{ required: true, message: 'Please enter your name' }]}
                                        >
                                            <Input placeholder="Enter your full name" />
                                        </Form.Item>

                                        <Form.Item
                                            name="email"
                                            label="Email Address"
                                            rules={[
                                                { required: true, message: 'Please enter your email' },
                                                { type: 'email', message: 'Please enter a valid email' }
                                            ]}
                                        >
                                            <Input placeholder="Enter your email address" />
                                        </Form.Item>

                                        <Form.Item
                                            name="phone"
                                            label="Phone Number (Optional)"
                                        >
                                            <Input placeholder="Enter your phone number" />
                                        </Form.Item>

                                        <Form.Item
                                            name="subject"
                                            label="Subject"
                                            rules={[{ required: true, message: 'Please enter a subject' }]}
                                        >
                                            <Input placeholder="What is this about?" />
                                        </Form.Item>

                                        <Form.Item
                                            name="message"
                                            label="Message"
                                            rules={[{ required: true, message: 'Please enter your message' }]}
                                        >
                                            <TextArea
                                                rows={6}
                                                placeholder="Tell us how we can help you..."
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
                                                Send Message
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
                            Visit Our Headquarters
                        </Title>
                        <Paragraph className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Stop by our main office for in-person support and consultations.
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
                                    <Text className="text-gray-600 text-lg">Interactive Map</Text>
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
