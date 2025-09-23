import { useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Button, Modal, Form, Input, Typography, message, Tag, Tooltip, Space, Calendar, Badge, Spin, ConfigProvider, Alert, Divider } from "antd";
import type { BadgeProps, TagProps } from "antd";
import viVN from "antd/locale/vi_VN";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import axiosInstance from "../../services/constant/axiosInstance";
import { TECHNICIAN_SCHEDULES_BY_TECHNICIAN_ENDPOINT } from "../../services/constant/apiConfig";
import { useAppSelector, useAppDispatch } from "../../services/store/store";
import {
    createWorkProgress,
    getProgressByAppointment,
    submitInspectionQuote as submitInspectionQuoteThunk,
    startMaintenance as startMaintenanceThunk,
    completeMaintenance,
} from "../../services/features/technician/workProgressSlice";
import { TechnicianSchedule } from "@/interfaces/technician";
import { WorkProgress } from "@/interfaces/workProgress";

const { TextArea } = Input;
const { Title, Text } = Typography;



export default function TechnicianWorkProgressPage() {
    const { user } = useAppSelector((s) => s.auth);
    const technicianId = user?.id || "";
    const dispatch = useAppDispatch();

    dayjs.locale("vi");
    const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
    // const [today] = useState<Dayjs>(dayjs());
    const [dayModalOpen, setDayModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);
    const [loading, setLoading] = useState(false);
    type ScheduleLike = TechnicianSchedule & { appointmentId?: string };
    const [schedules, setSchedules] = useState<ScheduleLike[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [form] = Form.useForm();
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailSchedule, setDetailSchedule] = useState<ScheduleLike | null>(null);
    const [detailProgress, setDetailProgress] = useState<WorkProgress | null>(null);
    const [quoteOpen, setQuoteOpen] = useState(false);
    const [quoteForm] = Form.useForm();
    const [completeOpen, setCompleteOpen] = useState(false);
    const [completeForm] = Form.useForm();
    const [progressExistSet, setProgressExistSet] = useState<Set<string>>(new Set());

    const startDate = useMemo(() => currentMonth.startOf("month").format("YYYY-MM-DD"), [currentMonth]);
    const endDate = useMemo(() => currentMonth.endOf("month").format("YYYY-MM-DD"), [currentMonth]);

    const schedulesByDate = useMemo(() => {
        const map: Record<string, ScheduleLike[]> = {};
        schedules.forEach((sch) => {
            const key = dayjs(sch.workDate).format("YYYY-MM-DD");
            if (!map[key]) map[key] = [];
            map[key].push(sch);
        });
        return map;
    }, [schedules]);

    const loadSchedules = async () => {
        if (!technicianId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                TECHNICIAN_SCHEDULES_BY_TECHNICIAN_ENDPOINT(technicianId),
                { params: { startDate, endDate } }
            );
            const data = res.data?.data || res.data;
            const list = Array.isArray(data) ? (data as ScheduleLike[]) : [];
            setSchedules(list);
            // Build set of appointmentIds that already have progress
            const ids = list
                .map((s) => s.appointmentId || s.assignedAppointments?.[0]?._id)
                .filter((x): x is string => typeof x === 'string');
            const checks = await Promise.allSettled(ids.map((id) => dispatch(getProgressByAppointment(id))));
            const exist = new Set<string>();
            checks.forEach((r, i) => {
                if (r.status === 'fulfilled') {
                    const action = r.value;
                    if (getProgressByAppointment.fulfilled.match(action) && (action.payload as { success?: boolean })?.success) {
                        exist.add(ids[i]);
                    }
                }
            });
            setProgressExistSet(exist);
        } catch {
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [technicianId, startDate, endDate]);

    const ensureProgressChecked = async (appointmentId: string): Promise<boolean> => {
        try {
            const action = await dispatch(getProgressByAppointment(appointmentId));
            if (getProgressByAppointment.fulfilled.match(action) && (action.payload as { success?: boolean })?.success) {
                setProgressExistSet((prev) => new Set(prev).add(appointmentId));
                return true;
            }
            // Not found or no success
            setProgressExistSet((prev) => {
                const copy = new Set(prev);
                copy.delete(appointmentId);
                return copy;
            });
            return false;
        } catch {
            return false;
        }
    };

    const statusColor = (status?: string) =>
        status === "working"
            ? "processing"
            : status === "completed"
                ? "success"
                : status === "on_leave"
                    ? "warning"
                    : status === "absent"
                        ? "error"
                        : "default";

    const dateCellRender = (value: Dayjs) => {
        const key = value.format("YYYY-MM-DD");
        const items = schedulesByDate[key] || [];
        if (!items.length) return null;
        return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item) => (
                    <li key={item._id}>
                        <Space size={4} align="center">
                            <Badge status={statusColor(item.status) as BadgeProps['status']} text={`${item.shiftStart} - ${item.shiftEnd}`} />
                        </Space>
                    </li>
                ))}
            </ul>
        );
    };

    const onPanelChange = (value: Dayjs) => {
        setCurrentMonth(value);
    };

    const onSelectDate = (value: Dayjs) => {
        const key = value.format("YYYY-MM-DD");
        const items = schedulesByDate[key] || [];
        if (!items.length) return;
        setSelectedDay(value);
        setDayModalOpen(true);
    };

    const openCreateProgress = async (schedule: ScheduleLike) => {
        const apptId = schedule.appointmentId || schedule.assignedAppointments?.[0]?._id || null;
        setSelectedAppointmentId(apptId);
        if (!apptId) {
            message.warning("Lịch này chưa gắn booking - không thể tạo tiến trình");
            return;
        }
        const existed = await ensureProgressChecked(apptId);
        if (existed) {
            message.info("Booking đã có tiến trình.");
            return;
        }
        // Prefill serviceDate and startTime from booking if available
        let serviceDateValue: dayjs.Dayjs | undefined;
        let startTimeValue: dayjs.Dayjs | undefined;
        const aTime = schedule.assignedAppointments?.[0]?.appointmentTime as { date?: string; startTime?: string } | undefined;
        const dateISO = aTime?.date || schedule.workDate;
        if (dateISO) {
            serviceDateValue = dayjs(dateISO);
            const start = aTime?.startTime;
            if (start) {
                const [hh, mm] = start.split(":");
                startTimeValue = dayjs(dateISO).hour(Number(hh || 0)).minute(Number(mm || 0)).second(0).millisecond(0);
            }
        }
        form.resetFields();
        form.setFieldsValue({
            serviceDate: serviceDateValue,
            startTime: startTimeValue,
            milestones: [],
        });
        setCreateOpen(true);
    };

    const getAppointmentIdFromSchedule = (sch: ScheduleLike): string | null => {
        return sch.appointmentId || sch.assignedAppointments?.[0]?._id || null;
    };

    const openDetails = async (sch: ScheduleLike) => {
        setDetailSchedule(sch);
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailProgress(null);
        try {
            const apptId = getAppointmentIdFromSchedule(sch);
            if (apptId) {
                const result = await dispatch(getProgressByAppointment(apptId));
                if (getProgressByAppointment.fulfilled.match(result) && result.payload.success) {
                    setDetailProgress(result.payload.data as WorkProgress);
                }
            }
        } finally {
            setDetailLoading(false);
        }
    };

    const createProgressFromDetails = async () => {
        if (!detailSchedule || !technicianId) return;
        try {
            const apptId = getAppointmentIdFromSchedule(detailSchedule);
            if (!apptId) return;
            const existed = await ensureProgressChecked(apptId);
            if (existed) {
                message.info("Booking đã có tiến trình.");
                return;
            }
            const aTime = detailSchedule.assignedAppointments?.[0]?.appointmentTime as { date?: string; startTime?: string } | undefined;
            const dateISO = aTime?.date || detailSchedule.workDate || new Date().toISOString();
            const result = await dispatch(createWorkProgress({ technicianId, appointmentId: apptId, serviceDate: dateISO }));
            if (createWorkProgress.fulfilled.match(result) && (result.payload as { success?: boolean })?.success) {
                message.success("Đã tạo tiến trình");
                setProgressExistSet((prev) => new Set(prev).add(apptId));
            } else {
                const errMsg = (result.payload as string) || "Tạo tiến trình thất bại";
                message.error(String(errMsg));
            }
            await openDetails(detailSchedule);
        } catch {
            message.error("Tạo tiến trình thất bại");
        }
    };

    const submitInspectionQuote = async () => {
        try {
            const values = await quoteForm.validateFields();
            const progressId = detailProgress?._id;
            if (!progressId) return;
            const result = await dispatch(
                submitInspectionQuoteThunk({
                    progressId,
                    payload: {
                        vehicleCondition: values.vehicleCondition,
                        diagnosisDetails: values.diagnosisDetails,
                        inspectionNotes: values.inspectionNotes,
                        quoteAmount: Number(values.quoteAmount || 0),
                        quoteDetails: values.quoteDetails,
                    },
                })
            );
            if (submitInspectionQuoteThunk.fulfilled.match(result) && (result.payload as { success?: boolean })?.success) {
                message.success("Đã gửi báo giá");
                setQuoteOpen(false);
            } else {
                const payload = result.payload as unknown;
                const errMsg = (typeof payload === 'string' ? payload : (payload as { message?: string })?.message) || "Gửi báo giá thất bại";
                message.error(String(errMsg));
            }
            await openDetails(detailSchedule as ScheduleLike);
        } catch {
            // validation or request error
        }
    };

    const startMaintenance = async () => {
        try {
            const progressId = detailProgress?._id;
            if (!progressId) return;
            const result = await dispatch(startMaintenanceThunk(progressId));
            if (startMaintenanceThunk.fulfilled.match(result) && (result.payload as { success?: boolean })?.success) {
                message.success("Bắt đầu bảo dưỡng");
            } else {
                const payload = result.payload as unknown;
                const errMsg = (typeof payload === 'string' ? payload : (payload as { message?: string })?.message) || "Không thể bắt đầu bảo dưỡng";
                message.error(String(errMsg));
            }
            await openDetails(detailSchedule as ScheduleLike);
        } catch {
            message.error("Không thể bắt đầu bảo dưỡng");
        }
    };

    const submitComplete = async () => {
        try {
            const values = await completeForm.validateFields();
            const progressId = detailProgress?._id;
            if (!progressId) return;
            const result = await dispatch(completeMaintenance({ progressId, payload: values }));
            if (completeMaintenance.fulfilled.match(result) && (result.payload as { success?: boolean })?.success) {
                message.success("Đã hoàn thành bảo dưỡng");
                setCompleteOpen(false);
            } else {
                const payload = result.payload as unknown;
                const errMsg = (typeof payload === 'string' ? payload : (payload as { message?: string })?.message) || "Hoàn thành thất bại";
                message.error(String(errMsg));
            }
            await openDetails(detailSchedule as ScheduleLike);
        } catch {
            message.error("Hoàn thành thất bại");
        }
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedAppointmentId || !technicianId) return;
            const existed = await ensureProgressChecked(selectedAppointmentId);
            if (existed) {
                message.info("Booking đã có tiến trình.");
                setCreateOpen(false);
                return;
            }
            const payload = {
                technicianId,
                appointmentId: selectedAppointmentId,
                serviceDate: values.serviceDate?.toISOString?.() || new Date().toISOString(),
                startTime: values.startTime?.toISOString?.() || new Date().toISOString(),
                milestones: (values.milestones || []).map((m: { name: string; description: string }) => ({ name: m.name, description: m.description })),
                notes: values.notes || "",
            };
            const result = await dispatch(createWorkProgress(payload));
            if (createWorkProgress.fulfilled.match(result) && (result.payload as { success?: boolean })?.success) {
                message.success("Tạo tiến trình thành công");
                setCreateOpen(false);
                setProgressExistSet((prev) => new Set(prev).add(selectedAppointmentId));
            } else {
                const payload = result.payload as unknown;
                const errMsg = (typeof payload === 'string' ? payload : (payload as { message?: string })?.message) || "Tạo tiến trình thất bại";
                message.error(String(errMsg));
            }
        } catch {
            // validation error or request failed
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Title level={2}>Tiến độ làm việc kỹ thuật viên</Title>
                <Space size={8} wrap>
                    <Badge status="processing" text="Đang làm" />
                    <Badge status="success" text="Hoàn tất" />
                    <Badge status="warning" text="Nghỉ phép" />
                    <Badge status="error" text="Vắng" />
                    <Badge status="default" text="Lịch" />
                </Space>
            </div>

            <Spin spinning={loading}>
                <ConfigProvider locale={viVN}>
                    <Card>
                        <div className="flex justify-between items-center mb-3">
                            <Space>
                                <Button onClick={() => setCurrentMonth(dayjs())}>Hôm nay</Button>
                                <Button onClick={loadSchedules} loading={loading}>Tải lại</Button>
                            </Space>
                            <Text type="secondary">Khoảng: {dayjs(startDate).format("DD/MM/YYYY")} - {dayjs(endDate).format("DD/MM/YYYY")}</Text>
                        </div>
                        <Calendar
                            value={currentMonth}
                            onPanelChange={onPanelChange}
                            dateCellRender={dateCellRender}
                            onSelect={onSelectDate}
                        />
                    </Card>
                </ConfigProvider>
            </Spin>

            <Modal
                title="Chi tiết lịch/booking"
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={720}
            >
                {detailLoading ? (
                    <div className="py-6">Đang tải...</div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Ngày:</span>
                            <span className="font-medium">{dayjs(detailSchedule?.workDate || startDate).format("DD/MM/YYYY")}</span>
                            <span>• Ca:</span>
                            <span className="font-medium">{detailSchedule?.shiftStart} - {detailSchedule?.shiftEnd}</span>
                        </div>
                        <div className="border-t pt-3">
                            <Space wrap>
                                {(() => {
                                    const apptId = detailSchedule ? getAppointmentIdFromSchedule(detailSchedule) : null;
                                    const hasBooking = !!apptId;
                                    const hasProgress = !!detailProgress;
                                    const disabled = !hasBooking || hasProgress;
                                    const tip = hasProgress
                                        ? "Đã có tiến trình cho booking này"
                                        : (!hasBooking ? "Lịch này chưa gắn booking - không thể tạo tiến trình" : undefined);
                                    return (
                                        <Tooltip title={tip}>
                                            <Button type="primary" onClick={createProgressFromDetails} disabled={disabled}>Tạo tiến trình</Button>
                                        </Tooltip>
                                    );
                                })()}
                                {detailProgress && (
                                    <>
                                        <Button onClick={() => { quoteForm.resetFields(); setQuoteOpen(true); }}>Gửi Inspection & Quote</Button>
                                        <Button onClick={startMaintenance} disabled={!(detailProgress?.currentStatus === 'quote_provided' || detailProgress?.quote?.quoteStatus === 'approved' || (typeof detailProgress?.appointmentId === 'object' && detailProgress?.appointmentId?.inspectionAndQuote?.quoteStatus === 'approved'))}>Bắt đầu bảo dưỡng</Button>
                                        <Button danger onClick={() => { completeForm.resetFields(); setCompleteOpen(true); }} disabled={detailProgress?.currentStatus !== 'in_progress'}>Hoàn thành</Button>
                                    </>
                                )}
                            </Space>
                        </div>
                        {!detailProgress && (
                            <div className="bg-gray-50 p-3 rounded border">
                                <p className="text-gray-600">Chưa có tiến trình cho lịch này. Nhấn "Tạo tiến trình" để bắt đầu.</p>
                            </div>
                        )}
                        {detailProgress && (
                            <div className="bg-gray-50 p-3 rounded border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Trạng thái hiện tại</p>
                                        <p className="font-medium">{(detailProgress.currentStatus || '').split('_').join(' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Quote status</p>
                                        <p className="font-medium">{detailProgress?.quote?.quoteStatus || (typeof detailProgress?.appointmentId === 'object' && detailProgress?.appointmentId?.inspectionAndQuote?.quoteStatus) || 'pending'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                open={dayModalOpen}
                title={selectedDay ? `Lịch ngày ${selectedDay.format("DD/MM/YYYY")}` : "Lịch trong ngày"}
                onCancel={() => setDayModalOpen(false)}
                footer={<Button onClick={() => setDayModalOpen(false)}>Đóng</Button>}
            >
                {selectedDay ? (
                    (() => {
                        const key = selectedDay.format("YYYY-MM-DD");
                        const items = schedulesByDate[key] || [];
                        if (!items.length) return <Alert type="info" message="Không có lịch trong ngày này" showIcon />;
                        return (
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {items.map((item) => {
                                    const apptId = item.appointmentId || (item.assignedAppointments?.[0]?._id as string | undefined);
                                    const hasBooking = !!apptId;
                                    const hasProgress = apptId ? progressExistSet.has(apptId) : false;
                                    return (
                                        <Card key={item._id} size="small">
                                            <Space split={<Divider type="vertical" />} wrap>
                                                <Tag color={statusColor(item.status) as TagProps['color']}>{item.status}</Tag>
                                                <Text>{`${item.shiftStart} - ${item.shiftEnd}`}</Text>
                                                {item.centerId?.name && (
                                                    <Text type="secondary">{item.centerId.name}</Text>
                                                )}
                                            </Space>
                                            <div className="mt-2 flex gap-2">
                                                <Button onClick={() => openDetails(item)}>Chi tiết</Button>
                                                <Tooltip title={hasProgress ? "Đã có tiến trình cho booking này" : (hasBooking ? undefined : "Lịch này chưa gắn booking - không thể tạo tiến trình")}>
                                                    <Button type="primary" disabled={!hasBooking || hasProgress} onClick={() => openCreateProgress(item)}>
                                                        Tạo tiến trình
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </Space>
                        );
                    })()
                ) : null}
            </Modal>

            <Modal
                title="Inspection & Quote"
                open={quoteOpen}
                onCancel={() => setQuoteOpen(false)}
                onOk={submitInspectionQuote}
                okText="Gửi báo giá"
            >
                <Form layout="vertical" form={quoteForm}>
                    <Form.Item name="vehicleCondition" label="Tình trạng xe" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Ắc quy yếu, đèn báo động cơ..." />
                    </Form.Item>
                    <Form.Item name="diagnosisDetails" label="Chẩn đoán" rules={[{ required: true }]}>
                        <Input placeholder="Chi tiết chẩn đoán" />
                    </Form.Item>
                    <Form.Item name="inspectionNotes" label="Ghi chú kiểm tra">
                        <Input placeholder="Ghi chú" />
                    </Form.Item>
                    <Form.Item name="quoteAmount" label="Giá báo (VND)" rules={[{ required: true }]}>
                        <Input type="number" placeholder="1500000" />
                    </Form.Item>
                    <Form.Item name="quoteDetails" label="Chi tiết báo giá" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} placeholder="Chi phí bao gồm..." />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Hoàn thành bảo dưỡng"
                open={completeOpen}
                onCancel={() => setCompleteOpen(false)}
                onOk={submitComplete}
                okText="Xác nhận hoàn thành"
            >
                <Form layout="vertical" form={completeForm}>
                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="workDone" label="Công việc đã làm" rules={[{ required: true }]}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="recommendations" label="Khuyến nghị">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Tạo tiến trình làm việc"
                open={createOpen}
                onCancel={() => setCreateOpen(false)}
                onOk={handleCreate}
                okText="Tạo"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Ngày dịch vụ" name="serviceDate" rules={[{ required: true, message: "Chọn ngày" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item label="Thời điểm bắt đầu" name="startTime" rules={[{ required: true, message: "Chọn thời điểm bắt đầu" }]}>
                        <DatePicker showTime className="w-full" />
                    </Form.Item>
                    <Form.Item label="Trạng thái hiện tại">
                        <Tag>Chưa bắt đầu</Tag>
                    </Form.Item>

                    <Form.Item label="Các mốc tiến độ" shouldUpdate>
                        <Form.List name="milestones">
                            {(fields, { add, remove }) => (
                                <div className="space-y-2">
                                    {fields.map((field) => (
                                        <Card key={field.key} size="small">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <Form.Item name={[field.name, "name"]} label="Tên mốc" rules={[{ required: true }]}>
                                                    <Input placeholder="Tên mốc" />
                                                </Form.Item>
                                                <Form.Item name={[field.name, "description"]} label="Mô tả" rules={[{ required: true }]}>
                                                    <Input placeholder="Mô tả" />
                                                </Form.Item>
                                            </div>
                                            <Button danger onClick={() => remove(field.name)}>Xóa</Button>
                                        </Card>
                                    ))}
                                    <Button onClick={() => add({ name: "", description: "" })}>Thêm mốc</Button>
                                </div>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="notes">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
