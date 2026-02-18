
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getMonth, getDate, isSameDay, getYear } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BirthdayEntry, RelationshipType, User } from '../types';
import { MONTHS_PT, RELATIONSHIP_LABELS, ZODIAC_SIGNS } from '../constants';
import { getChineseZodiac } from '../services/zodiacService';
import { Filter, Users, Shield, Calendar, Sparkles, Gift, X, BarChart3, PieChart, TrendingUp, Info, ChevronRight } from 'lucide-react';
import DailyHoroscope from './DailyHoroscope';

interface Props {
  users: BirthdayEntry[];
  viewerId: string;
}

const BirthdayCelebrationEffect = () => {
  const colors = ['bg-amber-400', 'bg-pink-500', 'bg-indigo-500', 'bg-emerald-400', 'bg-red-500'];
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Aura Rings */}
      <motion.div
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-amber-400/50"
      />
      <motion.div
        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-pink-400/50"
      />
      <motion.div
        animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeOut" }}
        className="absolute inset-0 rounded-full border-2 border-indigo-400/50"
      />

      {/* Firework Particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ 
            x: Math.cos((i * 36) * Math.PI / 180) * 70,
            y: Math.sin((i * 36) * Math.PI / 180) * 70,
            scale: [0, 1, 0.5, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity, 
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
          className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full -ml-1 -mt-1 shadow-sm ${colors[i % colors.length]}`}
        />
      ))}
      
      {/* Extra Sparkle Bits */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{ 
            rotate: [0, 180, 360],
            scale: [0.5, 1.2, 0.5],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          className="absolute top-0 left-0"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }}
        >
          <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
        </motion.div>
      ))}
    </div>
  );
};

const WishlistModal: React.FC<{ user: BirthdayEntry; onClose: () => void }> = ({ user, onClose }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative">
      <div className="h-28 bg-gradient-to-r from-pink-500 to-indigo-600 flex items-center justify-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"><X className="w-5 h-5" /></button>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Gift className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="p-8 text-center space-y-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">Desejos de {user.name}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Lista de Presentes</p>
        </div>
        <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100 italic text-slate-700 text-sm leading-relaxed whitespace-pre-wrap text-left shadow-inner">
          {user.wishlist || "Ainda não pediu nada... mas um gesto simpático conta sempre! ☕️"}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200">Entendido!</button>
      </div>
    </motion.div>
  </div>
);

const UserDetailModal: React.FC<{ user: BirthdayEntry; onClose: () => void; onShowWishlist: () => void }> = ({ user, onClose, onShowWishlist }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
    <motion.div 
      initial={{ y: 20, opacity: 0, scale: 0.95 }} 
      animate={{ y: 0, opacity: 1, scale: 1 }} 
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
    >
      <div className="relative h-32 bg-slate-50">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="px-8 pb-8 -mt-16 text-center space-y-4">
        <div className="relative inline-block">
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
            className="w-32 h-32 rounded-[2rem] border-8 border-white shadow-xl object-cover mx-auto" 
            alt={user.name} 
          />
          {isSameDay(new Date(), new Date(user.birthdate)) && (
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800">{user.name}</h3>
          <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">
            {format(new Date(user.birthdate), "d 'de' MMMM", { locale: pt })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Signo</p>
            <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> {user.zodiacSign}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Chinês</p>
            <p className="text-xs font-bold text-slate-700">
              {getChineseZodiac(new Date(user.birthdate))}
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button 
            onClick={onShowWishlist}
            className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 active:scale-95"
          >
            <Gift className="w-5 h-5" /> Ver Wishlist
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

const TeamInsights: React.FC<{ users: User[] }> = ({ users }) => {
  const stats = useMemo(() => {
    const zodiacCounts: Record<string, number> = {};
    const monthCounts: Record<number, number> = {};
    // Fix: Explicitly type generations record to avoid 'unknown' types in Object.entries
    const generations: Record<string, number> = {
      'Boomers': 0, 
      'Gen X': 0,   
      'Millennials': 0, 
      'Gen Z': 0,   
      'Gen Alpha': 0
    };

    users.forEach(u => {
      zodiacCounts[u.zodiacSign] = (zodiacCounts[u.zodiacSign] || 0) + 1;
      const m = getMonth(new Date(u.birthdate));
      monthCounts[m] = (monthCounts[m] || 0) + 1;
      const year = getYear(new Date(u.birthdate));
      if (year >= 1946 && year <= 1964) generations['Boomers']++;
      else if (year >= 1965 && year <= 1980) generations['Gen X']++;
      else if (year >= 1981 && year <= 1996) generations['Millennials']++;
      else if (year >= 1997 && year <= 2012) generations['Gen Z']++;
      else if (year >= 2013) generations['Gen Alpha']++;
    });

    return { zodiacCounts, monthCounts, generations };
  }, [users]);

  // Fix: Cast Object.values to number[] to resolve spreading 'unknown' types into Math.max
  const maxMonthVal = Math.max(...(Object.values(stats.monthCounts) as number[]), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
      {/* Demografia Card */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600"><Users className="w-5 h-5" /></div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Demografia</h3>
            <p className="text-[10px] text-slate-400 font-bold">Equilíbrio Geracional</p>
          </div>
        </div>
        <div className="space-y-5 flex-1 flex flex-col justify-center">
          {Object.entries(stats.generations).filter(([_, count]) => (count as number) > 0).map(([gen, count]) => (
            <div key={gen} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                <span className="text-slate-600">{gen}</span>
                <span className="text-indigo-600">{count} {count === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <motion.div initial={{ width: 0 }} animate={{ width: `${((count as number) / users.length) * 100}%` }} className="h-full bg-indigo-500 rounded-full shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meses de Festa Card */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><Calendar className="w-5 h-5" /></div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Meses de Festa</h3>
            <p className="text-[10px] text-slate-400 font-bold">Volume de Aniversários</p>
          </div>
        </div>
        <div className="flex items-end justify-between h-48 gap-1.5 px-1 relative">
          {MONTHS_PT.map((m, i) => {
            const count = stats.monthCounts[i] || 0;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-3 group h-full relative">
                <div className="absolute top-0 w-full bg-slate-50 rounded-lg h-[calc(100%-30px)] -z-10 border border-slate-100/50" />
                <div className="flex-1 w-full flex flex-col justify-end">
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${(count / maxMonthVal) * 100}%` }} 
                    className={`w-full rounded-lg transition-all relative z-10 ${count > 0 ? 'bg-amber-400 shadow-[0_-2px_10px_rgba(251,191,36,0.3)]' : 'bg-transparent'}`} 
                  />
                </div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter h-[20px] flex items-center">
                  {m.slice(0, 3)}
                </span>
                {count > 0 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 shadow-2xl">
                    {count} {count === 1 ? 'Aniversário' : 'Aniversários'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Energia Astral Card */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><Sparkles className="w-5 h-5" /></div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Energia Astral</h3>
            <p className="text-[10px] text-slate-400 font-bold">Signos Dominantes</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats.zodiacCounts).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 4).map(([sign, count]) => (
            <div key={sign} className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:bg-purple-50 hover:border-purple-100 transition-all">
              <span className="text-xs font-black text-slate-700">{sign}</span>
              <span className="text-xs font-black text-purple-600 bg-white w-7 h-7 rounded-xl flex items-center justify-center shadow-sm border border-purple-50">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 items-center">
          <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <p className="text-[10px] text-purple-700 font-bold leading-tight">A harmonia astral da equipa está em alta. O cosmos sorri para os vossos projetos!</p>
        </div>
      </div>
    </div>
  );
};

const BirthdayTimeline: React.FC<Props> = ({ users, viewerId }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [activeDetailUser, setActiveDetailUser] = useState<BirthdayEntry | null>(null);
  const [wishlistUser, setWishlistUser] = useState<BirthdayEntry | null>(null);

  const viewer = users.find(u => u.id === viewerId);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      return selectedMonth === 'all' || getMonth(new Date(user.birthdate)) === selectedMonth;
    });
  }, [users, selectedMonth]);

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-indigo-500" /> 
              Timeline Anual
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Celebrações de Equipa</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))} 
              className="text-xs font-black bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            >
              <option value="all">Todos os Meses</option>
              {MONTHS_PT.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-12 pb-6 no-scrollbar min-h-[350px] items-end px-2">
          {MONTHS_PT.map((name, i) => {
            const mUsers = filteredUsers.filter(u => getMonth(new Date(u.birthdate)) === i);
            if (selectedMonth !== 'all' && i !== selectedMonth) return null;
            
            return (
              <div key={name} className="flex flex-col border-l-2 border-slate-50 pl-6 min-w-[160px] last:pr-6 group">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-12 group-hover:text-indigo-400 transition-colors">{name}</span>
                <div className="flex flex-wrap gap-5 items-end h-56">
                  {/* Fix: Wrap arithmetic operands in Number() or cast to number to ensure valid subtraction in sort */}
                  {mUsers.sort((a, b) => Number(getDate(new Date(a.birthdate))) - Number(getDate(new Date(b.birthdate)))).map(user => {
                    const isToday = isSameDay(new Date(), new Date(user.birthdate));

                    return (
                      <div 
                        key={user.id} 
                        className="relative group cursor-pointer select-none"
                        onClick={() => setActiveDetailUser(user)}
                      >
                        {isToday && <BirthdayCelebrationEffect />}
                        
                        <motion.div 
                          animate={isToday ? { 
                            y: [0, -8, 0],
                            rotate: [0, -2, 2, 0]
                          } : {}}
                          transition={isToday ? {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          } : {}}
                          className={`w-16 h-16 rounded-[1.5rem] border-2 overflow-hidden bg-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-indigo-100 relative z-10 ${isToday ? 'border-amber-400 ring-4 ring-amber-50 shadow-amber-200' : 'border-slate-100 hover:border-indigo-200'}`}
                        >
                          <img 
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                            className="w-full h-full object-cover" 
                            alt={user.name}
                          />
                        </motion.div>
                        
                        {user.wishlist && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-lg border-2 border-white flex items-center justify-center shadow-md z-20">
                            <Gift className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className="text-center mt-3">
                          <span className={`text-[11px] font-black transition-colors ${isToday ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {getDate(new Date(user.birthdate))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {viewer && (
        <DailyHoroscope 
          westernSign={viewer.zodiacSign} 
          chineseSign={getChineseZodiac(new Date(viewer.birthdate))} 
        />
      )}

      <TeamInsights users={users} />

      <AnimatePresence>
        {activeDetailUser && (
          <UserDetailModal 
            user={activeDetailUser} 
            onClose={() => setActiveDetailUser(null)} 
            onShowWishlist={() => {
              setWishlistUser(activeDetailUser);
              setActiveDetailUser(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wishlistUser && (
          <WishlistModal 
            user={wishlistUser} 
            onClose={() => setWishlistUser(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BirthdayTimeline;
