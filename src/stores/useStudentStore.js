import { create } from 'zustand';

export const useStudentStore = create((set) => ({
  experience: 0,
  level: 1,
  currentStreak: 0,
  coins: 0,
  
  profile: null, // Stores data from getStudentProfileData

  setGamificationProfile: (profile) => set({
    experience: profile.experience || 0,
    level: profile.level || 1,
    currentStreak: profile.currentStreak || 0,
    coins: profile.coins || 0
  }),

  setProfileData: (profileData) => set({ profile: profileData }),

  inventory: [{ id: 'outfit-boy-basic', type: 'outfit', name: 'Boy Standard Uniform' }, { id: 'outfit-girl-basic', type: 'outfit', name: 'Girl Standard Uniform' }],
  gender: 'boy', // 'boy' | 'girl'
  activeOutfit: 'outfit-boy-basic',

  setGender: (gender) => set({ gender, activeOutfit: `outfit-${gender}-basic` }),
  equipOutfit: (outfitId) => set({ activeOutfit: outfitId }),

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  spendCoins: (amount) => set((state) => {
    if (state.coins >= amount) {
      return { coins: state.coins - amount };
    }
    return state;
  }),

  buyItem: (item) => set((state) => {
    // Check if already owned and not consumable
    if (item.type !== 'consumable' && state.inventory.some(i => i.id === item.id)) {
      alert("Bạn đã sở hữu vật phẩm này rồi!");
      return state;
    }

    if (state.coins >= item.price) {
      alert(`Mua thành công ${item.name}!`);
      return {
        coins: state.coins - item.price,
        inventory: [...state.inventory, item]
      };
    } else {
      alert("Bạn không đủ vàng!");
      return state;
    }
  }),

  consumeItem: (itemId) => set((state) => {
    const itemIndex = state.inventory.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      const newInventory = [...state.inventory];
      newInventory.splice(itemIndex, 1);
      return { inventory: newInventory };
    }
    return state;
  })
}));
