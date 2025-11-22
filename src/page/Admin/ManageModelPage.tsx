import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Table, Modal, Form, InputNumber, Select, message, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchVehicleModels } from "@/services/features/parts/partsSlice";
import { VehicleModel } from "@/interfaces/vehicle";
import { api } from "@/services/constant/axiosInstance";
import { VEHICLE_MODELS_ENDPOINT } from "@/services/constant/apiConfig";

const { Option } = Select;

const ManageModelPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { vehicleModels, fetchVehicleModelsLoading } = useAppSelector((s) => (s as any).parts || {});

    const [searchTerm, setSearchTerm] = useState("");
    const [brandFilter, setBrandFilter] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
    const [submitting, setSubmitting] = useState(false);
    // Local copy used to reflect immediate changes after create/update/delete
    const [localModels, setLocalModels] = useState<VehicleModel[]>([]);

    const [form] = Form.useForm();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        // initial fetch into store
        dispatch(fetchVehicleModels());
        // also populate local copy from API so UI can update immediately after mutations
        (async () => {
            try {
                const res = await api.get(VEHICLE_MODELS_ENDPOINT);
                const data = res.data?.data ?? res.data;
                if (Array.isArray(data)) setLocalModels(data as VehicleModel[]);
            } catch (e) {
                // ignore - store data will be used as fallback
            }
        })();
    }, [dispatch]);

    const models: VehicleModel[] = Array.isArray(vehicleModels) ? vehicleModels : [];
    // prefer local copy when available for immediate UI updates
    const effectiveModels = localModels.length ? localModels : models;
    const totalModels = effectiveModels.length;

    const brands = useMemo(() => {
        const setB = new Set<string>();
        effectiveModels.forEach((m) => { if (m.brand) setB.add(m.brand); });
        return Array.from(setB).sort();
    }, [effectiveModels]);

    const filtered = useMemo(() => {
        const base = effectiveModels;
        let list = base;
        if (brandFilter) {
            list = list.filter((m) => m.brand === brandFilter);
        }
        if (!searchTerm) return list;
        const term = searchTerm.toLowerCase();
        return list.filter((m) =>
            (m.brand || "").toLowerCase().includes(term) ||
            (m.modelName || "").toLowerCase().includes(term)
        );
    }, [effectiveModels, brandFilter, searchTerm]);

    const handleOpenCreate = () => {
        form.resetFields();
        setEditingModel(null);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (model: VehicleModel) => {
        setEditingModel(model);
        setIsEditMode(true);
        form.setFieldsValue({
            brand: model.brand,
            modelName: model.modelName,
            yearFrom: model.yearFrom,
            yearTo: model.yearTo,
            batteryType: model.batteryType,
            batteryCapacity: model.batteryCapacity,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (model: VehicleModel) => {
        Modal.confirm({
            title: "Xóa mẫu xe?",
            content: `Bạn có chắc muốn xóa ${model.brand} ${model.modelName}?`,
            okText: "Xóa",
            okButtonProps: { danger: true },
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await api.delete(`${VEHICLE_MODELS_ENDPOINT}/${model._id}`);
                    message.success("Đã xóa mẫu xe");
                    // remove from localModels immediately
                    setLocalModels((prev) => prev.filter((m) => m._id !== model._id));
                    // Refresh store in background and reset to first page
                    dispatch(fetchVehicleModels() as any);
                    setCurrentPage(1);
                } catch (err: any) {
                    console.error(err);
                    message.error(err?.response?.data?.message || "Xóa thất bại");
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            const payload = {
                brand: values.brand,
                modelName: values.modelName,
                yearFrom: values.yearFrom,
                yearTo: values.yearTo,
                batteryType: values.batteryType,
                batteryCapacity: values.batteryCapacity,
            } as any;

            if (isEditMode && editingModel) {
                const res = await api.put(`${VEHICLE_MODELS_ENDPOINT}/${editingModel._id}`, payload);
                const updated = res.data?.data ?? res.data;
                message.success("Cập nhật mẫu xe thành công");
                setLocalModels((prev) => prev.map((m) => (m._id === (updated as any)._id ? (updated as any) : m)));
            } else {
                const res = await api.post(VEHICLE_MODELS_ENDPOINT, payload);
                const created = res.data?.data ?? res.data;
                message.success("Tạo mẫu xe thành công");
                setLocalModels((prev) => Array.isArray(prev) ? [(created as any), ...prev] : [(created as any)]);
            }

            setIsModalOpen(false);
            // Refresh store in background and reset to first page
            dispatch(fetchVehicleModels() as any);
            setCurrentPage(1);
        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.message || "Lỗi khi lưu mẫu xe");
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: "Hãng xe",
            dataIndex: "brand",
            key: "brand",
            render: (text: string) => <span className="font-medium">{text}</span>,
        },
        {
            title: "Mẫu xe",
            dataIndex: "modelName",
            key: "modelName",
        },
        {
            title: "Năm",
            key: "years",
            render: (_: any, record: VehicleModel) => (
                <span>{record.yearFrom} - {record.yearTo}</span>
            ),
        },
        {
            title: "Pin",
            key: "battery",
            render: (_: any, record: VehicleModel) => (
                <div>
                    <Tag color="blue" className="mr-2">{record.batteryType}</Tag>
                    {record.batteryCapacity ? <span>{record.batteryCapacity} kWh</span> : null}
                </div>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_: any, record: VehicleModel) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý mẫu xe</h1>
                        
                        <div className="flex items-center gap-4">
                            <p className="text-gray-600 mt-1">Tổng mẫu: <span className="font-semibold text-gray-700">{totalModels}</span></p>
                        </div>
                </div>
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Tìm kiếm theo hãng hoặc tên mẫu"
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        allowClear
                        style={{ width: 280 }}
                    />
                    <Select
                        allowClear
                        placeholder="Lọc theo hãng"
                        value={brandFilter || undefined}
                        onChange={(val) => { setBrandFilter(val || null); setCurrentPage(1); }}
                        style={{ width: 180 }}
                    >
                        <Select.Option value="" key="all">Tất cả</Select.Option>
                        {brands.map((b) => (
                            <Select.Option value={b} key={b}>{b}</Select.Option>
                        ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                        Thêm mẫu
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filtered}
                rowKey={(r: VehicleModel) => r._id}
                loading={fetchVehicleModelsLoading}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: filtered.length,
                    onChange: (page, pSize) => { setCurrentPage(page); setPageSize(pSize || pageSize); }
                }}
            />

            <Modal
                title={isEditMode ? "Chỉnh sửa mẫu xe" : "Thêm mẫu xe"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ batteryType: 'Li-ion' }}>
                    <Form.Item name="brand" label="Hãng" rules={[{ required: true, message: 'Nhập hãng' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="modelName" label="Tên mẫu" rules={[{ required: true, message: 'Nhập tên mẫu' }]}>
                        <Input />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="yearFrom" label="Năm bắt đầu" rules={[{ required: true }]}>
                            <InputNumber className="w-full" min={1900} max={2100} />
                        </Form.Item>
                        <Form.Item
                            name="yearTo"
                            label="Năm kết thúc"
                            rules={[
                                { required: true, message: 'Nhập năm kết thúc' },
                                {
                                    validator: (_, value) => {
                                        if (value == null) return Promise.resolve();
                                        if (value < currentYear) return Promise.resolve();
                                        return Promise.reject(new Error(`Năm kết thúc phải nhỏ hơn năm hiện tại (${currentYear})`));
                                    }
                                }
                            ]}
                        >
                                <InputNumber className="w-full" min={1900} max={currentYear - 1} />
                            </Form.Item>
                    </div>
                    <Form.Item name="batteryType" label="Loại pin">
                        <Select>
                            <Option value="Li-ion">Li-ion</Option>
                            <Option value="Lead-acid">Lead-acid</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="batteryCapacity" label="Dung lượng pin (kWh)">
                        <InputNumber className="w-full" min={0} />
                    </Form.Item>

                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>{isEditMode ? 'Cập nhật' : 'Tạo'}</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageModelPage;
