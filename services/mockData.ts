
import { User, RelationshipType, Relationship } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Administrador',
    phone: '917772010',
    birthdate: '1990-05-15',
    zodiacSign: 'Touro',
    zodiacTraits: ['Paciente', 'Persistente', 'Leal'],
    avatarUrl: 'https://picsum.photos/seed/admin/200',
    likes: ['Gestão', 'Tecnologia', 'Organização'],
    isProfilePrivate: false
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+351919876543',
    birthdate: '1992-02-28',
    zodiacSign: 'Peixes',
    zodiacTraits: ['Empática', 'Criativa', 'Intuitiva'],
    avatarUrl: 'https://picsum.photos/seed/maria/200',
    likes: ['Música', 'Gatos', 'Viagens'],
    isProfilePrivate: true
  },
  {
    id: '3',
    name: 'Carlos Bento',
    phone: '+351922334455',
    birthdate: '1985-12-25',
    zodiacSign: 'Capricórnio',
    zodiacTraits: ['Ambicioso', 'Prático', 'Disciplinado'],
    avatarUrl: 'https://picsum.photos/seed/carlos/200',
    likes: ['Vinho', 'Leitura'],
    isProfilePrivate: false
  },
  {
    id: '4',
    name: 'Ana Pereira',
    phone: '+351933445566',
    // Setting today as birthday for demo pulse
    birthdate: new Date().toISOString().split('T')[0],
    zodiacSign: 'Sagitário',
    zodiacTraits: ['Otimista', 'Aventureira'],
    avatarUrl: 'https://picsum.photos/seed/ana/200',
    likes: ['Surf', 'Yoga'],
    isProfilePrivate: false
  }
];

export const MOCK_RELATIONSHIPS: Relationship[] = [
  { id: 'r1', userId: '1', relatedUserId: '2', type: RelationshipType.FRIEND },
  { id: 'r2', userId: '1', relatedUserId: '4', type: RelationshipType.COLLEAGUE }
];
