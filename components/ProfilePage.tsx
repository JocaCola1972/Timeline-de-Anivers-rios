
import React, { useState, useMemo, useEffect } from 'react';
import { User, Relationship, RelationshipType } from '../types';
import { Gift, Info, Save, Camera, User as UserIcon, Heart, Search, RefreshCw, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { RELATIONSHIP_LABELS } from '../constants';
import { getZodiac, getChineseZodiac } from '../services/zodiacService';

interface Props {
  user: User;
  allUsers: User[];
  relationships: Relationship[];
  onUpdate: (updated: User) => Promise<void>;
  onUpdateRelationships: (rels: Relationship[]) => Promise<void>;
  onSync: () => void;
  isSyncing: boolean;
}

const ProfilePage: React.FC<Props> = ({ user, allUsers, relationships, onUpdate, onUpdateRelationships, onSync, isSyncing }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'rels'>('info');
  const [formData, setFormData] = useState<User>({
    ...user,
    likes: user.likes || [],
    zodiacTraits: user.zodiacTraits || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [relSearch, setRelSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData({
      ...user,
      likes: user.likes || [],
      zodiacTraits: user.zodiacTraits || [],
    });
  }, [user]);

  const [userRels, setUserRels] = useState<Relationship[]>(
    relationships.filter(r => r.userId === user.id)
  );

  useEffect(() => {
    setUserRels(relationships.filter(r => r.userId === user.id));
  }, [relationships, user.id]);

  const handleBirthdateChange = (newDateStr: string) => {
    if (!newDateStr) {
      setFormData(prev => ({ ...prev, birthdate: newDateStr }));
      return;
    }
    
    const date = new Date(newDateStr);
    const { sign, traits } = getZodiac(date);
    const chinese = getChineseZodiac(date);
    
    setFormData(prev => ({
      ...prev,
      birthdate: newDateStr,
      zodiacSign: sign,
      zodiacTraits: traits,
      chineseZodiac: chinese
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        likes: formData.likes || [],
        zodiacTraits: formData.zodiacTraits || [],
      };

      await onUpdate(dataToSave);
      
      const otherRels = relationships.filter(r => r.userId !== user.id);
      const updatedGlobalRels = [...otherRels, ...userRels];
      await onUpdateRelationships(updatedGlobalRels);
      
      alert('Perfil e relações atualizados com sucesso!');
    } catch (err) {
      console.error("Erro ao guardar no Perfil:", err);
      alert('Erro ao guardar alterações. Verifique a sua ligação.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateRelationship = (relatedUserId: string, type: RelationshipType | null) => {
    setUserRels(prev => {
      const filtered = prev.filter(r => r.relatedUserId !== relatedUserId);
      if (type === null) return filtered;
      return [...filtered, { 
        id: `rel-${user.id}-${relatedUserId}`, 
        userId: user.id, 
        relatedUserId, 
        type 
      }];
    });
  };

  const filteredUsersForRel = useMemo(() => {
    return allUsers.filter(u => 
      u.id !== user.id && 
      u.name.toLowerCase().includes(relSearch.toLowerCase())
    );
  }, [allUsers, user.id, relSearch]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-white rounded-xl text-indigo-600 shadow-sm ${isSyncing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">Sincronização Cloud</h4>
            <p className="text-[10px] text-indigo-700 font-medium">Atualiza os teus dados com a base de dados central.</p>
          </div>
        </div>
        <button 
          onClick={onSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {isSyncing ? 'A Sincronizar...' : 'Sincronizar Agora'}
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <UserIcon className="w-4 h-4" /> Dados e Wishlist
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rels')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'rels' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Heart className="w-4 h-4" /> Minhas Relações
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'info' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-left-4">
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="px-8 pb-8 -mt-10">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 mb-6 overflow-hidden shadow-lg group relative">
                  <img src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`} className="w-full h-full object-cover" alt="Avatar" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nome</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Aniversário</label>
                    <input 
                      type="date" 
                      value={formData.birthdate} 
                      onChange={e => handleBirthdateChange(e.target.value)} 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <Key className="w-5 h-5" /> Redefinir Password
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password || ''} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="Nova password..." 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-12" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium italic">* Deixa em branco para manter a password atual.</p>
                </div>

                {/* WISHLIST SECTION - UPDATED WITH FUN TEXT */}
                <div className="mt-8 p-8 bg-pink-50 border-2 border-pink-100 rounded-[2.5rem] space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                    <Gift className="w-20 h-20 text-pink-600" />
                  </div>
                  
                  <div className="flex items-center gap-3 text-pink-600">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Gift className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">A Minha Wishlist</h3>
                  </div>

                  <div className="space-y-3 bg-white/60 p-5 rounded-3xl border border-pink-200/50 backdrop-blur-sm shadow-inner">
                    <div className="flex gap-3 text-pink-900 text-[13px] leading-relaxed font-medium">
                      <div className="mt-1"><Info className="w-4 h-4 flex-shrink-0 text-pink-500" /></div>
                      <p>
                        O que te faria saltar de alegria este ano? Sê criativo! <br/> 
                        Podes pedir um <strong>touro mecânico</strong> para a sala de reuniões, uma <strong>máquina de pipocas</strong> infinita, ou até um <strong>aumento de ordenado</strong>...
                      </p>
                    </div>
                    
                    <div className="flex gap-3 items-start p-3 bg-pink-100/50 rounded-2xl border border-pink-200/40">
                      <AlertCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-pink-800 font-bold italic leading-snug">
                        Nota de Segurança: Lembra-te que o GM e o Financeiro também estão na lista de utilizadores... pede o aumento por tua conta e risco! 😂
                      </p>
                    </div>

                    <div className="pt-1">
                      <p className="text-[11px] text-pink-700/60 font-bold">
                        Outras sugestões: Um bilhete de ida para Marte, um café que nunca arrefece ou apenas um abraço (e um jantar pago).
                      </p>
                    </div>
                  </div>

                  <textarea 
                    value={formData.wishlist || ''} 
                    onChange={e => setFormData({...formData, wishlist: e.target.value})} 
                    placeholder="Ex: 1. Um touro mecânico (com seguro); 2. Paz no mundo; 3. Um almoço no melhor sushi da cidade..." 
                    className="w-full h-40 p-5 bg-white border-2 border-pink-100 rounded-[1.8rem] outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-300 text-sm resize-none shadow-xl transition-all font-medium placeholder:text-pink-200" 
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Círculo de Conexões</h3>
                <p className="text-[10px] text-slate-500">Diz-nos como te relacionas com a equipa.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Procurar..." 
                  value={relSearch} 
                  onChange={e => setRelSearch(e.target.value)} 
                  className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none w-40 md:w-56" 
                />
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {filteredUsersForRel.map(u => {
                const currentRel = userRels.find(r => r.relatedUserId === u.id);
                return (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} className="w-10 h-10 rounded-xl" alt="" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{u.name}</p>
                        <p className="text-[9px] font-bold text-indigo-500 uppercase">{u.zodiacSign}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                      {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
                        <button 
                          key={val} 
                          type="button" 
                          onClick={() => updateRelationship(u.id, currentRel?.type === val ? null : val as RelationshipType)} 
                          className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all ${currentRel?.type === val ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSaving} 
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> 
          {isSaving ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
