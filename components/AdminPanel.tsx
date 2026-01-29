
import React, { useState, useMemo } from 'react';
import { User, Relationship, RelationshipType } from '../types';
import { getZodiac, getChineseZodiac } from '../services/zodiacService';
import { RELATIONSHIP_LABELS } from '../constants';
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  Users, 
  Link as LinkIcon,
  Plus
} from 'lucide-react';

interface Props {
  users: User[];
  relationships: Relationship[];
  onAdd: (user: User) => void;
  onUpdate: (user: User) => void;
  onDelete: (id: string) => void;
  onUpdateRelationships: (rels: Relationship[]) => void;
}

const AdminPanel: React.FC<Props> = ({ users, relationships, onAdd, onUpdate, onDelete, onUpdateRelationships }) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rels'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [newRel, setNewRel] = useState({ u1: '', u2: '', type: RelationshipType.FRIEND });

  const [formState, setFormState] = useState<Partial<User>>({
    name: '',
    phone: '',
    birthdate: '',
    likes: [],
    isProfilePrivate: false,
    avatarUrl: ''
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.phone.includes(searchTerm)
    );
  }, [users, searchTerm]);

  const resetForm = () => {
    setFormState({
      name: '',
      phone: '',
      birthdate: '',
      likes: [],
      isProfilePrivate: false,
      avatarUrl: ''
    });
    setEditingUser(null);
    setIsFormOpen(false);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormState(user);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(formState.birthdate!);
    const { sign, traits } = getZodiac(date);
    const chinese = getChineseZodiac(date);
    
    const userData: User = {
      ...(formState as User),
      id: editingUser ? editingUser.id : Math.random().toString(36).substr(2, 9),
      zodiacSign: sign,
      zodiacTraits: traits,
      chineseZodiac: chinese,
      likes: formState.likes || [],
    };

    if (editingUser) {
      onUpdate(userData);
    } else {
      onAdd(userData);
    }
    resetForm();
  };

  const handleCreateRel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRel.u1 || !newRel.u2 || newRel.u1 === newRel.u2) return;
    
    const rel: Relationship = {
      id: `rel-admin-${Date.now()}`,
      userId: newRel.u1,
      relatedUserId: newRel.u2,
      type: newRel.type
    };
    onUpdateRelationships([...relationships, rel]);
    setNewRel({ u1: '', u2: '', type: RelationshipType.FRIEND });
  };

  const deleteRel = (id: string) => {
    onUpdateRelationships(relationships.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveSubTab('users')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeSubTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Utilizadores</div>
        </button>
        <button onClick={() => setActiveSubTab('rels')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeSubTab === 'rels' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Relações Globais</div>
        </button>
      </div>

      {activeSubTab === 'users' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Utilizadores na Cloud</h2>
              <p className="text-slate-500 text-xs">A sincronizar com Supabase.</p>
            </div>
            <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
              <UserPlus className="w-5 h-5" /> Novo Utilizador
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Filtrar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Signos</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} className="w-8 h-8 rounded-full border border-slate-200" alt="" />
                          <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">{user.zodiacSign}</span>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">{user.chineseZodiac}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(user)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => onDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-500" /> Novo Vínculo</h3>
            <form onSubmit={handleCreateRel} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={newRel.u1} onChange={e => setNewRel({...newRel, u1: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" required>
                <option value="">Utilizador 1</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={newRel.u2} onChange={e => setNewRel({...newRel, u2: e.target.value})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" required>
                <option value="">Utilizador 2</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={newRel.type} onChange={e => setNewRel({...newRel, type: e.target.value as RelationshipType})} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                {Object.entries(RELATIONSHIP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button type="submit" className="bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm py-2">Criar Relação</button>
            </form>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingUser ? 'Editar' : 'Novo'} Utilizador</h3>
              <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Nome" className="px-4 py-2 bg-slate-50 border rounded-xl" required />
                <input type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} placeholder="Telemóvel" className="px-4 py-2 bg-slate-50 border rounded-xl" required />
                <input type="date" value={formState.birthdate} onChange={e => setFormState({...formState, birthdate: e.target.value})} className="px-4 py-2 bg-slate-50 border rounded-xl col-span-1 md:col-span-2" required />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                {editingUser ? 'Atualizar Dados' : 'Criar Utilizador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
