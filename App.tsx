
import React, { useState, useMemo, useEffect } from 'react';
import { User, BirthdayEntry, Relationship, RelationshipType } from './types';
import { MOCK_USERS, MOCK_RELATIONSHIPS } from './services/mockData';
import BirthdayTimeline from './components/BirthdayTimeline';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import { normalizePhone } from './services/zodiacService';
import { db } from './services/supabase';
import { LayoutGrid, User as UserIcon, LogOut, ShieldAlert, Settings, RefreshCw, AlertTriangle, Cake } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'profile' | 'admin'>('timeline');
  const [users, setUsers] = useState<User[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const ADMIN_PHONE = '917772010';

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
        const adminExists = remoteUsers.some(u => normalizePhone(u.phone) === ADMIN_PHONE);
        if (!adminExists) {
          const adminMock = MOCK_USERS.find(u => normalizePhone(u.phone) === ADMIN_PHONE) || MOCK_USERS[0];
          setUsers([adminMock, ...remoteUsers]);
        } else {
          setUsers(remoteUsers);
        }
        setRelationships(remoteRels);
      }
    } catch (err: any) {
      console.error("Erro Supabase:", err);
      setDbError("Modo Offline: Tabelas remotas não encontradas.");
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
    return normalizePhone(currentUser.phone) === ADMIN_PHONE;
  }, [currentUser]);

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await db.users.upsert(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
    } catch (err) { alert("Erro ao atualizar dados."); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
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
            <div className="relative w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden group">
              <Cake className="w-6 h-6 absolute opacity-20 group-hover:scale-125 transition-transform" />
              <span className="relative z-10">W</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-800 block leading-none">Aniversários da Equipa</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workspace Hub</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-1">
            <button onClick={() => setActiveTab('timeline')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'timeline' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              <LayoutGrid className="w-4 h-4" /> <span className="hidden md:inline">Timeline</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              <UserIcon className="w-4 h-4" /> <span className="hidden md:inline">Perfil</span>
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${activeTab === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Settings className="w-4 h-4" /> <span className="hidden md:inline">Admin</span>
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {dbError && <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-medium"><AlertTriangle className="w-5 h-5 text-amber-500" /> {dbError}</div>}
        
        {activeTab === 'timeline' && <BirthdayTimeline users={timelineData} viewerId={currentUser.id} />}
        {activeTab === 'profile' && <ProfilePage user={currentUser} allUsers={users} relationships={relationships} onUpdate={handleUpdateUser} onUpdateRelationships={async (rels) => { await db.relationships.upsertMany(rels); setRelationships(rels); }} />}
        {activeTab === 'admin' && isAdmin && <AdminPanel users={users} relationships={relationships} onAdd={async u => { await db.users.upsert(u); setUsers([...users, u]); }} onUpdate={handleUpdateUser} onDelete={async id => { await db.users.delete(id); setUsers(users.filter(u => u.id !== id)); }} onUpdateRelationships={async rs => { await db.relationships.upsertMany(rs); setRelationships(rs); }} />}
      </main>
    </div>
  );
};

export default App;
