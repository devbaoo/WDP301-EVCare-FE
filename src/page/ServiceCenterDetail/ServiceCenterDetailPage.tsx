import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { Button, Spin, Empty, Typography, Tag, Image, Carousel, Card, Row, Col, Space } from "antd";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchServiceCenterById } from "@/services/features/serviceCenter/serviceCenterSlice";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  Camera
} from "lucide-react";
import { isCurrentlyOpen, getNextOpeningTime } from "@/lib/timeUtils";

const { Title, Paragraph, Text } = Typography;

export default function ServiceCenterDetailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { selectedServiceCenter, loading, error } = useAppSelector((state) => state.serviceCenter);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchServiceCenterById(id));
    }
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

  const formatOperatingHours = (operatingHours: any) => {
    if (!operatingHours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      const dayHours = operatingHours[day];
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !selectedServiceCenter) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="text-center py-20">
          <Empty 
            description="Service center not found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button 
            type="primary" 
            onClick={() => navigate('/service-centers')}
            className="mt-4"
          >
            Back to List
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    name,
    description,
    address,
    contact,
    rating,
    operatingHours,
    capacity,
    services,
    paymentMethods,
    images,
    status
  } = selectedServiceCenter;

  // Check if currently open based on real-time
  const isCurrentlyOpenNow = operatingHours ? isCurrentlyOpen(operatingHours) : false;
  const nextOpeningTime = operatingHours ? getNextOpeningTime(operatingHours) : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Back Button */}
      <div className="bg-gray-50 py-4 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            icon={<ArrowLeft />} 
            onClick={() => navigate('/service-centers')}
            className="mb-0"
          >
            Back to List
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[24, 24]}>
            {/* Images */}
            <Col xs={24} lg={12}>
              <Card className="h-full">
                {images && images.length > 0 ? (
                  <Carousel autoplay>
                    {images.map((image, index) => (
                      <div key={index}>
                        <Image
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-80 object-cover rounded-lg"
                          preview={{
                            mask: <div className="text-white">View Image</div>
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-lg">
                    <Camera className="w-16 h-16 text-blue-400" />
                  </div>
                )}
              </Card>
            </Col>

            {/* Basic Info */}
            <Col xs={24} lg={12}>
              <div className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Title level={2} className="mb-2">{name}</Title>
                    <Tag color={getStatusColor(status)} className="text-sm">
                      {getStatusText(status)}
                    </Tag>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-50 rounded-full px-3 py-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-700">
                      {rating.average.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">({rating.count})</span>
                  </div>
                </div>

                <Paragraph className="text-gray-600 mb-6 flex-grow">
                  {description}
                </Paragraph>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<Calendar />}
                    onClick={handleBookAppointment}
                    className="w-full"
                    disabled={status !== 'active' || !isCurrentlyOpenNow}
                  >
                    Book Appointment
                  </Button>
                  
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
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

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
                        <div>{address.street}</div>
                        <div>{address.ward}, {address.district}, {address.city}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <Text strong>Phone:</Text>
                      <div className="text-gray-600">{contact.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <Text strong>Email:</Text>
                      <div className="text-gray-600">{contact.email}</div>
                    </div>
                  </div>

                  {contact.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <Text strong>Website:</Text>
                        <div>
                          <a 
                            href={contact.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {contact.website}
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
                  {formatOperatingHours(operatingHours)}
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
                  {services.map((service) => (
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
                  {paymentMethods.filter(pm => pm.isEnabled).map((method) => (
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
                  <div className="text-2xl font-bold text-blue-600">{capacity.maxConcurrentServices}</div>
                  <div className="text-gray-600">Concurrent Services</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Wrench className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{services.length}</div>
                  <div className="text-gray-600">Available Services</div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{rating.average.toFixed(1)}</div>
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
                  <Button type="primary" onClick={() => window.open(`tel:${contact.phone}`)}>
                    Call: {contact.phone}
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

      <Footer />
    </div>
  );
}
