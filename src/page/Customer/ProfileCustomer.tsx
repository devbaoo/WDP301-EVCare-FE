import { useState, useEffect } from 'react';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    UploadOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CrownOutlined,
    TeamOutlined,
    ToolOutlined
} from '@ant-design/icons';
import {
    Card,
    Avatar,
    Button,
    Form,
    Input,
    Upload,
    Typography,
    Space,
    Divider,
    Row,
    Col,
    Tag,
    Spin,
    Badge,
    Tooltip
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../services/store/store';
import {
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    clearError
} from '../../services/features/user/userSlice';
import Header from '../../components/Header/Header';

const { Title, Text } = Typography;

function ProfileCustomer() {
    const dispatch = useAppDispatch();
    const { profile, loading } = useAppSelector((state) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Load user profile when component mounts
        dispatch(getUserProfile());
    }, [dispatch]);

    useEffect(() => {
        // Set form values when profile is loaded
        if (profile) {
            form.setFieldsValue({
                username: profile.username,
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address,
            });
        }
    }, [profile, form]);

    useEffect(() => {
        // Clear error when component unmounts
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form to original values
        if (profile) {
            form.setFieldsValue({
                username: profile.username,
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address,
            });
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            await dispatch(updateUserProfile(values)).unwrap();
            setIsEditing(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        setUploading(true);
        try {
            await dispatch(uploadAvatar(file)).unwrap();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
        return false; // Prevent default upload behavior
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'customer': return '#3764F3'; // synop-blue-primary
            case 'admin': return '#FF4D4F'; // red
            case 'staff': return '#52C41A'; // green
            case 'technician': return '#FA8C16'; // orange
            default: return '#8C8C8C'; // gray
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'customer': return 'Khách hàng';
            case 'admin': return 'Quản trị viên';
            case 'staff': return 'Nhân viên';
            case 'technician': return 'Kỹ thuật viên';
            default: return role;
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'customer': return <UserOutlined />;
            case 'admin': return <CrownOutlined />;
            case 'staff': return <TeamOutlined />;
            case 'technician': return <ToolOutlined />;
            default: return <UserOutlined />;
        }
    };

    if (loading && !profile) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gradient-to-br from-synop-gray-light to-white flex justify-center items-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center"
                >
                    <Spin size="large" />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-4 text-synop-gray-medium"
                    >
                        Đang tải thông tin...
                    </motion.p>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
        >
            <Header />
            <div className="pt-16"> {/* Add padding to ensure content starts below the header */}
                <div className="bg-gradient-to-br from-synop-gray-light to-white">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-r from-synop-blue-primary to-synop-blue-light py-16"
                    >
                        <div className="max-w-6xl mx-auto px-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-center text-white"
                            >
                                <Title level={1} className="text-white mb-4 font-bold">
                                    Thông tin cá nhân
                                </Title>
                                <Text className="text-white/90 text-lg">
                                    Quản lý và cập nhật thông tin tài khoản của bạn
                                </Text>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-6xl mx-auto px-4 -mt-8 relative z-10"
                    >
                        <Row gutter={[16, 16]} justify="center" align="middle">
                            {/* Profile Card */}
                            <Col xs={24} lg={8}>
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    <Card
                                        className="shadow-2xl border-0 rounded-2xl overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            border: '1px solid rgba(55, 100, 243, 0.1)'
                                        }}
                                    >
                                        <div className="text-center p-6">
                                            {/* Avatar Section */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.6, delay: 0.5 }}
                                                className="mb-8"
                                            >
                                                <Upload
                                                    accept="image/*"
                                                    beforeUpload={handleAvatarUpload}
                                                    showUploadList={false}
                                                    disabled={uploading}
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="relative inline-block group"
                                                    >
                                                        <Badge
                                                            count={
                                                                <Tooltip title="Tải lên ảnh đại diện">
                                                                    <div className="w-8 h-8 bg-synop-blue-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-synop-blue-dark transition-colors">
                                                                        <UploadOutlined className="text-white text-sm" />
                                                                    </div>
                                                                </Tooltip>
                                                            }
                                                            offset={[-5, 5]}
                                                        >
                                                            <Avatar
                                                                size={140}
                                                                src={profile?.avatar}
                                                                icon={<UserOutlined />}
                                                                className="cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg border-4 border-white"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #3764F3 0%, #2EB7FA 100%)'
                                                                }}
                                                            />
                                                        </Badge>
                                                        <AnimatePresence>
                                                            {uploading && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm"
                                                                >
                                                                    <Spin size="small" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                </Upload>
                                            </motion.div>

                                            {/* User Info */}
                                            <div className="mb-6">
                                                <Title level={3} className="mb-2 text-synop-gray-dark">
                                                    {profile?.fullName || 'Chưa cập nhật'}
                                                </Title>

                                                <Text className="text-synop-gray-medium text-lg block mb-4">
                                                    @{profile?.username}
                                                </Text>

                                                <Tag
                                                    color={getRoleColor(profile?.role || '')}
                                                    className="mb-6 px-4 py-2 text-sm font-semibold rounded-full border-0"
                                                    icon={getRoleIcon(profile?.role || '')}
                                                >
                                                    {getRoleText(profile?.role || '')}
                                                </Tag>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                    <MailOutlined className="mr-3 text-synop-blue-primary text-lg" />
                                                    <Text className="text-synop-gray-dark font-medium">{profile?.email}</Text>
                                                </div>

                                                {profile?.phone && (
                                                    <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                        <PhoneOutlined className="mr-3 text-green-500 text-lg" />
                                                        <Text className="text-synop-gray-dark font-medium">{profile.phone}</Text>
                                                    </div>
                                                )}

                                                {profile?.isVerified !== undefined && (
                                                    <div className="flex items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                                        {profile.isVerified ? (
                                                            <>
                                                                <CheckCircleOutlined className="mr-3 text-green-500 text-lg" />
                                                                <Text className="text-green-600 font-medium">Đã xác thực</Text>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ExclamationCircleOutlined className="mr-3 text-orange-500 text-lg" />
                                                                <Text className="text-orange-600 font-medium">Chưa xác thực</Text>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </Col>

                            {/* Profile Details */}
                            <Col xs={24} lg={16}>
                                <Card
                                    className="shadow-2xl border-0 rounded-2xl overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                        border: '1px solid rgba(55, 100, 243, 0.1)'
                                    }}
                                    title={
                                        <div className="flex items-center">
                                            <div className="w-2 h-8 bg-gradient-to-b from-synop-blue-primary to-synop-blue-light rounded-full mr-3"></div>
                                            <Title level={4} className="mb-0 text-synop-gray-dark">Thông tin chi tiết</Title>
                                        </div>
                                    }
                                    extra={
                                        !isEditing ? (
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                onClick={handleEdit}
                                                className="bg-synop-blue-primary hover:bg-synop-blue-dark border-0 rounded-full px-6 h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                Chỉnh sửa
                                            </Button>
                                        ) : (
                                            <Space>
                                                <Button
                                                    icon={<CloseOutlined />}
                                                    onClick={handleCancel}
                                                    className="rounded-full px-6 h-10 font-semibold border-gray-300 hover:border-red-400 hover:text-red-500 transition-all duration-300"
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    icon={<SaveOutlined />}
                                                    onClick={handleSave}
                                                    loading={loading}
                                                    className="bg-green-500 hover:bg-green-600 border-0 rounded-full px-6 h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    Lưu thay đổi
                                                </Button>
                                            </Space>
                                        )
                                    }
                                >
                                    <div className="p-6">
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            disabled={!isEditing}
                                            className="space-y-6"
                                        >
                                            <Row gutter={[24, 24]}>
                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        label={<span className="text-synop-gray-dark font-semibold">Tên đăng nhập</span>}
                                                        name="username"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                                                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                                                        ]}
                                                    >
                                                        <Input
                                                            prefix={<UserOutlined className="text-synop-blue-primary" />}
                                                            className="h-12 rounded-xl border-gray-200 hover:border-synop-blue-primary focus:border-synop-blue-primary transition-colors"
                                                            placeholder="Nhập tên đăng nhập"
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} sm={12}>
                                                    <Form.Item
                                                        label={<span className="text-synop-gray-dark font-semibold">Họ và tên</span>}
                                                        name="fullName"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng nhập họ và tên!' }
                                                        ]}
                                                    >
                                                        <Input
                                                            className="h-12 rounded-xl border-gray-200 hover:border-synop-blue-primary focus:border-synop-blue-primary transition-colors"
                                                            placeholder="Nhập họ và tên"
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item
                                                label={<span className="text-synop-gray-dark font-semibold">Địa chỉ</span>}
                                                name="address"
                                            >
                                                <Input.TextArea
                                                    rows={4}
                                                    placeholder="Nhập địa chỉ của bạn..."
                                                    className="rounded-xl border-gray-200 hover:border-synop-blue-primary focus:border-synop-blue-primary transition-colors resize-none"
                                                />
                                            </Form.Item>
                                        </Form>

                                        <Divider className="my-8" />

                                        {/* Account Information */}
                                        <div className="bg-gradient-to-r from-synop-gray-light to-white p-6 rounded-2xl border border-gray-100">
                                            <Title level={5} className="text-synop-gray-dark mb-6 flex items-center">
                                                <CalendarOutlined className="mr-2 text-synop-blue-primary" />
                                                Thông tin tài khoản
                                            </Title>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                                        <CalendarOutlined className="text-synop-blue-primary text-lg" />
                                                    </div>
                                                    <div>
                                                        <Text className="text-synop-gray-medium text-sm block">Ngày tạo tài khoản</Text>
                                                        <Text className="text-synop-gray-dark font-semibold">
                                                            {profile?.createdAt
                                                                ? new Date(profile.createdAt).toLocaleDateString('vi-VN')
                                                                : 'Không có thông tin'
                                                            }
                                                        </Text>
                                                    </div>
                                                </div>

                                                <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                                        <CalendarOutlined className="text-green-500 text-lg" />
                                                    </div>
                                                    <div>
                                                        <Text className="text-synop-gray-medium text-sm block">Cập nhật lần cuối</Text>
                                                        <Text className="text-synop-gray-dark font-semibold">
                                                            {profile?.updatedAt
                                                                ? new Date(profile.updatedAt).toLocaleDateString('vi-VN')
                                                                : 'Không có thông tin'
                                                            }
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default ProfileCustomer;