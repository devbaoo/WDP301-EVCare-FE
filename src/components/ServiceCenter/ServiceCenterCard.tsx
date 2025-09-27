import React from 'react';
import { Card, Tag, Button } from 'antd';
import {
  MapPin,
  Phone,
  Star,
  Wrench,
  CreditCard,
  Camera,
  Navigation
} from 'lucide-react';
import { ServiceCenter } from '../../interfaces/serviceCenter';
import RealTimeStatus from './RealTimeStatus';

interface ServiceCenterCardProps {
  serviceCenter: ServiceCenter;
  onViewDetails?: (serviceCenter: ServiceCenter) => void;
  actionsBelowStatus?: React.ReactNode;
}

const ServiceCenterCard: React.FC<ServiceCenterCardProps> = ({
  serviceCenter,
  onViewDetails,
  actionsBelowStatus
}) => {
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
    status
  } = serviceCenter;

  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];

  const formatOperatingHours = () => {
    if (!operatingHours) return 'N/A';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof operatingHours;
    const todayHours = operatingHours[today];
    if (todayHours?.isOpen) {
      return `${todayHours.open} - ${todayHours.close}`;
    }
    return 'Closed today';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'maintenance': return 'orange';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  const handleGetDirections = () => {
    const fullAddress = `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <Card
      className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden flex flex-col group"
      cover={
        <div className="relative h-52 overflow-hidden">
          {primaryImage ? (
            <img
              alt={primaryImage.caption}
              src={primaryImage.url}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Camera className="w-12 h-12 text-blue-400" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Tag color={getStatusColor(status)} className="font-semibold text-xs">
              {status === 'active' ? 'Active' :
                status === 'maintenance' ? 'Maintenance' : 'Inactive'}
            </Tag>
          </div>
          <div className="absolute top-3 left-3">
            <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold text-gray-700">
                {rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({rating.count})</span>
            </div>
          </div>
        </div>
      }
      actions={[
        <Button
          type="primary"
          icon={<Navigation className="w-5 h-5 -mt-0.5" />}
          onClick={handleGetDirections}
          className="w-full h-12 rounded-full flex items-center justify-center gap-2 !bg-blue-600 hover:!bg-blue-700 !border-0"
          size="large"
        >
          Get Directions
        </Button>
      ]}
      styles={{
        body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <h3
            className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 min-h-[3.5rem]"
            onClick={() => onViewDetails?.(serviceCenter)}
          >
            {name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {description}
          </p>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600 flex-1">
            <p className="font-medium line-clamp-1">{address.street}</p>
            <p className="line-clamp-1">{address.ward}, {address.district}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center space-x-2 mb-3">
          <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">{contact.phone}</span>
        </div>

        {/* Operating Hours */}
        <div className="mb-3">
          <RealTimeStatus
            operatingHours={operatingHours}
            className="mb-1"
            showNextOpening={true}
          />
          <div className="text-sm text-gray-600 ml-6">
            {formatOperatingHours()}
          </div>
        </div>

        {/* Actions below status */}
        {actionsBelowStatus && (
          <div className="mb-3 px-2 flex justify-end">
            {actionsBelowStatus}
          </div>
        )}

        {/* Services & Payment - Combined for better balance */}
        <div className="mt-auto space-y-3">
          {/* Services */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">Services:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {services.slice(0, 2).map((service, index) => (
                <Tag key={`service-${service._id}-${index}`} color="blue" className="text-xs">
                  {service.name}
                </Tag>
              ))}
              {services.length > 2 && (
                <Tag color="default" className="text-xs">
                  +{services.length - 2}
                </Tag>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">Payment:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {paymentMethods.filter(pm => pm.isEnabled).slice(0, 2).map((method, index) => (
                <Tag key={`payment-${method._id}-${index}`} color="green" className="text-xs">
                  {method.type === 'cash' ? 'Cash' :
                    method.type === 'card' ? 'Card' :
                      method.type === 'banking' ? 'Bank' :
                        method.type === 'ewallet' ? 'E-Wallet' : method.type}
                </Tag>
              ))}
              {paymentMethods.filter(pm => pm.isEnabled).length > 2 && (
                <Tag color="default" className="text-xs">
                  +{paymentMethods.filter(pm => pm.isEnabled).length - 2}
                </Tag>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCenterCard;
