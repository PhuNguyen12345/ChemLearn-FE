import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import {
  FlaskConical,
  ArrowRight,
  BookOpen,
  MonitorPlay,
  TrendingUp,
  ArrowRightCircle,
  Globe,
  Hexagon,
  Beaker,
  Atom,
  MousePointer2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import virtualLabDemo from '../assets/virtual_lab_demo.gif';

const featureStyles = `
@keyframes bubble-rise {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
}
@keyframes bar-grow {
  from { height: 20%; }
  to { height: var(--target-height); }
}
@keyframes atom-h2-move {
  0% { transform: translate(-220px, 15px) scale(0.8); opacity: 0; }
  10% { opacity: 1; }
  40% { transform: translate(-30px, 0) scale(1); opacity: 1; filter: brightness(1); }
  45% { transform: translate(-10px, 0) scale(1.1); opacity: 1; filter: brightness(1.5); }
  50% { transform: translate(-10px, 0) scale(1.2); opacity: 0; }
  100% { opacity: 0; transform: translate(0, 0); }
}
@keyframes atom-o2-move {
  0% { transform: translate(-220px, -15px) scale(0.8); opacity: 0; }
  10% { opacity: 1; }
  40% { transform: translate(30px, 0) scale(1); opacity: 1; filter: brightness(1); }
  45% { transform: translate(10px, 0) scale(1.1); opacity: 1; filter: brightness(1.5); }
  50% { transform: translate(10px, 0) scale(1.2); opacity: 0; }
  100% { opacity: 0; transform: translate(0, 0); }
}
@keyframes flash-glow {
  0%, 40% { opacity: 0; transform: scale(0.5); }
  45% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 60px 30px rgba(34, 211, 238, 0.6); }
  55% { opacity: 0; transform: scale(1.8); box-shadow: 0 0 100px 50px rgba(34, 211, 238, 0); }
  100% { opacity: 0; }
}
@keyframes molecule-h2o-move {
  0%, 45% { opacity: 0; transform: translateX(0) scale(0.5); filter: drop-shadow(0 0 0px rgba(168, 85, 247, 0)); }
  50% { opacity: 1; transform: translateX(0) scale(1); filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8)); }
  85% { transform: translateX(200px) scale(1); opacity: 1; filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8)); }
  95%, 100% { transform: translateX(230px) scale(0.8); opacity: 0; filter: drop-shadow(0 0 0px rgba(168, 85, 247, 0)); }
}
@keyframes cursor-click {
  0% { transform: translate(60px, 60px); }
  25% { transform: translate(5px, 5px); }
  30% { transform: translate(5px, 5px) scale(0.9); }
  35% { transform: translate(5px, 5px) scale(1); }
  50% { transform: translate(40px, 40px); opacity: 1; }
  100% { transform: translate(40px, 40px); opacity: 0; }
}
@keyframes quiz-success {
  0%, 30% { background-color: rgb(255 255 255); border-color: rgb(226 232 240); }
  35%, 80% { background-color: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
  100% { background-color: rgb(255 255 255); border-color: rgb(226 232 240); }
}
@keyframes xp-float {
  0%, 30% { opacity: 0; transform: translateY(0); pointer-events: none; }
  45% { opacity: 1; transform: translateY(-20px); pointer-events: none; }
  70% { opacity: 1; transform: translateY(-40px); pointer-events: none; }
  100% { opacity: 0; transform: translateY(-50px); pointer-events: none; }
}
@keyframes bar-grow-y {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@keyframes bar-grow-y-loop {
  0% { transform: scaleY(0); }
  15%, 85% { transform: scaleY(1); }
  100% { transform: scaleY(0); }
}
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
`;

const LandingPage = () => {

  const scatteredIcons = [
    { Icon: FlaskConical, size: 'w-48 h-48', pos: '-top-10 -left-10', rotate: 'rotate-12', delay: '0s' },
    { Icon: Beaker, size: 'w-64 h-64', pos: 'top-20 -right-20', rotate: '-rotate-12', delay: '2s' },
    { Icon: Atom, size: 'w-40 h-40', pos: 'bottom-20 left-1/4', rotate: 'rotate-45', delay: '4s' },
    { Icon: Hexagon, size: 'w-56 h-56', pos: 'top-1/2 -right-10', rotate: '-rotate-45', delay: '1s' },
    { Icon: FlaskConical, size: 'w-32 h-32', pos: 'bottom-10 right-1/3', rotate: 'rotate-[30deg]', delay: '3s' },
    { Icon: Beaker, size: 'w-24 h-24', pos: 'top-1/4 left-1/3', rotate: 'rotate-[-20deg]', delay: '5s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 font-sans text-white selection:bg-purple-500/30 overflow-x-hidden">
      <style>{featureStyles}</style>

      {/* 1. Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-indigo-950/50 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-cyan-400 rounded-2xl text-white group-hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-500/50">
              <FlaskConical className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Chem<span className="text-cyan-400">Learn</span>
            </span>
          </Link>

          {/* Desktop Links — colorful pill buttons */}
          <div className="hidden md:flex items-center space-x-2 text-sm font-bold">
            <Link to="/" className="rounded-full px-4 py-1.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200">
              Trang chủ
            </Link>
            <a href="#features" className="rounded-full px-4 py-1.5 bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
              Bài học
            </a>
            <Link to="/lab" className="rounded-full px-4 py-1.5 bg-yellow-400 text-white hover:bg-yellow-500 transition-colors shadow-sm shadow-yellow-200">
              Phòng thí nghiệm
            </Link>
            <a href="#showcase" className="rounded-full px-4 py-1.5 bg-orange-400 text-white hover:bg-orange-500 transition-colors shadow-sm shadow-orange-200">
              Bài kiểm tra
            </a>
            <Link to="/teacher/dashboard" className="rounded-full px-4 py-1.5 bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-sm shadow-purple-200">
              Giáo viên
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login" variant="ghost" className="rounded-full text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 font-bold px-6">
              Đăng nhập
            </Link>
            <Link to="/register" className="rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold px-6 shadow-md shadow-cyan-200">
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">

        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* 🪄 Magic Background Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {scatteredIcons.map(({ Icon, size, pos, rotate, delay }, idx) => (
              <Icon
                key={idx}
                className={`absolute ${size} ${pos} ${rotate} text-white/5 animate-[pulse_8s_ease-in-out_infinite]`}
                style={{ animationDelay: delay }}
                strokeWidth={1}
              />
            ))}
          </div>

          {/* Big colourful blobs */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Text Left — with floating science emojis */}
              <div className="relative max-w-2xl space-y-8">
                {/* Floating decorative science icons */}
                <div className="absolute -top-8 -left-4 text-5xl animate-bounce" style={{ animationDuration: '2.8s' }}>⚛️</div>
                <div className="absolute top-10 -right-6 text-5xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🧪</div>
                <div className="absolute -bottom-30 left-12 text-5xl animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '1s' }}>🔬</div>
                <div className="absolute bottom-8 right-0 text-5xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.2s' }}>💡</div>

                <div className="inline-block px-5 py-2 bg-purple-500/20 text-purple-200 text-sm font-black rounded-full shadow-sm border border-purple-400/30 backdrop-blur-md">
                  ✨ Tương lai của EdTech
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white">
                  Nâng Tầm Kỹ Năng <br />
                  <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    Hóa Học Của Bạn! 🧪
                  </span>
                </h1>

                <p className="text-xl text-purple-100 leading-relaxed md:max-w-lg font-medium">
                  Cuộc phiêu lưu định kỳ tối thượng. Làm chủ nguyên tử, phân tử và phản ứng thông qua các nhiệm vụ vui nhộn và phòng thí nghiệm ảo.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold shadow-lg shadow-orange-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/60 px-8 h-14 text-base group"
                  >
                    Bắt đầu ngay
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#showcase"
                    className="inline-flex items-center justify-center rounded-3xl border-2 border-purple-400/30 hover:bg-white/5 text-white px-8 h-14 text-base group shadow-sm backdrop-blur-sm font-bold"
                  >
                    <MonitorPlay className="mr-2 w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    Xem Demo
                  </a>
                </div>
              </div>

              {/* Visual Right */}
              <div className="relative mt-12 md:mt-0">
                <div className="relative w-full aspect-square max-w-lg mx-auto bg-gradient-to-tr from-cyan-100 via-blue-50 to-white rounded-[3rem] shadow-2xl shadow-cyan-200/50 p-8 border border-white/80 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                  <div className="relative z-10 animate-[bounce_4s_ease-in-out_infinite]">
                    <div className="w-48 h-48 bg-white/90 backdrop-blur shadow-xl rounded-3xl p-6 flex items-center justify-center border border-cyan-100">
                      <div className="relative">
                        <FlaskConical className="w-24 h-24 text-cyan-500" strokeWidth={1.5} />
                        <div className="absolute top-0 right-2 w-3 h-3 bg-cyan-300 rounded-full animate-[ping_2s_ease-in-out_infinite]" />
                        <div className="absolute -top-4 right-8 w-4 h-4 bg-purple-300 rounded-full animate-[ping_3s_ease-in-out_infinite] delay-300" />
                        <div className="absolute top-4 -right-2 w-2 h-2 bg-teal-300 rounded-full animate-[ping_2.5s_ease-in-out_infinite] delay-700" />
                      </div>
                    </div>
                  </div>

                  {/* Floating chemical labels — universal symbols, no translation needed */}
                  <div className="absolute top-12 left-12 w-16 h-16 bg-white shadow-lg shadow-cyan-100 rounded-2xl flex items-center justify-center animate-[pulse_5s_ease-in-out_infinite] border border-cyan-100 z-20">
                    <span className="text-2xl font-extrabold text-teal-500">H₂O</span>
                  </div>
                  <div className="absolute bottom-16 right-12 w-20 h-20 bg-white shadow-lg shadow-purple-100 rounded-full flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite] delay-1000 border border-purple-100 z-20">
                    <span className="text-xl font-extrabold text-purple-500">CO₂</span>
                  </div>
                  <div className="absolute top-16 right-10 w-12 h-12 bg-yellow-100 shadow rounded-full flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite] z-20">
                    <span className="text-lg font-extrabold text-yellow-600">O₂</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section className="py-24 bg-transparent relative z-20" id="features">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Mọi thứ bạn cần để chinh phục Hóa học 🚀
              </h2>
              <p className="text-lg text-purple-200">
                Các công cụ được thiết kế để giúp việc học trở nên hấp dẫn, trực quan và hiệu quả cho học sinh THCS.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 — Curriculum (Flipping Pages) */}
              <div className="group relative bg-sky-500/10 border border-sky-400/20 text-white rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-8 shadow-inner perspective-1000">
                  <div className="relative w-10 h-12 preserve-3d transition-transform duration-700 group-hover:rotate-y-[-30deg]">
                    {/* Spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-400 rounded-l-sm z-30 shadow-sm" />
                    {/* Pages */}
                    <div className="absolute inset-0 bg-white rounded-r-sm origin-left transition-transform duration-500 group-hover:rotate-y-[-140deg] z-20 shadow-sm" />
                    <div className="absolute inset-0 bg-sky-100 rounded-r-sm origin-left transition-transform duration-700 group-hover:rotate-y-[-110deg] z-10 shadow-sm" />
                    <div className="absolute inset-0 bg-sky-200 rounded-r-sm origin-left transition-transform duration-300 group-hover:rotate-y-[-80deg] z-0 shadow-sm" />
                    {/* Back cover */}
                    <div className="absolute inset-0 bg-sky-600 rounded-r-sm" />
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4 text-sky-300 drop-shadow-sm">Hành Trình Nhiệm Vụ Sử Thi</h3>
                <p className="leading-relaxed text-purple-100 font-medium">
                  Khám phá các cấp độ từ Kiến thức Nguyên tử Cơ bản đến Bậc thầy Giả kim. Lộ trình học tập rõ ràng.
                </p>
                {/* Decorative blob */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-colors" />
              </div>

              {/* Feature 2 — Simulations (Tipping Beaker & Bubbles) */}
              <div className="group relative bg-emerald-500/10 border border-emerald-400/20 text-white rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-8 shadow-inner relative">
                  <div className="relative z-10 transition-transform duration-500 group-hover:-rotate-[25deg] group-hover:-translate-x-1 group-hover:scale-110">
                    <Beaker className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  </div>
                  {/* Bubbles */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bottom-6 left-1/2 w-2 h-2 bg-emerald-400 rounded-full opacity-0 pointer-events-none group-hover:opacity-100"
                      style={{
                        animation: `bubble-rise ${1 + i * 0.4}s ease-in infinite`,
                        animationDelay: `${i * 0.3}s`,
                        left: `${45 + (i % 3) * 10}%`
                      }}
                    />
                  ))}
                </div>
                <h3 className="text-2xl font-black mb-4 text-emerald-300 drop-shadow-sm">Cổng Thí Nghiệm Ảo</h3>
                <p className="leading-relaxed text-purple-100 font-medium">
                  Pha trộn, đun nóng và bùng nổ! Thực hiện các thí nghiệm an toàn và thực tế ở bất cứ đâu.
                </p>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              </div>

              {/* Feature 3 — Progress (Growing Bars & Arrow) */}
              <div className="group relative bg-amber-500/10 border border-amber-400/20 text-white rounded-[2.5rem] p-10 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-8 shadow-inner relative overflow-hidden">
                  <div className="flex items-end gap-1.5 h-10 mb-1 z-10 transition-transform group-hover:scale-110">
                    <div className="w-3 bg-white/20 rounded-t-sm transition-all duration-500 group-hover:h-8 group-hover:bg-amber-300" style={{ height: '30%' }} />
                    <div className="w-3 bg-white/40 rounded-t-sm transition-all duration-700 group-hover:h-12 group-hover:bg-amber-400" style={{ height: '50%' }} />
                    <div className="w-3 bg-white/60 rounded-t-sm transition-all duration-300 group-hover:h-6 group-hover:bg-amber-200" style={{ height: '40%' }} />
                  </div>
                  <TrendingUp className="absolute top-4 right-4 w-5 h-5 text-amber-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-amber-300 drop-shadow-sm">Sưu Tầm Huy Hiệu Hiếm</h3>
                <p className="leading-relaxed text-purple-100 font-medium">
                  Thu thập các thành tựu độc đáo khi bạn chinh phục từng thử thách hóa học và nâng cấp hồ sơ của mình.
                </p>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. How It Works — Abstract Concepts Visual Section */}
        <section className="py-24 bg-indigo-950/30 relative overflow-hidden" id="how-it-works">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 max-w-2xl mx-auto">
                ChemLearn giúp bạn hiểu các khái niệm trừu tượng như thế nào 🧬
              </h2>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                Nền tảng của chúng tôi sử dụng hình ảnh sinh động, hoạt ảnh và các yếu tố tương tác để giúp các quá trình hóa học phức tạp trở nên dễ hiểu.
              </p>
            </div>

            {/* Visual Reaction Flow */}
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-white/10 relative">
              <div className="relative h-64 w-full flex items-center justify-center overflow-hidden rounded-3xl bg-indigo-950/40 border border-white/5 shadow-inner">
                {/* Stage */}
                <div className="absolute inset-0 flex items-center justify-center scale-[1.5]">
                  {/* Reactant H2 */}
                  <div className="absolute w-12 h-12 rounded-full bg-teal-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.2)] animate-[atom-h2-move_4s_ease-in-out_infinite] z-20 flex items-center justify-center text-teal-900 font-bold text-sm">H₂</div>
                  
                  {/* Reactant O2 */}
                  <div className="absolute w-16 h-16 rounded-full bg-purple-400 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.2)] animate-[atom-o2-move_4s_ease-in-out_infinite] z-20 flex items-center justify-center text-purple-900 font-bold text-sm">O₂</div>

                  {/* Flash at Collision */}
                  <div className="absolute w-20 h-20 bg-cyan-300 rounded-full blur-xl animate-[flash-glow_4s_ease-in-out_infinite] z-30 pointer-events-none" />

                  {/* Product H2O */}
                  <div className="absolute flex items-center justify-center animate-[molecule-h2o-move_4s_ease-in-out_infinite] z-20">
                    <div className="relative w-24 h-24 rounded-full bg-purple-500 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white font-bold text-lg border-2 border-purple-400/50">
                      H₂O
                      {/* Attached H atoms */}
                      <div className="absolute -top-1 -left-2 w-8 h-8 bg-teal-400 rounded-full shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.2)]" />
                      <div className="absolute -bottom-1 -left-2 w-8 h-8 bg-teal-400 rounded-full shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.2)]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Labels placed below the animated stage */}
              <div className="grid grid-cols-3 text-center mt-10 relative z-10">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-teal-400 drop-shadow-md">Chất phản ứng</span>
                  <span className="text-sm font-medium text-purple-200 mt-2 max-w-[150px]">Hydro + Oxy</span>
                </div>
                <div className="flex flex-col items-center justify-start text-cyan-400 mt-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-200 bg-cyan-950/50 px-4 py-2 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    Phản ứng
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-purple-400 drop-shadow-md">Sản phẩm</span>
                  <span className="text-sm font-medium text-purple-200 mt-2 max-w-[150px]">Nước (H₂O)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Platform Showcase */}
        <section className="py-24 bg-transparent relative z-20" id="showcase">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Các tính năng nổi trội
              </h2>
              <p className="text-lg text-purple-200">
                Trải nghiệm sự kỳ diệu từ cả hai phía của màn hình.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Card 1: Interactive Quizzes */}
              <div className="group relative bg-indigo-950/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
                <div className="mb-6 relative z-10">
                  <span className="inline-block px-4 py-1.5 bg-cyan-500/20 text-cyan-300 text-xs font-black rounded-full border border-cyan-400/30 uppercase tracking-widest">
                    Học sinh
                  </span>
                  <h3 className="text-2xl font-black mt-4 text-white">Trắc nghiệm tương tác</h3>
                  <p className="text-purple-200 mt-2 font-medium">Học tập thông qua trò chơi hóa, biến bài tập về nhà thành một cuộc phiêu lưu hoành tráng.</p>
                </div>
                
                {/* High-Fidelity Mock UI Container (Quiz) */}
                <div className="relative bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 shadow-inner h-80 overflow-hidden mt-8 z-10 font-sans">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm border border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">?</div>
                       <span className="text-slate-800 font-bold text-[11px]">Trắc nghiệm phản ứng hóa học</span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100/60 px-2 py-0.5 rounded-md">
                       <span className="text-yellow-500 text-[10px]">⭐</span>
                       <span className="text-yellow-700 font-extrabold text-[10px]">850</span>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl p-4 mb-3 text-center shadow-md relative group-hover:scale-[1.02] transition-transform duration-500">
                     <p className="text-white font-bold text-[12px] leading-snug drop-shadow-sm">
                       Yếu tố nào sau đây là chỉ số chính cho thấy một phản ứng hóa học đã xảy ra khi hai chất lỏng trong suốt được trộn với nhau và tạo thành một chất rắn màu trắng?
                     </p>
                  </div>

                  {/* Answers Grid */}
                  <div className="grid grid-cols-2 gap-2 relative">
                    {/* A */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                      <div className="w-5 h-5 shrink-0 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">A</div>
                      <span className="text-slate-600 font-semibold text-[10px] truncate">Sự thay đổi nhiệt độ...</span>
                    </div>
                    {/* B (The animated correct answer) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-sm relative animate-[quiz-success_6s_ease-in-out_infinite]">
                      <div className="w-5 h-5 shrink-0 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">B</div>
                      <span className="text-slate-600 font-semibold text-[10px] truncate">Sự hình thành...</span>
                      
                      {/* Animated Cursor */}
                      <div className="absolute top-2 right-[-10px] text-white animate-[cursor-click_6s_ease-in-out_infinite] z-30 drop-shadow-md">
                        <MousePointer2 className="w-6 h-6 fill-slate-800 text-white" strokeWidth={1.5} />
                      </div>

                      {/* Floating XP */}
                      <div className="absolute -top-5 right-2 animate-[xp-float_6s_ease-in-out_infinite] z-20">
                        <span className="text-emerald-500 font-black text-xs drop-shadow-[0_0_2px_rgba(255,255,255,1)]">+50 XP</span>
                      </div>
                    </div>
                    {/* C */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                      <div className="w-5 h-5 shrink-0 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">C</div>
                      <span className="text-slate-600 font-semibold text-[10px] truncate">Sự giải phóng khí</span>
                    </div>
                    {/* D */}
                    <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                      <div className="w-5 h-5 shrink-0 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">D</div>
                      <span className="text-slate-600 font-semibold text-[10px] truncate">Sự thay đổi màu sắc</span>
                    </div>
                  </div>

                  {/* Progress Bar corner overlay */}
                  <div className="absolute bottom-3 left-3 bg-[#9b51e0] rounded-xl p-3 w-40 shadow-xl border border-purple-400">
                    <div className="flex justify-between items-center mb-1 text-white">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-90 drop-shadow-sm">Tiến độ của bạn</span>
                    </div>
                    <div className="w-full h-1.5 bg-purple-900/40 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-yellow-400 w-[80%] rounded-full shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                    </div>
                    <div className="flex justify-between items-center text-white">
                      <span className="text-[10px] font-bold">2,450 XP</span>
                      <span className="text-[9px] opacity-80 font-bold">Lv.8 → 10</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              </div>

              {/* Card 2: Parent Dashboard */}
              <div className="group relative bg-indigo-950/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
                <div className="mb-6 relative z-10">
                  <span className="inline-block px-4 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-black rounded-full border border-purple-400/30 uppercase tracking-widest">
                    Phụ huynh
                  </span>
                  <h3 className="text-2xl font-black mt-4 text-white">Dashboard tiến độ</h3>
                  <p className="text-purple-200 mt-2 font-medium">Theo dõi thời gian học tập và các cột mốc đã đạt được theo thời gian thực một cách dễ dàng.</p>
                </div>

                {/* High-Fidelity Mock UI Container (Chart) */}
                <div className="relative bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 shadow-inner h-80 overflow-hidden mt-8 flex flex-col justify-between z-10 font-sans">
                  {/* Stats header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-slate-800 font-extrabold text-sm mb-0.5 uppercase tracking-widest opacity-80">Tổng thời gian học</h4>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-black text-4xl text-indigo-600 tracking-tight drop-shadow-sm">14.7</span>
                        <span className="text-slate-500 font-bold text-[11px] uppercase">giờ trong tuần này</span>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm">
                      <TrendingUp className="w-4 h-4" />
                      +12%
                    </div>
                  </div>

                  <p className="text-slate-500 text-[12px] font-semibold mb-2 leading-relaxed">Con bạn đã học với tiến độ trung bình <strong className="text-indigo-600 text-[13px] font-extrabold">2.1 giờ</strong> trong 7 ngày qua.</p>

                  {/* Bar Chart Area */}
                  <div className="relative h-44 w-full mt-auto flex items-end justify-between px-1 group-hover:scale-[1.02] transition-transform duration-500 pb-6">
                    {/* Grid lines (Y-axis) */}
                    <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between pointer-events-none z-0">
                      {[5, 4, 3, 2, 1].map((val, i) => (
                        <div key={i} className="flex items-center gap-3 -mt-[7px]">
                          <span className="text-[11px] font-extrabold text-slate-400 w-4 text-right flex-shrink-0">{val}</span>
                          <div className="border-t border-slate-200 border-dashed w-full h-0" />
                        </div>
                      ))}
                      {/* Zero line */}
                      <div className="flex items-center gap-3 -mt-[7px]">
                          <span className="text-[11px] font-extrabold text-slate-400 w-4 text-right flex-shrink-0">0</span>
                          <div className="border-t border-slate-300 w-full h-0" />
                      </div>
                    </div>

                    {/* Animated Bars (X-axis) */}
                    <div className="absolute inset-x-10 bottom-6 top-0 grid grid-cols-7 gap-1 z-10">
                      {[
                        { day: 'Mon', h: '30%', color: 'from-blue-400 to-indigo-500' },
                        { day: 'Tue', h: '50%', color: 'from-purple-400 to-fuchsia-500' },
                        { day: 'Wed', h: '100%', color: 'from-emerald-400 to-teal-500' },
                        { day: 'Thu', h: '70%', color: 'from-blue-400 to-indigo-500' },
                        { day: 'Fri', h: '85%', color: 'from-orange-400 to-amber-500' },
                        { day: 'Sat', h: '0%', color: 'from-slate-200 to-slate-200' },
                        { day: 'Sun', h: '15%', color: 'from-blue-400 to-indigo-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                          <div className="w-full h-[calc(100%-8px)] flex items-end justify-center rounded-t border-b border-transparent px-0.5">
                            <div 
                              className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg shadow-sm origin-bottom animate-[bar-grow-y-loop_6s_ease-in-out_infinite] hover:brightness-110 transition-all cursor-pointer`} 
                              style={{ 
                                height: item.h,
                                animationDelay: `${i * 0.05}s`,
                                transform: 'scaleY(0)',
                              }} 
                            />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-500 absolute -bottom-6 tracking-tight">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Decorative blob */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              </div>

              {/* Card 3: Virtual Lab Demo */}
              <div className="group relative bg-indigo-950/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 md:col-span-2 flex flex-col md:flex-row items-center gap-10">
                <div className="relative z-10 flex-1">
                  <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-full border border-emerald-400/30 uppercase tracking-widest">
                    Thực hành
                  </span>
                  <h3 className="text-3xl font-black mt-4 text-white">Phòng Thí Nghiệm Ảo</h3>
                  <p className="text-purple-200 mt-4 font-medium text-lg leading-relaxed">Trải nghiệm các phản ứng hóa học sinh động, an toàn tuyệt đối với công cụ mô phỏng trực quan. Tự do khám phá, pha chế hóa chất mà không lo ngại rủi ro cháy nổ ngoài đời thực!</p>
                </div>

                {/* High-Fidelity Mock UI Container (GIF) */}
                <div className="relative flex-1 bg-[#0f172a] border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden z-10 group-hover:-translate-y-2 transition-transform duration-500 w-full aspect-video">
                  {/* MacOS style window header */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800/80 backdrop-blur-sm flex items-center px-4 gap-2 z-20 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm"></div>
                  </div>
                  <div className="w-full h-full pt-8 p-1.5 bg-slate-900 flex items-center justify-center">
                    <img src={virtualLabDemo} alt="Virtual Lab Demo" className="w-full h-full object-cover rounded-2xl border border-slate-800 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                
                {/* Decorative blob */}
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="bg-slate-950/40 border-t border-white/5 pt-20 pb-8 text-white backdrop-blur-md">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
                <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">ChemLearn</span>
              </Link>
              <p className="text-purple-100 max-w-sm mb-6 leading-relaxed">
                Định nghĩa lại việc dạy và học Hóa học cho học sinh THCS thông qua công nghệ tương tác, trực quan và hấp dẫn.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer">
                  <span className="font-bold text-white">in</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer">
                  <span className="font-bold text-white text-lg">x</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-extrabold mb-6 text-lg">Nền tảng</h4>
              <ul className="space-y-4 text-sm font-medium text-purple-100">
                <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
                <li><Link to="/lab" className="hover:text-white transition-colors">Phòng thí nghiệm ảo</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Bảng giá</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dành cho trường học</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-extrabold mb-6 text-lg">Công ty</h4>
              <ul className="space-y-4 text-sm font-medium text-purple-100">
                <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-400 pt-8 flex flex-col md:flex-row items-center justify-between text-sm font-medium text-purple-100">
            <p>© 2026 ChemLearn. Bảo lưu mọi quyền.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Hỗ trợ</a>
              <a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
