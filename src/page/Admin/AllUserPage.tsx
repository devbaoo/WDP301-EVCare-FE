import React, { useEffect, useMemo, useState } from "react";
import { Table, Typography, Input, Select, Space, Tag, Spin, message, Popover, Tooltip, Button, DatePicker, Pagination } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { fetchAllUsers, AppUser } from "@/services/features/admin/userService";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenters } from "@/services/features/serviceCenter/serviceCenterSlice";
import { changeRole } from "@/services/features/admin/seviceSlice";
import dayjs from "dayjs";


const { Option } = Select;

const AllUserPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { serviceCenters } = useAppSelector((state) => state.serviceCenter);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [openUserId, setOpenUserId] = useState<string | null>(null);
    const [selectedCenterByUser, setSelectedCenterByUser] = useState<Record<string, string>>({});
    const [selectedPositionByUser, setSelectedPositionByUser] = useState<Record<string, string>>({});
    const [selectedStartByUser, setSelectedStartByUser] = useState<Record<string, string>>({});
    const [selectedEndByUser, setSelectedEndByUser] = useState<Record<string, string>>({});
    const [createdSort, setCreatedSort] = useState<string>("createdAt:desc");
    const [pageSize, setPageSize] = useState(10);
    const [allRoles, setAllRoles] = useState<string[]>([]);

    const loadUsers = async (page: number = 1, limit: number = 10, search?: string, role?: string, sort?: string) => {
        try {
            setLoading(true);
            
            // Load all users first for proper sorting across all pages
            const allUsersData = await fetchAllUsers({ 
                page: 1, 
                limit: 10000, // Load a large number to get all users
                search: search || undefined, 
                role: role !== "all" ? role : undefined,
                sort: sort
            });
            
            // Load all roles separately (without any filters) to get complete role list
            if (allRoles.length === 0) {
                const allRolesData = await fetchAllUsers({ 
                    page: 1, 
                    limit: 10000,
                    search: undefined,
                    role: undefined,
                    sort: undefined
                });
                const uniqueRoles = Array.from(new Set(allRolesData.data.users.map(u => u.role).filter(Boolean)));
                setAllRoles(uniqueRoles);
            }
            
            // Sort all users if needed
            let allUsers = allUsersData.data.users;
            if (sort === 'createdAt:asc') {
                allUsers = [...allUsersData.data.users].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
            } else if (sort === 'createdAt:desc') {
                allUsers = [...allUsersData.data.users].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            }
            
            // Paginate the sorted results
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = allUsers.slice(startIndex, endIndex);
            
            setUsers(paginatedUsers);
            setPagination({
                currentPage: page,
                totalPages: Math.ceil(allUsers.length / limit),
                totalItems: allUsers.length,
                itemsPerPage: limit
            });
            setError("");
        } catch (e: any) {
            const msg = e?.message || "Không thể tải danh sách người dùng";
            setError(msg);
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(1, pageSize);
        dispatch(fetchServiceCenters({ page: 1, limit: 1000 } as any));
    }, [dispatch]);

    const roleOptions = useMemo(() => {
        return ["all", ...allRoles];
    }, [allRoles]);

    const handlePageChange = (page: number, size?: number) => {
        const newPageSize = size || pageSize;
        if (size) setPageSize(newPageSize);
        loadUsers(page, newPageSize, keyword, roleFilter, createdSort);
    };

    const handleSearch = (value: string) => {
        setKeyword(value);
        loadUsers(1, pageSize, value, roleFilter, createdSort);
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        loadUsers(1, pageSize, keyword, value, createdSort);
    };

    const handleSort = (value: string) => {
        setCreatedSort(value);
        loadUsers(1, pageSize, keyword, roleFilter, value);
    };

    const columns = [
        { title: "Họ và tên", dataIndex: "fullName", key: "fullName", render: (v: string) => v || "—" },
        { title: "Username", dataIndex: "username", key: "username", render: (v: string) => v || "—" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "SĐT", dataIndex: "phone", key: "phone", render: (v: string) => v || "—" },
        { title: "Địa chỉ", dataIndex: "address", key: "address", ellipsis: true, render: (v: string) => v || "—" },
        { title: "Xác thực", dataIndex: "isVerified", key: "isVerified", render: (v: boolean) => v ? <Tag color="green">Đã xác thực</Tag> : <Tag color="gold">Chưa</Tag> },
        { title: "Vai trò", dataIndex: "role", key: "role", render: (v: string) => <Tag>{v || "—"}</Tag> },
        {
            title: "Hành động",
            key: "actions",
            render: (record: AppUser) => {
                if ((record.role || '').toLowerCase() === 'admin') {
                    return;
                }
                const centerId = selectedCenterByUser[record._id];
                const position = selectedPositionByUser[record._id];
                const startDate = selectedStartByUser[record._id];
                const endDate = selectedEndByUser[record._id];
                const readyToApply = Boolean(centerId && position && startDate && endDate);
                const onApply = async () => {
                    if (!readyToApply) {
                        message.warning("Vui lòng chọn trung tâm, vị trí và thời hạn");
                        return;
                    }
                    const res: any = await dispatch(changeRole({ id: record._id, data: { userId: record._id, centerId, position, startDate, endDate } } as any));
                    if (res?.type?.endsWith('/fulfilled')) {
                        message.success("Đổi vai trò thành công");
                        setOpenUserId(null);
                        setTimeout(() => window.location.reload(), 400);
                    } else {
                        message.error(res?.payload?.message || "Đổi vai trò thất bại");
                    }
                };
                const popoverContent = (
                    <div style={{ maxWidth: 320 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <div>
                                <Typography.Text strong className="block">Trung tâm</Typography.Text>
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Chọn trung tâm"
                                    value={selectedCenterByUser[record._id]}
                                    onChange={(val) => setSelectedCenterByUser((prev) => ({ ...prev, [record._id]: val }))}
                                    options={(serviceCenters || []).map((c: any) => ({ label: c.name, value: c._id }))}
                                    optionFilterProp="label"
                                    style={{ width: '100%', marginTop: 4 }}
                                />
                            </div>
                            <div>
                                <Typography.Text strong className="block">Vị trí</Typography.Text>
                                <Select
                                    allowClear
                                    placeholder="Chọn vị trí"
                                    value={selectedPositionByUser[record._id]}
                                    onChange={(val) => setSelectedPositionByUser((prev) => ({ ...prev, [record._id]: val }))}
                                    options={[
                                        { label: 'staff', value: 'staff' },
                                        { label: 'technician', value: 'technician' },
                                    ]}
                                    style={{ width: '100%', marginTop: 4 }}
                                />
                            </div>
                            <div>
                                <Typography.Text strong className="block">Thời hạn</Typography.Text>
                                <Space style={{ width: '100%', marginTop: 4 }}>
                                    <DatePicker
                                        placeholder="Bắt đầu"
                                        value={selectedStartByUser[record._id] ? dayjs(selectedStartByUser[record._id]) : undefined}
                                        disabledDate={(current) => {
                                            const end = selectedEndByUser[record._id] ? dayjs(selectedEndByUser[record._id]) : null;
                                            if (!current) return false;
                                            return end ? current.isAfter(end, 'day') : false;
                                        }}
                                        onChange={(d) => setSelectedStartByUser((prev) => ({ ...prev, [record._id]: d ? (d as any).toDate().toISOString() : '' }))}
                                        style={{ width: 140 }}
                                    />
                                    <DatePicker
                                        placeholder="Kết thúc"
                                        value={selectedEndByUser[record._id] ? dayjs(selectedEndByUser[record._id]) : undefined}
                                        disabledDate={(current) => {
                                            const start = selectedStartByUser[record._id] ? dayjs(selectedStartByUser[record._id]) : null;
                                            if (!current) return false;
                                            return start ? current.isBefore(start, 'day') : false;
                                        }}
                                        onChange={(d) => setSelectedEndByUser((prev) => ({ ...prev, [record._id]: d ? (d as any).toDate().toISOString() : '' }))}
                                        style={{ width: 140 }}
                                    />
                                </Space>
                            </div>
                            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <Button size="small" onClick={() => setOpenUserId(null)}>Hủy</Button>
                                <Button type="primary" size="small" onClick={onApply} disabled={!readyToApply}>Xác nhận</Button>
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
                                    setSelectedPositionByUser((prev) => ({ ...prev, [record._id]: record.role || 'staff' }));
                                }
                                if (!selectedStartByUser[record._id]) {
                                    setSelectedStartByUser((prev) => ({ ...prev, [record._id]: new Date().toISOString() }));
                                }
                            }
                        }}
                    >
                        <Tooltip title="Đổi vai trò">
                            <Button shape="circle" icon={<EllipsisOutlined />} />
                        </Tooltip>
                    </Popover>
                );
            }
        }
    ];

    return (
        <div className="p-6">
            <Typography.Title level={3} style={{ margin: 0 }}>Tất cả người dùng</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>Quản lý tất cả người dùng trong hệ thống.</Typography.Paragraph>
                

            <Space style={{ marginBottom: 16 }}>
                <Input 
                    placeholder="Tìm theo tên, username, email, sđt, địa chỉ" 
                    allowClear 
                    value={keyword} 
                    onChange={(e) => handleSearch(e.target.value)} 
                    style={{ width: 360 }} 
                />
                <Select value={roleFilter} onChange={handleRoleFilter} style={{ minWidth: 180 }}>
                    {roleOptions.map((r) => (
                        <Option key={r} value={r}>{r === 'all' ? 'Tất cả vai trò' : r}</Option>
                    ))}
                </Select>
                <Select value={createdSort} onChange={handleSort} style={{ minWidth: 240 }}>
                    <Option value="createdAt:desc">Ngày tạo: Mới nhất</Option>
                    <Option value="createdAt:asc">Ngày tạo: Cũ nhất</Option>
                </Select>
            </Space>

            {error ? (
                <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
                <Spin spinning={loading}>
                    <Table 
                        rowKey="_id" 
                        columns={columns as any} 
                        dataSource={users as any} 
                        pagination={false}
                    />
                    {/* Custom Pagination */}
                    {pagination.totalItems > pageSize && (
                        <div className="flex justify-end mt-4 ">
                            <Pagination
                                current={pagination.currentPage}
                                total={pagination.totalItems}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                showSizeChanger={true}
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} of ${total} users`
                                }
                                className="pagination-custom"
                            />
                        </div>
                    )}
                </Spin>
            )}
        </div>
    );
};

export default AllUserPage;
