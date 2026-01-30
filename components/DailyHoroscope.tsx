
import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, RefreshCw, Compass, CalendarCheck } from 'lucide-react';
import { getDailyHoroscope } from '../services/horoscopeService';

interface Props {
  westernSign: string;
  chineseSign: string;
}

const DailyHoroscope: React.FC<Props> = ({ westernSign, chineseSign }) => {
  const [horoscopes, setHoroscopes] = useState<{ western: string; chinese: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  // Chave única baseada nos signos e na data de hoje
  const getCacheKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `horoscope_cache_${today}_${westernSign}_${chineseSign}`;
  };

  const fetchHoroscope = async (force: boolean = false) => {
    setLoading(true);
    const cacheKey = getCacheKey();
    
    // Tenta carregar do cache se não for um refresh forçado
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setHoroscopes(parsed);
          setIsFromCache(true);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Erro ao ler cache do horóscopo", e);
        }
      }
    }

    // Se não houver cache ou for forçado, pede ao Gemini
    const data = await getDailyHoroscope(westernSign, chineseSign);
    setHoroscopes(data);
    setIsFromCache(false);
    
    // Guarda no cache para o resto do dia
    localStorage.setItem(cacheKey, JSON.stringify(data));
    
    // Limpeza opcional: remove chaves de horóscopo antigas
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('horoscope_cache_') && key !== cacheKey) {
        localStorage.removeItem(key);
      }
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchHoroscope();
  }, [westernSign, chineseSign]);

  const todayStr = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long' });

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Energia Astral de Hoje
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
            <CalendarCheck className="w-3 h-3" /> {todayStr} 
            {isFromCache && <span className="text-indigo-400 ml-2">• Previsão Diária Ativa</span>}
          </p>
        </div>
        
        <button 
          onClick={() => fetchHoroscope(true)}
          disabled={loading}
          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-50 shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'A ler estrelas...' : 'Forçar Nova Previsão'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Western Horoscope Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 group transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -m-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Zodíaco Ocidental</span>
              <Sun className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h4 className="text-3xl font-black tracking-tight">{westernSign}</h4>
              <div className="w-12 h-1 bg-white/20 rounded-full mt-2"></div>
            </div>
            {loading ? (
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-full bg-white/20 rounded animate-pulse shadow-inner"></div>
                <div className="h-3 w-2/3 bg-white/20 rounded animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-indigo-50 font-medium italic">
                "{horoscopes?.western}"
              </p>
            )}
          </div>
        </div>

        {/* Chinese Horoscope Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-red-600 rounded-[2rem] p-8 text-white shadow-xl shadow-amber-100 group transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 -m-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Zodíaco Chinês</span>
              <Compass className="w-6 h-6 text-red-200" />
            </div>
            <div>
              <h4 className="text-3xl font-black tracking-tight">{chineseSign.split(' ')[1]}</h4>
              <div className="w-12 h-1 bg-white/20 rounded-full mt-2"></div>
            </div>
            {loading ? (
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-full bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-white/20 rounded animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-amber-50 font-medium italic">
                "{horoscopes?.chinese}"
              </p>
            )}
            <div className="text-[40px] absolute -bottom-2 -right-2 opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500">
              {chineseSign.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyHoroscope;
