
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, getMonth, getDate, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BirthdayEntry, RelationshipType } from '../types';
import { MONTHS_PT, RELATIONSHIP_LABELS } from '../constants';
import { getChineseZodiac } from '../services/zodiacService';
import { Filter, Users, Shield, Calendar, Sparkles, Gift, X } from 'lucide-react';
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
    // Limpar timer anterior se existir
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (activeDetailUserId === userId) {
      // Se clicar no mesmo, fecha
      setActiveDetailUserId(null);
    } else {
      // Abre detalhes do novo utilizador
      setActiveDetailUserId(userId);
      // Define timer para fechar após 10 segundos
      timerRef.current = setTimeout(() => {
        setActiveDetailUserId(null);
      }, 10000);
    }
  };

  // Limpar timer ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-8">
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
                                  setActiveDetailUserId(null); // Fecha o balão ao abrir a modal
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
