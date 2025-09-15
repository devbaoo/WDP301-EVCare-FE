import Header from "@/components/Header/Header";
import { Button, Spin, Empty, Typography, Tag, Image, Carousel, Card, Row, Col, Space } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenterById } from "@/services/features/serviceCenter/serviceCenterSlice";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Star,
  Wrench,
  CreditCard,
  Calendar,
  ArrowLeft,
  Navigation
} from "lucide-react";
import { isCurrentlyOpen, getNextOpeningTime } from "@/lib/timeUtils";
import type { WeeklyOperatingHours } from "@/interfaces/serviceCenter";

const { Title, Paragraph, Text } = Typography;

export default function ServiceCenterDetailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { selectedServiceCenter, loading, error } = useAppSelector((state) => state.serviceCenter);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Destructure service center data
  const {
    name,
    description,
    address,
    contact,
    rating,
    operatingHours,
    services,
    paymentMethods,
    images,
    status,
    capacity
  } = selectedServiceCenter || {};

  useEffect(() => {
    if (id) {
      dispatch(fetchServiceCenterById(id));
    }
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, id]);

  useEffect(() => {
    // Check if user wants to book appointment
    if (searchParams.get('action') === 'book') {
      setShowBookingForm(true);
    }
  }, [searchParams]);

  const handleBookAppointment = () => {
    setShowBookingForm(true);
    // Scroll to booking form
    setTimeout(() => {
      const bookingForm = document.getElementById('booking-form');
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleGetDirections = () => {
    if (!address) return;
    const fullAddress = `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const formatOperatingHours = (operatingHours: WeeklyOperatingHours) => {
    if (!operatingHours) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return days.map((day, index) => {
      const dayKey = day as keyof WeeklyOperatingHours;
      const dayHours = operatingHours[dayKey];
      return (
        <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="font-medium">{dayNames[index]}</span>
          <span className={dayHours?.isOpen ? 'text-green-600' : 'text-red-600'}>
            {dayHours?.isOpen ? `${dayHours.open} - ${dayHours.close}` : 'Closed'}
          </span>
        </div>
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'maintenance': return 'orange';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white"
      >
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center py-20"
        >
          <Spin size="large" />
        </motion.div>
      </motion.div>
    );
  }

  if (error || !selectedServiceCenter) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white"
      >
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-20"
        >
          <Empty
            description="Service center not found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              type="primary"
              onClick={() => navigate('/service-centers')}
              className="mt-4"
            >
              Back to List
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Check if currently open based on real-time
  const isCurrentlyOpenNow = operatingHours ? isCurrentlyOpen(operatingHours) : false;
  const nextOpeningTime = operatingHours ? getNextOpeningTime(operatingHours) : null;

  // Sample images for testing if no images from API
  const sampleImages = [
    {
      _id: '1',
      url: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop',
      caption: 'Service Center Exterior',
      isPrimary: true
    },
    {
      _id: '2',
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
      caption: 'Charging Station',
      isPrimary: false
    },
    {
      _id: '3',
      url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      caption: 'Workshop Area',
      isPrimary: false
    }
  ];

  // Use sample images if no images from API
  const displayImages = images && images.length > 0 ? images : sampleImages;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <Header />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-50 py-4 pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              icon={<ArrowLeft />}
              onClick={() => navigate('/service-centers')}
              className="mb-0"
            >
              Back to List
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[24, 24]}>
            {/* Images */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full shadow-lg">
                    <Carousel autoplay dots>
                      {displayImages.map((image, index) => (
                        <div key={image._id || index}>
                          <Image
                            src={image.url}
                            alt={image.caption || name}
                            className="w-full h-80 object-cover"
                            preview={{
                              mask: <div className="text-white">View Image</div>
                            }}
                          />
                        </div>
                      ))}
                    </Carousel>
                  </Card>
                </motion.div>
              </motion.div>
            </Col>

            {/* Basic Info */}
            <Col xs={24} lg={12}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="h-full flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex items-start justify-between mb-4"
                  >
                    <div>
                      <Title level={2} className="mb-2">{name}</Title>
                      <Tag color={getStatusColor(status || '')} className="text-sm">
                        {getStatusText(status || '')}
                      </Tag>
                    </div>
                    <div className="flex items-center space-x-1 bg-yellow-50 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-700">
                        {rating?.average?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-sm text-gray-500">({rating?.count || 0})</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <Paragraph className="text-gray-600 mb-6 flex-grow">
                      {description}
                    </Paragraph>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<Navigation className="w-5 h-5 -mt-0.5" />}
                        onClick={handleGetDirections}
                        className="w-full h-12 rounded-full flex items-center justify-center gap-2 !bg-blue-600 hover:!bg-blue-700 !border-0"
                        disabled={!address}
                      >
                        Get Directions
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="large"
                        icon={<Calendar />}
                        onClick={handleBookAppointment}
                        className="w-full h-12 rounded-full"
                        disabled={status !== 'active' || !isCurrentlyOpenNow}
                      >
                        Book Appointment
                      </Button>
                    </motion.div>

                    {status !== 'active' ? (
                      <Text type="secondary" className="text-center block">
                        This center is currently not accepting bookings
                      </Text>
                    ) : !isCurrentlyOpenNow ? (
                      <div className="text-center">
                        <Text type="secondary" className="block mb-1">
                          Currently closed
                        </Text>
                        {nextOpeningTime && (
                          <Text type="secondary" className="text-sm">
                            Opens {nextOpeningTime}

                          </Text>
                        )}
                      </div>
                    ) : null}
                  </motion.div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </motion.section>

      {/* Details Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[24, 24]}>
            {/* Contact & Location */}
            <Col xs={24} lg={12}>
              <Card title="Contact Information" className="h-full">
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <Text strong>Address:</Text>
                      <div className="text-gray-600">
                        <div>{address?.street || 'N/A'}</div>
                        <div>{address ? `${address.ward}, ${address.district}, ${address.city}` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <Text strong>Phone:</Text>
                      <div className="text-gray-600">{contact?.phone || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <Text strong>Email:</Text>
                      <div className="text-gray-600">{contact?.email || 'N/A'}</div>
                    </div>
                  </div>

                  {contact?.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <Text strong>Website:</Text>
                        <div>
                          <a
                            href={contact?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {contact?.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>

            {/* Operating Hours */}
            <Col xs={24} lg={12}>
              <Card title="Operating Hours" className="h-full">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div className="flex flex-col">
                      <span className={`font-medium ${isCurrentlyOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                        {isCurrentlyOpenNow ? 'Open Now' : 'Closed'}
                      </span>
                      {!isCurrentlyOpenNow && nextOpeningTime && (
                        <span className="text-sm text-gray-500">
                          Opens {nextOpeningTime}
                        </span>
                      )}
                    </div>
                  </div>
                  {operatingHours ? formatOperatingHours(operatingHours) : null}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Services & Payment */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[24, 24]}>
            {/* Services */}
            <Col xs={24} lg={12}>
              <Card title="Available Services" className="h-full">
                <div className="space-y-3">
                  {services?.map((service) => (
                    <div key={service._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Wrench className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-grow">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">Base Price: ${service.pricing.basePrice}</div>
                      </div>
                      <Tag color="blue">{service.category}</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            {/* Payment Methods */}
            <Col xs={24} lg={12}>
              <Card title="Payment Methods" className="h-full">
                <div className="space-y-3">
                  {paymentMethods?.filter(pm => pm.isEnabled).map((method) => (
                    <div key={method._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="flex-grow">
                        <div className="font-medium">
                          {method.type === 'cash' ? 'Cash' :
                            method.type === 'card' ? 'Credit/Debit Card' :
                              method.type === 'banking' ? 'Bank Transfer' :
                                method.type === 'ewallet' ? 'E-Wallet' : method.type}
                        </div>
                        <div className="text-sm text-gray-600">
                          {method.isEnabled ? 'Available' : 'Not Available'}
                        </div>
                      </div>
                      <Tag color="green">Supported</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Capacity Info */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card title="Capacity Information">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{capacity?.maxConcurrentServices || 0}</div>
                  <div className="text-gray-600">Concurrent Services</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Wrench className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{services?.length || 0}</div>
                  <div className="text-gray-600">Available Services</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{rating?.average?.toFixed(1) || '0.0'}</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </section>

      {/* Booking Form Section */}
      {showBookingForm && (
        <section id="booking-form" className="py-8 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card title="Book Appointment">
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <Title level={3}>Booking Feature</Title>
                <Paragraph className="text-gray-600 mb-6">
                  The booking feature will be developed in the next version.
                  Please contact the center directly to make an appointment.
                </Paragraph>
                <Space>
                  <Button type="primary" onClick={() => window.open(`tel:${contact?.phone}`)} disabled={!contact?.phone}>
                    Call: {contact?.phone || 'N/A'}
                  </Button>
                  <Button onClick={() => setShowBookingForm(false)}>
                    Close
                  </Button>
                </Space>
              </div>
            </Card>
          </div>
        </section>
      )}

    </motion.div>
  );
}
