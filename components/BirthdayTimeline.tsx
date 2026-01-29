
import React, { useState, useMemo } from 'react';
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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"><X className="w-5 h-5" /></button>
        <Gift className="w-10 h-10 text-white" />
      </div>
      <div className="p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Desejos de {user.name}</h3>
        <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 italic text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
          {user.wishlist || "Ainda não pediu nada... mas um gesto simpático conta sempre! ☕️"}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all">Fechar</button>
      </div>
    </motion.div>
  </div>
);

const BirthdayTimeline: React.FC<Props> = ({ users, viewerId }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [wishlistUser, setWishlistUser] = useState<BirthdayEntry | null>(null);

  const viewer = users.find(u => u.id === viewerId);
  const filteredUsers = users.filter(user => {
    const m = selectedMonth === 'all' || getMonth(new Date(user.birthdate)) === selectedMonth;
    const r = selectedRelation === 'all' || user.relationToViewer === selectedRelation;
    return m && r;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> Timeline Anual</h2>
          <div className="flex gap-2">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none">
              <option value="all">Todos os Meses</option>
              {MONTHS_PT.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-4 no-scrollbar min-h-[280px] items-end">
          {MONTHS_PT.map((name, i) => {
            const mUsers = filteredUsers.filter(u => getMonth(new Date(u.birthdate)) === i);
            if (selectedMonth !== 'all' && i !== selectedMonth) return null;
            return (
              <div key={name} className="flex flex-col border-l border-slate-100 pl-4 min-w-[140px]">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">{name}</span>
                <div className="flex flex-wrap gap-3 items-end h-48">
                  {mUsers.map(user => (
                    <div key={user.id} className="relative group cursor-pointer" onMouseEnter={() => setHoveredUser(user.id)} onMouseLeave={() => setHoveredUser(null)}>
                      {isSameDay(new Date(), new Date(user.birthdate)) && <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-50 scale-125" />}
                      <div className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-white shadow-sm transition-transform group-hover:scale-110 ${isSameDay(new Date(), new Date(user.birthdate)) ? 'border-indigo-500' : 'border-slate-200'}`}>
                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} className="w-full h-full object-cover" />
                      </div>
                      
                      {user.wishlist && <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center"><Gift className="w-2 h-2 text-white" /></div>}

                      <AnimatePresence>
                        {hoveredUser === user.id && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-center">
                            <p className="font-bold text-slate-800 text-sm mb-1">{user.name}</p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase mb-3">{format(new Date(user.birthdate), "d 'de' MMMM", { locale: pt })}</p>
                            
                            <div className="space-y-1 mb-4">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center justify-center gap-1"><Sparkles className="w-2 h-2" /> {user.zodiacSign} &bull; {getChineseZodiac(new Date(user.birthdate))}</div>
                            </div>

                            <button onClick={() => setWishlistUser(user)} className="w-full py-2 bg-pink-500 text-white rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 hover:bg-pink-600 shadow-md shadow-pink-100">
                              <Gift className="w-3 h-3" /> Ver Wishlist
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="text-center mt-2"><span className="text-[10px] font-bold text-slate-500">{getDate(new Date(user.birthdate))}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {wishlistUser && <WishlistModal user={wishlistUser} onClose={() => setWishlistUser(null)} />}
      {viewer && <DailyHoroscope westernSign={viewer.zodiacSign} chineseSign={getChineseZodiac(new Date(viewer.birthdate))} />}
    </div>
  );
};

export default BirthdayTimeline;
