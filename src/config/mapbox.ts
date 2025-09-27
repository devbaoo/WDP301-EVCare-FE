// Mapbox API Configuration
// Lấy Access Token từ: https://console.mapbox.com/
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';

// Default map center (Hồ Chí Minh)
export const DEFAULT_MAP_CENTER = {
  lat: 10.7769,
  lng: 106.7009
};

// Map configuration
export const MAP_CONFIG = {
  zoom: 15,
  style: 'mapbox://styles/hungdz0/cmg2ky2cd002701qw596x3kjm', // Mapbox style
  center: DEFAULT_MAP_CENTER,
  zoomControl: true,
  attributionControl: true
};
