import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Library, LayoutTemplate, FlaskConical, FilePenLine, BookOpen } from 'lucide-react';

const navItems = [
  { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/teacher/dashboard' },
  { name: 'Lớp học', icon: LayoutTemplate, path: '/teacher/classes' },
  { name: 'Quản lý nội dung', icon: BookOpen, path: '/teacher/content' },
  { name: 'Tạo bài kiểm tra', icon: FilePenLine, path: '/teacher/quiz-creation' },
  { name: 'Ngân hàng câu hỏi', icon: Library, path: '/teacher/questions' },
];

const Sidebar = ({ className = '' }) => {
  return (
    <aside className={`w-64 border-r bg-background flex flex-col h-full ${className}`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <FlaskConical className="w-6 h-6 text-primary mr-2" />
        <span className="text-xl font-bold tracking-tight text-primary">ChemLearn Teacher</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
