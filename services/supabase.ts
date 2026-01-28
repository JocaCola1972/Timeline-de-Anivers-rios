
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkbcknwtwafpjkwmzguu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrYmNrbnd0d2FmcGprd216Z3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1OTU4NDgsImV4cCI6MjA4NTE3MTg0OH0.6EjgfJqqfJgP5mTcs3oREu0w6ikXS1S6IBHapn317AM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utilitários para sincronização
export const db = {
  users: {
    async getAll() {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data;
    },
    async upsert(user: any) {
      const { error } = await supabase.from('users').upsert(user);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    }
  },
  relationships: {
    async getAll() {
      const { data, error } = await supabase.from('relationships').select('*');
      if (error) throw error;
      return data;
    },
    async upsertMany(rels: any[]) {
      // Primeiro removemos as relações antigas do utilizador (se aplicável) para evitar duplicados chatos em lógica simples
      // Nota: Em produção, isto seria mais refinado.
      const { error } = await supabase.from('relationships').upsert(rels);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase.from('relationships').delete().eq('id', id);
      if (error) throw error;
    }
  }
};
