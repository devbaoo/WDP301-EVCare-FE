import  { useEffect, useMemo, useState } from "react";
import { Spin, Empty, Input, Select, Pagination, Button, Tag, Modal, Form, Popconfirm } from "antd";
import { SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceTypes, createServiceType, updateServiceType, deleteServiceType } from "@/services/features/admin/seviceSlice";
import { ServiceType } from "@/interfaces/service";
import ServiceTypeForm from "@/components/Admin/ServiceTypeForm";

const { Option } = Select;

const formatCurrencyVND = (value?: number) => {
  if (typeof value !== "number") return "-";
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  } catch {
    return `${value.toLocaleString("vi-VN")} ₫`;
  }
};

export default function ServicePage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.adminService);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchServiceTypes({ page: 1, limit: 1000 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (svc: ServiceType) => {
    setEditingService(svc);
    form.setFieldsValue({
      name: svc.name,
      description: svc.description,
      category: svc.category,
      basePrice: svc.pricing?.basePrice,
      priceType: svc.pricing?.priceType || "fixed",
      currency: svc.pricing?.currency || "VND",
      isNegotiable: svc.pricing?.isNegotiable || false,
      duration: svc.serviceDetails?.duration,
      complexity: svc.serviceDetails?.complexity || "easy",
      requiredSkills: svc.serviceDetails?.requiredSkills || [],
      tools: svc.serviceDetails?.tools || [],
      requiredParts: svc.requiredParts || [],
      compatibleVehicles: svc.compatibleVehicles || [],
      steps: (svc.procedure?.steps || []).map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.description,
        estimatedTime: s.estimatedTime,
        requiredTools: (s.requiredTools || []).join(", "),
        safetyNotes: (s.safetyNotes || []).join(", "),
      })),
      minBatteryLevel: svc.requirements?.minBatteryLevel,
      maxMileage: svc.requirements?.maxMileage,
      specialConditions: svc.requirements?.specialConditions || [],
      safetyRequirements: svc.requirements?.safetyRequirements || [],
      status: svc.status,
      tags: svc.tags || [],
      priority: svc.priority || 0,
      isPopular: svc.isPopular || false,
      images: svc.images || [],
      aiData: svc.aiData ? JSON.stringify(svc.aiData, null, 2) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteServiceType(id));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let parsedAiData: Record<string, unknown> | undefined = undefined;
      if (values.aiData) {
        try { parsedAiData = JSON.parse(values.aiData); } catch { parsedAiData = undefined; }
      }
      const stepsArray = (values.steps || []).map((s: any, idx: number) => ({
        stepNumber: s.stepNumber ?? idx + 1,
        title: s.title,
        description: s.description,
        estimatedTime: s.estimatedTime,
        requiredTools: typeof s.requiredTools === "string" && s.requiredTools ? s.requiredTools.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        safetyNotes: typeof s.safetyNotes === "string" && s.safetyNotes ? s.safetyNotes.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      }));
      const data = {
        name: values.name,
        description: values.description,
        category: values.category,
        pricing: {
          basePrice: Number(values.basePrice ?? 0),
          priceType: values.priceType || "fixed",
          currency: values.currency || "VND",
          isNegotiable: !!values.isNegotiable,
        },
        serviceDetails: {
          duration: values.duration,
          complexity: values.complexity,
          requiredSkills: values.requiredSkills || [],
          tools: values.tools || [],
        },
        requiredParts: (values.requiredParts || []).map((p: any) => ({
          partName: p.partName,
          partType: p.partType,
          quantity: Number(p.quantity) || 0,
          isOptional: !!p.isOptional,
          estimatedCost: p.estimatedCost !== undefined ? Number(p.estimatedCost) : undefined,
        })),
        compatibleVehicles: (values.compatibleVehicles || []).map((v: any) => ({
          brand: v.brand,
          model: v.model,
          year: v.year,
          batteryType: v.batteryType,
        })),
        procedure: {
          steps: stepsArray,
          totalSteps: stepsArray.length,
        },
        requirements: {
          minBatteryLevel: values.minBatteryLevel,
          maxMileage: values.maxMileage,
          specialConditions: values.specialConditions || [],
          safetyRequirements: values.safetyRequirements || [],
        },
        status: values.status,
        images: (values.images || []).map((img: any) => ({ url: img.url, caption: img.caption, isPrimary: !!img.isPrimary })),
        aiData: parsedAiData,
        tags: values.tags || [],
        priority: values.priority !== undefined ? Number(values.priority) : undefined,
        isPopular: !!values.isPopular,
      } as Partial<ServiceType>;

      if (editingService) {
        await dispatch(updateServiceType({ id: editingService._id, data }));
      } else {
        await dispatch(createServiceType(data));
      }
      setIsModalOpen(false);
      setEditingService(null);
      form.resetFields();
    } catch (_) {
      // validation handled by antd
    }
  };

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (items || []).filter((svc) => {
      const categoryMatch = categoryFilter === "all" || svc.category === categoryFilter;
      const searchMatch = !term ||
        svc.name.toLowerCase().includes(term) ||
        svc.description.toLowerCase().includes(term) ||
        (svc.tags || []).some(t => t.toLowerCase().includes(term));
      return categoryMatch && searchMatch;
    });
  }, [items, searchTerm, categoryFilter]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);
  const totalFilteredItems = filteredServices.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ServiceCard = ({ svc }: { svc: ServiceType }) => (
    <div className="h-full">
      <div className="relative h-full flex flex-col group border rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between min-h-[56px]">
          <div>
            <h3 className="text-lg font-semibold line-clamp-2">{svc.name}</h3>
            <div className="text-sm text-gray-500 capitalize">{svc.category}</div>
          </div>
          <div className="flex items-center gap-2">
            {svc.isPopular ? <Tag color="green">Popular</Tag> : null}
            <Tag color={svc.status === "active" ? "blue" : "orange"}>{svc.status}</Tag>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-3 grow">
          <p className="text-gray-700 line-clamp-3 min-h-[72px]">{svc.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm min-h-[136px]">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Giá cơ bản</div>
              <div className="font-medium">{formatCurrencyVND(svc.pricing?.basePrice)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Thời lượng</div>
              <div className="font-medium">{svc.serviceDetails?.duration || 0} phút</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Độ khó</div>
              <div className="font-medium capitalize">{svc.serviceDetails?.complexity}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500">Bước quy trình</div>
              <div className="font-medium">{svc.procedure?.totalSteps || svc.procedure?.steps?.length || 0}</div>
            </div>
          </div>

          <div className="min-h-[28px]">
            {Array.isArray(svc.tags) && svc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {svc.tags.map((t) => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">#{t}</span>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 min-h-[20px]">
            {Array.isArray(svc.compatibleVehicles) && svc.compatibleVehicles.length > 0 && (
              <>
                <span className="text-gray-500">Tương thích: </span>
                {svc.compatibleVehicles.slice(0, 3).map((v) => `${v.brand} ${v.model} (${v.year})`).join(", ")}
                {svc.compatibleVehicles.length > 3 ? "..." : ""}
              </>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button icon={<EditOutlined />} onClick={() => openEditModal(svc)}>Sửa</Button>
          <Popconfirm title="Xóa dịch vụ này?" onConfirm={() => handleDelete(svc._id)} okText="Xóa" cancelText="Hủy">
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="py-8 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex-1 max-w-md"
            >
              <Input
                placeholder="Search services..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                size="large"
                className="rounded-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-4 items-center"
            >
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilter}
                size="large"
                className="min-w-40"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All categories</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="repair">Repair</Option>
                <Option value="upgrade">Upgrade</Option>
                <Option value="inspection">Inspection</Option>
                <Option value="emergency">Emergency</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreateModal}>
                Thêm dịch vụ
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-20"
              >
                <Spin size="large" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <Empty description="Unable to load services list" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </motion.div>
            ) : paginatedServices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <Empty description="No services found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {paginatedServices.map((svc, index) => (
                    <motion.div
                      key={svc._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="h-full"
                    >
                      <ServiceCard svc={svc} />
                    </motion.div>
                  ))}
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {totalFilteredItems > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pb-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                total={totalFilteredItems}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                hideOnSinglePage={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} services`}
                className="pagination-custom"
              />
            </div>
          </div>
        </motion.section>
      )}

      <Modal
        title={editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingService(null); }}
        onOk={handleSubmit}
        okText={editingService ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        confirmLoading={loading}
        destroyOnClose
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '80vh', overflow: 'hidden' }}
      >
        <ServiceTypeForm form={form} />
      </Modal>
    </motion.div>
  );
}

