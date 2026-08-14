import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LeadBoardData, LeadCardData, LeadTag } from '../lead-board.model';

@Component({
  selector: 'lam-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DashboardComponent {
  searchTerm = '';
  selectedSource = 'All Sources';
  selectedLead: LeadCardData | null = null;

  readonly sourceOptions = ['All Sources', 'Referral', 'Digital', 'Branch', 'Event'];
  readonly boards: readonly LeadBoardData[] = this.createBoards();

  get filteredBoards(): readonly LeadBoardData[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();

    return this.boards.map((board) => ({
      ...board,
      leads: board.leads.filter((lead) => {
        const matchesName = !query || lead.name.toLocaleLowerCase().includes(query);
        const matchesSource = this.selectedSource === 'All Sources' || lead.source === this.selectedSource;
        return matchesName && matchesSource;
      })
    }));
  }

  trackBoard(index: number, board: LeadBoardData): string {
    return board.id;
  }

  selectLead(lead: LeadCardData): void {
    this.selectedLead = lead;
  }

  private createBoards(): readonly LeadBoardData[] {
    const createdAt = 'Created Feb/01/2026 · 3:00 PM';
    const newLead: LeadTag = { label: 'New Lead', tone: 'primary' };
    const generated: LeadTag = { label: 'SI Generated', tone: 'success' };
    const appointment: LeadTag = { label: 'Feb 2, 2026 · 2:00-3:00 PM', tone: 'info' };
    const parked: LeadTag = { label: 'Parked', tone: 'neutral' };
    const lead = (
      id: string,
      name: string,
      active: boolean,
      source: string,
      tags: readonly LeadTag[]
    ): LeadCardData => ({
      id,
      name,
      createdAt,
      leadType: active ? 'Active' : 'Inactive',
      aging: '1d',
      source,
      tags
    });

    return [
      {
        id: 'lead',
        title: 'Lead',
        leads: [
          lead('lead-1', 'John Mark Doe', false, 'Referral', [newLead]),
          lead('lead-2', 'Alice Johnson Smith', false, 'Digital', [newLead]),
          lead('lead-3', 'Michael Lee Thompson', false, 'Branch', [newLead])
        ]
      },
      {
        id: 'contacted',
        title: 'Contacted',
        leads: [lead('contacted-1', 'Alex Morgan', true, 'Referral', [newLead])]
      },
      {
        id: 'appointments',
        title: 'Appointments',
        leads: [lead('appointment-1', 'Sarah Ann Thompson', true, 'Digital', [generated, appointment])]
      },
      {
        id: 'meetings',
        title: 'Meetings',
        leads: [lead('meeting-1', 'Emily Rose Carter', true, 'Branch', [generated, appointment])]
      },
      {
        id: 'follow-up',
        title: 'Follow-Up',
        leads: [
          lead('follow-up-1', 'Alex Morgan Smith', true, 'Referral', [generated]),
          lead('follow-up-2', 'Emily Jane Cooper', true, 'Digital', [generated]),
          lead('follow-up-3', 'Michael Lee Johnson', true, 'Branch', [generated]),
          lead('follow-up-4', 'John Mark Doe', true, 'Referral', [generated]),
          lead('follow-up-5', 'David Robert Brown', true, 'Event', [generated, parked]),
          lead('follow-up-6', 'Jessica Marie Davis', true, 'Digital', [generated]),
          lead('follow-up-7', 'Robert James Wilson', true, 'Branch', [generated]),
          lead('follow-up-8', 'Laura Elizabeth Taylor', true, 'Event', [generated]),
          lead('follow-up-9', 'Christopher Paul Martinez', true, 'Referral', [generated])
        ]
      }
    ];
  }
}
