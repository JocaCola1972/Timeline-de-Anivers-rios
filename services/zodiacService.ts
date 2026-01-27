
import { ZODIAC_SIGNS } from '../constants';

export const getZodiac = (date: Date): { sign: string; traits: string[] } => {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  for (const z of ZODIAC_SIGNS) {
    // Handling year transition for Capricorn
    if (z.name === 'Capricórnio') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return { sign: z.name, traits: z.traits };
      }
    } else {
      const isAfterStart = (month === z.start.month && day >= z.start.day) || month > z.start.month;
      const isBeforeEnd = (month === z.end.month && day <= z.end.day) || month < z.end.month;
      
      if (month === z.start.month && day >= z.start.day) return { sign: z.name, traits: z.traits };
      if (month === z.end.month && day <= z.end.day) return { sign: z.name, traits: z.traits };
    }
  }

  // Fallback (shouldn't happen with full year coverage)
  return { sign: 'Capricórnio', traits: ZODIAC_SIGNS[0].traits };
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 5) return '****';
  const prefix = phone.slice(0, 4);
  const suffix = phone.slice(-2);
  return `${prefix}${'*'.repeat(phone.length - 6)}${suffix}`;
};
