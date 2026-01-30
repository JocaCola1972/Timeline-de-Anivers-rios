
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
  Plus,
  ArrowRight,
  RefreshCw,
  Database,
  Terminal,
  Copy,
  Check,
  Key,
  Loader2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface Props {
  users: User[];
  relationships: Relationship[];
  onAdd: (user: User) => Promise<void>;
  onUpdate: (user: User) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateRelationships: (rels: Relationship[]) => Promise<void>;
  onSync: () => void;
  isSyncing: boolean;
}

const AdminPanel: React.FC<Props> = ({ users, relationships, onAdd, onUpdate, onDelete, onUpdateRelationships, onSync, isSyncing }) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rels' | 'sql'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newRel, setNewRel] = useState({ u1: '', u2: '', type: RelationshipType.FRIEND });

  const [formState, setFormState] = useState<Partial<User>>({
    name: '',
    phone: '',
    password: '',
    birthdate: '',
    likes: [],
    isProfilePrivate: false,
    avatarUrl: ''
  });

  const sqlSchema = `-- SCRIPT DE CONFIGURAÇÃO FINAL DA BASE DE DADOS (SUPABASE)
-- EXECUTE ESTE SCRIPT NO "SQL EDITOR" DO SUPABASE PARA CORRIGIR TODOS OS ERROS

-- 1. Criar ou Atualizar a Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT,
  birthdate DATE NOT NULL,
  zodiac_sign TEXT,
  zodiac_traits TEXT[],
  chinese_zodiac TEXT,
  avatar_url TEXT,
  likes TEXT[] DEFAULT '{}',
  wishlist TEXT,
  is_profile_private BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT FALSE,
  last_login_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Garantir que as colunas críticas existem (caso a tabela já tenha sido criada antes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wishlist TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- 3. Tabela de Relações
CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  related_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Notificar o sistema para atualizar o cache
NOTIFY pgrst, 'reload schema';`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.phone.includes(searchTerm)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }));
  }, [users, searchTerm]);

  const resetForm = () => {
    setFormState({
      name: '',
      phone: '',
      password: '',
      birthdate: '',
      likes: [],
      isProfilePrivate: false,
      avatarUrl: ''
    });
    setEditingUser(null);
    setIsFormOpen(false);
    setIsSubmitting(false);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormState(user);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
        isProfilePrivate: formState.isProfilePrivate || false
      };

      if (editingUser) {
        await onUpdate(userData);
      } else {
        await onAdd(userData);
      }
      resetForm();
    } catch (error) {
      console.error("Erro no formulário:", error);
      setIsSubmitting(false);
    }
  };

  const handleCreateRel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRel.u1 || !newRel.u2 || newRel.u1 === newRel.u2) {
      alert("Selecione dois utilizadores diferentes.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const rel: Relationship = {
        id: `rel-admin-${Date.now()}`,
        userId: newRel.u1,
        relatedUserId: newRel.u2,
        type: newRel.type
      };
      await onUpdateRelationships([...relationships, rel]);
      setNewRel({ u1: '', u2: '', type: RelationshipType.FRIEND });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Tens a certeza que queres remover este utilizador?")) {
      await onDelete(id);
    }
  };

  const deleteRel = async (id: string) => {
    if (confirm("Deseja remover esta relação?")) {
      await onUpdateRelationships(relationships.filter(r => r.id !== id));
    }
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || "Desconhecido";

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveSubTab('users')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeSubTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Utilizadores</div>
        </button>
        <button onClick={() => setActiveSubTab('rels')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeSubTab === 'rels' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Relações Globais</div>
        </button>
        <button onClick={() => setActiveSubTab('sql')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeSubTab === 'sql' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Configuração SQL</div>
        </button>
      </div>

      {activeSubTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Base de Dados de Equipa</h2>
              <p className="text-slate-500 text-xs">Gestão centralizada de perfis.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onSync} 
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Cloud'}
              </button>
              <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
                <UserPlus className="w-5 h-5" /> Novo Utilizador
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Procurar por nome ou telemóvel..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome / Contacto</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Zodíaco</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} className="w-9 h-9 rounded-xl border border-slate-100" alt="" />
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'sql' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] border-2 border-amber-200 p-8 shadow-xl shadow-amber-50 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Como corrigir o erro de Colunas?</h3>
                <p className="text-sm text-slate-500 font-medium">Siga estes 3 passos para ativar o sistema cloud:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-indigo-600 shadow-sm mb-3">1</span>
                <p className="text-xs font-bold text-slate-700">Copie o script SQL abaixo clicando no botão preto.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-indigo-600 shadow-sm mb-3">2</span>
                <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  Abra o <a href="https://supabase.com/dashboard" target="_blank" className="text-indigo-600 underline">Dashboard Supabase</a> e entre no seu projeto.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-indigo-600 shadow-sm mb-3">3</span>
                <p className="text-xs font-bold text-slate-700">Vá a "SQL Editor", cole o script e clique em "RUN".</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[11px] font-black rounded-xl hover:bg-black transition-all shadow-xl"
                >
                  {copied ? <><Check className="w-4 h-4" /> Copiado com sucesso!</> : <><Copy className="w-4 h-4" /> Copiar Script SQL</>}
                </button>
              </div>
              <pre className="bg-slate-900 text-indigo-300 p-8 pt-16 rounded-[1.5rem] text-[11px] font-mono leading-relaxed overflow-x-auto shadow-inner min-h-[350px]">
                {sqlSchema}
              </pre>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">{editingUser ? 'Editar Perfil' : 'Novo Perfil'}</h3>
              <button onClick={resetForm} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
                  <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Telemóvel</label>
                  <input type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                  <input type="text" value={formState.password || ''} onChange={e => setFormState({...formState, password: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nascimento</label>
                  <input type="date" value={formState.birthdate} onChange={e => setFormState({...formState, birthdate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none" required />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar na Cloud'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
