
import { RelationshipType } from './types';

export const ZODIAC_SIGNS = [
  { name: 'Capricórnio', start: { month: 12, day: 22 }, end: { month: 1, day: 19 }, traits: ['Ambicioso', 'Prático', 'Disciplinado'] },
  { name: 'Aquário', start: { month: 1, day: 20 }, end: { month: 2, day: 18 }, traits: ['Inovador', 'Original', 'Humanitário'] },
  { name: 'Peixes', start: { month: 2, day: 19 }, end: { month: 3, day: 20 }, traits: ['Empático', 'Criativo', 'Intuitivo'] },
  { name: 'Carneiro', start: { month: 3, day: 21 }, end: { month: 4, day: 19 }, traits: ['Energético', 'Corajoso', 'Determinado'] },
  { name: 'Touro', start: { month: 4, day: 20 }, end: { month: 5, day: 20 }, traits: ['Paciente', 'Persistente', 'Leal'] },
  { name: 'Gémeos', start: { month: 5, day: 21 }, end: { month: 6, day: 20 }, traits: ['Adaptável', 'Curioso', 'Comunicativo'] },
  { name: 'Caranguejo', start: { month: 6, day: 21 }, end: { month: 7, day: 22 }, traits: ['Protetor', 'Sensível', 'Sentimental'] },
  { name: 'Leão', start: { month: 7, day: 23 }, end: { month: 8, day: 22 }, traits: ['Confiante', 'Generoso', 'Carismático'] },
  { name: 'Virgem', start: { month: 8, day: 23 }, end: { month: 9, day: 22 }, traits: ['Analítico', 'Meticuloso', 'Fiável'] },
  { name: 'Balança', start: { month: 9, day: 23 }, end: { month: 10, day: 22 }, traits: ['Diplomático', 'Justo', 'Sociável'] },
  { name: 'Escorpião', start: { month: 10, day: 23 }, end: { month: 11, day: 21 }, traits: ['Apaixonado', 'Resiliente', 'Misterioso'] },
  { name: 'Sagitário', start: { month: 11, day: 22 }, end: { month: 12, day: 21 }, traits: ['Otimista', 'Aventureiro', 'Filosófico'] },
];

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  [RelationshipType.FAMILY]: 'Família',
  [RelationshipType.FRIEND]: 'Amigo',
  [RelationshipType.COLLEAGUE]: 'Colega',
  [RelationshipType.OTHER]: 'Outro'
};
