import React from "react";
import { useEffect, useMemo, useState } from "react";
import { fetchAllStaff, StaffUser } from "../../services/features/admin/technicianService";
import { Table, Tag, Typography, Input, Space, Select, Button, message, Popover, Tooltip, DatePicker } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../services/store/store";
import { fetchServiceCenters } from "../../services/features/serviceCenter/serviceCenterSlice";
import { changeRole } from "../../services/features/admin/seviceSlice";

const StaffPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { serviceCenters } = useAppSelector((state) => state.serviceCenter);
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedCenterByUser, setSelectedCenterByUser] = useState<Record<string, string>>({});
    const [selectedPositionByUser, setSelectedPositionByUser] = useState<Record<string, string>>({});
    const [openUserId, setOpenUserId] = useState<string | null>(null);
    const [selectedStartByUser, setSelectedStartByUser] = useState<Record<string, string>>({});
    const [selectedEndByUser, setSelectedEndByUser] = useState<Record<string, string>>({});

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchAllStaff();
                if (isMounted) setStaff(data);
            } catch (err: any) {
                if (isMounted) setError(err?.message || "Không thể tải danh sách nhân viên");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    // Load all service centers once for role change dropdowns
    useEffect(() => {
        dispatch(fetchServiceCenters({ page: 1, limit: 1000 } as any));
    }, [dispatch]);

    const roleOptions = useMemo(() => {
        const roles = Array.from(new Set(staff.filter((u) => u.role !== 'admin').map((u) => u.role))).filter(Boolean) as string[];
        return ['all', ...roles];
    }, [staff]);

    const dataSource = useMemo(() => {
        const visible = staff.filter((u) => u.role !== 'admin');
        const filteredByRole = roleFilter === 'all' ? visible : visible.filter((u) => u.role === roleFilter);
        if (!keyword) return filteredByRole;
        const key = keyword.toLowerCase();
        return filteredByRole.filter((u) =>
            (u.fullName || "").toLowerCase().includes(key) ||
            (u.username || "").toLowerCase().includes(key) ||
            (u.email || "").toLowerCase().includes(key) ||
            (u.phone || "").toLowerCase().includes(key) ||
            (u.address || "").toLowerCase().includes(key)
        );
    }, [staff, keyword, roleFilter]);

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            render: (text: string) => text || "—",
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            render: (text: string) => text || "—",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            render: (text: string) => text || "—",
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            render: (text: string) => text || "—",
        },
        {
            title: "Xác thực",
            dataIndex: "isVerified",
            key: "isVerified",
            render: (v: boolean) => v ? <Tag color="green">Đã xác thực</Tag> : <Tag color="gold">Chưa xác thực</Tag>,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (text: string) => <Tag>{text || "—"}</Tag>,
        },
        {
            title: "Hành động",
            key: "actions",
            render: (record: StaffUser) => {
                const centerId = selectedCenterByUser[record._id];
                const position = selectedPositionByUser[record._id];
                const startDate = selectedStartByUser[record._id];
                const endDate = selectedEndByUser[record._id];
                const onApply = async () => {
                    if (!centerId || !position || !startDate || !endDate) {
                        message.warning("Vui lòng chọn trung tâm, vị trí và thời hạn");
                        return;
                    }
                    const res: any = await dispatch(changeRole({ id: record._id, data: { userId: record._id, centerId, position, startDate, endDate } } as any));
                    if (res.type?.endsWith('/fulfilled')) {
                        message.success("Đổi vai trò thành công");
                        setOpenUserId(null);
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    } else {
                        const msg = res.payload?.message || "Đổi vai trò thất bại";
                        message.error(msg);
                    }
                };
                const onCancel = () => setOpenUserId(null);
                const readyToApply = Boolean(centerId && position && startDate && endDate);
                const popoverContent = (
                    <div style={{ maxWidth: 360 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <Typography.Text strong className="block">Trung tâm</Typography.Text>
                                <Typography.Text type="secondary" className="block" style={{ fontSize: 12 }}>Chọn trung tâm làm việc</Typography.Text>
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Chọn trung tâm"
                                    value={selectedCenterByUser[record._id]}
                                    onChange={(val) => setSelectedCenterByUser((prev) => ({ ...prev, [record._id]: val }))}
                                    options={(serviceCenters || []).map((c: any) => ({ label: c.name, value: c._id }))}
                                    style={{ width: '100%', marginTop: 6 }}
                                    optionFilterProp="label"
                                />
                            </div>
                            <div>
                                <Typography.Text strong className="block">Vị trí</Typography.Text>
                                <Typography.Text type="secondary" className="block" style={{ fontSize: 12 }}>Chọn vai trò trong trung tâm</Typography.Text>
                                <Select
                                    allowClear
                                    placeholder="Chọn vị trí"
                                    value={selectedPositionByUser[record._id]}
                                    onChange={(val) => setSelectedPositionByUser((prev) => ({ ...prev, [record._id]: val }))}
                                    options={[
                                        { label: 'staff', value: 'staff' },
                                        { label: 'technician', value: 'technician' },
                                    ]}
                                    style={{ width: '100%', marginTop: 6 }}
                                />
                            </div>
                            <div>
                                <Typography.Text strong className="block">Thời hạn</Typography.Text>
                                <Typography.Text type="secondary" className="block" style={{ fontSize: 12 }}>Chọn ngày bắt đầu và kết thúc</Typography.Text>
                                <Space style={{ width: '100%', marginTop: 6 }}>
                                    <DatePicker
                                        placeholder="Bắt đầu"
                                        onChange={(d) => setSelectedStartByUser((prev) => ({ ...prev, [record._id]: d ? (d as any).toDate().toISOString() : '' }))}
                                        style={{ width: 140 }}
                                    />
                                    <DatePicker
                                        placeholder="Kết thúc"
                                        onChange={(d) => setSelectedEndByUser((prev) => ({ ...prev, [record._id]: d ? (d as any).toDate().toISOString() : '' }))}
                                        style={{ width: 140 }}
                                    />
                                </Space>
                            </div>
                            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <Button size="small" onClick={onCancel}>Hủy</Button>
                                <Button type="primary" size="small" onClick={onApply} disabled={!readyToApply}>
                                    Xác nhận
                                </Button>
                            </Space>
                        </Space>
                    </div>
                );
                return (
                    <Popover
                        content={popoverContent}
                        title="Đổi vai trò"
                        trigger="click"
                        open={openUserId === record._id}
                        onOpenChange={(visible) => {
                            setOpenUserId(visible ? record._id : null);
                            if (visible) {
                                if (!selectedPositionByUser[record._id]) {
                                    setSelectedPositionByUser((prev) => ({
                                        ...prev,
                                        [record._id]: (record as any)?.role || 'staff',
                                    }));
                                }
                            }
                        }}
                    >
                        <Tooltip title="Đổi vai trò">
                            <Button shape="circle" icon={<EllipsisOutlined />} />
                        </Tooltip>
                    </Popover>
                );
            },
        },
    ];

    return (
        <div className="p-6">
            <Typography.Title level={3} style={{ margin: 0 }}>Staff Management</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>Quản lý nhân viên và quyền hạn.</Typography.Paragraph>

            <Space style={{ marginTop: 16, marginBottom: 16 }} direction="horizontal">
                <Input
                    placeholder="Tìm theo tên, username, email, số điện thoại, địa chỉ"
                    allowClear
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ width: 420 }}
                />
                <Select
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={roleOptions.map((r) => ({ label: r === 'all' ? 'Tất cả vai trò' : r, value: r }))}
                    style={{ minWidth: 160 }}
                />
            </Space>

            {error ? (
                <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
                <Table
                    rowKey="_id"
                    loading={loading}
                    columns={columns as any}
                    dataSource={dataSource as any}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            )}
        </div>
    );
};

export default StaffPage;
