
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Relationship, RelationshipType } from '../types';
import { getZodiac, getChineseZodiac } from '../services/zodiacService';
import { RELATIONSHIP_LABELS } from '../constants';
import { resizeImage, validateHumanImage } from '../services/imageService';
import { 
  Save, 
  Lock, 
  Eye, 
  Camera, 
  Heart, 
  Search, 
  XCircle, 
  User as UserIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';

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
  const [userRels, setUserRels] = useState<Relationship[]>(
    relationships.filter(r => r.userId === user.id)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [relSearch, setRelSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.birthdate) {
      const date = new Date(formData.birthdate);
      const { sign, traits } = getZodiac(date);
      const chinese = getChineseZodiac(date);
      setFormData(prev => ({ 
        ...prev, 
        zodiacSign: sign, 
        zodiacTraits: traits,
        chineseZodiac: chinese
      }));
    }
  }, [formData.birthdate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      onUpdateRelationships(userRels);
      setIsSaving(false);
      alert('Alterações guardadas com sucesso!');
    }, 800);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setIsAnalyzingImage(true);

    try {
      const resizedBase64 = await resizeImage(file);
      const validation = await validateHumanImage(resizedBase64);
      
      if (validation.isHuman) {
        setFormData(prev => ({ ...prev, avatarUrl: resizedBase64 }));
      } else {
        setImageError(validation.reason || "A foto deve conter um ser humano.");
      }
    } catch (err) {
      setImageError("Erro ao processar a imagem.");
    } finally {
      setIsAnalyzingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateRelationship = (relatedUserId: string, type: RelationshipType | null) => {
    setUserRels(prev => {
      const filtered = prev.filter(r => r.relatedUserId !== relatedUserId);
      if (type === null) return filtered;
      return [...filtered, { id: `rel-${user.id}-${relatedUserId}`, userId: user.id, relatedUserId, type }];
    });
  };

  const filteredUsersForRel = useMemo(() => {
    return allUsers.filter(u => u.id !== user.id && u.name.toLowerCase().includes(relSearch.toLowerCase()));
  }, [allUsers, user.id, relSearch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'info' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <UserIcon className="w-4 h-4" /> Dados Pessoais
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
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-left-4 duration-300">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-10 mb-6 flex flex-col items-start gap-4">
                <div className="relative group w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-slate-100 shadow-xl">
                  {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center backdrop-blur-sm z-20">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  )}
                  <img 
                    src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`} 
                    className={`w-full h-full object-cover transition-opacity ${isAnalyzingImage ? 'opacity-50' : 'opacity-100'}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzingImage}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
                {imageError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {imageError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Nascimento</label>
                  <input type="date" value={formData.birthdate} onChange={e => setFormData({ ...formData, birthdate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1 tracking-wider">Signo Ocidental</p>
                  <p className="text-lg font-bold text-indigo-900">{formData.zodiacSign}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-amber-500 uppercase mb-1 tracking-wider">Signo Chinês</p>
                  <p className="text-lg font-bold text-amber-900">{formData.chineseZodiac}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.isProfilePrivate ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {formData.isProfilePrivate ? <Lock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </div>
                  <div><p className="font-bold text-sm text-slate-800">Perfil Privado</p><p className="text-[10px] text-slate-500">Privacidade ativada.</p></div>
                </div>
                <button type="button" onClick={() => setFormData({ ...formData, isProfilePrivate: !formData.isProfilePrivate })} className={`relative w-12 h-6 rounded-full transition-colors ${formData.isProfilePrivate ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isProfilePrivate ? 'translate-x-6' : 'translate-x-0'}`} /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div><h3 className="font-bold text-slate-800">Círculo de Conexões</h3><p className="text-xs text-slate-500">Define quem é quem.</p></div>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Procurar..." value={relSearch} onChange={e => setRelSearch(e.target.value)} className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none w-48" /></div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredUsersForRel.map(u => {
                const currentRel = userRels.find(r => r.relatedUserId === u.id);
                return (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} className="w-10 h-10 rounded-xl" alt="" />
                      <div><p className="text-sm font-bold text-slate-800">{u.name}</p><p className="text-[10px] font-bold text-indigo-500 uppercase">{u.zodiacSign}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                      {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
                        <button key={val} type="button" onClick={() => updateRelationship(u.id, currentRel?.type === val ? null : val as RelationshipType)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${currentRel?.type === val ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={isSaving || isAnalyzingImage} 
            className="w-full max-w-sm py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" /> 
            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
