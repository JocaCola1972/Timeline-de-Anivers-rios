
import React, { useState, useMemo, useEffect } from 'react';
import { User, BirthdayEntry, Relationship, RelationshipType } from './types';
import { MOCK_USERS, MOCK_RELATIONSHIPS } from './services/mockData';
import BirthdayTimeline from './components/BirthdayTimeline';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import { normalizePhone } from './services/zodiacService';
import { LayoutGrid, User as UserIcon, LogOut, ShieldAlert, Settings } from 'lucide-react';

const STORAGE_KEYS = {
  USERS: 'birthday_app_users',
  RELS: 'birthday_app_relationships'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'profile' | 'admin'>('timeline');

  // Inicializa estado a partir do localStorage ou mock se vazio
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [relationships, setRelationships] = useState<Relationship[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RELS);
    return saved ? JSON.parse(saved) : MOCK_RELATIONSHIPS;
  });

  // Persiste alterações no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RELS, JSON.stringify(relationships));
  }, [relationships]);

  const timelineData = useMemo<BirthdayEntry[]>(() => {
    if (!currentUser) return [];
    return users.map(user => {
      const rel = relationships.find(r => 
        (r.userId === currentUser.id && r.relatedUserId === user.id) ||
        (r.userId === user.id && r.relatedUserId === currentUser.id)
      );
      return {
        ...user,
        relationToViewer: rel ? rel.type : (user.id === currentUser.id ? RelationshipType.FAMILY : null)
      };
    });
  }, [currentUser, users, relationships]);

  // Admin reconhecido por número normalizado
  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return normalizePhone(currentUser.phone) === normalizePhone('917772010');
  }, [currentUser]);

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, { ...newUser, phone: normalizePhone(newUser.phone) }]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const normalized = { ...updatedUser, phone: normalizePhone(updatedUser.phone) };
    setUsers(prev => prev.map(u => u.id === normalized.id ? normalized : u));
    if (currentUser?.id === normalized.id) {
      setCurrentUser(normalized);
    }
  };

  const handleUpdateRelationships = (newRels: Relationship[]) => {
    setRelationships(newRels);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setRelationships(prev => prev.filter(r => r.userId !== id && r.relatedUserId !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
  };

  if (!currentUser) {
    return <LoginPage users={users} onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">T</div>
            <div className="hidden sm:block"><span className="font-bold text-slate-800 block leading-none">Aniversários</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timeline Familiar</span></div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => setActiveTab('timeline')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'timeline' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}><LayoutGrid className="w-4 h-4" /><span className="hidden sm:inline">Timeline</span></button>
            <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}><UserIcon className="w-4 h-4" /><span className="hidden sm:inline">Perfil</span></button>
            {isAdmin && <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'admin' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Settings className="w-4 h-4" /><span className="hidden sm:inline">Gestão</span></button>}
            <div className="w-px h-6 bg-slate-200 mx-1 sm:mx-2" /><button onClick={() => setCurrentUser(null)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Sair"><LogOut className="w-5 h-5" /></button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentUser.mustChangePassword && activeTab !== 'profile' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-800 animate-in slide-in-from-top-4">
            <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-500" /><div className="flex-1"><p className="font-bold">Segurança: Password predefinida detectada</p><p className="text-sm opacity-90 text-amber-700">Por favor, define uma password personalizada nas tuas configurações de perfil.</p></div>
            <button onClick={() => setActiveTab('profile')} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 shadow-sm">Mudar Agora</button>
          </div>
        )}

        {activeTab === 'timeline' && <BirthdayTimeline users={timelineData} viewerId={currentUser.id} />}
        {activeTab === 'profile' && <ProfilePage user={currentUser} allUsers={users} relationships={relationships} onUpdate={handleUpdateUser} onUpdateRelationships={handleUpdateRelationships} />}
        {activeTab === 'admin' && isAdmin && <AdminPanel users={users} relationships={relationships} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} onUpdateRelationships={handleUpdateRelationships} />}
      </main>
      <footer className="max-w-6xl mx-auto px-4 py-6 border-t border-slate-200 text-center"><p className="text-xs text-slate-400 font-medium">&copy; {new Date().getFullYear()} Timeline de Aniversários &bull; Ligado como <span className="text-slate-600 font-bold">{currentUser.name}</span></p></footer>
    </div>
  );
};

export default App;
