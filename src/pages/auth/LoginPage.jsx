import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Mock API call
      const response = await fetch(`http://localhost:5000/users?email=${email}&password=${password}`);
      const users = await response.json();

      if (users.length > 0) {
        const user = users[0];
        login(user);
        
        // Redirect based on role
        switch(user.role) {
          case 'STUDENT': navigate('/student/home'); break;
          case 'TEACHER': navigate('/teacher/dashboard'); break;
          case 'PARENT': navigate('/parent/dashboard'); break;
          case 'ADMIN': navigate('/admin/dashboard'); break;
          default: navigate('/');
        }
      } else {
        setError('Email hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ.');
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
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nhapemail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Đăng Nhập
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">
          Về trang chủ?{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
}
