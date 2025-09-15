import React from 'react';
import { Card, Tag, Button, Image } from 'antd';
import {
  MapPin,
  Phone,
  Star,
  Navigation,
  Camera
} from 'lucide-react';
import { ServiceCenter } from '../../interfaces/serviceCenter';
import RealTimeStatus from './RealTimeStatus';

interface ServiceCenterCardSimpleProps {
  serviceCenter: ServiceCenter;
  onViewDetails?: (serviceCenter: ServiceCenter) => void;
}

const ServiceCenterCardSimple: React.FC<ServiceCenterCardSimpleProps> = ({
  serviceCenter,
  onViewDetails
}) => {
  const {
    name,
    address,
    contact,
    rating,
    operatingHours,
    status,
    images
  } = serviceCenter;


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

  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];

  return (
    <Card
      className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-xl overflow-hidden flex flex-col group"
      cover={
        <div className="relative h-48 overflow-hidden">
          {primaryImage ? (
            <Image
              alt={primaryImage.caption || name}
              src={primaryImage.url}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              preview={{
                mask: <div className="text-white">View Image</div>
              }}
              placeholder={
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-400" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Tag color={getStatusColor(status)} className="text-xs font-semibold">
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
            </div>
          </div>
        </div>
      }
      styles={{
        body: { flex: 1, display: 'flex', flexDirection: 'column' }
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-3">
          <h3
            className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            onClick={() => onViewDetails?.(serviceCenter)}
          >
            {name}
          </h3>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
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
            showNextOpening={false}
          />
          <div className="text-sm text-gray-600 ml-6">
            {formatOperatingHours()}
          </div>
        </div>

        {/* Rating Count */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xs text-gray-500">({rating.count} reviews)</span>
        </div>

        {/* Get Directions Button */}
        <div className="mt-auto">
          <Button
            type="primary"
            icon={<Navigation className="w-5 h-5 -mt-0.5" />}
            onClick={handleGetDirections}
            className="w-full h-12 rounded-full flex items-center justify-center gap-2 !bg-blue-600 hover:!bg-blue-700 !border-0"
            size="large"
          >
            Get Directions
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCenterCardSimple;
