export type TagTone = 'primary' | 'success' | 'info' | 'danger' | 'neutral';

export interface LeadTag {
  label: string;
  tone: TagTone;
}

export type LeadState = 'Active' | 'Inactive' | 'Parked' | 'Dropped' | 'Reactivated';
export type LeadGender = 'Male' | 'Female';

export type LeadActivityCategory = 'sales' | 'system';

export interface LeadActivityRecord {
  id: string;
  category: LeadActivityCategory;
  label: string;
  dateLabel: string;
  timeLabel: string;
  occurredAtTimestamp: number;
  notes?: string;
}

export interface LeadAppointment {
  date: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
  notes?: string;
}

export interface LeadCardData {
  id: string;
  name: string;
  gender: LeadGender;
  createdAt: string;
  createdAtTimestamp: number;
  lastActivityTimestamp?: number;
  leadType: LeadState;
  aging: string;
  source: string;
  referrer: string;
  productInterested: string;
  tags: readonly LeadTag[];
  appointment?: LeadAppointment;
  activities: readonly LeadActivityRecord[];
}

export function leadDisplayName(lead: Pick<LeadCardData, 'gender' | 'name'>): string {
  return `${lead.gender === 'Female' ? 'Ms.' : 'Mr.'} ${lead.name}`;
}

export interface LeadBoardData {
  id: string;
  title: string;
  leads: readonly LeadCardData[];
}
