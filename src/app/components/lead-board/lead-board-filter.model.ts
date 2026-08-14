import { LeadCardData } from '../../lead-board.model';

export type BoardStatusFilter = 'Parked' | 'Drop Lead' | null;
export type BoardLeadTypeFilter = LeadCardData['leadType'] | null;
export type BoardSortOption = 'recent' | 'oldest' | 'name-asc' | 'name-desc' | null;

export interface LeadBoardFilters {
  status: BoardStatusFilter;
  leadType: BoardLeadTypeFilter;
  sort: BoardSortOption;
}

export const EMPTY_LEAD_BOARD_FILTERS: LeadBoardFilters = {
  status: null,
  leadType: null,
  sort: null
};
