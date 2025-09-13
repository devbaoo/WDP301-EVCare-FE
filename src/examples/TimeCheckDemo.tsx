import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { Clock } from 'lucide-react';
import { isCurrentlyOpen, getNextOpeningTime, getTimeUntilNextOpening } from '@/lib/timeUtils';

const { Title, Text } = Typography;

// Mock operating hours for testing
const mockOperatingHours = {
  monday: { open: '08:00', close: '18:00', isOpen: true },
  tuesday: { open: '08:00', close: '18:00', isOpen: true },
  wednesday: { open: '08:00', close: '18:00', isOpen: true },
  thursday: { open: '08:00', close: '18:00', isOpen: true },
  friday: { open: '08:00', close: '18:00', isOpen: true },
  saturday: { open: '09:00', close: '17:00', isOpen: true },
  sunday: { open: '10:00', close: '16:00', isOpen: true }
};

const TimeCheckDemo: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpening, setNextOpening] = useState<string | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for demo

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStatus = () => {
      const currentlyOpen = isCurrentlyOpen(mockOperatingHours);
      const nextOpeningTime = getNextOpeningTime(mockOperatingHours);
      const timeUntilNextOpening = getTimeUntilNextOpening(mockOperatingHours);
      
      setIsOpen(currentlyOpen);
      setNextOpening(nextOpeningTime);
      setTimeUntilNext(timeUntilNextOpening);
    };

    checkStatus();
  }, [currentTime]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Title level={2}>Real-time Service Center Status Demo</Title>
      
      <Space direction="vertical" size="large" className="w-full">
        <Card title="Current Status" className="w-full">
          <Space direction="vertical" size="middle" className="w-full">
            <div className="flex items-center space-x-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <Text strong>Current Time: {currentTime.toLocaleTimeString()}</Text>
            </div>
            
            <div className="flex items-center space-x-4">
              <Tag color={isOpen ? 'green' : 'red'} className="text-lg px-4 py-2">
                {isOpen ? 'Open Now' : 'Closed'}
              </Tag>
            </div>
            
            {!isOpen && nextOpening && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <Text strong>Next Opening: {nextOpening}</Text>
                {timeUntilNext && (
                  <Text className="ml-4 text-gray-600">
                    (in {timeUntilNext})
                  </Text>
                )}
              </div>
            )}
          </Space>
        </Card>

        <Card title="Operating Hours" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(mockOperatingHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <Text strong className="capitalize">{day}</Text>
                <Text className={hours.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Test Different Times" className="w-full">
          <Text type="secondary">
            This demo updates every second to show real-time status checking.
            The service center is configured to be open Monday-Friday 8:00-18:00,
            Saturday 9:00-17:00, and Sunday 10:00-16:00.
          </Text>
        </Card>
      </Space>
    </div>
  );
};

export default TimeCheckDemo;
