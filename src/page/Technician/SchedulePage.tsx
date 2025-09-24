import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Badge, Card, Button, Space, Typography, message, Spin, Tag, Alert, Modal, Descriptions, Divider, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { fetchTechnicianSchedulesById, checkInTechnician, checkOutTechnician } from "../../services/features/technician/technicianSlice";
import type { TechnicianSchedule } from "../../interfaces/technician";

const { Title, Text } = Typography;

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { schedules, fetchSchedulesLoading, checkInLoading, checkOutLoading } = useAppSelector((s) => s.technician);
  const { user } = useAppSelector((s) => s.auth);

  dayjs.locale("vi");
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [today] = useState<Dayjs>(dayjs());
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (!user) return;
    const startDate = currentMonth.startOf("month").format("YYYY-MM-DD");
    const endDate = currentMonth.endOf("month").format("YYYY-MM-DD");
    dispatch(
      fetchTechnicianSchedulesById({
        technicianId: user.id,
        startDate,
        endDate,
      })
    );
  }, [dispatch, user, currentMonth]);

  const schedulesByDate = useMemo(() => {
    const map: Record<string, TechnicianSchedule[]> = {};
    schedules.forEach((sch) => {
      const key = dayjs(sch.workDate).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(sch);
    });
    return map;
  }, [schedules]);

  const todayKey = useMemo(() => today.format("YYYY-MM-DD"), [today]);
  const todaySchedule = schedulesByDate[todayKey]?.[0];
  const todayStatus = todaySchedule?.status;
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

  const handleCheckIn = async () => {
    try {
      if (!user) return;
      const key = today.format("YYYY-MM-DD");
      const todaySchedules = schedulesByDate[key] || [];
      const target = todaySchedules[0];
      if (!target) {
        message.warning("Hôm nay bạn không có lịch làm việc.");
        return;
      }
      if (target.status === "working") {
        message.info("Bạn đã check-in rồi.");
        return;
      }
      await dispatch(checkInTechnician(target._id)).unwrap();
      message.success("Check-in thành công");
    } catch (e) {
      message.error("Check-in thất bại");
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!user) return;
      const key = today.format("YYYY-MM-DD");
      const todaySchedules = schedulesByDate[key] || [];
      const target = todaySchedules[0];
      if (!target) {
        message.warning("Hôm nay bạn không có lịch làm việc.");
        return;
      }
      if (target.status === "completed") {
        message.info("Bạn đã check-out rồi.");
        return;
      }
      await dispatch(checkOutTechnician(target._id)).unwrap();
      message.success("Check-out thành công");
    } catch (e) {
      message.error("Check-out thất bại");
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const key = value.format("YYYY-MM-DD");
    const items = schedulesByDate[key] || [];
    if (!items.length) return null;
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item) => (
          <li key={item._id}>
            <Space size={4} align="center">
              <Badge
                status={
                  item.status === "working"
                    ? "processing"
                    : item.status === "completed"
                    ? "success"
                    : item.status === "on_leave"
                    ? "warning"
                    : item.status === "absent"
                    ? "error"
                    : "default"
                }
                text={`${item.shiftStart} - ${item.shiftEnd}`}
              />
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
    if (!items.length) return; // Do nothing for empty days
    setSelectedDay(value);
    setDayModalOpen(true);
  };

  return (
    <Card>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Space align="baseline" style={{ justifyContent: "space-between", width: "100%" }}>
          <div>
            <Title level={4} style={{ marginBottom: 0 }}>Lịch làm việc</Title>
            <Space size={8} wrap>
              <Badge status="processing" text="Đang làm" />
              <Badge status="success" text="Hoàn tất" />
              <Badge status="warning" text="Nghỉ phép" />
              <Badge status="error" text="Vắng" />
              <Badge status="default" text="Lịch" />
            </Space>
          </div>
          <Space>
            <Button onClick={() => setCurrentMonth(dayjs())}>Hôm nay</Button>
            {todayStatus === "working" ? (
              <Button danger loading={checkOutLoading} onClick={handleCheckOut}>Check out</Button>
            ) : todayStatus === "completed" ? (
              <Button disabled>Đã check out</Button>
            ) : (
              <Button type="primary" loading={checkInLoading} onClick={handleCheckIn}>Check in</Button>
            )}
          </Space>
        </Space>

        {todaySchedule ? (
          <Card size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space align="center">
                <Text strong>Hôm nay:</Text>
                <Tag color={statusColor(todayStatus) as any}>
                  {todayStatus === "working"
                    ? "Đang làm"
                    : todayStatus === "completed"
                    ? "Hoàn tất"
                    : todayStatus === "on_leave"
                    ? "Nghỉ phép"
                    : todayStatus === "absent"
                    ? "Vắng"
                    : "Đã lên lịch"}
                </Tag>
              </Space>
              <Descriptions size="small" column={3} bordered>
                <Descriptions.Item label="Ngày">
                  {today.format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ bắt đầu">
                  {todaySchedule.shiftStart}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ kết thúc">
                  {todaySchedule.shiftEnd}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        ) : (
          <Alert type="info" message="Hôm nay bạn không có lịch làm việc." showIcon />
        )}

        <Spin spinning={fetchSchedulesLoading}>
          <ConfigProvider locale={viVN}>
            <Calendar
              value={currentMonth}
              onPanelChange={onPanelChange}
              dateCellRender={dateCellRender}
              onSelect={onSelectDate}
            />
          </ConfigProvider>
        </Spin>
      </Space>

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
                {items.map((item) => (
                  <Card key={item._id} size="small">
                    <Space split={<Divider type="vertical" />} wrap>
                      <Tag color={statusColor(item.status) as any}>
                        {item.status}
                      </Tag>
                      <Text>{`${item.shiftStart} - ${item.shiftEnd}`}</Text>
                      {item.centerId?.name && (
                        <Text type="secondary">{item.centerId.name}</Text>
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>
            );
          })()
        ) : null}
      </Modal>
    </Card>
  );
};

export default SchedulePage;


