import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/services/store/store';
import { getRatingByServiceCenterId } from '@/services/features/admin/seviceSlice';
import { ServiceCenter } from '@/interfaces/serviceCenter';

interface ServiceCenterRating {
  _id: string;
  average: number;
  count: number;
}

export const useServiceCenterRatings = (serviceCenters: ServiceCenter[]) => {
  const dispatch = useAppDispatch();
  const [ratings, setRatings] = useState<Record<string, ServiceCenterRating>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRatings = async () => {
      if (serviceCenters.length === 0) return;
      
      setLoading(true);
      const ratingPromises = serviceCenters.map(async (center) => {
        try {
          const result = await dispatch(getRatingByServiceCenterId({ centerId: center._id }));
          if (result.type.endsWith('/fulfilled')) {
            return {
              _id: center._id,
              ...result.payload
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to fetch rating for center ${center._id}:`, error);
          return null;
        }
      });

      const ratingResults = await Promise.all(ratingPromises);
      const ratingsMap: Record<string, ServiceCenterRating> = {};
      
      ratingResults.forEach((rating) => {
        if (rating) {
          ratingsMap[rating._id] = rating;
        }
      });
      
      setRatings(ratingsMap);
      setLoading(false);
    };

    fetchRatings();
  }, [dispatch, serviceCenters]);

  const getRatingForCenter = (centerId: string): ServiceCenterRating | null => {
    return ratings[centerId] || null;
  };

  const getEnhancedServiceCenters = (): ServiceCenter[] => {
    return serviceCenters.map(center => {
      const rating = getRatingForCenter(center._id);
      return {
        ...center,
        rating: rating ? { average: rating.average, count: rating.count } : center.rating
      };
    });
  };

  return {
    ratings,
    loading,
    getRatingForCenter,
    getEnhancedServiceCenters
  };
};
