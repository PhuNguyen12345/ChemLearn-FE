import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

// Component bảo vệ route, yêu cầu đã login và (tuỳ chọn) có role phù hợp
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    // Nếu đã đăng nhập nhưng không có quyền (không đúng role), chuyển hướng về unauthorized hoặc trang chủ
    // Ở đây ta đơn giản chuyển về / (hoặc có thể tạo 1 trang báo lỗi Unauthorized)
    return <Navigate to="/" replace />;
  }

  // Nếu thoả mãn hết điều kiện, render các con bên trong
  return <Outlet />;
};

export default ProtectedRoute;
