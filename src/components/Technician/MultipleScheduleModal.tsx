import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    DatePicker,
    Button,
    message,
    Row,
    Col,
    Typography,
    Alert,
} from "antd";
import {
    CalendarOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch } from "../../services/store/store";
import { createDefaultSchedules } from "../../services/features/technician/technicianSlice";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface MultipleScheduleModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
    technicianId: string;
    centerId: string;
}

const MultipleScheduleModal: React.FC<MultipleScheduleModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    technicianId,
    centerId,
}) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            form.resetFields();
            // Set default values
            form.setFieldsValue({
                dateRange: [dayjs(), dayjs().add(7, 'day')],
            });
        }
    }, [visible, form]);

    const handleSubmit = async (values: {
        dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    }) => {
        try {
            setLoading(true);

            if (!values.dateRange) {
                message.error("Vui lòng chọn khoảng thời gian!");
                return;
            }

            const payload = {
                technicianId,
                centerId,
                startDate: values.dateRange[0].format("YYYY-MM-DD"),
                endDate: values.dateRange[1].format("YYYY-MM-DD"),
            };

            const result = await dispatch(createDefaultSchedules(payload)).unwrap();

            // Check if the response indicates success
            if (result.success) {
                message.success(result.message || "Tạo lịch làm việc nhiều ngày thành công!");
                onSuccess?.();
            } else {
                message.error(result.message || "Có lỗi xảy ra khi tạo lịch làm việc!");
            }
        } catch (error: unknown) {
            // Handle API error response
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (err.message) {
                message.error(err.message);
            } else if (err.response?.data?.message) {
                message.error(err.response.data.message);
            } else {
                message.error("Có lỗi xảy ra khi tạo lịch làm việc!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-green-500" />
                    <span>Tạo lịch làm việc nhiều ngày</span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={500}
        >
            <Alert
                message="Thông tin lịch làm việc"
                description="Lịch sẽ được tạo tự động với ca làm việc mặc định từ 08:00 - 17:00 cho tất cả các ngày trong khoảng thời gian đã chọn."
                type="info"
                icon={<InfoCircleOutlined />}
                className="mb-4"
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-4"
            >
                <Form.Item
                    label={<Text strong>Khoảng thời gian</Text>}
                    name="dateRange"
                    rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian" }]}
                >
                    <RangePicker
                        className="w-full"
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        showTime={false}
                        picker="date"
                    />
                </Form.Item>

                <Row gutter={16} className="text-sm text-gray-600">
                    <Col span={24}>
                        <div className="bg-gray-50 p-3 rounded">
                            <div className="font-medium mb-1">Chi tiết lịch làm việc:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Ca làm việc: 08:00 - 17:00</li>
                                <li>Trạng thái: Đã lên lịch</li>
                                <li>Áp dụng cho tất cả ngày trong tuần</li>
                            </ul>
                        </div>
                    </Col>
                </Row>

                <div className="flex justify-end space-x-2">
                    <Button onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<CalendarOutlined />}
                    >
                        Tạo lịch nhiều ngày
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default MultipleScheduleModal;
