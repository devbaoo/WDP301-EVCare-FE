import  { useEffect, useMemo, useState } from "react";
import { Spin, Empty, Input, Select, Pagination, Button, Tag } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceTypes } from "@/services/features/admin/seviceSlice";
import { ServiceType } from "@/interfaces/service";

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
          {svc.isPopular ? (
            <Tag color="green">Popular</Tag>
          ) : null}
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

        <div className="pt-4 flex justify-end">
          <Button type="primary">Xem chi tiết</Button>
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
    </motion.div>
  );
}

