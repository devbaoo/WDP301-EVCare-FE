import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, message } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_CENTER, MAP_CONFIG } from '../../config/mapbox';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxPickerProps {
  onLocationSelect: (coordinates: { lat: number; lng: number }, address: string) => void;
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
  className?: string;
}

const MapboxPicker: React.FC<MapboxPickerProps> = ({
  onLocationSelect,
  initialAddress = '',
  initialCoordinates,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Kiểm tra API key
    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN' || !MAPBOX_ACCESS_TOKEN) {
      message.error('Vui lòng cấu hình Mapbox Access Token trong file .env hoặc config/mapbox.ts');
      return;
    }

    initMap();

    // Cleanup khi component unmount
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    // Clear container trước khi tạo map
    mapRef.current.innerHTML = '';

    const mapInstance = new mapboxgl.Map({
      container: mapRef.current,
      style: MAP_CONFIG.style,
      center: [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat],
      zoom: MAP_CONFIG.zoom,
      attributionControl: MAP_CONFIG.attributionControl
    });

    // Handle WebGL errors
    mapInstance.on('error', (e) => {
      console.error('Mapbox error:', e);
      message.error('Lỗi khi tải bản đồ. Vui lòng kiểm tra WebGL support.');
    });

    setMap(mapInstance);
    setIsMapLoaded(true);

    // Tạo marker ban đầu
    const initialMarker = new mapboxgl.Marker({
      draggable: true,
      color: '#3b82f6'
    })
      .setLngLat([DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat])
      .addTo(mapInstance);

    setMarker(initialMarker);

    // Lắng nghe sự kiện click trên map
    mapInstance.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Cập nhật vị trí marker
      initialMarker.setLngLat([lng, lat]);

      // Lấy địa chỉ từ tọa độ
      getAddressFromCoordinates(lat, lng);
    });

    // Lắng nghe sự kiện kéo marker
    initialMarker.on('dragend', () => {
      const lngLat = initialMarker.getLngLat();
      getAddressFromCoordinates(lngLat.lat, lngLat.lng);
    });

    // Nếu có tọa độ ban đầu, lấy địa chỉ
    if (initialCoordinates) {
      initialMarker.setLngLat([initialCoordinates.lng, initialCoordinates.lat]);
      mapInstance.setCenter([initialCoordinates.lng, initialCoordinates.lat]);
      getAddressFromCoordinates(initialCoordinates.lat, initialCoordinates.lng);
    } else {
      // Lấy vị trí hiện tại
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (map && marker) {
            map.setCenter([lng, lat]);
            marker.setLngLat([lng, lat]);
            getAddressFromCoordinates(lat, lng);
          }
        },
        (error) => {
          console.warn('Không thể lấy vị trí hiện tại:', error);
        }
      );
    }
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        setSearchQuery(address);
        onLocationSelect({ lat, lng }, address);
      } else {
        onLocationSelect({ lat, lng }, `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelect({ lat, lng }, `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
    }
  };

  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        // Cập nhật map và marker
        map.setCenter([lng, lat]);
        if (marker) {
          marker.setLngLat([lng, lat]);
        }

        // Lấy địa chỉ chi tiết
        getAddressFromCoordinates(lat, lng);
      } else {
        message.error('Không tìm thấy địa chỉ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Search error:', error);
      message.error('Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`mapbox-picker ${className}`}>
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Tìm kiếm địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            prefix={<SearchOutlined />}
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            disabled={!isMapLoaded}
          >
            Tìm kiếm
          </Button>
        </div>
        <Button
          type="default"
          icon={<EnvironmentOutlined />}
          onClick={getCurrentLocation}
          disabled={!isMapLoaded}
          className="w-full"
        >
          Vị trí hiện tại
        </Button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-64 border border-gray-300 rounded-md"
        style={{ minHeight: '256px' }}
      />

      {!isMapLoaded && (
        <div className="flex items-center justify-center h-64 border border-gray-300 rounded-md bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Đang tải bản đồ Mapbox...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxPicker;
