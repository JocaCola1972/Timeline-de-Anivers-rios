
import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, RefreshCw, Compass } from 'lucide-react';
import { getDailyHoroscope } from '../services/horoscopeService';

interface Props {
  westernSign: string;
  chineseSign: string;
}

const DailyHoroscope: React.FC<Props> = ({ westernSign, chineseSign }) => {
  const [horoscopes, setHoroscopes] = useState<{ western: string; chinese: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHoroscope = async () => {
    setLoading(true);
    const data = await getDailyHoroscope(westernSign, chineseSign);
    setHoroscopes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHoroscope();
  }, [westernSign, chineseSign]);

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Previsões para Ti
        </h3>
        <button 
          onClick={fetchHoroscope}
          disabled={loading}
          className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2 hover:text-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Previsão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Western Horoscope Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 group">
          <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Zodíaco Ocidental</span>
              <Sun className="w-5 h-5 text-amber-300" />
            </div>
            <h4 className="text-2xl font-bold">{westernSign}</h4>
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-white/20 rounded animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-indigo-50 font-medium">
                {horoscopes?.western}
              </p>
            )}
          </div>
        </div>

        {/* Chinese Horoscope Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-red-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-100 group">
          <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">Zodíaco Chinês</span>
              <Compass className="w-5 h-5 text-red-200" />
            </div>
            <h4 className="text-2xl font-bold">{chineseSign}</h4>
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/20 rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-white/20 rounded animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-amber-50 font-medium">
                {horoscopes?.chinese}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyHoroscope;
