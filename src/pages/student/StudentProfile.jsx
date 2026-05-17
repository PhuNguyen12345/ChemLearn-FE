import React, { useState, useEffect } from 'react';
import { useStudentStore } from '../../stores/useStudentStore';
import { Sparkles, ShoppingBag, ShieldCheck, Check, User, Settings, BookOpen, Lock, Mail, Users, Save, LayoutDashboard, Award } from 'lucide-react';
import boyBasic from '../../assets/boy_student_basic.png';
import boyChemist from '../../assets/boy_chemist.png';
import girlBasic from '../../assets/girl_student_basic.png';
import girlChemist from '../../assets/girl_magic-chemist.png';
import { getStudentProfileData, updateStudentProfileData, changeStudentPassword } from '../../api/studentApi';
import { initiateAccountLink, getPendingAccountLinks } from '../../api/accountLinkApi';
import { toast } from 'sonner';

const OUTFIT_DATA = [
  { id: 'outfit-boy-basic', name: 'Standard Uniform', gender: 'boy', price: 0, icon: '👕', image: boyBasic },
  { id: 'outfit-boy-chemist', name: 'Lab Coat', gender: 'boy', price: 200, icon: '🥼', image: boyChemist },
  { id: 'outfit-girl-basic', name: 'Standard Uniform', gender: 'girl', price: 0, icon: '👗', image: girlBasic },
  { id: 'outfit-girl-chemist', name: 'Magic Chemist', gender: 'girl', price: 250, icon: '✨', image: girlChemist }
];

export default function StudentProfile() {
  const { coins, experience, level, inventory, gender, activeOutfit, setGender, equipOutfit, buyItem, profile, setProfileData } = useStudentStore();
  const [activeTab, setActiveTab] = useState('overview'); 
  const [isLoading, setIsLoading] = useState(false);
  
  const currentOutfits = OUTFIT_DATA.filter((o) => o.gender === gender);
  const activeOutfitData = OUTFIT_DATA.find((o) => o.id === activeOutfit);
  
  const handleToggleGender = () => setGender(gender === 'boy' ? 'girl' : 'boy');
  const isOwned = (id) => inventory.some((item) => item.id === id);

  const [infoForm, setInfoForm] = useState({ fullName: '', email: '', phoneNumber: '', gender: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [linkEmail, setLinkEmail] = useState('');
  const [pendingLinks, setPendingLinks] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStudentProfileData();
        setProfileData(data);
        setInfoForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || ''
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
      try {
        const links = await getPendingAccountLinks();
        setPendingLinks(links);
      } catch (error) {
        console.error("Failed to fetch pending links", error);
      }
    };
    fetchProfile();
  }, [setProfileData]);

  const handleLinkAccount = async () => {
    if (!linkEmail) return;
    try {
      setIsLoading(true);
      await initiateAccountLink(linkEmail);
      toast.success('Yêu cầu liên kết đã được gửi thành công! Vui lòng chờ phụ huynh xác nhận.');
      setLinkEmail('');
      const links = await getPendingAccountLinks();
      setPendingLinks(links);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      setIsLoading(true);
      const data = await updateStudentProfileData({
        fullName: infoForm.fullName,
        email: infoForm.email,
        phoneNumber: infoForm.phoneNumber,
        gender: infoForm.gender
      });
      setProfileData(data);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật thông tin.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passForm.newPassword !== passForm.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      setIsLoading(true);
      await changeStudentPassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      alert("Đổi mật khẩu thành công!");
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      alert("Có lỗi xảy ra khi đổi mật khẩu.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 select-none">
      {/* Header Profile Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-300/50">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">My Profile</h1>
          <p className="text-slate-500 font-bold">Manage your account, settings, and wardrobe</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-2 flex gap-2">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 rounded-[1.5rem] py-3 flex items-center justify-center gap-2 font-black transition-all ${activeTab === 'overview' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}>
          <LayoutDashboard className="w-5 h-5" /> Tổng quan
        </button>
        <button onClick={() => setActiveTab('wardrobe')} className={`flex-1 rounded-[1.5rem] py-3 flex items-center justify-center gap-2 font-black transition-all ${activeTab === 'wardrobe' ? 'bg-purple-500 text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Sparkles className="w-5 h-5" /> Trang phục
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 rounded-[1.5rem] py-3 flex items-center justify-center gap-2 font-black transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white shadow-md shadow-slate-300' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Settings className="w-5 h-5" /> Cài đặt
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full">
        {/* ===================== OVERVIEW TAB ===================== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                 <User className="w-5 h-5 text-indigo-500" /> Thông tin cá nhân
               </h2>
               <div className="flex flex-col items-center gap-4">
                 <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-indigo-50 overflow-hidden flex items-center justify-center">
                    {activeOutfitData ? <img src={activeOutfitData.image} alt="Avatar" className="w-full h-full object-cover scale-150" /> : <User className="w-10 h-10 text-indigo-300" />}
                 </div>
                 <div className="text-center">
                   <h3 className="text-xl font-black text-slate-800">{profile?.fullName || 'ChemLearn Student'}</h3>
                   <p className="text-sm font-bold text-slate-500 mb-2">{profile?.email || 'student@chemlearn.edu.vn'}</p>
                   <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                     <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">Lớp {profile?.gradeLevel || '8'}</span>
                     <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full shadow-sm uppercase tracking-wider">
                       {level >= 10 ? '🥇 Gold Alchemist' : level >= 7 ? '🥈 Silver Alchemist' : level >= 4 ? '🥉 Bronze Alchemist' : '🌱 Novice Chemist'}
                     </span>
                   </div>
                 </div>
               </div>
               <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Ngày tham gia</span>
                    <span className="text-sm font-black text-slate-700">
                      {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('vi-VN') : '01/09/2026'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Giới tính</span>
                    <span className="text-sm font-black text-slate-700">{profile?.gender === 'female' ? 'Nữ' : profile?.gender === 'male' ? 'Nam' : (gender === 'boy' ? 'Nam' : 'Nữ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Số điện thoại</span>
                    <span className="text-sm font-black text-slate-700">{profile?.phoneNumber || 'Chưa cập nhật'}</span>
                  </div>
               </div>
            </div>

            {/* Parent Info & Progress */}
            <div className="md:col-span-2 space-y-6">
               {/* Parent Info */}
               <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] p-8 text-white shadow-lg shadow-emerald-200">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-white/20 rounded-xl"><Users className="w-6 h-6" /></div>
                   <h2 className="text-xl font-black tracking-tight">Thông tin Phụ huynh</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="bg-white/10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm">
                     <p className="text-emerald-100 text-xs font-black uppercase tracking-wider mb-1">Họ và Tên</p>
                     <p className="text-lg font-black">{profile?.parentName || 'Chưa cập nhật'}</p>
                   </div>
                   <div className="bg-white/10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm">
                     <p className="text-emerald-100 text-xs font-black uppercase tracking-wider mb-1">Liên hệ</p>
                     <p className="text-lg font-black flex items-center gap-2"><Mail className="w-4 h-4"/> {profile?.parentContact || 'Chưa cập nhật'}</p>
                   </div>
                 </div>
               </div>

               {/* Enrolled Classes */}
               <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                 <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
                   <BookOpen className="w-5 h-5 text-sky-500" /> Các lớp học đang tham gia
                 </h2>
                 <div className="space-y-4">
                    {profile?.enrolledClasses && profile.enrolledClasses.length > 0 ? (
                      profile.enrolledClasses.map((enrolledClass, index) => (
                        <div key={enrolledClass.classId} className={`flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border-2 transition-colors ${index % 2 === 0 ? 'border-sky-100 bg-sky-50/50 hover:bg-sky-50' : 'border-purple-100 bg-purple-50/50 hover:bg-purple-50'}`}>
                          <div className={`w-14 h-14 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shrink-0 ${index % 2 === 0 ? 'bg-sky-500 shadow-sky-200' : 'bg-purple-500 shadow-purple-200'}`}>
                            {enrolledClass.className.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-lg font-black text-slate-800">{enrolledClass.className}</h3>
                            <p className="text-sm font-bold text-slate-500">Giáo viên: {enrolledClass.teacherName}</p>
                          </div>
                          <div className="w-full sm:w-32">
                            <div className={`flex justify-between text-xs font-black mb-1 ${index % 2 === 0 ? 'text-sky-600' : 'text-purple-600'}`}>
                               <span>Tiến độ</span>
                               <span>{enrolledClass.progress}%</span>
                            </div>
                            <div className={`h-2.5 w-full rounded-full overflow-hidden ${index % 2 === 0 ? 'bg-sky-200' : 'bg-purple-200'}`}>
                               <div className={`h-full rounded-full ${index % 2 === 0 ? 'bg-sky-500' : 'bg-purple-500'}`} style={{width: `${enrolledClass.progress}%`}}></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 py-4 font-bold">Chưa tham gia lớp học nào.</div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* ===================== WARDROBE TAB ===================== */}
        {activeTab === 'wardrobe' && (
          <div className="flex flex-col lg:flex-row gap-6 w-full h-full text-slate-800">
            {/* LEFT PANEL: Avatar & Mastery */}
            <div className="w-full lg:w-1/3 flex flex-col items-center p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-xl relative overflow-hidden shrink-0 border-b-8 border-purple-800">
              {/* Glow Effects */}
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-pink-400 opacity-30 rounded-full blur-3xl pointer-events-none"></div>

              {/* Gender Toggle */}
              <div className="z-10 bg-white/20 backdrop-blur-md rounded-full px-1 py-1 flex items-center justify-center gap-1 shadow-inner border border-white/30 mb-4">
                <button 
                  onClick={handleToggleGender}
                  className={`px-4 py-1.5 rounded-full text-sm font-black transition-all ${gender === 'boy' ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-white hover:bg-white/10'}`}
                >
                  Boy
                </button>
                <button 
                  onClick={handleToggleGender}
                  className={`px-4 py-1.5 rounded-full text-sm font-black transition-all ${gender === 'girl' ? 'bg-white text-pink-600 shadow-md scale-105' : 'text-white hover:bg-white/10'}`}
                >
                  Girl
                </button>
              </div>
              
              {/* Avatar Display */}
              <div className="flex-1 w-full flex items-center justify-center relative mt-4">
                <div className="relative w-64 h-80 z-20 flex items-center justify-center hover:scale-[1.02] transition-transform duration-500">
                  {activeOutfitData ? (
                    <img 
                      src={activeOutfitData.image} 
                      alt="Avatar" 
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] z-20"
                    />
                  ) : (
                     <div className="text-white">Select an outfit!</div>
                  )}
                </div>
                {/* Pedestal */}
                <div className="absolute bottom-6 w-56 h-12 bg-white/20 rounded-[100%] blur-[2px] border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.4)] z-10"></div>
                <div className="absolute bottom-3 w-40 h-8 bg-black/20 rounded-[100%] blur-md z-0"></div>
              </div>

              {/* Level / Mastery */}
              <div className="w-full mt-6 z-10">
                <div className="bg-white/20 backdrop-blur-md p-5 rounded-3xl border border-white/30 shadow-lg text-center">
                   <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      <h3 className="text-white font-black uppercase tracking-widest text-sm drop-shadow-sm">Mastery Level</h3>
                   </div>
                   
                   <div className="h-3.5 w-full bg-black/20 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full relative overflow-hidden" style={{ width: `${(experience % 1000) / 10}%` }}>
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full" />
                      </div>
                   </div>
                   <p className="text-white/80 font-bold text-xs mt-2">Level {level} — {level >= 4 ? 'Alchemist' : 'Chemist'}</p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Shop & Inventory */}
            <div className="flex-1 flex flex-col gap-6 w-full">
               {/* Top Header: Coins */}
               <div className="flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-slate-100 shrink-0">
                  <div>
                    <h1 className="text-2xl font-black text-slate-800">Wardrobe Shop</h1>
                    <p className="text-slate-500 text-sm font-semibold">Customize your scientific style!</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-indigo-50 px-5 py-3 rounded-2xl border-2 border-indigo-100 shadow-inner">
                     <div className="bg-indigo-500 p-2 rounded-xl shadow-md shadow-indigo-300/50">
                        <span className="text-xl leading-none">⚛️</span>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Atomic Coins</p>
                       <p className="text-2xl font-black text-indigo-900 leading-none">{coins}</p>
                     </div>
                  </div>
               </div>

               {/* Shop Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto">
                  {currentOutfits.map((outfit) => {
                     const owned = isOwned(outfit.id);
                     const isActive = activeOutfit === outfit.id;

                     return (
                        <div 
                           key={outfit.id} 
                           className={`flex items-center gap-4 p-4 rounded-3xl border-2 shadow-sm transition-all bg-white
                             ${isActive ? 'border-amber-400 bg-amber-50/30' : 'border-slate-100 hover:border-slate-300 hover:-translate-y-1'}`}
                        >
                           <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0 ${isActive ? 'bg-amber-100' : 'bg-slate-100'}`}>
                              {outfit.icon}
                           </div>
                           <div className="flex-1 h-full flex flex-col justify-between py-1 min-w-0">
                              <div className="w-full">
                                 <h3 className="font-black text-slate-800 truncate">{outfit.name}</h3>
                                 {!owned ? (
                                    <p className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                                       ⚛️ {outfit.price} Atoms
                                    </p>
                                 ) : (
                                    <p className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                                       <ShieldCheck className="w-4 h-4" /> Owned
                                    </p>
                                 )}
                              </div>

                              <div className="mt-2 text-right">
                                 {isActive ? (
                                    <button disabled className="bg-amber-400 text-white font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 opacity-80 cursor-default">
                                       <Check className="w-4 h-4" /> Equipped
                                    </button>
                                 ) : owned ? (
                                    <button 
                                       onClick={() => equipOutfit(outfit.id)}
                                       className="bg-slate-800 hover:bg-slate-700 text-white font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                                    >
                                       Equip
                                    </button>
                                 ) : (
                                    <button 
                                       onClick={() => buyItem({ id: outfit.id, type: 'outfit', name: outfit.name, price: outfit.price })}
                                       className="bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-300/50 text-white font-black px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 transition-colors group"
                                    >
                                       <ShoppingBag className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Buy
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>
          </div>
        )}

        {/* ===================== SETTINGS TAB ===================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Update Info Form */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
                 <User className="w-5 h-5 text-indigo-500" /> Cập nhật Thông tin
               </h2>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Họ và Tên</label>
                    <input 
                      type="text" 
                      value={infoForm.name}
                      onChange={(e) => setInfoForm({...infoForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Email</label>
                    <input 
                      type="email" 
                      value={infoForm.email}
                      onChange={(e) => setInfoForm({...infoForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={infoForm.phoneNumber}
                      onChange={(e) => setInfoForm({...infoForm, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Giới tính</label>
                    <select 
                      value={infoForm.gender}
                      onChange={(e) => setInfoForm({...infoForm, gender: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-slate-700 transition-all"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <button onClick={handleUpdateInfo} disabled={isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black py-3 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-colors">
                       <Save className="w-5 h-5" /> {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
               </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
                 <Lock className="w-5 h-5 text-red-500" /> Đổi Mật Khẩu
               </h2>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passForm.confirm}
                      onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div className="pt-2">
                    <button onClick={handleChangePassword} disabled={isLoading} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-black py-3 rounded-xl shadow-md shadow-red-200 flex items-center justify-center gap-2 transition-colors">
                       <Lock className="w-5 h-5" /> {isLoading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                    </button>
                  </div>
               </div>
            </div>

            {/* Account Linking Form */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 md:col-span-2">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">
                 <Users className="w-5 h-5 text-emerald-500" /> Liên kết Tài khoản Phụ huynh
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <p className="text-sm font-bold text-slate-500 mb-4">Gửi yêu cầu liên kết đến email của phụ huynh để họ có thể theo dõi tiến độ học tập của bạn.</p>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Email Phụ huynh</label>
                     <div className="flex gap-2">
                       <input 
                         type="email" 
                         placeholder="parent@example.com"
                         value={linkEmail}
                         onChange={(e) => setLinkEmail(e.target.value)}
                         className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none font-bold text-slate-700 transition-all"
                       />
                       <button onClick={handleLinkAccount} disabled={isLoading || !linkEmail} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black px-6 py-3 rounded-xl shadow-md shadow-emerald-200 transition-colors whitespace-nowrap">
                         Gửi Yêu Cầu
                       </button>
                     </div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Yêu cầu đang chờ xác nhận</h3>
                   {pendingLinks.length > 0 ? (
                     <div className="space-y-3">
                       {pendingLinks.map(link => (
                         <div key={link.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="text-sm font-bold text-slate-700 truncate mr-2">{link.targetEmail}</div>
                           <span className="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg whitespace-nowrap">Đang chờ</span>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm font-bold text-slate-400 bg-slate-50 p-4 rounded-xl text-center border border-slate-100 border-dashed">Không có yêu cầu nào đang chờ</p>
                   )}
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
