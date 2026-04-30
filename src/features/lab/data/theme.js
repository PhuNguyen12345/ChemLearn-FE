import { 
  Beaker, Flame, Droplet, Box, Cloud, 
  Zap, Scale, Leaf, Sparkles, ClipboardList 
} from 'lucide-react';

export const LAB_THEMES = {
  AXIT_BAZO: {
    gradient: "from-amber-400 to-orange-500",
    iconColor: "text-orange-100",
    tag: "🧪 Axit - Bazơ",
    Icon: Droplet
  },
  NHIET_HOC: {
    gradient: "from-rose-400 to-red-500",
    iconColor: "text-red-100",
    tag: "🔥 Nhiệt học",
    Icon: Flame
  },
  KIM_LOAI: {
    gradient: "from-slate-400 to-slate-600",
    iconColor: "text-slate-100",
    tag: "⚙️ Kim loại",
    Icon: Box
  },
  CHAT_KHI: {
    gradient: "from-teal-400 to-emerald-500",
    iconColor: "text-emerald-100",
    tag: "☁️ Chất khí",
    Icon: Cloud
  },
  KET_TUA: {
    gradient: "from-violet-400 to-purple-600",
    iconColor: "text-purple-100",
    tag: "🔬 Kết tủa",
    Icon: Beaker
  },
  OXI_HOA_KHU: {
    gradient: "from-fuchsia-400 to-pink-600",
    iconColor: "text-pink-100",
    tag: "⚡ Oxi hóa - Khử",
    Icon: Zap
  },
  CAN_BANG: {
    gradient: "from-blue-400 to-indigo-500",
    iconColor: "text-indigo-100",
    tag: "⚖️ Cân bằng",
    Icon: Scale
  },
  HUU_CO: {
    gradient: "from-green-400 to-emerald-600",
    iconColor: "text-emerald-100",
    tag: "🌿 Hữu cơ",
    Icon: Leaf
  },
  // SANDBOX: {
  //   gradient: "from-pink-400 to-rose-500",
  //   iconColor: "text-rose-100",
  //   tag: "✨ Tự do",
  //   Icon: Sparkles
  // },
  DEFAULT: {
    gradient: "from-sky-400 to-blue-500",
    iconColor: "text-blue-100",
    tag: "🔬 Thực hành",
    Icon: Beaker
  }
};
