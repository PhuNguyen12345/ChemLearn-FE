import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Star,
  Medal,
  Flame,
  Users,
} from 'lucide-react';

/* ================================================================
   MOCK DATA
================================================================ */
const mockLeaderboard = [
  { id: 1,  rank: 1,  name: 'Minh Khoa',    initials: 'MK', exp: 8_420, trend: 'flat', isCurrentUser: false, avatarBg: 'bg-violet-500'  },
  { id: 2,  rank: 2,  name: 'Linh Anh',     initials: 'LA', exp: 7_890, trend: 'up',   isCurrentUser: false, avatarBg: 'bg-pink-500'    },
  { id: 3,  rank: 3,  name: 'Bao Nguyen',   initials: 'BN', exp: 7_310, trend: 'up',   isCurrentUser: false, avatarBg: 'bg-teal-500'    },
  { id: 4,  rank: 4,  name: 'Thanh Van',    initials: 'TV', exp: 6_750, trend: 'down', isCurrentUser: false, avatarBg: 'bg-blue-500'    },
  { id: 5,  rank: 5,  name: 'Alex (You)',   initials: 'ST', exp: 6_450, trend: 'up',   isCurrentUser: true,  avatarBg: 'bg-indigo-500'  },
  { id: 6,  rank: 6,  name: 'Hoa Tran',     initials: 'HT', exp: 5_990, trend: 'flat', isCurrentUser: false, avatarBg: 'bg-emerald-500' },
  { id: 7,  rank: 7,  name: 'Duc Manh',     initials: 'DM', exp: 5_620, trend: 'down', isCurrentUser: false, avatarBg: 'bg-orange-500'  },
  { id: 8,  rank: 8,  name: 'Phuong Chi',   initials: 'PC', exp: 5_100, trend: 'up',   isCurrentUser: false, avatarBg: 'bg-rose-500'    },
  { id: 9,  rank: 9,  name: 'Khai Nguyen',  initials: 'KN', exp: 4_830, trend: 'flat', isCurrentUser: false, avatarBg: 'bg-amber-500'   },
  { id: 10, rank: 10, name: 'Thu Hương',    initials: 'TH', exp: 4_200, trend: 'down', isCurrentUser: false, avatarBg: 'bg-cyan-500'    },
];

const top3    = mockLeaderboard.slice(0, 3);
const restOf  = mockLeaderboard.slice(3);

/* ================================================================
   HELPERS
================================================================ */
const trendConfig = {
  up:   { icon: ArrowUp,   color: 'text-emerald-500', bg: 'bg-emerald-50',  label: '▲' },
  down: { icon: ArrowDown, color: 'text-rose-500',    bg: 'bg-rose-50',     label: '▼' },
  flat: { icon: Minus,     color: 'text-slate-400',   bg: 'bg-slate-50',    label: '—' },
};

const podiumConfig = {
  1: {
    order:      'order-2',
    height:     'h-28 md:h-36',
    pedestal:   'bg-gradient-to-b from-amber-300 to-amber-500 border-b-4 border-amber-700',
    ring:       'ring-4 ring-amber-400 ring-offset-2',
    avatarSize: 'w-20 h-20 md:w-24 md:h-24 text-2xl',
    expColor:   'text-amber-600',
    shadow:     'shadow-[0_0_24px_rgba(251,191,36,0.5)]',
    crownColor: 'text-amber-400',
    medal:      '🥇',
  },
  2: {
    order:      'order-1',
    height:     'h-20 md:h-28',
    pedestal:   'bg-gradient-to-b from-slate-300 to-slate-400 border-b-4 border-slate-600',
    ring:       'ring-4 ring-slate-300 ring-offset-2',
    avatarSize: 'w-16 h-16 md:w-20 md:h-20 text-xl',
    expColor:   'text-slate-500',
    shadow:     'shadow-[0_0_18px_rgba(148,163,184,0.5)]',
    crownColor: 'text-slate-400',
    medal:      '🥈',
  },
  3: {
    order:      'order-3',
    height:     'h-16 md:h-24',
    pedestal:   'bg-gradient-to-b from-orange-300 to-orange-500 border-b-4 border-orange-700',
    ring:       'ring-4 ring-orange-300 ring-offset-2',
    avatarSize: 'w-16 h-16 md:w-20 md:h-20 text-xl',
    expColor:   'text-orange-500',
    shadow:     'shadow-[0_0_18px_rgba(253,186,116,0.5)]',
    crownColor: 'text-orange-400',
    medal:      '🥉',
  },
};

/* ================================================================
   SUB-COMPONENTS
================================================================ */
const PodiumCard = ({ user }) => {
  const cfg = podiumConfig[user.rank];
  const TrendIcon = trendConfig[user.trend].icon;

  return (
    <div className={`flex flex-col items-center gap-2 ${cfg.order}`}>
      {/* Crown (rank 1 only) */}
      {user.rank === 1 && (
        <Crown
          className={`w-8 h-8 ${cfg.crownColor} fill-current animate-[bounce_3s_ease-in-out_infinite] drop-shadow-lg`}
        />
      )}

      {/* Avatar */}
      <div className={`${cfg.avatarSize} rounded-full ${user.avatarBg} ${cfg.ring} ${cfg.shadow} flex items-center justify-center font-black text-white shrink-0 transition-transform hover:scale-105 duration-300`}>
        {user.initials}
      </div>

      {/* Name + EXP */}
      <div className="text-center space-y-0.5">
        <p className="font-black text-slate-800 text-sm leading-tight">{user.name}</p>
        <p className={`text-xs font-black ${cfg.expColor} flex items-center justify-center gap-0.5`}>
          <Zap className="w-3 h-3" />
          {user.exp.toLocaleString()} XP
        </p>
        {/* Trend */}
        <div className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${trendConfig[user.trend].bg} ${trendConfig[user.trend].color}`}>
          <TrendIcon className="w-2.5 h-2.5" />
          {user.trend === 'up' ? '+2' : user.trend === 'down' ? '-1' : '0'}
        </div>
      </div>

      {/* Podium pedestal */}
      <div className={`w-24 md:w-28 ${cfg.height} ${cfg.pedestal} rounded-t-2xl flex items-start justify-center pt-2`}>
        <span className="text-white font-black text-xl drop-shadow">{cfg.medal}</span>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT
================================================================ */
const Leaderboard = () => {
  const [filter, setFilter] = useState('weekly');

  return (
    <div className="min-h-full w-full bg-slate-50 overflow-y-auto pb-12">

      {/* ════════════════════════════════════════════════
          BANNER HEADER
      ════════════════════════════════════════════════ */}
      <div className="m-4 md:m-6 rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-7 md:p-10 relative overflow-hidden shadow-2xl shadow-indigo-500/30">
        {/* Blobs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-44 h-44 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Floating icons */}
        <div className="absolute top-5 right-28 animate-bounce" style={{ animationDuration: '2.6s' }}>
          <Trophy className="w-7 h-7 text-amber-300 fill-amber-300/40" />
        </div>
        <div className="absolute top-7 right-12 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
          <Crown className="w-6 h-6 text-yellow-200/70 fill-yellow-200/40" />
        </div>
        <div className="absolute bottom-5 right-20 animate-bounce" style={{ animationDuration: '2.9s', animationDelay: '0.7s' }}>
          <Sparkles className="w-5 h-5 text-indigo-200/80" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs font-black uppercase tracking-widest">
              Rankings
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm">
            Weekly Leaderboard 🏆
          </h1>
          <p className="text-indigo-200 mt-1.5 font-semibold text-base flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-300" />
            Bronze Alchemist League · Ends in 2 days
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2">
              <Users className="w-4 h-4 text-indigo-200" />
              <span className="text-white font-black text-sm">{mockLeaderboard.length} Students Competing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300/60" />
              <span className="text-white font-black text-sm">You're Rank #5</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2">
              <Flame className="w-4 h-4 text-orange-300 fill-orange-300/40" />
              <span className="text-white font-black text-sm">1,970 XP behind #1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-8">

        {/* ── Filter pills ── */}
        <div className="flex gap-2 flex-wrap">
          {['weekly', 'monthly', 'all-time'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border-b-[3px] transition-all duration-150 capitalize
                ${filter === f
                  ? 'bg-indigo-500 text-white border-indigo-700 shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:-translate-y-0.5 hover:shadow-sm'}
              `}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════
            TOP 3 PODIUM
        ════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-amber-500 rounded-xl shadow-md shadow-amber-300/40">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Top Champions</h2>
          </div>

          {/* Podium stage */}
          <div className="bg-white rounded-3xl border-2 border-slate-100 border-b-[6px] border-b-slate-200 shadow-sm overflow-hidden">
            {/* Stars bg decoration */}
            <div className="relative flex items-end justify-center gap-4 md:gap-8 pt-10 pb-0 px-4 bg-gradient-to-b from-indigo-50/60 to-white overflow-hidden min-h-[260px] md:min-h-[320px]">
              {/* Decorative confetti-like dots */}
              {['top-8 left-8', 'top-12 left-1/4', 'top-6 right-1/4', 'top-10 right-8'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full opacity-40 ${['bg-amber-400','bg-indigo-400','bg-pink-400','bg-emerald-400'][i]}`} />
              ))}

              {/* Render: 2, 1, 3 in DOM (left, center, right) via order- classes */}
              {[top3[1], top3[0], top3[2]].map((user) => (
                <PodiumCard key={user.id} user={user} />
              ))}
            </div>

            {/* Stage floor label */}
            <div className="bg-slate-800 py-2 text-center">
              <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                🏟️ Champions Stage
              </span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════
            RANKING LIST (Ranks 4+)
        ════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-md shadow-indigo-300/40">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Full Rankings</h2>
          </div>

          <div className="space-y-2.5">
            {restOf.map((user) => {
              const cfg        = trendConfig[user.trend];
              const TrendIcon  = cfg.icon;

              return (
                <div
                  key={user.id}
                  className={`group flex items-center gap-3 md:gap-4 p-3.5 rounded-2xl border-2 transition-all duration-200
                    ${user.isCurrentUser
                      ? 'bg-indigo-50 border-indigo-400 border-b-[5px] border-b-indigo-500 shadow-md shadow-indigo-100/60'
                      : 'bg-white border-slate-100 border-b-[4px] border-b-slate-200 hover:-translate-y-1 hover:shadow-md hover:border-indigo-100 hover:border-b-indigo-200'
                    }
                  `}
                >
                  {/* Rank number */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0
                    ${user.isCurrentUser
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-300/50'
                      : 'bg-slate-100 text-slate-500'}
                  `}>
                    #{user.rank}
                  </div>

                  {/* Avatar circle */}
                  <div className={`w-10 h-10 rounded-full ${user.avatarBg} flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm
                    ${user.isCurrentUser ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
                  `}>
                    {user.initials}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm truncate
                      ${user.isCurrentUser ? 'text-indigo-700' : 'text-slate-800'}
                    `}>
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="ml-2 text-[10px] font-black text-indigo-500 bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded-full">YOU</span>
                      )}
                    </p>
                    <p className={`text-[11px] font-semibold ${user.isCurrentUser ? 'text-indigo-400' : 'text-slate-400'}`}>
                      Bronze Alchemist
                    </p>
                  </div>

                  {/* Trend indicator */}
                  <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-black ${cfg.bg} ${cfg.color} shrink-0`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    <span>{user.trend === 'up' ? '+2' : user.trend === 'down' ? '-1' : '—'}</span>
                  </div>

                  {/* EXP */}
                  <div className={`flex items-center gap-1 font-black text-sm shrink-0
                    ${user.isCurrentUser ? 'text-indigo-600' : 'text-slate-700'}
                  `}>
                    <Zap className={`w-3.5 h-3.5 ${user.isCurrentUser ? 'text-indigo-400' : 'text-amber-400'}`} />
                    {user.exp.toLocaleString()}
                    <span className={`text-[11px] font-bold ${user.isCurrentUser ? 'text-indigo-300' : 'text-slate-400'}`}>XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Motivational footer nudge ── */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center shadow-xl shadow-indigo-300/30">
          <p className="text-white font-black text-lg mb-1">⚡ Keep it up, Alex!</p>
          <p className="text-indigo-100 font-semibold text-sm">
            You're only <span className="text-yellow-300 font-black">300 XP</span> behind Rank #4. Complete today's quests to climb!
          </p>
          <div className="mt-4 h-3 w-full max-w-xs mx-auto bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full" style={{ width: '94%' }}>
              <div className="h-full w-full bg-white/20 rounded-full" />
            </div>
          </div>
          <p className="text-indigo-200 text-[11px] font-black mt-1.5 uppercase tracking-wider">
            6,450 / 6,750 XP to next rank
          </p>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
