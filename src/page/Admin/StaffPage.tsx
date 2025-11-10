import React from "react";
import { useEffect, useMemo, useState } from "react";
import { fetchAllStaff, StaffUser } from "../../services/features/admin/technicianService";
import { Table, Tag, Typography, Input, Space, Select } from "antd";


const StaffPage: React.FC = () => {
    
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    

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
        
    ];

    return (
        <div className="p-6">
            <Typography.Title level={3} style={{ margin: 0 }}>Quản lý nhân viên</Typography.Title>
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
