import { create } from 'zustand';

export const useStudentStore = create((set) => ({
  coins: 100, // Khởi tạo 100 vàng cho học sinh
  inventory: [],
  
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  
  spendCoins: (amount) => set((state) => {
    if (state.coins >= amount) {
      return { coins: state.coins - amount };
    }
    return state;
  }),
  
  buyItem: (item) => set((state) => {
    // Check if already owned
    if (state.inventory.some(i => i.id === item.id)) {
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
  })
}));
