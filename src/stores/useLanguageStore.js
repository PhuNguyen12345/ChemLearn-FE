import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'vi', // default language
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'language-storage', // key in localStorage
    }
  )
);

export default useLanguageStore;
