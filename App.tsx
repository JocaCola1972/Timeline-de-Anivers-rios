
import React, { useState, useMemo, useEffect } from 'react';
import { User, BirthdayEntry, Relationship, RelationshipType } from './types';
import { MOCK_USERS, MOCK_RELATIONSHIPS } from './services/mockData';
import BirthdayTimeline from './components/BirthdayTimeline';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import { normalizePhone } from './services/zodiacService';
import { db, supabase } from './services/supabase';
import { LayoutGrid, User as UserIcon, LogOut, ShieldAlert, Settings, RefreshCw, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'profile' | 'admin'>('timeline');
  const [users, setUsers] = useState<User[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Carregar dados iniciais do Supabase
  const fetchData = async (isManual = false) => {
    if (isManual) setIsSyncing(true);
    else setIsLoading(true);
    
    setDbError(null);
    try {
      const [remoteUsers, remoteRels] = await Promise.all([
        db.users.getAll(),
        db.relationships.getAll()
      ]);
      
      if (remoteUsers.length === 0) {
        setUsers(MOCK_USERS);
        setRelationships(MOCK_RELATIONSHIPS);
      } else {
        setUsers(remoteUsers);
        setRelationships(remoteRels);
      }
    } catch (err: any) {
      console.error("Erro ao carregar do Supabase:", err);
      setDbError("Não foi possível ligar à base de dados. Verifique se as tabelas foram criadas no Supabase.");
      setUsers(MOCK_USERS);
      setRelationships(MOCK_RELATIONSHIPS);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const timelineData = useMemo<BirthdayEntry[]>(() => {
    if (!currentUser) return [];
    return users.map(user => {
      const rel = relationships.find(r => 
        (r.userId === currentUser.id && r.relatedUserId === user.id) ||
        (r.userId === user.id && r.relatedUserId === currentUser.id)
      );
      return {
        ...user,
        relationToViewer: rel ? (rel.type as RelationshipType) : (user.id === currentUser.id ? RelationshipType.FAMILY : null)
      };
    });
  }, [currentUser, users, relationships]);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return normalizePhone(currentUser.phone) === normalizePhone('917772010');
  }, [currentUser]);

  const handleAddUser = async (newUser: User) => {
    const userToSave = { ...newUser, phone: normalizePhone(newUser.phone) };
    try {
      await db.users.upsert(userToSave);
      setUsers(prev => [...prev, userToSave]);
    } catch (err) {
      alert("Erro ao guardar no servidor.");
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const normalized = { ...updatedUser, phone: normalizePhone(updatedUser.phone) };
    try {
      await db.users.upsert(normalized);
      setUsers(prev => prev.map(u => u.id === normalized.id ? normalized : u));
      if (currentUser?.id === normalized.id) {
        setCurrentUser(normalized);
      }
    } catch (err) {
      alert("Erro ao atualizar no servidor.");
    }
  };

  const handleUpdateRelationships = async (newRels: Relationship[]) => {
    try {
      await db.relationships.upsertMany(newRels);
      setRelationships(newRels);
    } catch (err) {
      alert("Erro ao sincronizar relações.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === '1') {
      alert("Não pode apagar o administrador principal.");
      return;
    }
    try {
      await db.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setRelationships(prev => prev.filter(r => r.userId !== id && r.relatedUserId !== id));
      if (currentUser?.id === id) {
        setCurrentUser(null);
      }
    } catch (err) {
      alert("Erro ao eliminar no servidor.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse">A ligar ao Supabase...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage users={users} onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">T</div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800 block leading-none">Aniversários</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cloud Sync Ativo</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => fetchData(true)} 
              disabled={isSyncing}
              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mr-2"
              title="Sincronizar Manualmente"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={() => setActiveTab('timeline')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'timeline' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'admin' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Gestão</span>
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 mx-1 sm:mx-2" />
            <button onClick={() => setCurrentUser(null)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {dbError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-800">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div className="text-sm font-medium">{dbError}</div>
          </div>
        )}

        {currentUser.mustChangePassword && activeTab !== 'profile' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-800 animate-in slide-in-from-top-4">
            <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-bold">Segurança: Password predefinida detectada</p>
              <p className="text-sm opacity-90 text-amber-700">Por favor, define uma password personalizada nas tuas configurações de perfil.</p>
            </div>
            <button onClick={() => setActiveTab('profile')} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 shadow-sm">Mudar Agora</button>
          </div>
        )}

        {activeTab === 'timeline' && <BirthdayTimeline users={timelineData} viewerId={currentUser.id} />}
        {activeTab === 'profile' && <ProfilePage user={currentUser} allUsers={users} relationships={relationships} onUpdate={handleUpdateUser} onUpdateRelationships={handleUpdateRelationships} />}
        {activeTab === 'admin' && isAdmin && <AdminPanel users={users} relationships={relationships} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} onUpdateRelationships={handleUpdateRelationships} />}
      </main>
      
      <footer className="max-w-6xl mx-auto px-4 py-6 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base de Dados Supabase Conectada &bull; Sincronização em Tempo Real</p>
      </footer>
    </div>
  );
};

export default App;
