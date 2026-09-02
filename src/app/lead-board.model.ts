export type TagTone = 'primary' | 'success' | 'info' | 'danger' | 'neutral';

export interface LeadTag {
  label: string;
  tone: TagTone;
}

export type LeadState = 'Active' | 'Inactive' | 'Parked' | 'Dropped' | 'Reactivated' | 'Booked';
export type LeadGender = 'Male' | 'Female';

export type LeadActivityCategory = 'sales' | 'system';

export interface LeadActivityRecord {
  id: string;
  category: LeadActivityCategory;
  label: string;
  dateLabel: string;
  timeLabel: string;
  occurredAtTimestamp: number;
  recordedDateLabel?: string;
  recordedTimeLabel?: string;
  scheduledDateLabel?: string;
  scheduledTimeLabel?: string;
  afypDeclaration?: number;
  potentialCaseCount?: number;
  notes?: string;
}

export interface LeadAppointment {
  date: string;
  dateLabel: string;
  startMinutes: number;
  endMinutes: number;
  timeLabel: string;
  notes?: string;
  afypDeclaration?: number;
  potentialCaseCount?: number;
}

export interface LeadCardData {
  id: string;
  leadId: string;
  name: string;
  gender: LeadGender;
  createdAt: string;
  createdAtTimestamp: number;
  lastActivityTimestamp?: number;
  leadType: LeadState;
  aging: string;
  tatAging?: string;
  notContactedFor48Hours?: boolean;
  notContactedFor30Days?: boolean;
  autoParkedAfter30Days?: boolean;
  autoDroppedAfter90Days?: boolean;
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
