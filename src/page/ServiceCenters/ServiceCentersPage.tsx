import Header from "@/components/Header/Header";
import ServiceCenterCard from "@/components/ServiceCenter/ServiceCenterCard";
import { Spin, Empty, Input, Select, Pagination } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenters } from "@/services/features/serviceCenter/serviceCenterSlice";
import { useEffect, useState } from "react";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function ServiceCentersPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { serviceCenters, loading, error } = useAppSelector((state) => state.serviceCenter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

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

  // Filter service centers by status and search term
  const filteredServiceCenters = serviceCenters.filter(center => {
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

  const handleViewDetails = (serviceCenter: any) => {
    navigate(`/service-centers/${serviceCenter._id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">All Service Centers</h1>
            <p className="text-xl opacity-90">
              Search and discover EV service centers near you
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
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
            </div>

            {/* Filter */}
            <div className="flex gap-4">
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
            </div>
          </div>
        </div>
      </section>

      {/* Service Centers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Empty
                description="Unable to load service centers list"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : filteredServiceCenters.length === 0 ? (
            <div className="text-center py-20">
              <Empty
                description="No service centers found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedServiceCenters.map((serviceCenter) => (
                  <div key={serviceCenter._id} className="h-full">
                    <ServiceCenterCard
                      serviceCenter={serviceCenter}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalFilteredItems > pageSize && (
                <div className="flex justify-center">
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
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
