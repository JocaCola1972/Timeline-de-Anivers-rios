
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getMonth, getDate, isSameDay, getYear } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BirthdayEntry, RelationshipType, User } from '../types';
import { MONTHS_PT, RELATIONSHIP_LABELS, ZODIAC_SIGNS } from '../constants';
import { getChineseZodiac } from '../services/zodiacService';
import { Filter, Users, Shield, Calendar, Sparkles, Gift, X, BarChart3, PieChart, TrendingUp, Info } from 'lucide-react';
import DailyHoroscope from './DailyHoroscope';

interface Props {
  users: BirthdayEntry[];
  viewerId: string;
}

const WishlistModal: React.FC<{ user: BirthdayEntry; onClose: () => void }> = ({ user, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative">
      <div className="h-24 bg-gradient-to-r from-pink-500 to-indigo-600 flex items-center justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"><X className="w-5 h-5" /></button>
        <Gift className="w-10 h-10 text-white" />
      </div>
      <div className="p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Desejos de {user.name}</h3>
        <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 italic text-slate-700 text-sm leading-relaxed whitespace-pre-wrap text-left shadow-inner">
          {user.wishlist || "Ainda não pediu nada... mas um gesto simpático conta sempre! ☕️"}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg">Fechar</button>
      </div>
    </motion.div>
  </div>
);

const TeamInsights: React.FC<{ users: User[] }> = ({ users }) => {
  const stats = useMemo(() => {
    const zodiacCounts: Record<string, number> = {};
    const monthCounts: Record<number, number> = {};
    const generations = {
      'Boomers': 0, // 1946-1964
      'Gen X': 0,    // 1965-1980
      'Millennials': 0, // 1981-1996
      'Gen Z': 0,    // 1997-2012
      'Gen Alpha': 0 // 2013+
    };

    users.forEach(u => {
      // Zodiac
      zodiacCounts[u.zodiacSign] = (zodiacCounts[u.zodiacSign] || 0) + 1;
      
      // Month
      const m = getMonth(new Date(u.birthdate));
      monthCounts[m] = (monthCounts[m] || 0) + 1;
      
      // Generation
      const year = getYear(new Date(u.birthdate));
      if (year >= 1946 && year <= 1964) generations['Boomers']++;
      else if (year >= 1965 && year <= 1980) generations['Gen X']++;
      else if (year >= 1981 && year <= 1996) generations['Millennials']++;
      else if (year >= 1997 && year <= 2012) generations['Gen Z']++;
      else if (year >= 2013) generations['Gen Alpha']++;
    });

    return { zodiacCounts, monthCounts, generations };
  }, [users]);

  const maxMonthVal = Math.max(...Object.values(stats.monthCounts), 1);
  const maxZodiacVal = Math.max(...Object.values(stats.zodiacCounts), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
      {/* Gerações */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Demografia da Equipa</h3>
        </div>
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          {Object.entries(stats.generations).filter(([_, count]) => count > 0).map(([gen, count]) => (
            <div key={gen} className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-slate-500">{gen}</span>
                <span className="text-indigo-600">{count} {count === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / users.length) * 100}%` }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meses de Festa */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Meses de Festa</h3>
        </div>
        <div className="flex items-end justify-between h-32 gap-1 px-2">
          {MONTHS_PT.map((m, i) => {
            const count = stats.monthCounts[i] || 0;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-2 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / maxMonthVal) * 100}%` }}
                  className={`w-full rounded-t-md transition-all ${count > 0 ? 'bg-amber-400' : 'bg-slate-50'}`}
                />
                <span className="text-[8px] font-bold text-slate-400 uppercase transform -rotate-45 md:rotate-0">{m.slice(0, 3)}</span>
                {count > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Signos Dominantes */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Energia Astral</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(stats.zodiacCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([sign, count]) => (
              <div key={sign} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between group hover:bg-purple-50 transition-colors">
                <span className="text-[10px] font-bold text-slate-700">{sign}</span>
                <span className="text-xs font-black text-purple-600 bg-white w-6 h-6 rounded-lg flex items-center justify-center shadow-sm">{count}</span>
              </div>
            ))}
          {Object.keys(stats.zodiacCounts).length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 text-[10px] italic">Sem dados astrais.</div>
          )}
        </div>
        <p className="text-[9px] text-slate-400 mt-4 text-center leading-tight">
          Estes são os signos mais comuns na equipa. <br/>A harmonia entre elementos está no auge!
        </p>
      </div>
    </div>
  );
};

const BirthdayTimeline: React.FC<Props> = ({ users, viewerId }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');
  const [activeDetailUserId, setActiveDetailUserId] = useState<string | null>(null);
  const [wishlistUser, setWishlistUser] = useState<BirthdayEntry | null>(null);
  const timerRef = useRef<any>(null);

  const viewer = users.find(u => u.id === viewerId);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const m = selectedMonth === 'all' || getMonth(new Date(user.birthdate)) === selectedMonth;
      const r = selectedRelation === 'all' || user.relationToViewer === selectedRelation;
      return m && r;
    });
  }, [users, selectedMonth, selectedRelation]);

  const handleUserClick = (userId: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (activeDetailUserId === userId) {
      setActiveDetailUserId(null);
    } else {
      setActiveDetailUserId(userId);
      timerRef.current = setTimeout(() => {
        setActiveDetailUserId(null);
      }, 10000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" /> 
            Timeline Anual
          </h2>
          <div className="flex flex-wrap gap-2">
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))} 
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">Todos os Meses</option>
              {MONTHS_PT.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-4 no-scrollbar min-h-[300px] items-end px-2">
          {MONTHS_PT.map((name, i) => {
            const mUsers = filteredUsers.filter(u => getMonth(new Date(u.birthdate)) === i);
            if (selectedMonth !== 'all' && i !== selectedMonth) return null;
            
            return (
              <div key={name} className="flex flex-col border-l border-slate-100 pl-4 min-w-[140px] last:pr-4">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">{name}</span>
                <div className="flex flex-wrap gap-4 items-end h-48">
                  {mUsers.sort((a, b) => getDate(new Date(a.birthdate)) - getDate(new Date(b.birthdate))).map(user => {
                    const isToday = isSameDay(new Date(), new Date(user.birthdate));
                    const isActive = activeDetailUserId === user.id;

                    return (
                      <div 
                        key={user.id} 
                        className="relative group cursor-pointer select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user.id);
                        }}
                      >
                        {isToday && (
                          <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-50 scale-125" />
                        )}
                        
                        <div className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-white shadow-md transition-all duration-300 ${isActive ? 'scale-110 border-indigo-600 ring-4 ring-indigo-50' : (isToday ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300')}`}>
                          <img 
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                            className="w-full h-full object-cover" 
                            alt={user.name}
                          />
                        </div>
                        
                        {user.wishlist && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                            <Gift className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}

                        <AnimatePresence>
                          {isActive && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                              animate={{ opacity: 1, y: 0, scale: 1 }} 
                              exit={{ opacity: 0, y: 10, scale: 0.9 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-center"
                            >
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45"></div>
                              
                              <p className="font-bold text-slate-800 text-sm mb-1">{user.name}</p>
                              <p className="text-[10px] text-indigo-500 font-bold uppercase mb-3">
                                {format(new Date(user.birthdate), "d 'de' MMMM", { locale: pt })}
                              </p>
                              
                              <div className="flex flex-col gap-1 mb-4">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center justify-center gap-1 bg-slate-50 py-1 rounded-md">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" /> 
                                  {user.zodiacSign} &bull; {getChineseZodiac(new Date(user.birthdate))}
                                </div>
                              </div>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWishlistUser(user);
                                  setActiveDetailUserId(null);
                                }} 
                                className="w-full py-2.5 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-pink-600 active:scale-95 transition-all shadow-md shadow-pink-100"
                              >
                                <Gift className="w-3.5 h-3.5" /> Ver Wishlist
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div className="text-center mt-2">
                          <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
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

      {/* Estatísticas da Equipa */}
      <TeamInsights users={users} />

      {wishlistUser && (
        <WishlistModal 
          user={wishlistUser} 
          onClose={() => setWishlistUser(null)} 
        />
      )}
      
      {viewer && (
        <DailyHoroscope 
          westernSign={viewer.zodiacSign} 
          chineseSign={getChineseZodiac(new Date(viewer.birthdate))} 
        />
      )}
    </div>
  );
};

export default BirthdayTimeline;
