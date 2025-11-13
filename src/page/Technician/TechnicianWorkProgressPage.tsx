import { useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Button, Modal, Form, Input, Typography, message, Tag, Tooltip, Space, Calendar, Badge, Spin, ConfigProvider, Alert, Divider, Radio, Select, InputNumber } from "antd";
import type { BadgeProps, TagProps } from "antd";
import viVN from "antd/locale/vi_VN";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import axiosInstance from "../../services/constant/axiosInstance";
import { TECHNICIAN_SCHEDULES_BY_TECHNICIAN_ENDPOINT, APPOINTMENT_VIEW_QUOTE_ENDPOINT } from "../../services/constant/apiConfig";
import { useAppSelector, useAppDispatch } from "../../services/store/store";
import {
    createWorkProgress,
    getProgressByAppointment,
    startMaintenance as startMaintenanceThunk,
    completeMaintenance,
} from "../../services/features/technician/workProgressSlice";
import { cancelBooking } from "../../services/features/booking/bookingSlice";
import { submitAppointmentInspectionQuote } from "../../services/features/booking/bookingSlice";
import { TechnicianSchedule } from "@/interfaces/technician";
import { WorkProgress } from "@/interfaces/workProgress";
import { fetchParts, fetchPartsByCategory } from "../../services/features/parts/partsSlice";

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
    const [createCtx, setCreateCtx] = useState<{ schedule: ScheduleLike; apptId: string } | null>(null);
    const [form] = Form.useForm();
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailSchedule, setDetailSchedule] = useState<ScheduleLike | null>(null);
    const [detailProgress, setDetailProgress] = useState<WorkProgress | null>(null);
    const [detailSelectedAppointmentId, setDetailSelectedAppointmentId] = useState<string | null>(null);
    const [quoteOpen, setQuoteOpen] = useState(false);
    const [quoteAppointmentId, setQuoteAppointmentId] = useState<string | null>(null);
    const [quoteForm] = Form.useForm();
    const [completeOpen, setCompleteOpen] = useState(false);
    const [completeForm] = Form.useForm();
    const [progressExistSet, setProgressExistSet] = useState<Set<string>>(new Set());
    const [dayModalSelectedAppt, setDayModalSelectedAppt] = useState<Record<string, string>>({});
    const { parts: allParts, loading: partsLoading } = useAppSelector((s) => s.parts);
    const [selectedPartCategory, setSelectedPartCategory] = useState<string | undefined>(undefined);

    // Cancel booking state
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<string | null>(null);

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

    // Load parts list when opening quote modal (for items selection)
    useEffect(() => {
        if (quoteOpen && (!allParts || allParts.length === 0)) {
            dispatch(fetchParts(undefined));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quoteOpen]);

    const categoryOptions = useMemo(() => {
        const set = new Set<string>();
        (allParts || []).forEach((p) => {
            if (p?.category) set.add(p.category);
        });
        return Array.from(set).sort().map((c) => ({ label: c, value: c }));
    }, [allParts]);

    const handleSelectCategory = (category?: string) => {
        setSelectedPartCategory(category);
        if (!category) {
            dispatch(fetchParts(undefined));
        } else {
            dispatch(fetchPartsByCategory(category));
        }
    };

    const handleSelectPartForItem = (itemIndex: number, partId: string) => {
        const part = (allParts || []).find((p) => p._id === partId);
        const currentQuote = quoteForm.getFieldValue(["quoteDetails"]) || {} as { items?: Array<{ partId?: string; name?: string; unitPrice?: number; quantity?: number }> };
        const items: Array<{ partId?: string; name?: string; unitPrice?: number; quantity?: number }> = Array.isArray(currentQuote.items) ? [...currentQuote.items] : [];
        const existing = items[itemIndex] || {};
        items[itemIndex] = {
            ...existing,
            partId,
            name: existing.name ?? part?.partName ?? "",
            unitPrice: part?.unitPrice ?? existing.unitPrice ?? 0,
            quantity: existing.quantity ?? 1,
        };
        quoteForm.setFieldsValue({ quoteDetails: { ...currentQuote, items } });
    };

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

    const ensureQuoteApproved = async (appointmentId: string): Promise<boolean> => {
        try {
            const res = await axiosInstance.get(APPOINTMENT_VIEW_QUOTE_ENDPOINT(appointmentId));
            const data = res.data?.data || res.data;
            const status: string | undefined = (data?.status as string | undefined) || undefined;
            // server may wrap quote in data.quote
            const quoteStatus: string | undefined = (data?.quote?.quoteStatus as string | undefined) || undefined;
            return status === 'quote_approved' || String(quoteStatus || '').toLowerCase() === 'approved';
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
                    <li key={item._id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <Badge status={statusColor(item.status) as BadgeProps['status']} text={`${item.shiftStart}-${item.shiftEnd}`} />
                            {Array.isArray(item.assignedAppointments) && item.assignedAppointments.some((a) => a.status !== 'cancelled') && (
                                <Tooltip title="Có booking">
                                    <span style={{ width: 6, height: 6, background: '#1677ff', borderRadius: '50%', display: 'inline-block' }} />
                                </Tooltip>
                            )}
                        </div>
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

    const openCreateProgress = async (schedule: ScheduleLike, explicitAppointmentId?: string) => {
        const apptId = explicitAppointmentId || schedule.appointmentId || schedule.assignedAppointments?.[0]?._id || null;
        setSelectedAppointmentId(apptId);
        if (!apptId) {
            message.warning("Lịch này chưa gắn booking - không thể tạo tiến trình");
            return;
        }
        const existed = await ensureProgressChecked(apptId);
        if (existed) {
            message.info("Booking đã có tiến trình. Không thể tạo thêm.");
            return;
        }
        // Must have inspection & quote APPROVED before creating progress
        const chosenAppt = (Array.isArray(schedule.assignedAppointments)
            ? schedule.assignedAppointments.find((a) => a._id === apptId)
            : undefined) as unknown as { inspectionAndQuote?: { quoteStatus?: string } } | undefined;
        const localApproved = ((): boolean => {
            // Local quick check using schedule data if present
            const apptStatus: string | undefined = (chosenAppt as unknown as { status?: string } | undefined)?.status;
            const qStatus: string | undefined = chosenAppt?.inspectionAndQuote?.quoteStatus;
            return apptStatus === 'quote_approved' || String(qStatus || '').toLowerCase() === 'approved';
        })();
        let approved = localApproved;
        if (!approved) {
            approved = await ensureQuoteApproved(apptId);
        }
        if (!approved) {
            message.warning("Cần báo giá và được khách duyệt (approved) trước khi tạo tiến trình");
            return;
        }
        // Prefill serviceDate and startTime from booking if available
        let serviceDateValue: dayjs.Dayjs | undefined;
        let startTimeValue: dayjs.Dayjs | undefined;
        const selectedAppt = schedule.assignedAppointments?.find((a) => a._id === apptId) || schedule.assignedAppointments?.[0];
        const aTime = selectedAppt?.appointmentTime as { date?: string; startTime?: string } | undefined;
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
        setCreateCtx({ schedule, apptId });
        setCreateOpen(true);
    };

    const getAppointmentIdFromSchedule = (sch: ScheduleLike): string | null => {
        return sch.appointmentId || sch.assignedAppointments?.[0]?._id || null;
    };

    const openDetails = async (sch: ScheduleLike, presetAppointmentId?: string | null) => {
        setDetailSchedule(sch);
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailProgress(null);
        // preselect first assigned appointment if available
        const firstNonCancelled = Array.isArray(sch.assignedAppointments)
            ? sch.assignedAppointments.find((a) => a.status !== 'cancelled')?._id
            : undefined;
        const apptPreset = presetAppointmentId || firstNonCancelled || sch.appointmentId || null;
        setDetailSelectedAppointmentId(typeof apptPreset === 'string' ? apptPreset : null);
        try {
            const apptId = (apptPreset as string | undefined) || getAppointmentIdFromSchedule(sch);
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

    const onChangeDetailAppointment = async (appointmentId: string) => {
        setDetailSelectedAppointmentId(appointmentId);
        setDetailLoading(true);
        setDetailProgress(null);
        try {
            const result = await dispatch(getProgressByAppointment(appointmentId));
            if (getProgressByAppointment.fulfilled.match(result) && result.payload.success) {
                setDetailProgress(result.payload.data as WorkProgress);
            }
        } finally {
            setDetailLoading(false);
        }
    };



    const submitInspectionQuote = async () => {
        try {
            const values = await quoteForm.validateFields();
            const appointmentId = quoteAppointmentId || detailSelectedAppointmentId;
            if (!appointmentId) return;
            // Build payload without quoteAmount and without labor
            type QuoteItemForm = { partId?: string; quantity?: number; unitPrice?: number; name?: string };
            const itemsSource: QuoteItemForm[] = Array.isArray(values?.quoteDetails?.items)
                ? (values.quoteDetails.items as QuoteItemForm[])
                : [];
            const items = itemsSource
                .filter((it) => !!it?.partId)
                .map((it) => ({
                    partId: it.partId as string,
                    quantity: Number(it?.quantity || 0),
                    unitPrice: Number(it?.unitPrice || 0),
                    name: it?.name,
                }));
            // Handle array values from tags mode: convert to string
            const vehicleConditionValue = Array.isArray(values.vehicleCondition)
                ? values.vehicleCondition.join(", ")
                : (values.vehicleCondition || "");
            const diagnosisDetailsValue = Array.isArray(values.diagnosisDetails)
                ? values.diagnosisDetails.join(", ")
                : (values.diagnosisDetails || "");
            const inspectionNotesValue = Array.isArray(values.inspectionNotes)
                ? values.inspectionNotes.join(", ")
                : (values.inspectionNotes || "");

            const result = await dispatch(
                submitAppointmentInspectionQuote({
                    appointmentId,
                    payload: {
                        vehicleCondition: vehicleConditionValue,
                        diagnosisDetails: diagnosisDetailsValue,
                        inspectionNotes: inspectionNotesValue,
                        quoteDetails: { items },
                    },
                })
            );
            if ((result as unknown as { type: string }).type.endsWith('/fulfilled')) {
                message.success("Đã gửi báo giá");
                setQuoteOpen(false);
                setQuoteAppointmentId(null);
            } else {
                const payload = result.payload as unknown;
                const errMsg = (typeof payload === 'string' ? payload : (payload as { message?: string })?.message) || "Gửi báo giá thất bại";
                message.error(String(errMsg));
            }
            if (detailSchedule) await openDetails(detailSchedule, appointmentId);
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
            // Handle array values from tags mode: convert to string
            const payload = {
                notes: Array.isArray(values.notes) ? values.notes.join(", ") : (values.notes || ""),
                workDone: Array.isArray(values.workDone) ? values.workDone.join(", ") : (values.workDone || ""),
                recommendations: Array.isArray(values.recommendations) ? values.recommendations.join(", ") : (values.recommendations || ""),
            };
            const result = await dispatch(completeMaintenance({ progressId, payload }));
            if (completeMaintenance.fulfilled.match(result) && (result.payload as { success?: boolean })?.success) {
                message.success("Đã hoàn thành bảo dưỡng");
                setCompleteOpen(false);
            } else {
                const errorPayload = result.payload as unknown;
                const errMsg = (typeof errorPayload === 'string' ? errorPayload : (errorPayload as { message?: string })?.message) || "Hoàn thành thất bại";
                message.error(String(errMsg));
            }
            await openDetails(detailSchedule as ScheduleLike);
        } catch {
            message.error("Hoàn thành thất bại");
        }
    };

    const openCancelBooking = (appointmentId: string) => {
        setSelectedBookingForCancel(appointmentId);
        setCancelReason("");
        setCancelOpen(true);
    };

    const closeCancelBooking = () => {
        setCancelOpen(false);
        setSelectedBookingForCancel(null);
        setCancelReason("");
    };

    const submitCancelBooking = async () => {
        if (!selectedBookingForCancel) return;
        try {
            const result = await dispatch(cancelBooking({
                bookingId: selectedBookingForCancel,
                reason: cancelReason
            }));
            if (cancelBooking.fulfilled.match(result)) {
                message.success("Đã hủy lịch hẹn thành công");
                closeCancelBooking();
                // Reload schedules to reflect the cancellation
                await loadSchedules();
                // Close detail modal if open
                setDetailOpen(false);
            } else {
                const payload = result.payload as unknown;
                const errMsg = (typeof payload === 'string' ? payload : (payload as { message?: string })?.message) || "Hủy lịch hẹn thất bại";
                message.error(String(errMsg));
            }
        } catch {
            message.error("Hủy lịch hẹn thất bại");
        }
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedAppointmentId || !technicianId) return;
            // Re-check server approval strictly before creating
            const approved = await ensureQuoteApproved(selectedAppointmentId);
            if (!approved) {
                message.warning("Chỉ được tạo tiến trình khi báo giá đã được duyệt");
                return;
            }
            await ensureProgressChecked(selectedAppointmentId);
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
                // Mở chi tiết ngay sau khi tạo để bắt đầu làm
                if (createCtx) {
                    await openDetails(createCtx.schedule, createCtx.apptId);
                }
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
                                {null}
                                {detailProgress && (
                                    <>
                                        {(() => {
                                            const status = detailProgress?.currentStatus || '';
                                            const maintenanceStartedOrBeyond = ['in_progress', 'paused', 'completed', 'delayed'].includes(status);
                                            const quoteApproved = detailProgress?.quote?.quoteStatus === 'approved'
                                                || (typeof detailProgress?.appointmentId === 'object' && detailProgress?.appointmentId?.inspectionAndQuote?.quoteStatus === 'approved')
                                                || status === 'quote_provided';
                                            const canStart = !maintenanceStartedOrBeyond && !!quoteApproved;
                                            return (
                                                <Button onClick={startMaintenance} disabled={!canStart}>Bắt đầu bảo dưỡng</Button>
                                            );
                                        })()}
                                        <Button danger onClick={() => { completeForm.resetFields(); setCompleteOpen(true); }} disabled={detailProgress?.currentStatus !== 'in_progress'}>Hoàn thành</Button>
                                    </>
                                )}
                                {/* Cancel booking button - show for all appointments that can be cancelled */}
                                {detailSelectedAppointmentId && (() => {
                                    const currentAppt = (detailSchedule && Array.isArray(detailSchedule.assignedAppointments))
                                        ? (detailSchedule.assignedAppointments.find(a => a._id === detailSelectedAppointmentId) || detailSchedule.assignedAppointments[0])
                                        : undefined;
                                    const apptStatus = currentAppt?.status || '';
                                    // Allow cancellation for most statuses except completed and cancelled
                                    const canCancel = !['completed', 'cancelled'].includes(apptStatus);
                                    return canCancel ? (
                                        <Button
                                            danger
                                            onClick={() => openCancelBooking(detailSelectedAppointmentId)}
                                        >
                                            Hủy lịch hẹn
                                        </Button>
                                    ) : null;
                                })()}
                            </Space>
                        </div>
                        {/* Chọn booking nếu có nhiều */}
                        {detailSchedule && Array.isArray(detailSchedule.assignedAppointments) && detailSchedule.assignedAppointments.some((a) => a.status !== 'cancelled') && (
                            <div className="bg-gray-50 p-3 rounded border">
                                <div className="mb-2 text-sm text-gray-600">Chọn booking theo giờ hẹn</div>
                                <Radio.Group
                                    value={detailSelectedAppointmentId || undefined}
                                    onChange={(e) => onChangeDetailAppointment(e.target.value)}
                                >
                                    <Space direction="vertical">
                                        {detailSchedule.assignedAppointments.filter((a) => a.status !== 'cancelled').map((a) => (
                                            <Radio key={a._id} value={a._id}>
                                                {(a.appointmentTime?.startTime || '')}{a.appointmentTime?.endTime ? ` - ${a.appointmentTime.endTime}` : ''}
                                                {a.status ? ` • ${a.status}` : ''}
                                            </Radio>
                                        ))}
                                    </Space>
                                </Radio.Group>
                            </div>
                        )}
                        {detailSchedule && Array.isArray(detailSchedule.assignedAppointments) && detailSchedule.assignedAppointments.some((a) => a.status !== 'cancelled') && (
                            <div className="bg-gray-50 p-3 rounded border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Giờ hẹn</p>
                                        <p className="font-medium">
                                            {(() => {
                                                const current = detailSchedule.assignedAppointments.find(a => a._id === detailSelectedAppointmentId && a.status !== 'cancelled')
                                                    || detailSchedule.assignedAppointments.find(a => a.status !== 'cancelled');
                                                return `${current?.appointmentTime?.startTime || ''}${current?.appointmentTime?.endTime ? ` - ${current.appointmentTime.endTime}` : ''}`;
                                            })()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Quote status</p>
                                        <p className="font-medium">{(() => {
                                            const current = detailSchedule.assignedAppointments.find(a => a._id === detailSelectedAppointmentId && a.status !== 'cancelled')
                                                || detailSchedule.assignedAppointments.find(a => a.status !== 'cancelled');
                                            return current?.inspectionAndQuote?.quoteStatus || 'pending';
                                        })()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Payment</p>
                                        <p className="font-medium">{(() => {
                                            const current = detailSchedule.assignedAppointments.find(a => a._id === detailSelectedAppointmentId && a.status !== 'cancelled')
                                                || detailSchedule.assignedAppointments.find(a => a.status !== 'cancelled');
                                            return current?.payment?.status || '—';
                                        })()}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-gray-500">Mô tả</p>
                                        <p className="font-medium break-words">{(() => {
                                            const current = detailSchedule.assignedAppointments.find(a => a._id === detailSelectedAppointmentId && a.status !== 'cancelled')
                                                || detailSchedule.assignedAppointments.find(a => a.status !== 'cancelled');
                                            return current?.serviceDetails?.description || '—';
                                        })()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Xác nhận</p>
                                        <p className="font-medium">{(() => {
                                            const current = detailSchedule.assignedAppointments.find(a => a._id === detailSelectedAppointmentId && a.status !== 'cancelled')
                                                || detailSchedule.assignedAppointments.find(a => a.status !== 'cancelled');
                                            return current?.confirmation?.isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận';
                                        })()}</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                        const items = (schedulesByDate[key] || []).map((it) => ({
                            ...it,
                            assignedAppointments: Array.isArray(it.assignedAppointments)
                                ? it.assignedAppointments.filter((a) => a.status !== 'cancelled')
                                : it.assignedAppointments,
                        }));
                        if (!items.length) return <Alert type="info" message="Không có lịch trong ngày này" showIcon />;
                        return (
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {items.map((item) => {
                                    const apptId = item.appointmentId || (item.assignedAppointments?.[0]?._id as string | undefined);
                                    const hasBooking = !!apptId;
                                    return (
                                        <Card key={item._id} size="small">
                                            <Space split={<Divider type="vertical" />} wrap>
                                                <Tag color={statusColor(item.status) as TagProps['color']}>{item.status}</Tag>
                                                <Text>{`${item.shiftStart} - ${item.shiftEnd}`}</Text>
                                                {item.centerId?.name && (
                                                    <Text type="secondary">{item.centerId.name}</Text>
                                                )}
                                                {Array.isArray(item.assignedAppointments) && item.assignedAppointments.length > 0 && (
                                                    <>
                                                        <Tag color="blue">Có booking</Tag>

                                                    </>
                                                )}
                                            </Space>
                                            <div className="mt-2 flex gap-2 flex-col">
                                                {Array.isArray(item.assignedAppointments) && item.assignedAppointments.length > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <Text type="secondary">Chọn giờ:</Text>
                                                        <Radio.Group
                                                            value={dayModalSelectedAppt[item._id] || (item.assignedAppointments?.[0]?._id as string | undefined)}
                                                            onChange={(e) => setDayModalSelectedAppt((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                                        >
                                                            <Space size={4} wrap>
                                                                {item.assignedAppointments.map((a) => (
                                                                    <Radio key={a._id} value={a._id}>
                                                                        {(a.appointmentTime?.startTime || '')}{a.appointmentTime?.endTime ? ` - ${a.appointmentTime.endTime}` : ''}
                                                                    </Radio>
                                                                ))}
                                                            </Space>
                                                        </Radio.Group>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button onClick={() => openDetails(item)}>Chi tiết</Button>
                                                    <Button
                                                        onClick={() => {
                                                            const chosen = dayModalSelectedAppt[item._id] || (item.assignedAppointments?.[0]?._id as string | undefined) || (item.appointmentId as string | undefined);
                                                            if (!chosen) { message.warning("Không có booking để báo giá"); return; }
                                                            setQuoteAppointmentId(chosen);
                                                            quoteForm.resetFields();
                                                            setQuoteOpen(true);
                                                        }}
                                                    >
                                                        Gửi Inspection & Quote
                                                    </Button>
                                                    <Tooltip title={(() => {
                                                        const chosen = dayModalSelectedAppt[item._id] || (item.assignedAppointments?.[0]?._id as string | undefined) || (item.appointmentId as string | undefined);
                                                        const hasProgress = chosen ? progressExistSet.has(chosen) : false;
                                                        const chosenAppt: { inspectionAndQuote?: { quoteStatus?: string } } | undefined = Array.isArray(item.assignedAppointments)
                                                            ? (item.assignedAppointments.find((a) => a._id === chosen) as unknown as { inspectionAndQuote?: { quoteStatus?: string } } | undefined)
                                                            : undefined;
                                                        const qs = chosenAppt?.inspectionAndQuote?.quoteStatus;
                                                        const apptStatus: string | undefined = (chosenAppt as unknown as { status?: string } | undefined)?.status;
                                                        if (!hasBooking) return "Lịch này chưa gắn booking - không thể tạo tiến trình";
                                                        if (hasProgress) return "Đã tạo tiến trình - không thể tạo thêm";
                                                        if (!(apptStatus === 'quote_approved' || String(qs || '').toLowerCase() === 'approved')) return "Cần báo giá và khách duyệt trước khi tạo tiến trình";
                                                        return undefined;
                                                    })()}>
                                                        <Button
                                                            type="primary"
                                                            disabled={(() => {
                                                                if (!hasBooking) return true;
                                                                const chosen = dayModalSelectedAppt[item._id] || (item.assignedAppointments?.[0]?._id as string | undefined) || (item.appointmentId as string | undefined);
                                                                const hasProgress = chosen ? progressExistSet.has(chosen) : false;
                                                                if (hasProgress) return true;
                                                                const chosenAppt: { inspectionAndQuote?: { quoteStatus?: string } } | undefined = Array.isArray(item.assignedAppointments)
                                                                    ? (item.assignedAppointments.find((a) => a._id === chosen) as unknown as { inspectionAndQuote?: { quoteStatus?: string } } | undefined)
                                                                    : undefined;
                                                                const qs = chosenAppt?.inspectionAndQuote?.quoteStatus;
                                                                const apptStatus: string | undefined = (chosenAppt as unknown as { status?: string } | undefined)?.status;
                                                                return !(apptStatus === 'quote_approved' || String(qs || '').toLowerCase() === 'approved');
                                                            })()}
                                                            onClick={() => {
                                                                const chosen = dayModalSelectedAppt[item._id] || (item.assignedAppointments?.[0]?._id as string | undefined) || (item.appointmentId as string | undefined);
                                                                openCreateProgress(item, chosen);
                                                            }}
                                                        >
                                                            Tạo tiến trình
                                                        </Button>
                                                    </Tooltip>
                                                </div>
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
                width={860}
                destroyOnHidden
            >
                <Form layout="vertical" form={quoteForm} size="small">
                    <Form.Item name="vehicleCondition" label="Tình trạng xe" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                        <Select
                            mode="tags"
                            placeholder="Chọn hoặc nhập tình trạng xe"
                            showSearch
                            allowClear
                            optionFilterProp="label"
                            options={[
                                { label: "Ắc quy yếu", value: "Ắc quy yếu" },
                                { label: "Đèn báo động cơ", value: "Đèn báo động cơ" },
                                { label: "Hệ thống phanh có vấn đề", value: "Hệ thống phanh có vấn đề" },
                                { label: "Pin yếu", value: "Pin yếu" },
                                { label: "Hệ thống sạc không hoạt động", value: "Hệ thống sạc không hoạt động" },
                                { label: "Lốp mòn", value: "Lốp mòn" },
                                { label: "Hệ thống điều hòa không lạnh", value: "Hệ thống điều hòa không lạnh" },
                                { label: "Đèn pha không sáng", value: "Đèn pha không sáng" },
                                { label: "Hệ thống treo có tiếng kêu", value: "Hệ thống treo có tiếng kêu" },
                                { label: "Xe không khởi động được", value: "Xe không khởi động được" },
                                { label: "Hệ thống lái có vấn đề", value: "Hệ thống lái có vấn đề" },
                                { label: "Rò rỉ dầu", value: "Rò rỉ dầu" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="diagnosisDetails" label="Chẩn đoán" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                        <Select
                            mode="tags"
                            placeholder="Chọn hoặc nhập chẩn đoán"
                            showSearch
                            allowClear
                            optionFilterProp="label"
                            options={[
                                { label: "Xe hư", value: "Xe hư" },
                                { label: "Cần bảo dưỡng định kỳ", value: "Cần bảo dưỡng định kỳ" },
                                { label: "Cần thay thế linh kiện", value: "Cần thay thế linh kiện" },
                                { label: "Cần sửa chữa", value: "Cần sửa chữa" },
                                { label: "Cần kiểm tra kỹ hơn", value: "Cần kiểm tra kỹ hơn" },
                                { label: "Xe hoạt động bình thường", value: "Xe hoạt động bình thường" },
                                { label: "Cần vệ sinh và bảo dưỡng", value: "Cần vệ sinh và bảo dưỡng" },
                                { label: "Cần hiệu chỉnh hệ thống", value: "Cần hiệu chỉnh hệ thống" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="inspectionNotes" label="Ghi chú kiểm tra" style={{ marginBottom: 8 }}>
                        <Select
                            mode="tags"
                            placeholder="Chọn hoặc nhập ghi chú"
                            allowClear
                            options={[
                                { label: "Đã kiểm tra kỹ", value: "Đã kiểm tra kỹ" },
                                { label: "Cần theo dõi thêm", value: "Cần theo dõi thêm" },
                                { label: "Khách hàng đã được thông báo", value: "Khách hàng đã được thông báo" },
                                { label: "Cần phụ tùng đặt hàng", value: "Cần phụ tùng đặt hàng" },
                                { label: "Xe cần giữ lại để kiểm tra", value: "Xe cần giữ lại để kiểm tra" },
                            ]}
                        />
                    </Form.Item>
                    {/** Removed Giá báo (VND) field as it is no longer sent */}
                    <Card size="small" className="mb-3">
                        <div className="flex items-center justify-between">
                            <Typography.Text strong>Hạng mục linh kiện</Typography.Text>
                            <Space>
                                <Typography.Text type="secondary">Danh mục:</Typography.Text>
                                <Select
                                    allowClear
                                    placeholder="Tất cả"
                                    options={categoryOptions}
                                    loading={partsLoading}
                                    value={selectedPartCategory}
                                    style={{ minWidth: 200 }}
                                    onChange={(v) => handleSelectCategory(v)}
                                />
                            </Space>
                        </div>
                        <Form.List name={["quoteDetails", "items"]}>
                            {(fields, { add, remove }) => (
                                <div className="space-y-2 mt-2 max-h-[320px] overflow-y-auto pr-1">
                                    {fields.map((field) => (
                                        <Card key={field.key} size="small">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                                <div className="md:col-span-4">
                                                    <Form.Item name={[field.name, "partId"]} label="Linh kiện" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                                                        <Select
                                                            loading={partsLoading}
                                                            showSearch
                                                            optionFilterProp="label"
                                                            placeholder="Chọn linh kiện"
                                                            options={(allParts || []).map((p) => ({ label: `${p.partName} (${p.partNumber})`, value: p._id }))}
                                                            onChange={(v) => handleSelectPartForItem(field.name, v)}
                                                        />
                                                    </Form.Item>
                                                </div>
                                                <div className="md:col-span-4">
                                                    <Form.Item name={[field.name, "name"]} label="Tên hiển thị" style={{ marginBottom: 8 }}>
                                                        <Input placeholder="Ví dụ: Dầu, Lọc dầu" />
                                                    </Form.Item>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Form.Item name={[field.name, "quantity"]} label="Số lượng" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                                                        <InputNumber min={1} className="w-full" />
                                                    </Form.Item>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Form.Item name={[field.name, "unitPrice"]} label="Đơn giá (VND)" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
                                                        <InputNumber min={0} step={1000} className="w-full" />
                                                    </Form.Item>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button size="small" type="link" danger onClick={() => remove(field.name)}>Xóa mục</Button>
                                            </div>
                                        </Card>
                                    ))}
                                    <Button size="small" type="dashed" onClick={() => add({ quantity: 1, unitPrice: 0 })}>Thêm linh kiện</Button>
                                </div>
                            )}
                        </Form.List>
                    </Card>
                    {/** Removed Công lao động UI and will not include in payload */}
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
                        <Select
                            mode="tags"
                            placeholder="Chọn hoặc nhập ghi chú"
                            allowClear
                            options={[
                                { label: "Đã hoàn thành đúng hạn", value: "Đã hoàn thành đúng hạn" },
                                { label: "Cần kiểm tra lại sau", value: "Cần kiểm tra lại sau" },
                                { label: "Khách hàng đã được thông báo", value: "Khách hàng đã được thông báo" },
                                { label: "Xe sẵn sàng giao", value: "Xe sẵn sàng giao" },
                                { label: "Cần chờ phụ tùng", value: "Cần chờ phụ tùng" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="workDone" label="Công việc đã làm" rules={[{ required: true }]}>
                        <Select
                            mode="tags"
                            placeholder="Chọn hoặc nhập công việc đã làm"
                            allowClear
                            options={[
                                { label: "Đã kiểm tra toàn bộ hệ thống", value: "Đã kiểm tra toàn bộ hệ thống" },
                                { label: "Đã thay thế linh kiện", value: "Đã thay thế linh kiện" },
                                { label: "Đã bảo dưỡng định kỳ", value: "Đã bảo dưỡng định kỳ" },
                                { label: "Đã sửa chữa hệ thống", value: "Đã sửa chữa hệ thống" },
                                { label: "Đã vệ sinh xe", value: "Đã vệ sinh xe" },
                                { label: "Đã kiểm tra và hiệu chỉnh pin", value: "Đã kiểm tra và hiệu chỉnh pin" },
                                { label: "Đã kiểm tra hệ thống sạc", value: "Đã kiểm tra hệ thống sạc" },
                                { label: "Đã kiểm tra hệ thống phanh", value: "Đã kiểm tra hệ thống phanh" },
                                { label: "Đã kiểm tra hệ thống lái", value: "Đã kiểm tra hệ thống lái" },
                                { label: "Đã thay dầu và lọc dầu", value: "Đã thay dầu và lọc dầu" },
                                { label: "Đã kiểm tra và bảo dưỡng điều hòa", value: "Đã kiểm tra và bảo dưỡng điều hòa" },
                                { label: "Đã kiểm tra lốp và áp suất", value: "Đã kiểm tra lốp và áp suất" },
                                { label: "Đã kiểm tra đèn và hệ thống điện", value: "Đã kiểm tra đèn và hệ thống điện" },
                                { label: "Đã test drive", value: "Đã test drive" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item name="recommendations" label="Khuyến nghị">
                        <Select
                            mode="tags"
                            placeholder="Chọn hoặc nhập khuyến nghị"
                            allowClear
                            options={[
                                { label: "Nên kiểm tra định kỳ sau 3 tháng", value: "Nên kiểm tra định kỳ sau 3 tháng" },
                                { label: "Nên kiểm tra định kỳ sau 6 tháng", value: "Nên kiểm tra định kỳ sau 6 tháng" },
                                { label: "Cần thay lốp trong thời gian tới", value: "Cần thay lốp trong thời gian tới" },
                                { label: "Cần thay pin trong thời gian tới", value: "Cần thay pin trong thời gian tới" },
                                { label: "Nên bảo dưỡng định kỳ", value: "Nên bảo dưỡng định kỳ" },
                                { label: "Nên vệ sinh xe thường xuyên", value: "Nên vệ sinh xe thường xuyên" },
                                { label: "Cần theo dõi hệ thống sạc", value: "Cần theo dõi hệ thống sạc" },
                                { label: "Cần kiểm tra lại sau 1 tháng", value: "Cần kiểm tra lại sau 1 tháng" },
                                { label: "Nên sử dụng phụ tùng chính hãng", value: "Nên sử dụng phụ tùng chính hãng" },
                                { label: "Xe hoạt động tốt, không cần lo lắng", value: "Xe hoạt động tốt, không cần lo lắng" },
                            ]}
                        />
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
                                                    <Select
                                                        placeholder="Chọn tên mốc"
                                                        showSearch
                                                        allowClear
                                                        optionFilterProp="label"
                                                        options={[
                                                            { label: "Kiểm tra ban đầu", value: "Kiểm tra ban đầu" },
                                                            { label: "Chẩn đoán sơ bộ", value: "Chẩn đoán sơ bộ" },
                                                            { label: "Chẩn đoán chi tiết", value: "Chẩn đoán chi tiết" },
                                                            { label: "Tháo lắp linh kiện", value: "Tháo lắp linh kiện" },
                                                            { label: "Thay thế linh kiện", value: "Thay thế linh kiện" },
                                                            { label: "Bảo dưỡng hệ thống", value: "Bảo dưỡng hệ thống" },
                                                            { label: "Kiểm tra pin", value: "Kiểm tra pin" },
                                                            { label: "Kiểm tra hệ thống sạc", value: "Kiểm tra hệ thống sạc" },
                                                            { label: "Kiểm tra hệ thống phanh", value: "Kiểm tra hệ thống phanh" },
                                                            { label: "Kiểm tra hệ thống lái", value: "Kiểm tra hệ thống lái" },
                                                            { label: "Vệ sinh và bảo dưỡng", value: "Vệ sinh và bảo dưỡng" },
                                                            { label: "Hiệu chỉnh hệ thống", value: "Hiệu chỉnh hệ thống" },
                                                            { label: "Kiểm tra cuối cùng", value: "Kiểm tra cuối cùng" },
                                                            { label: "Hoàn tất", value: "Hoàn tất" },
                                                            { label: "Khác", value: "Khác" },
                                                        ]}
                                                    />
                                                </Form.Item>
                                                <Form.Item name={[field.name, "description"]} label="Mô tả" rules={[{ required: true }]}>
                                                    <Select
                                                        placeholder="Chọn mô tả"
                                                        showSearch
                                                        allowClear
                                                        optionFilterProp="label"
                                                        options={[
                                                            { label: "Đã hoàn thành kiểm tra", value: "Đã hoàn thành kiểm tra" },
                                                            { label: "Đã xác định vấn đề", value: "Đã xác định vấn đề" },
                                                            { label: "Đang tiến hành sửa chữa", value: "Đang tiến hành sửa chữa" },
                                                            { label: "Đã thay thế linh kiện", value: "Đã thay thế linh kiện" },
                                                            { label: "Đã bảo dưỡng xong", value: "Đã bảo dưỡng xong" },
                                                            { label: "Đã vệ sinh xong", value: "Đã vệ sinh xong" },
                                                            { label: "Đã hiệu chỉnh xong", value: "Đã hiệu chỉnh xong" },
                                                            { label: "Đang chờ phụ tùng", value: "Đang chờ phụ tùng" },
                                                            { label: "Cần kiểm tra thêm", value: "Cần kiểm tra thêm" },
                                                            { label: "Hoạt động bình thường", value: "Hoạt động bình thường" },
                                                            { label: "Cần thay thế", value: "Cần thay thế" },
                                                            { label: "Cần sửa chữa", value: "Cần sửa chữa" },
                                                            { label: "Đã hoàn tất", value: "Đã hoàn tất" },
                                                            { label: "Khác", value: "Khác" },
                                                        ]}
                                                    />
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

            {/* Cancel Booking Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        Hủy lịch hẹn
                    </div>
                }
                open={cancelOpen}
                onCancel={closeCancelBooking}
                footer={[
                    <Button key="cancel" onClick={closeCancelBooking}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        danger
                        onClick={submitCancelBooking}
                        loading={loading}
                    >
                        Xác nhận hủy
                    </Button>
                ]}
                width={500}
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-red-500 text-xl">⚠️</span>
                            <div>
                                <Text strong className="text-red-800 block">Cảnh báo</Text>
                                <Text className="text-red-700">Hành động này không thể hoàn tác. Lịch hẹn sẽ bị hủy.</Text>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Text strong className="block mb-2">
                            Lý do hủy (tùy chọn)
                        </Text>
                        <TextArea
                            rows={3}
                            placeholder="Lý do hủy lịch hẹn là gì?"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
