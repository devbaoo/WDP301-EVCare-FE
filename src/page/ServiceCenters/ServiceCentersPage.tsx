import Header from "@/components/Header/Header";
import ServiceCenterCard from "@/components/ServiceCenter/ServiceCenterCard";
import { Spin, Empty, Input, Select, Pagination } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenters } from "@/services/features/serviceCenter/serviceCenterSlice";
import { useEffect, useState } from "react";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useServiceCenterRatings } from "@/hooks/useServiceCenterRatings";

const { Option } = Select;

export default function ServiceCentersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serviceCenters, loading, error } = useAppSelector((state) => state.serviceCenter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // Use the ratings hook
  const { getEnhancedServiceCenters, loading: ratingsLoading } = useServiceCenterRatings(serviceCenters);

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
      <Header />

      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 pt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl font-bold mb-4">Tất cả trung tâm dịch vụ</h1>
            <p className="text-xl opacity-90">
              Tìm kiếm và khám phá trung tâm dịch vụ xe điện gần bạn
            </p>
          </motion.div>
        </div>
      </motion.section>

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
                placeholder="Tìm trung tâm dịch vụ..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                onClear={handleClearSearch}
                size="large"
                className="rounded-full"
              />
            </motion.div>

            {/* Filter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-4"
            >
              <Select
                value={statusFilter}
                onChange={handleStatusFilter}
                size="large"
                className="min-w-32"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="maintenance">Bảo trì</Option>
                <Option value="inactive">Tạm dừng</Option>
              </Select>
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
                  description="Không thể tải danh sách trung tâm dịch vụ"
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
                  description="Không tìm thấy trung tâm dịch vụ nào"
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
                      <ServiceCenterCard
                        serviceCenter={serviceCenter}
                        onViewDetails={handleViewDetails}
                      />
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
                        `${range[0]}-${range[1]} trong tổng ${total} trung tâm`
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
    </motion.div>
  );
}
