import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/auth/authSlice";
import serviceCenterReducer from "../features/serviceCenter/serviceCenterSlice";
import userReducer from "../features/user/userSlice";
import adminServiceReducer from "../features/admin/seviceSlice";
import bookingReducer from "../features/booking/bookingSlice";
import vehicleReducer from "../features/vehicle/vehicleSlice";
import paymentReducer from "../features/payment/paymentSlice";

const presistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "serviceCenter", "user", "booking", "vehicle", "payment"],
};

// Create a hook for using TypedUseSelectorHook
const rootReducer = combineReducers({
  auth: authReducer,
  serviceCenter: serviceCenterReducer,
  user: userReducer,
  adminService: adminServiceReducer,
  booking: bookingReducer,
  vehicle: vehicleReducer,
  payment: paymentReducer,
});

const persistedReducer = persistReducer(presistConfig, rootReducer);

// Combine all reducers
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Persist the store
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for using TypedUseSelectorHook
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
