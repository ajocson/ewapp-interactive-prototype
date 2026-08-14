export type TagTone = 'primary' | 'success' | 'info' | 'neutral';

export interface LeadTag {
  label: string;
  tone: TagTone;
}

export interface LeadCardData {
  id: string;
  name: string;
  createdAt: string;
  leadType: 'Active' | 'Inactive';
  aging: string;
  source: string;
  tags: readonly LeadTag[];
}

export interface LeadBoardData {
  id: string;
  title: string;
  leads: readonly LeadCardData[];
}
