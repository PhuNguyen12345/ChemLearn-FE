import React, { useState, useEffect } from 'react';
import { Swords, Shield, Loader2, ChevronRight } from 'lucide-react';
import { getMyPets } from '../../../api/studentApi';
import { useStudentStore } from '../../../stores/useStudentStore';
import BattleArenaPage from './BattleArenaPage';
import { WebSocketProvider } from '../../../context/WebSocketProvider';

// Fallback images if DB doesn't have URLs
import pet1 from '../../../assets/CapybaraWizard.png';
import pet2 from '../../../assets/DogeWizard.png';
import pet3 from '../../../assets/SkibidiToilem.png';
import pet4 from '../../../assets/TungSahurWarrior.png';

const getPetImage = (url, name) => {
  if (url) return url;
  if (!name) return pet1;
  const n = String(name).toLowerCase();
  if (n.includes('capybara')) return pet1;
  if (n.includes('doge')) return pet2;
  if (n.includes('skibidi') || n.includes('tolem')) return pet3;
  if (n.includes('tung') || n.includes('sahur') || n.includes('warrior')) return pet4;
  return pet1;
};

/**
 * PvpLobbyPage — Matchmaking lobby where student selects a pet and enters queue.
 * Wraps BattleArenaPage inside WebSocketProvider.
 */

export default function PvpLobbyPage({ onBack }) {
  const { level, experience, coins } = useStudentStore();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inBattle, setInBattle] = useState(false);

  const username = (() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return 'Học sinh';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || 'Học sinh';
    } catch { return 'Học sinh'; }
  })();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setIsLoading(true);
        const data = await getMyPets();
        setPets(data || []);
        if (data?.length > 0) setSelectedPet(data[0]);
      } catch (e) {
        console.error('Failed to load pets:', e);
        setPets([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPets();
  }, []);

  // In battle — render arena inside WS context
  if (inBattle && selectedPet) {
    return (
      <WebSocketProvider>
        <BattleArenaPage
          selectedPetId={selectedPet.id}
          onBack={() => setInBattle(false)}
        />
      </WebSocketProvider>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-300/30">
          <Swords className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">PVP Pet Battle</h1>
          <p className="text-slate-500 font-bold">Chiến đấu trực tuyến với học sinh khác!</p>
        </div>
      </div>

      {/* Player card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-300/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black">{username}</h2>
            <p className="text-indigo-200 text-sm font-bold">Level {level} Chemist</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <span className="text-sm font-black text-yellow-300">🪙 {coins} Gold</span>
            <span className="text-xs text-indigo-200">{experience} XP</span>
          </div>
        </div>
      </div>

      {/* Pet selection */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          Chọn Pet để chiến đấu
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="font-black">Bạn chưa có Pet nào!</p>
            <p className="text-sm mt-1">Hãy mua trứng và ấp Pet từ Pet Island.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pets.map((pet) => {
              const isSelected = selectedPet?.id === pet.id;
              return (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl border-2 text-left
                    transition-all duration-200
                    ${isSelected
                      ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                  `}
                >
                  <div className={`
                    w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0
                    ${isSelected ? 'border-indigo-300' : 'border-slate-100'}
                  `}>
                    <img src={getPetImage(pet.species?.imageUrl, pet.species?.name)} alt={pet.species?.name}
                      className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate">{pet.species?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-semibold">Level {pet.level} • ⭐{pet.starLevel}</p>
                    <p className="text-xs text-indigo-500 font-bold">
                      HP: {pet.maxHp ?? 0} | ATK: {pet.damage ?? 0}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Enter queue button */}
      <button
        onClick={() => setInBattle(true)}
        disabled={!selectedPet}
        className={`
          w-full py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3
          transition-all duration-200
          ${selectedPet
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-300/40 hover:scale-[1.02] hover:shadow-indigo-300/60'
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
        `}
      >
        <Swords className="w-6 h-6" />
        Tìm Trận Đấu
        {selectedPet && <ChevronRight className="w-5 h-5" />}
      </button>

      {selectedPet && (
        <p className="text-center text-slate-400 text-sm font-bold">
          Bạn sẽ chiến đấu với <strong>{selectedPet.species?.name}</strong> · Level {selectedPet.level}
        </p>
      )}
    </div>
  );
}
