import React, { useState, useEffect } from 'react';
import { useStudentStore } from '../../stores/useStudentStore';
import { Coins, ArrowLeft, Heart, Zap } from 'lucide-react';
import islandBg from '../../assets/islandBg.png';
import detailBg from '../../assets/detailBg.png';

// Pets images
import pet1 from '../../assets/SkibidiToilem.png';
import pet2 from '../../assets/CapybaraWizard.png';
import pet3 from '../../assets/DogeWizard.png';
import pet4 from '../../assets/TungSahurWarrior.png';

const PET_DATA = [
  { id: 'skibidi', name: 'Skibidi Tolem', image: pet1, price: 10, type: 'Water' },
  { id: 'capybara', name: 'Capybara Wizard', image: pet2, price: 800, type: 'Magic' },
  { id: 'doge', name: 'Doge Wizard', image: pet3, price: 10, type: 'Light' },
  { id: 'tung', name: 'Tung Sahur Warrior', image: pet4, price: 10, type: 'Earth' },
];

const StudentIsland = ({ onBack }) => {
  const { coins, spendCoins } = useStudentStore();

  // Try to load owned pets from local storage or initialize empty
  const [ownedPets, setOwnedPets] = useState(() => {
    try {
      const saved = localStorage.getItem('chemlearn_owned_pets');
      return saved ? JSON.parse(saved) : [
        { ...PET_DATA[1], level: 1, hunger: 80 } // Give them a Capybara for free to test! (Optional but fun)
      ];
    } catch {
      return [];
    }
  });

  const [selectedPet, setSelectedPet] = useState(null);
  const [showShop, setShowShop] = useState(false);

  // Random walk positions
  const [petPositions, setPetPositions] = useState({});

  useEffect(() => {
    localStorage.setItem('chemlearn_owned_pets', JSON.stringify(ownedPets));

    // Generate initial positions
    const initialPos = {};
    ownedPets.forEach(pet => {
      initialPos[pet.id] = {
        left: 25 + Math.random() * 50, // 25% to 75%
        top: 45 + Math.random() * 30,  // 45% to 75%
        flip: Math.random() > 0.5
      };
    });
    setPetPositions(initialPos);

    // Random walk interval
    const interval = setInterval(() => {
      setPetPositions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          // moveX: mostly horizontal (5% to 20% distance)
          const moveX = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 15);
          // moveY: mostly flat (small wobble), 20% chance to move diagonally up/down
          const moveY = Math.random() > 0.8 ? (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 3;

          let newLeft = next[id].left + moveX;
          let newTop = next[id].top + moveY;

          // Clamp strictly to the grassy surface of the island
          newLeft = Math.max(35, Math.min(75, newLeft));
          newTop = Math.max(14, Math.min(70, newTop));

          next[id] = {
            left: newLeft,
            top: newTop,
            flip: moveX < 0
          };
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [ownedPets]);

  const handleBuyPet = (pet) => {
    if (coins >= pet.price && !ownedPets.find(p => p.id === pet.id)) {
      spendCoins(pet.price);
      setOwnedPets([...ownedPets, { ...pet, level: 1, hunger: 50 }]);
    }
  };

  const updatePetProp = (id, newProps) => {
    const updated = ownedPets.map(p => p.id === id ? { ...p, ...newProps } : p);
    setOwnedPets(updated);
    if (selectedPet?.id === id) {
      setSelectedPet(updated.find(p => p.id === id));
    }
  };

  if (selectedPet) {
    return (
      <div className="flex w-full h-full items-center justify-center relative overflow-hidden bg-black animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${detailBg})` }} />
        <button onClick={() => setSelectedPet(null)} className="absolute top-6 left-6 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all shadow-lg border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="z-10 flex flex-col items-center gap-6 p-8 bg-black/50 backdrop-blur-md rounded-3xl border border-white/20 text-white shadow-2xl max-w-lg w-full mx-4">
          <h2 className="text-4xl font-black text-amber-400 drop-shadow-lg">{selectedPet.name}</h2>

          {/* Pet Stage/Platform */}
          <div className="relative w-64 h-64 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="absolute bottom-0 w-48 h-12 bg-black/40 rounded-[100%] blur-md"></div>
            <img src={selectedPet.image} alt={selectedPet.name} className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" draggable="false" />
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-white/10 p-4 rounded-xl border border-white/20 text-center shadow-inner">
              <p className="text-sm text-slate-300 font-semibold mb-1">Level</p>
              <div className="flex justify-center items-end gap-1"><span className="text-3xl font-black text-blue-400">{selectedPet.level}</span></div>
            </div>
            <div className="flex-1 bg-white/10 p-4 rounded-xl border border-white/20 text-center shadow-inner">
              <p className="text-sm text-slate-300 font-semibold mb-1">Độ no</p>
              <div className="w-full bg-black/50 rounded-full h-3 mt-2 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-300" style={{ width: `${selectedPet.hunger}%` }}></div>
              </div>
              <p className="text-xs font-bold text-green-300 mt-1">{selectedPet.hunger}/100</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
            <button
              onClick={() => {
                if (selectedPet.hunger < 100) {
                  updatePetProp(selectedPet.id, { hunger: Math.min(100, selectedPet.hunger + 15) });
                }
              }}
              disabled={selectedPet.hunger >= 100}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all shadow-lg ${selectedPet.hunger >= 100 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 hover:-translate-y-1 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-0'}`}>
              <Heart className="w-5 h-5" /> Cho Ăn
            </button>
            <button
              onClick={() => {
                if (coins >= 50) {
                  spendCoins(50);
                  updatePetProp(selectedPet.id, { level: selectedPet.level + 1 });
                }
              }}
              disabled={coins < 50}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all shadow-lg ${coins < 50 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:-translate-y-1 text-white border-b-4 border-blue-700 active:border-b-0 active:translate-y-0'}`}>
              <Zap className="w-5 h-5" /> Nâng Cấp (-50)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full items-center justify-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden bg-[#87CEEB]">
      {/* Background container filling screen */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${islandBg})` }} />

      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between z-20 pointer-events-none">
        <button onClick={onBack} className="p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all shadow-lg border border-white/10 pointer-events-auto">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/60 px-5 py-2.5 rounded-full border border-yellow-500/30 backdrop-blur-sm shadow-lg">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="font-black text-xl text-yellow-400 drop-shadow-md">{coins} Vàng</span>
          </div>
          <button onClick={() => setShowShop(true)} className="px-6 py-2.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 font-black text-amber-950 rounded-full shadow-lg border-2 border-amber-300 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide">
            🛒 Mua Pet
          </button>
        </div>
      </div>

      {/* Walking Pets Layer */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {ownedPets.map(pet => (
          <div
            key={pet.id}
            className="absolute transition-all duration-[4000ms] ease-linear z-10"
            style={{
              left: `${petPositions[pet.id]?.left}%`,
              top: `${petPositions[pet.id]?.top}%`,
            }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2">
              <div
                onClick={() => setSelectedPet(pet)}
                className="relative w-36 h-36 sm:w-56 sm:h-56 cursor-pointer hover:scale-110 transition-transform duration-200 pointer-events-auto"
              >
                <div className={`w-full h-full transition-transform duration-200 ${petPositions[pet.id]?.flip ? 'scale-x-[-1]' : ''}`}>
                  {/* Shadow underneath pet */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/30 rounded-[100%] blur-sm"></div>
                  <img src={pet.image} alt={pet.name} className="relative z-10 w-full h-full object-contain drop-shadow-2xl" draggable="false" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zero State */}
      {ownedPets.length === 0 && !showShop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center animate-pulse shadow-2xl">
            <p className="text-2xl font-black text-white">Trống Vắng Quá!</p>
            <p className="text-amber-200 mt-2 font-semibold text-lg">Đảo trên trời đang chờ bạn đón một Thú Cưng về.</p>
          </div>
        </div>
      )}

      {/* Shop Overlay */}
      {showShop && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1a1c29] w-full max-w-4xl rounded-[2rem] border-4 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-amber-600/30 to-orange-600/30 flex justify-between items-center border-b border-amber-500/30 relative">
              <h2 className="text-3xl font-black text-amber-400 drop-shadow-lg flex items-center gap-3">
                <span className="text-4xl">🏪</span>Shop Cửa Hàng Thú Cưng
              </h2>
              <button onClick={() => setShowShop(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 hover:rotate-90 rounded-full flex items-center justify-center text-white transition-all">
                ✕
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto bg-slate-900/50">
              {PET_DATA.map(pet => {
                const isOwned = ownedPets.find(p => p.id === pet.id);
                const canAfford = coins >= pet.price;
                return (
                  <div key={pet.id} className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-4 flex flex-col items-center border border-white/10 hover:border-amber-400/50 transition-all group shadow-lg hover:-translate-y-1">
                    <div className="w-28 h-28 mb-4 bg-black/40 rounded-xl p-3 flex items-center justify-center shadow-inner group-hover:bg-amber-500/10 transition-colors">
                      <img src={pet.image} alt={pet.name} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-sm font-black text-white text-center mb-1 leading-tight">{pet.name}</h3>
                    <p className="text-xs text-amber-300/80 font-bold mb-4 uppercase tracking-wider">{pet.type}</p>

                    {isOwned ? (
                      <div className="mt-auto px-4 py-2 bg-green-500/20 text-green-400 font-bold rounded-xl w-full text-center border border-green-500/30">Đã Sở Hữu</div>
                    ) : (
                      <button
                        onClick={() => handleBuyPet(pet)}
                        disabled={!canAfford}
                        className={`mt-auto px-4 py-2 rounded-xl font-bold w-full flex items-center justify-center gap-1 transition-colors border ${canAfford ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 border-amber-400' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
                      >
                        <Coins className="w-4 h-4" /> {pet.price} Vàng
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentIsland;
