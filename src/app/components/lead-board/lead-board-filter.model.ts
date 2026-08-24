import { LeadState } from '../../lead-board.model';

export type BoardLeadStateFilter = LeadState | 'Re-endorsed';
export type BoardSortOption = 'recent' | 'oldest' | 'name-asc' | 'name-desc' | null;

export interface LeadBoardFilters {
  leadStates: readonly BoardLeadStateFilter[];
  sort: BoardSortOption;
}

export const EMPTY_LEAD_BOARD_FILTERS: LeadBoardFilters = {
  leadStates: [],
  sort: 'recent'
};
