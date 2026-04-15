import React from 'react';
import { useStudentStore } from '../../stores/useStudentStore';
import { Sparkles, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import boyBasic from '../../assets/boy_student_basic.png';
import boyChemist from '../../assets/boy_chemist.png';
import girlBasic from '../../assets/girl_student_basic.png';
import girlChemist from '../../assets/girl_magic-chemist.png';

const OUTFIT_DATA = [
  {
    id: 'outfit-boy-basic',
    name: 'Standard Uniform',
    gender: 'boy',
    price: 0,
    icon: '👕',
    image: boyBasic,
  },
  {
    id: 'outfit-boy-chemist',
    name: 'Lab Coat',
    gender: 'boy',
    price: 200,
    icon: '🥼',
    image: boyChemist,
  },
  {
    id: 'outfit-girl-basic',
    name: 'Standard Uniform',
    gender: 'girl',
    price: 0,
    icon: '👗',
    image: girlBasic,
  },
  {
    id: 'outfit-girl-chemist',
    name: 'Magic Chemist',
    gender: 'girl',
    price: 250,
    icon: '✨',
    image: girlChemist,
  }
];

export default function StudentProfile() {
  const { coins, inventory, gender, activeOutfit, setGender, equipOutfit, buyItem } = useStudentStore();
  
  // Filter shop to current gender
  const currentOutfits = OUTFIT_DATA.filter((o) => o.gender === gender);
  
  // Find current active outfit to render
  const activeOutfitData = OUTFIT_DATA.find((o) => o.id === activeOutfit);
  
  const handleToggleGender = () => {
    setGender(gender === 'boy' ? 'girl' : 'boy');
  };

  const isOwned = (id) => inventory.some((item) => item.id === id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full text-slate-800 pb-10">
      
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
                <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full relative overflow-hidden" style={{ width: '65%' }}>
                   <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full" />
                </div>
             </div>
             <p className="text-white/80 font-bold text-xs mt-2">Level 7 — Apprentice</p>
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
  );
}
