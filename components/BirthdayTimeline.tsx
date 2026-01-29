
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, getMonth, getDate, isSameDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { BirthdayEntry, RelationshipType } from '../types';
import { MONTHS_PT, RELATIONSHIP_LABELS } from '../constants';
import { getChineseZodiac } from '../services/zodiacService';
import { Filter, Users, Shield, Calendar, Sparkles } from 'lucide-react';

interface Props {
  users: BirthdayEntry[];
  viewerId: string;
}

const BirthdayTimeline: React.FC<Props> = ({ users, viewerId }) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedRelation, setSelectedRelation] = useState<RelationshipType | 'all'>('all');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const monthMatch = selectedMonth === 'all' || getMonth(parseISO(user.birthdate)) === selectedMonth;
      const relationMatch = selectedRelation === 'all' || user.relationToViewer === selectedRelation;
      return monthMatch && relationMatch;
    });
  }, [users, selectedMonth, selectedRelation]);

  const today = new Date();

  return (
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
        <div className="flex items-end min-w-max h-72 gap-8">
          {MONTHS_PT.map((monthName, mIndex) => {
            const monthUsers = filteredUsers.filter(u => getMonth(parseISO(u.birthdate)) === mIndex);
            if (selectedMonth !== 'all' && mIndex !== selectedMonth) return null;

            return (
              <div key={monthName} className="flex flex-col h-full border-l border-slate-100 pl-4 min-w-[150px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-auto mt-2">
                  {monthName}
                </span>
                
                <div className="flex flex-wrap items-end gap-3 h-48 mt-4">
                  {monthUsers.sort((a, b) => getDate(parseISO(a.birthdate)) - getDate(parseISO(b.birthdate))).map((user) => {
                    const isBirthdayToday = isSameDay(today, parseISO(user.birthdate));
                    const isPrivate = user.isProfilePrivate && !user.relationToViewer && user.id !== viewerId;
                    
                    return (
                      <div
                        key={user.id}
                        className="relative group cursor-pointer"
                        onMouseEnter={() => !isPrivate && setHoveredUser(user.id)}
                        onMouseLeave={() => setHoveredUser(null)}
                      >
                        {/* Birthday Pulse */}
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

                        {/* Tooltip Detalhado */}
                        <AnimatePresence>
                          {hoveredUser === user.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-52 bg-white shadow-2xl border border-slate-100 rounded-2xl p-4 text-center"
                            >
                              <div className="mb-2">
                                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                <p className="text-xs text-indigo-500 font-bold mt-0.5">
                                  {format(parseISO(user.birthdate), "d 'de' MMMM", { locale: pt })}
                                </p>
                              </div>
                              
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg">
                                  <Sparkles className="w-3 h-3 text-indigo-400" />
                                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                    {user.zodiacSign}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
                                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                                    {user.chineseZodiac || getChineseZodiac(parseISO(user.birthdate))}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="mt-2 text-center">
                          <span className="text-[10px] font-bold text-slate-600">
                            {getDate(parseISO(user.birthdate))}
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
  );
};

export default BirthdayTimeline;
