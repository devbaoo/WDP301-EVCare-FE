import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    notification
} from 'antd';
import {
    LockOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../../services/store/store';
import { changePassword, logoutUser } from '../../../services/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface ChangePasswordModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
}

function ChangePasswordModal({ visible, onCancel, onSuccess }: ChangePasswordModalProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading } = useAppSelector((state) => state.auth);
    
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        try {
            const resultAction = await dispatch(changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            }));

            if (changePassword.fulfilled.match(resultAction)) {
                // Hiển thị toast notification
                notification.success({
                    message: 'Đổi mật khẩu thành công!',
                    description: 'Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại để tiếp tục.',
                    duration: 4.5,
                    placement: 'topRight',
                    style: {
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }
                });

                // Reset form và đóng modal
                form.resetFields();
                onSuccess?.();
                onCancel();

                // Tự động logout sau 2 giây (silent logout để không hiển thị error message)
                setTimeout(async () => {
                    try {
                        await dispatch(logoutUser({ silent: true })).unwrap();
                        navigate('/login');
                    } catch (error) {
                        console.error('Logout error:', error);
                        // Vẫn chuyển về login page ngay cả khi logout API fail
                        navigate('/login');
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Change password error:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center"
                >
                    <div className="w-8 h-8 bg-synop-blue-primary rounded-full flex items-center justify-center mr-3">
                        <LockOutlined className="text-white text-sm" />
                    </div>
                    <Title level={4} className="mb-0 text-synop-gray-dark">
                        Đổi mật khẩu
                    </Title>
                </motion.div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={500}
            className="change-password-modal"
            centered
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="p-2">
                    <Text className="text-synop-gray-medium mb-6 block">
                        Vui lòng nhập mật khẩu cũ và mật khẩu mới để thay đổi mật khẩu của bạn.
                    </Text>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        className="space-y-4"
                    >
                        <Form.Item
                            label={<span className="text-synop-gray-dark font-semibold">Mật khẩu cũ</span>}
                            name="oldPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu cũ!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-synop-blue-primary" />}
                                placeholder="Nhập mật khẩu cũ"
                                size="large"
                                className="rounded-xl border-gray-200 hover:border-synop-blue-primary focus:border-synop-blue-primary transition-colors"
                                iconRender={(visible) => 
                                    visible ? 
                                    <EyeOutlined className="text-synop-gray-medium" /> : 
                                    <EyeInvisibleOutlined className="text-synop-gray-medium" />
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-synop-gray-dark font-semibold">Mật khẩu mới</span>}
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-synop-blue-primary" />}
                                placeholder="Nhập mật khẩu mới"
                                size="large"
                                className="rounded-xl border-gray-200 hover:border-synop-blue-primary focus:border-synop-blue-primary transition-colors"
                                iconRender={(visible) => 
                                    visible ? 
                                    <EyeOutlined className="text-synop-gray-medium" /> : 
                                    <EyeInvisibleOutlined className="text-synop-gray-medium" />
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-synop-gray-dark font-semibold">Xác nhận mật khẩu mới</span>}
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<CheckCircleOutlined className="text-synop-blue-primary" />}
                                placeholder="Xác nhận mật khẩu mới"
                                size="large"
                                className="rounded-xl border-gray-200 hover:border-synop-blue-primary focus:border-synop-blue-primary transition-colors"
                                iconRender={(visible) => 
                                    visible ? 
                                    <EyeOutlined className="text-synop-gray-medium" /> : 
                                    <EyeInvisibleOutlined className="text-synop-gray-medium" />
                                }
                            />
                        </Form.Item>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                onClick={handleCancel}
                                size="large"
                                className="rounded-full px-6 h-10 font-semibold border-gray-300 hover:border-red-400 hover:text-red-500 transition-all duration-300"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                                className="bg-synop-blue-primary hover:bg-synop-blue-dark border-0 rounded-full px-6 h-10 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </Form>
                </div>
            </motion.div>
        </Modal>
    );
}

export default ChangePasswordModal;
