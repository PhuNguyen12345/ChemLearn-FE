import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../stores/useStudentStore';
import { Coins, ArrowLeft, Heart, Zap } from 'lucide-react';
import { getMyPets, getMyCoins, getShopItems, buyItem, openEgg, feedPet, starUpPet, getMyInventory } from '../../api/studentApi';
import { toast } from 'sonner';
import islandBg from '../../assets/islandBg.png';
import detailBg from '../../assets/detailBg.png';

// Fallback images if DB doesn't have URLs
import pet1 from '../../assets/CapybaraWizard.png';
import pet2 from '../../assets/DogeWizard.png';
import pet3 from '../../assets/SkibidiToilem.png';
import pet4 from '../../assets/TungSahurWarrior.png';
import egg1 from '../../assets/egg.png';
import bottle1 from '../../assets/bottle1.png';

const getPetImage = (url, name) => {
  if (url) return url;
  if (!name) return pet1;
  const n = String(name).toLowerCase();
  if (n.includes('capybara')) return pet1;
  if (n.includes('doge')) return pet2;
  if (n.includes('skibidi') || n.includes('tolem')) return pet3;
  if (n.includes('tung') || n.includes('sahur') || n.includes('warrior')) return pet4;
  if (n.includes('trứng') || n.includes('egg')) return egg1;
  return pet1;
};

const StudentIsland = ({ onBack }) => {
  const { coins, setCoins, spendCoins } = useStudentStore();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  const [ownedPets, setOwnedPets] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPet, setSelectedPet] = useState(null);
  const [showShop, setShowShop] = useState(false);
  const [petPositions, setPetPositions] = useState({});
  const [gachaResult, setGachaResult] = useState(null);

  // Fetch Data
  const loadData = useCallback(async () => {
    try {
      const [petsRes, shopRes, invRes, coinsRes] = await Promise.all([
        getMyPets(),
        getShopItems(),
        getMyInventory(),
        getMyCoins()
      ]);
      if (!isMountedRef.current) return;
      setOwnedPets(petsRes);
      setShopItems(shopRes);
      setFoodItems(invRes.filter(item => item.itemType === 'FOOD'));
      setCoins(coinsRes);
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Failed to load pet data:", error);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [setCoins]);

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadData]);

  useEffect(() => {
    if (ownedPets.length === 0) return;
    // Generate initial positions
    const initialPos = {};
    ownedPets.forEach((pet, i) => {
      if (!petPositions[pet.id]) {
        initialPos[pet.id] = {
          left: 25 + Math.random() * 50,
          top: 45 + Math.random() * 30,
          flip: Math.random() > 0.5
        };
      } else {
        initialPos[pet.id] = petPositions[pet.id];
      }
    });
    setPetPositions(initialPos);

    // Random walk interval
    const interval = setInterval(() => {
      setPetPositions(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const moveX = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 15);
          const moveY = Math.random() > 0.8 ? (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 3;

          let newLeft = next[id].left + moveX;
          let newTop = next[id].top + moveY;

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

  const handleBuyAndOpenEgg = async (egg) => {
    // We assume backend handles coin deduction, but for frontend responsiveness we'll check local store
    if (coins >= egg.quantity) {
      try {
        // 1. Buy Egg (price is stored in quantity field from our DTO workaround)
        await buyItem(egg.itemId, 1);
        spendCoins(egg.quantity);

        // 2. Open Egg immediately
        const result = await openEgg(egg.itemId);
        setGachaResult(result);

        // 3. Reload pets
        await loadData();
      } catch (error) {
        toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleBuyFood = async (item) => {
    if (coins >= item.quantity) {
      try {
        await buyItem(item.itemId, 1);
        spendCoins(item.quantity);
        toast.success(`Mua thành công 1 ${item.name}!`);
        await loadData();
      } catch (error) {
        toast.error("Mua thất bại: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleFeedPet = async () => {
    if (foodItems.length > 0) {
      try {
        const food = foodItems[0]; // Use first available food
        await feedPet(selectedPet.id, food.itemId, 1);
        await loadData(); // Reload stats

        // Update local selected pet reference
        const updatedPets = await getMyPets();
        setSelectedPet(updatedPets.find(p => p.id === selectedPet.id));
      } catch (error) {
        toast.error("Lỗi cho ăn: " + (error.response?.data?.message || error.message));
      }
    } else {
      toast.warning("Bạn không có thức ăn! Hãy mua trong Cửa hàng.");
    }
  };

  const handleStarUp = async () => {
    try {
      await starUpPet(selectedPet.id);
      await loadData();

      const updatedPets = await getMyPets();
      setSelectedPet(updatedPets.find(p => p.id === selectedPet.id));
      toast.success("Nâng sao thành công! Chỉ số đã tăng vọt.");
    } catch (error) {
      toast.error("Lỗi nâng sao: " + (error.response?.data?.message || error.message));
    }
  };

  if (isLoading) {
    return <div className="flex w-full h-full items-center justify-center bg-black text-white">Đang tải Đảo Thú Cưng...</div>;
  }

  if (selectedPet) {
    const expPercentage = Math.min(100, (selectedPet.experience / selectedPet.nextLevelExp) * 100);
    const totalFood = foodItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const canFeed = totalFood > 0;
    const fragmentsNeeded = selectedPet.starLevel * 20;
    const canStarUp = selectedPet.starLevel < 5 && (selectedPet.fragments || 0) >= fragmentsNeeded;

    return (
      <div className="flex w-full flex-1 min-h-[calc(100vh-8rem)] rounded-2xl shadow-xl items-center justify-center relative overflow-hidden bg-black animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${detailBg})` }} />
        <button onClick={() => setSelectedPet(null)} className="absolute top-6 left-6 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all shadow-lg border border-white/10">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="z-10 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-black/60 backdrop-blur-md rounded-3xl border border-white/20 text-white shadow-2xl max-w-sm sm:max-w-md w-full mx-4 overflow-y-auto max-h-[92vh]">
          {/* Title & Stars */}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-lg text-center">{selectedPet.species?.name}</h2>
            <div className="flex text-yellow-400 text-sm sm:text-base">
              {Array.from({ length: selectedPet.starLevel }).map((_, i) => <span key={i}>⭐</span>)}
              {Array.from({ length: 5 - selectedPet.starLevel }).map((_, i) => <span key={i} className="opacity-30" style={{ filter: 'grayscale(100%) brightness(50%)' }}>⭐</span>)}
            </div>
          </div>

          {/* Pet Image */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center animate-bounce mt-1" style={{ animationDuration: '3s' }}>
            <div className="absolute bottom-0 w-32 h-8 bg-black/40 rounded-[100%] blur-md"></div>
            <img src={getPetImage(selectedPet.species?.imageUrl, selectedPet.species?.name)} alt={selectedPet.species?.name} className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" draggable="false" />
          </div>

          {/* Level & EXP Section */}
          <div className="flex gap-3 w-full mt-1">
            <div className="flex-1 bg-white/10 p-2.5 rounded-xl border border-white/25 text-center shadow-inner flex flex-col justify-center">
              <p className="text-xs text-slate-300 font-semibold mb-0.5">Cấp độ</p>
              <div className="flex justify-center items-end gap-0.5">
                <span className="text-2xl font-black text-blue-400">{selectedPet.level}</span>
              </div>
            </div>
            <div className="flex-[2] bg-white/10 p-2.5 rounded-xl border border-white/25 text-center shadow-inner">
              <p className="text-xs text-slate-300 font-semibold mb-0.5">Kinh Nghiệm (EXP)</p>
              <div className="w-full bg-black/50 rounded-full h-2.5 mt-1.5 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${expPercentage}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-blue-300 mt-1">{selectedPet.experience}/{selectedPet.nextLevelExp}</p>
            </div>
          </div>

          {/* HP & Sát Thương Info */}
          <div className="flex gap-3 w-full">
            <div className="flex-1 bg-red-500/20 py-2 px-3 rounded border border-red-500/30 text-center flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span className="text-xs text-red-200 font-bold">HP: {selectedPet.maxHp}</span>
            </div>
            <div className="flex-1 bg-orange-500/20 py-2 px-3 rounded border border-orange-500/30 text-center flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span className="text-xs text-orange-200 font-bold">Sát Thương: {selectedPet.damage}</span>
            </div>
          </div>

          {/* Fragments Progression */}
          <div className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-2 text-center">
            {selectedPet.starLevel < 5 ? (
              <p className="text-xs text-indigo-200 font-medium">
                Mảnh Linh Hồn: <span className="text-amber-400 font-black text-sm">{selectedPet.fragments || 0}</span> / {fragmentsNeeded}
              </p>
            ) : (
              <p className="text-xs text-green-400 font-black">
                ✨ Linh thú đã đạt cấp sao tối đa! ✨
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mt-1.5">
            <button
              onClick={handleFeedPet}
              disabled={!canFeed}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 px-3 rounded-xl transition-all shadow-lg text-white ${
                canFeed 
                  ? 'bg-green-500 hover:bg-green-600 hover:-translate-y-0.5 border-b-4 border-green-700 active:border-b-0 active:translate-y-0 active:scale-95' 
                  : 'bg-slate-700/60 text-slate-400 border-b-4 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <Heart className="w-4 h-4 fill-white/10" /> Cho Ăn ({totalFood})
            </button>
            
            <button
              onClick={handleStarUp}
              disabled={!canStarUp}
              className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 px-3 rounded-xl transition-all shadow-lg text-white ${
                canStarUp 
                  ? 'bg-yellow-500 hover:bg-yellow-600 hover:-translate-y-0.5 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-0 active:scale-95 text-amber-950' 
                  : 'bg-slate-700/60 text-slate-400 border-b-4 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <Zap className="w-4 h-4 fill-white/10" /> Tăng Sao
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 min-h-[calc(100vh-8rem)] rounded-2xl shadow-xl items-center justify-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden bg-[#87CEEB]">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${islandBg})` }} />

      <div className="absolute top-6 left-6 right-6 flex justify-between z-20 pointer-events-none">
        <button onClick={() => navigate('/student/home')} className="p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all shadow-lg border border-white/10 pointer-events-auto">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/60 px-5 py-2.5 rounded-full border border-yellow-500/30 backdrop-blur-sm shadow-lg">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="font-black text-xl text-yellow-400 drop-shadow-md">{coins} Vàng</span>
          </div>
          <button onClick={() => setShowShop(true)} className="px-6 py-2.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 font-black text-amber-950 rounded-full shadow-lg border-2 border-amber-300 transition-all hover:scale-105 active:scale-95 uppercase tracking-wide">
            🛒 Ấp Trứng
          </button>
        </div>
      </div>

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {ownedPets.map((pet, idx) => (
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
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/30 rounded-[100%] blur-sm"></div>
                  <img src={getPetImage(pet.species?.imageUrl, pet.species?.name)} alt={pet.species?.name} className="relative z-10 w-full h-full object-contain drop-shadow-2xl" draggable="false" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ownedPets.length === 0 && !showShop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center animate-pulse shadow-2xl">
            <p className="text-2xl font-black text-white">Trống Vắng Quá!</p>
            <p className="text-amber-200 mt-2 font-semibold text-lg">Hãy đến Cửa hàng để ấp Quả trứng đầu tiên.</p>
          </div>
        </div>
      )}

      {/* Gacha Result Modal */}
      {gachaResult && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in zoom-in-50 duration-300">
          <div className="bg-gradient-to-b from-indigo-900 to-black p-8 rounded-3xl border-4 border-yellow-400 flex flex-col items-center max-w-sm text-center shadow-[0_0_100px_rgba(250,204,21,0.4)]">
            <h2 className="text-3xl font-black text-yellow-400 mb-6 drop-shadow-lg animate-bounce">
              {gachaResult.isDuplicate ? "TRÙNG LẶP!" : "PET MỚI!"}
            </h2>

            <div className="w-48 h-48 bg-white/10 rounded-full p-4 mb-6 shadow-inner">
              <img src={getPetImage(gachaResult.species?.imageUrl, gachaResult.species?.name)} alt={gachaResult.species?.name} className="w-full h-full object-contain drop-shadow-2xl animate-pulse" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{gachaResult.species?.name}</h3>
            <p className="text-sm font-bold text-indigo-300 mb-6 px-3 py-1 bg-indigo-500/20 rounded-full">
              Hệ: {gachaResult.species?.element} | Độ hiếm: {gachaResult.species?.rarity}
            </p>

            {gachaResult.isDuplicate ? (
              <div className="bg-orange-500/20 border border-orange-500 p-3 rounded-xl mb-6">
                <p className="text-orange-300 font-semibold">Bạn đã có Pet này!</p>
                <p className="text-white font-black">Nhận được {gachaResult.fragmentsReceived} mảnh linh hồn</p>
                {gachaResult.coinsConverted > 0 && (
                  <p className="text-yellow-400 font-bold mt-1 text-sm">
                    Đạt giới hạn nâng sao! Đã quy đổi thành {gachaResult.coinsConverted} Vàng 🪙
                  </p>
                )}
              </div>
            ) : (
              <p className="text-green-400 font-bold mb-6">Pet đã được thêm vào đảo!</p>
            )}

            <button
              onClick={() => setGachaResult(null)}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black rounded-xl w-full transition-colors">
              TUYỆT VỜI!
            </button>
          </div>
        </div>
      )}

      {/* Shop Overlay */}
      {showShop && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1a1c29] w-full max-w-4xl rounded-[2rem] border-4 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-amber-600/30 to-orange-600/30 flex justify-between items-center border-b border-amber-500/30 relative">
              <h2 className="text-3xl font-black text-amber-400 drop-shadow-lg flex items-center gap-3">
                <span className="text-4xl">🛒</span>Cửa Hàng Linh Thú
              </h2>
              <button onClick={() => setShowShop(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 hover:rotate-90 rounded-full flex items-center justify-center text-white transition-all">
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto bg-slate-900/50">
              {shopItems.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-400 italic">
                  Chưa có vật phẩm nào được bán hôm nay. Vui lòng quay lại sau!
                </div>
              ) : (
                shopItems.map((item, idx) => {
                  // Using quantity field to transport price from backend workaround
                  const price = item.quantity;
                  const canAfford = coins >= price;
                  const isEgg = item.itemType === 'EGG';

                  return (
                    <div key={item.id} className="bg-gradient-to-b from-indigo-900/40 to-black/60 rounded-2xl p-4 flex flex-col items-center border border-indigo-500/30 hover:border-amber-400/50 transition-all group shadow-lg hover:-translate-y-1">
                      <div className="w-28 h-28 mb-4 bg-black/40 rounded-full p-3 flex items-center justify-center shadow-inner group-hover:bg-amber-500/10 transition-colors border border-white/5">
                        <img src={item.imageUrl || (isEgg ? egg1 : bottle1)} alt={item.name} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                      </div>
                      <h3 className="text-sm font-black text-white text-center mb-1 leading-tight">{item.name}</h3>
                      <p className="text-xs text-indigo-300/80 font-medium mb-4 text-center line-clamp-2">{item.description || (isEgg ? "Mở để nhận pet ngẫu nhiên!" : "Thức ăn tăng EXP cho Pet")}</p>

                      <button
                        onClick={() => isEgg ? handleBuyAndOpenEgg(item) : handleBuyFood(item)}
                        disabled={!canAfford}
                        className={`mt-auto px-4 py-3 rounded-xl font-black w-full flex items-center justify-center gap-2 transition-colors border shadow-lg ${canAfford ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-amber-400' : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'}`}
                      >
                        <Coins className="w-5 h-5" /> {isEgg ? 'Ấp' : 'Mua'}: {price}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentIsland;
