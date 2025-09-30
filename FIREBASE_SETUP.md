# Firebase Google Authentication Setup

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google Authentication:
   - Vào Authentication > Sign-in method
   - Bật Google provider
   - Thêm domain của bạn vào Authorized domains

## Bước 2: Cấu hình Web App

1. Trong Firebase Console, chọn "Add app" > Web
2. Đặt tên app và copy config object
3. Cập nhật file `src/config/firebase.ts` với config của bạn

## Bước 3: Cài đặt Environment Variables

Tạo file `.env.local` trong thư mục root với nội dung:

```env
VITE_FIREBASE_API_KEY=AIzaSyD82mzgWEy3RFIt6dLB6PM2BtTjdI16Zlo
VITE_FIREBASE_AUTH_DOMAIN=evcare-ad417.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=evcare-ad417
VITE_FIREBASE_STORAGE_BUCKET=evcare-ad417.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=434761208517
VITE_FIREBASE_APP_ID=1:434761208517:web:a92472dd5f5b00d3f056ac
VITE_FIREBASE_MEASUREMENT_ID=G-FFJG12RDF9
```

## Bước 4: Backend API Endpoint

Đảm bảo backend có endpoint `/api/auth/google` để xử lý Google login:

```javascript
// Backend endpoint example
POST /api/auth/google
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://..."
}
```

## Bước 5: Test

1. Chạy ứng dụng: `npm run dev`
2. Vào trang login
3. Click "Sign in with Google"
4. Chọn tài khoản Google
5. Kiểm tra đăng nhập thành công

## Troubleshooting

- **Popup bị chặn**: Cho phép popup cho domain của bạn
- **CORS error**: Thêm domain vào Firebase Authorized domains
- **API endpoint không tồn tại**: Đảm bảo backend có endpoint `/api/auth/google`
