
import React, { useState } from 'react';
import { User, Relationship, RelationshipType } from '../types';
import { Gift, Info, Save, Camera, User as UserIcon, Heart, Lock, Eye } from 'lucide-react';

interface Props {
  user: User;
  allUsers: User[];
  relationships: Relationship[];
  onUpdate: (updated: User) => void;
  onUpdateRelationships: (rels: Relationship[]) => void;
}

const ProfilePage: React.FC<Props> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      alert('Perfil atualizado!');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8 -mt-10">
          <div className="w-24 h-24 rounded-2xl border-4 border-white bg-slate-100 mb-6 overflow-hidden shadow-lg group relative">
            <img src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
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
            <textarea value={formData.wishlist || ''} onChange={e => setFormData({...formData, wishlist: e.target.value})} placeholder="Escreve aqui os teus desejos..." className="w-full h-32 p-4 bg-white border border-pink-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm resize-none shadow-inner" />
          </div>

          <button type="submit" disabled={isSaving} className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> {isSaving ? 'A guardar...' : 'Guardar Perfil'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
