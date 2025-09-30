import { useState } from "react";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { useAppDispatch } from "@/services/store/store";
import { googleLogin } from "@/services/features/auth/authSlice";

export interface GoogleUser {
  email: string;
  name?: string;
  picture?: string;
}

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const signInWithGoogle = async (): Promise<GoogleUser | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const googleUser: GoogleUser = {
        email: user.email || "",
        name: user.displayName || "",
        picture: user.photoURL || undefined,
      };

      // Dispatch Google login action to Redux store
      await dispatch(googleLogin(googleUser)).unwrap();

      return googleUser;
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      let errorMessage = "Đăng nhập Google thất bại";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Đăng nhập bị hủy bởi người dùng";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup bị chặn, vui lòng cho phép popup";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Lỗi kết nối mạng";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Quá nhiều yêu cầu, vui lòng thử lại sau";
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error("Google sign-out error:", error);
      setError("Đăng xuất thất bại");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    signInWithGoogle,
    signOut,
    loading,
    error,
    clearError,
  };
};
