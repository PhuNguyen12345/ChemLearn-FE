import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });

      const authData = response.data;
      login(authData);

      switch (authData.role) {
        case 'ROLE_STUDENT':
          navigate('/student/home');
          break;
        case 'ROLE_TEACHER':
          navigate('/teacher/dashboard');
          break;
        case 'ROLE_PARENT':
          navigate('/parent/dashboard');
          break;
        case 'ROLE_ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        'Đăng nhập thất bại.';

      setError(String(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Đăng Nhập</h2>
          <p className="text-gray-500 mt-2">Đăng nhập vào ChemLearn</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-sm text-gray-500">
              Quên mật khẩu?{" "}
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Khôi phục mật khẩu
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>

        <div className="mt-2 text-center text-sm text-gray-500">
          Về trang chủ?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
}
