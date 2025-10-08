
import ServiceCenterCard from "@/components/ServiceCenter/ServiceCenterCard";
import { Spin, Empty, Input, Select, Pagination, Modal, Button, message, Tooltip, Dropdown } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenters, createServiceCenter, updateServiceCenter, deleteServiceCenter } from "@/services/features/serviceCenter/serviceCenterSlice";
import { useEffect, useState } from "react";
import { SearchOutlined, FilterOutlined, PlusOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceCenter, ServiceCenterCreatePayload, ServiceCenterUpdatePayload } from "@/interfaces/serviceCenter";
import ServiceCenterForm from "@/components/Admin/ServiceCenterForm";
import { useServiceCenterRatings } from "@/hooks/useServiceCenterRatings";

const { Option } = Select;

export default function ServiceCentersPages() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serviceCenters, loading, error } = useAppSelector((state) => state.serviceCenter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // CRUD modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);

  // Use the ratings hook
  const { getEnhancedServiceCenters, loading: ratingsLoading } = useServiceCenterRatings(serviceCenters);

  const refreshCenters = () => {
    dispatch(fetchServiceCenters({ page: 1, limit: 1000 } as any));
  };

  useEffect(() => {
    // Load all service centers for local filtering and pagination
    dispatch(fetchServiceCenters({
      page: 1,
      limit: 1000 // Load a large number to get all centers
    }));
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  // Get enhanced service centers with ratings
  const enhancedServiceCenters = getEnhancedServiceCenters();

  // Filter service centers by status and search term
  const filteredServiceCenters = enhancedServiceCenters.filter(center => {
    // Filter by status
    const statusMatch = statusFilter === "all" || center.status === statusFilter;

    // Filter by search term (name and address)
    const searchMatch = !searchTerm ||
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.city.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Calculate pagination for filtered results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedServiceCenters = filteredServiceCenters.slice(startIndex, endIndex);
  const totalFilteredItems = filteredServiceCenters.length;

  const handleViewDetails = (serviceCenter: { _id: string }) => {
    navigate(`/service-centers/${serviceCenter._id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // helper removed; form handles mapping

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingCenter(null);
    setIsModalOpen(true);
  };

  const openEditModal = (center: ServiceCenter) => {
    setIsEditMode(true);
    setEditingCenter(center);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await dispatch(deleteServiceCenter(id));
      if ((res as any).meta.requestStatus === "fulfilled") {
        message.success("Đã xóa trung tâm");
        refreshCenters();
      } else {
        const errMsg = (res as any).payload?.message || "Xóa thất bại";
        message.error(errMsg);
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error("Lỗi khi xóa trung tâm. Vui lòng thử lại.");
    }
  };

  const handleMenuClick = (actionKey: string, center: ServiceCenter) => {
    if (actionKey === 'edit') {
      openEditModal(center);
      return;
    }
    if (actionKey === 'delete') {
      Modal.confirm({
        title: 'Xóa trung tâm?',
        content: `Bạn có chắc muốn xóa ${center.name}?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: () => handleDelete(center._id)
      });
    }
  };

  const cardMenuItems = () => ([
    {
      key: 'edit',
      label: (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600"><EditOutlined /></span>
          <span>Edit</span>
        </div>
      ),
    },
    {
      type: 'divider',
    } as any,
    {
      key: 'delete',
      danger: true,
      label: (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600"><DeleteOutlined /></span>
          <span className="text-red-600">Delete</span>
        </div>
      ),
    },
  ]);

  const handleFormSubmit = async (payload: ServiceCenterCreatePayload | ServiceCenterUpdatePayload) => {
    try {
      if ((payload as any)._id) {
        const res = await dispatch(updateServiceCenter(payload as ServiceCenterUpdatePayload));
        if ((res as any).meta.requestStatus === "fulfilled") {
          message.success("Cập nhật trung tâm thành công");
          setIsModalOpen(false);
          refreshCenters();
        } else {
          const errMsg = (res as any).payload?.message || "Cập nhật thất bại";
          message.error(errMsg);
        }
      } else {
        // Create mode
        const res = await dispatch(createServiceCenter(payload as ServiceCenterCreatePayload));
        if ((res as any).meta.requestStatus === "fulfilled") {
          message.success("Tạo trung tâm thành công");
          setIsModalOpen(false);
          refreshCenters();
        } else {
          const errMsg = (res as any).payload?.message || "Tạo thất bại";
          message.error(errMsg);
        }
      }
    } catch (e: any) {
      console.error('Form submit error:', e);
      message.error(e?.message || 'Lỗi khi gửi form');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      {/* Search and Filter Section */}
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
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex-1 max-w-md"
            >
              <Input
                placeholder="Search service centers..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                onClear={handleClearSearch}
                size="large"
                className="rounded-full"
              />
            </motion.div>

            {/* Filter + Create */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-4 items-center"
            >
              <Select
                value={statusFilter}
                onChange={handleStatusFilter}
                size="large"
                className="min-w-32"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All</Option>
                <Option value="active">Active</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreateModal}>
                Thêm mới
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Service Centers Grid */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {loading || ratingsLoading ? (
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
                <Empty
                  description="Unable to load service centers list"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </motion.div>
            ) : filteredServiceCenters.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <Empty
                  description="No service centers found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                >
                  {paginatedServiceCenters.map((serviceCenter, index) => (
                    <motion.div
                      key={serviceCenter._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="h-full"
                    >
                      <div className="relative h-full flex flex-col group">
                        {/* Three-dot menu (polished) */}
                        <div className="absolute top-10 right-4 z-10">
                          <Dropdown
                            trigger={["click"]}
                            menu={{
                              items: cardMenuItems() as any,
                              onClick: (info) => handleMenuClick(info.key, serviceCenter)
                            }}
                          >
                            <Tooltip title="">
                              <Button
                                type="text"
                                shape="circle"
                                size="small"
                                className="!bg-white/80 backdrop-blur border border-white/60 shadow-sm hover:shadow transition-all !p-2 hover:!bg-white"
                                icon={<EllipsisOutlined />}
                              />
                            </Tooltip>
                          </Dropdown>
                        </div>

                        <ServiceCenterCard
                          serviceCenter={serviceCenter}
                          onViewDetails={handleViewDetails}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalFilteredItems > pageSize && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex justify-center"
                  >
                    <Pagination
                      current={currentPage}
                      total={totalFilteredItems}
                      pageSize={pageSize}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} centers`
                      }
                      className="pagination-custom"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      <Modal
        title={isEditMode ? "Chỉnh sửa trung tâm" : "Thêm trung tâm"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        
      >
        <div className="w-full max-h-[80vh] overflow-y-auto overflow-x-hidden">
          <ServiceCenterForm
            mode={isEditMode ? 'edit' : 'create'}
            initialValues={isEditMode ? editingCenter || undefined : undefined}
            loading={loading}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      </Modal>
    </motion.div>
  );
}
