
import React, { useState, useMemo } from 'react';
import { User, Relationship, RelationshipType } from '../types';
import { Gift, Info, Save, Camera, User as UserIcon, Heart, Search } from 'lucide-react';
import { RELATIONSHIP_LABELS } from '../constants';

interface Props {
  user: User;
  allUsers: User[];
  relationships: Relationship[];
  onUpdate: (updated: User) => void;
  onUpdateRelationships: (rels: Relationship[]) => void;
}

const ProfilePage: React.FC<Props> = ({ user, allUsers, relationships, onUpdate, onUpdateRelationships }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'rels'>('info');
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);
  const [relSearch, setRelSearch] = useState('');

  // Filtra as relações do utilizador atual
  const [userRels, setUserRels] = useState<Relationship[]>(
    relationships.filter(r => r.userId === user.id)
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Atualiza utilizador
      onUpdate(formData);
      
      // Atualiza relações: mantemos as relações globais que não pertencem a este utilizador 
      // e substituímos as deste utilizador pelas novas definições
      const otherRels = relationships.filter(r => r.userId !== user.id);
      const updatedGlobalRels = [...otherRels, ...userRels];
      onUpdateRelationships(updatedGlobalRels);
      
      alert('Perfil e relações atualizados com sucesso!');
    } catch (err) {
      alert('Erro ao guardar alterações.');
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
      {/* Seletor de Abas */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <UserIcon className="w-4 h-4" /> Dados e Wishlist
        </button>
        <button
          onClick={() => setActiveTab('rels')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'rels' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Heart className="w-4 h-4" /> Minhas Relações
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'info' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-left-4">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-8 pb-8 -mt-10">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 mb-6 overflow-hidden shadow-lg group relative">
                <img src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Aniversário</label>
                  <input type="date" value={formData.birthdate} onChange={e => setFormData({...formData, birthdate: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="mt-8 p-6 bg-pink-50 border border-pink-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-pink-600 font-bold"><Gift className="w-5 h-5" /> A Minha Wishlist</div>
                <div className="flex gap-3 bg-white/50 p-4 rounded-xl text-pink-800 text-xs">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>O que te faria saltar de alegria? Exemplos: um <strong>Touro Mecânico</strong> para a copa, um <strong>aumento chorudo</strong> (atenção ao GM e Financeiro na lista!), uma massagem de 5h ou uma viagem a Marte. Sê criativo!</p>
                </div>
                <textarea 
                  value={formData.wishlist || ''} 
                  onChange={e => setFormData({...formData, wishlist: e.target.value})} 
                  placeholder="Escreve aqui os teus desejos..." 
                  className="w-full h-32 p-4 bg-white border border-pink-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm resize-none shadow-inner" 
                />
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
