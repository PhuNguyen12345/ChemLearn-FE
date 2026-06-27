import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-indigo-950 border-t-2 border-indigo-800/60 py-4 px-4 md:px-6 shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">

        {/* Brand */}
        <div className="flex items-center gap-2 text-indigo-300 font-bold">
          <div className="p-1 bg-indigo-700 rounded-lg">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-200" />
          </div>
          <span className="text-indigo-100 font-black">ChemLearn</span>
          <span className="text-indigo-500 text-xs">· Đại học FPT © {new Date().getFullYear()}</span>
        </div>

        {/* Made with love */}
        <div className="hidden md:flex items-center gap-1.5 text-indigo-500 text-xs font-semibold">
          Dành cho <Heart className="w-3 h-3 fill-pink-500 text-pink-500 animate-pulse" /> những nhà hoá học nhí
        </div>

        {/* Links */}
        <div className="flex gap-5 text-xs font-bold text-indigo-400">
          <Link
            to="/info/privacy"
            className="hover:text-cyan-400 hover:scale-110 transition-all duration-200 underline-offset-4 hover:underline"
          >
            Chính sách bảo mật
          </Link>
          <Link
            to="/info/terms"
            className="hover:text-cyan-400 hover:scale-110 transition-all duration-200 underline-offset-4 hover:underline"
          >
            Điều khoản dịch vụ
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
