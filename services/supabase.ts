
import { createClient } from '@supabase/supabase-js';
import { User, Relationship } from '../types';

const supabaseUrl = 'https://fkbcknwtwafpjkwmzguu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYmNrbnd0d2FmcGprd216Z3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTU4NDgsImV4cCI6MjA4NTE3MTg0OH0.6EjgfJqqfJgP5mTcs3oREu0w6ikXS1S6IBHapn317AM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de mapeamento para utilizadores
const userToDB = (user: User) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  password: user.password,
  birthdate: user.birthdate,
  zodiac_sign: user.zodiacSign,
  zodiac_traits: user.zodiacTraits,
  chinese_zodiac: user.chineseZodiac,
  avatar_url: user.avatarUrl,
  likes: user.likes,
  wishlist: user.wishlist,
  is_profile_private: user.isProfilePrivate,
  must_change_password: user.mustChangePassword || false
});

const userFromDB = (data: any): User => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  password: data.password,
  birthdate: data.birthdate,
  zodiacSign: data.zodiac_sign,
  zodiacTraits: data.zodiac_traits || [],
  chineseZodiac: data.chinese_zodiac,
  avatarUrl: data.avatar_url,
  likes: data.likes || [],
  wishlist: data.wishlist,
  isProfilePrivate: data.is_profile_private,
  mustChangePassword: data.must_change_password
});

// Funções de mapeamento para relações
const relToDB = (rel: Relationship) => ({
  id: rel.id,
  user_id: rel.userId,
  related_user_id: rel.relatedUserId,
  type: rel.type
});

const relFromDB = (data: any): Relationship => ({
  id: data.id,
  userId: data.user_id,
  relatedUserId: data.related_user_id,
  type: data.type
});

export const db = {
  users: {
    async getAll(): Promise<User[]> {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return (data || []).map(userFromDB);
    },
    async upsert(user: User) {
      const dbUser = userToDB(user);
      const { error } = await supabase.from('users').upsert(dbUser);
      if (error) {
        console.error("Supabase User Upsert Error:", error);
        throw error;
      }
    },
    async delete(id: string) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }
  },
  relationships: {
    async getAll(): Promise<Relationship[]> {
      const { data, error } = await supabase.from('relationships').select('*');
      if (error) throw error;
      return (data || []).map(relFromDB);
    },
    async upsertMany(rels: Relationship[]) {
      const dbRels = rels.map(relToDB);
      const { error } = await supabase.from('relationships').upsert(dbRels);
      if (error) {
        console.error("Supabase Relationships Upsert Error:", error);
        throw error;
      }
    },
    async delete(id: string) {
      const { error } = await supabase.from('relationships').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
