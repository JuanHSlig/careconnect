export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Client {
  id: string;
  name: string;
  status: 'active' | 'dormant' | 'unknown';
  type: 'ordinary' | 'premium';
  contacts: Contact[];
  createdAt: Date;
  lastInteraction?: Date;
}

export interface Conversation {
  id: string;
  clientId: string;
  type: 'strategic' | 'presale' | 'postsale';
  date: Date;
  notes: string;
  repurchaseOpportunity: boolean;
} 