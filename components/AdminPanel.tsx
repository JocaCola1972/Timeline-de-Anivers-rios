
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
  Loader2
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

  const sqlSchema = `-- SCRIPT DE CONFIGURAÇÃO DA BASE DE DADOS (SUPABASE)

-- 1. Tabela de Utilizadores
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Tabela de Relações
CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  related_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Atualização (Caso falte a coluna wishlist ou password)
ALTER TABLE users ADD COLUMN IF NOT EXISTS wishlist TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- 4. Atualizar Cache do PostgREST
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
      // O erro já é tratado no App.tsx com um alert, mas paramos o loading aqui
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
      alert("Vínculo criado!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Tens a certeza que queres remover este utilizador e todos os seus dados?")) {
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
              <p className="text-slate-500 text-xs">Gestão centralizada de perfis (Ordenação Alfabética).</p>
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
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded uppercase">{user.zodiacSign}</span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase">{user.chineseZodiac}</span>
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

      {activeSubTab === 'rels' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><Plus className="w-4 h-4 text-indigo-500" /> Registar Novo Vínculo</h3>
            <form onSubmit={handleCreateRel} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={newRel.u1} onChange={e => setNewRel({...newRel, u1: e.target.value})} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold" required>
                <option value="">De (Utilizador)...</option>
                {[...users].sort((a,b) => a.name.localeCompare(b.name)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={newRel.u2} onChange={e => setNewRel({...newRel, u2: e.target.value})} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold" required>
                <option value="">Para (Alvo)...</option>
                {[...users].sort((a,b) => a.name.localeCompare(b.name)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={newRel.type} onChange={e => setNewRel({...newRel, type: e.target.value as RelationshipType})} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold">
                {Object.entries(RELATIONSHIP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-xs py-2.5 shadow-md shadow-indigo-100 flex items-center justify-center">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Relação'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vínculos Ativos no Sistema ({relationships.length})</h3>
              <button onClick={onSync} disabled={isSyncing} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {relationships.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic font-medium">Nenhuma relação registada globalmente.</div>
              ) : (
                relationships.map(rel => (
                  <div key={rel.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-slate-700">{getUserName(rel.userId)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{RELATIONSHIP_LABELS[rel.type]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-slate-700">{getUserName(rel.relatedUserId)}</span>
                    </div>
                    <button onClick={() => deleteRel(rel.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'sql' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl text-white">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Manutenção do Schema</h3>
                <p className="text-xs text-slate-500 font-medium">Copia e executa estes comandos no SQL Editor do Supabase para corrigir erros de colunas em falta.</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-black transition-all shadow-lg"
                >
                  {copied ? <><Check className="w-3 h-3" /> Copiado!</> : <><Copy className="w-3 h-3" /> Copiar SQL</>}
                </button>
              </div>
              <pre className="bg-slate-900 text-indigo-300 p-6 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto shadow-inner min-h-[300px]">
                {sqlSchema}
              </pre>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
              <Database className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-900">Nota Importante</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Se a app der erro ao adicionar utilizadores, é quase certo que a coluna <code>password</code> ainda não existe na tabela <code>users</code>. 
                  O Supabase não permite gravar campos que não foram definidos no seu sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">{editingUser ? 'Editar Perfil' : 'Novo Perfil'}</h3>
              <button onClick={resetForm} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
                  <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required disabled={isSubmitting} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Telemóvel</label>
                  <input type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required disabled={isSubmitting} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Password Inicial</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                    <input type="text" value={formState.password || ''} onChange={e => setFormState({...formState, password: e.target.value})} placeholder="Obrigatório para segurança" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required disabled={isSubmitting} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Data Nascimento</label>
                  <input type="date" value={formState.birthdate} onChange={e => setFormState({...formState, birthdate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required disabled={isSubmitting} />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all mt-4 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> A gravar na nuvem...</> : (editingUser ? 'Atualizar Perfil' : 'Criar no Sistema')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
