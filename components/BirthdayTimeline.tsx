
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed parseISO from date-fns as it was reported as missing; using new Date() instead for ISO strings.
import { format, getMonth, getDate, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BirthdayEntry, RelationshipType, User } from '../types';
import { MONTHS_PT, RELATIONSHIP_LABELS } from '../constants';
import { getChineseZodiac } from '../services/zodiacService';
import { Filter, Users, Shield, Calendar, Sparkles, Gift, X } from 'lucide-react';
import DailyHoroscope from './DailyHoroscope';

interface Props {
  users: BirthdayEntry[];
  viewerId: string;
}

const WishlistModal: React.FC<{ user: BirthdayEntry; onClose: () => void }> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-4xl">🎁</div>
        </div>
        
        <div className="p-8 pt-12 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-3xl border-4 border-white overflow-hidden shadow-xl bg-slate-100">
              <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Prendas para {user.name}</h3>
              <p className="text-sm text-slate-500 font-medium">O que me faria saltar de alegria no meu dia!</p>
            </div>
            
            <div className="bg-pink-50/50 rounded-3xl p-6 border border-pink-100/50 min-h-[120px] flex items-center justify-center">
              {user.wishlist ? (
                <p className="text-slate-700 italic leading-relaxed whitespace-pre-wrap font-medium">
                  "{user.wishlist}"
                </p>
              ) : (
                <p className="text-slate-400 text-sm font-medium">
                  {user.name} ainda não definiu a sua wishlist. <br/>Talvez um café e um abraço? ☕️
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg"
              >
                Vou tratar disso! 🚀
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const BirthdayTimeline: React.FC<Props> = ({ users, viewerId }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [wishlistUser, setWishlistUser] = useState<BirthdayEntry | null>(null);

  const viewer = useMemo(() => users.find(u => u.id === viewerId), [users, viewerId]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Using new Date() as parseISO was missing from date-fns exports
      const monthMatch = selectedMonth === 'all' || getMonth(new Date(user.birthdate)) === selectedMonth;
      const relationMatch = selectedRelation === 'all' || user.relationToViewer === selectedRelation;
      return monthMatch && relationMatch;
    });
  }, [users, selectedMonth, selectedRelation]);

  const today = new Date();

  return (
    <div className="space-y-8">
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500" />
              Timeline de Aniversários
            </h2>
            <p className="text-slate-500 text-sm">Acompanha as datas especiais do teu círculo.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-transparent text-sm font-medium focus:outline-none p-1 pr-4"
              >
                <option value="all">Todos os Meses</option>
                {MONTHS_PT.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <Users className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={selectedRelation}
                onChange={(e) => setSelectedRelation(e.target.value as any)}
                className="bg-transparent text-sm font-medium focus:outline-none p-1 pr-4"
              >
                <option value="all">Todas as Relações</option>
                {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto pb-8 -mx-6 px-6 no-scrollbar">
          <div className="flex items-end min-w-max h-80 gap-8">
            {MONTHS_PT.map((monthName, mIndex) => {
              const monthUsers = filteredUsers.filter(u => getMonth(new Date(u.birthdate)) === mIndex);
              if (selectedMonth !== 'all' && mIndex !== selectedMonth) return null;

              return (
                <div key={monthName} className="flex flex-col h-full border-l border-slate-100 pl-4 min-w-[150px]">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-auto mt-2">
                    {monthName}
                  </span>
                  
                  <div className="flex flex-wrap items-end gap-3 h-52 mt-4">
                    {monthUsers.sort((a, b) => getDate(new Date(a.birthdate)) - getDate(new Date(b.birthdate))).map((user) => {
                      const isBirthdayToday = isSameDay(today, new Date(user.birthdate));
                      const isPrivate = user.isProfilePrivate && !user.relationToViewer && user.id !== viewerId;
                      
                      return (
                        <div
                          key={user.id}
                          className="relative group cursor-pointer"
                          onMouseEnter={() => !isPrivate && setHoveredUser(user.id)}
                          onMouseLeave={() => setHoveredUser(null)}
                        >
                          {isBirthdayToday && (
                            <div className="absolute inset-0 -m-1 rounded-full bg-indigo-400 animate-ping opacity-75" />
                          )}

                          <div className={`relative z-10 w-12 h-12 rounded-full border-2 overflow-hidden bg-white ${isBirthdayToday ? 'border-indigo-500 scale-110 shadow-lg' : 'border-slate-200'}`}>
                            {isPrivate ? (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Shield className="w-6 h-6" />
                              </div>
                            ) : (
                              <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          <AnimatePresence>
                            {hoveredUser === user.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-56 bg-white shadow-2xl border border-slate-100 rounded-3xl p-5 text-center"
                              >
                                <div className="mb-3">
                                  <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                  <p className="text-xs text-indigo-500 font-bold mt-0.5">
                                    {format(new Date(user.birthdate), "d 'de' MMMM", { locale: pt })}
                                  </p>
                                </div>
                                
                                <div className="space-y-1.5 mb-4">
                                  <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg">
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                      {user.zodiacSign}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                                      {user.chineseZodiac || getChineseZodiac(new Date(user.birthdate))}
                                    </span>
                                  </div>
                                </div>

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWishlistUser(user);
                                  }}
                                  className="w-full py-2 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-pink-100"
                                >
                                  <Gift className="w-3 h-3" /> Ver Wishlist
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="mt-2 text-center">
                            <span className="text-[10px] font-bold text-slate-600">
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
      </div>

      <AnimatePresence>
        {wishlistUser && (
          <WishlistModal user={wishlistUser} onClose={() => setWishlistUser(null)} />
        )}
      </AnimatePresence>

      {viewer && (
        <DailyHoroscope 
          westernSign={viewer.zodiacSign} 
          chineseSign={viewer.chineseZodiac || getChineseZodiac(new Date(viewer.birthdate))} 
        />
      )}
    </div>
  );
};

export default BirthdayTimeline;
