import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    TimePicker,
    Button,
    message,
    Row,
    Col,
    Typography,
} from "antd";
import {
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch } from "../../services/store/store";
import { createSingleSchedule } from "../../services/features/technician/technicianSlice";
const { Text } = Typography;

interface SingleScheduleModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
    technicianId: string;
    centerId: string;
}

const SingleScheduleModal: React.FC<SingleScheduleModalProps> = ({
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
                workDate: dayjs(),
                shiftStart: dayjs("08:00", "HH:mm"),
                shiftEnd: dayjs("17:00", "HH:mm"),
            });
        }
    }, [visible, form]);

    const handleSubmit = async (values: {
        workDate: dayjs.Dayjs;
        shiftStart: dayjs.Dayjs;
        shiftEnd: dayjs.Dayjs;
        breakTime?: Array<{ start: string; end: string }>;
        notes?: string;
    }) => {
        try {
            setLoading(true);

            const payload = {
                technicianId,
                centerId,
                workDate: values.workDate.format("YYYY-MM-DD"),
                shiftStart: values.shiftStart.format("HH:mm"),
                shiftEnd: values.shiftEnd.format("HH:mm"),
                breakTime: values.breakTime || [],
                notes: values.notes || "",
            };

            const result = await dispatch(createSingleSchedule(payload)).unwrap();

            // Check if the response indicates success
            if (result.success) {
                message.success(result.message || "Tạo lịch làm việc thành công!");
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
                    <CalendarOutlined className="mr-2 text-blue-500" />
                    <span>Tạo lịch làm việc 1 ngày</span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-4"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<Text strong>Ngày làm việc</Text>}
                            name="workDate"
                            rules={[{ required: true, message: "Vui lòng chọn ngày làm việc" }]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={<Text strong>Giờ bắt đầu</Text>}
                            name="shiftStart"
                            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
                        >
                            <TimePicker
                                className="w-full"
                                format="HH:mm"
                                placeholder="Chọn giờ"
                                minuteStep={15}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<Text strong>Giờ kết thúc</Text>}
                            name="shiftEnd"
                            rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
                        >
                            <TimePicker
                                className="w-full"
                                format="HH:mm"
                                placeholder="Chọn giờ"
                                minuteStep={15}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<Text strong>Ghi chú</Text>}
                    name="notes"
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Nhập ghi chú (tùy chọn)"
                    />
                </Form.Item>

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
                        Tạo lịch
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default SingleScheduleModal;
