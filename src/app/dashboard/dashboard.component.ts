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
    const newLead: LeadTag = { label: 'New Lead', tone: 'primary' };
    const generated: LeadTag = { label: 'SI Generated', tone: 'success' };
    const appointment: LeadTag = { label: 'Feb 2, 2026 · 2:00-3:00 PM', tone: 'info' };
    const parked: LeadTag = { label: 'Parked', tone: 'neutral' };
    const dropLead: LeadTag = { label: 'Drop Lead', tone: 'danger' };
    const createdOn = (day: number, hour: number, minute = 0): Date =>
      new Date(2026, 1, day, hour, minute);
    const lead = (
      id: string,
      name: string,
      active: boolean,
      source: string,
      tags: readonly LeadTag[],
      createdAt: Date
    ): LeadCardData => ({
      id,
      name,
      createdAt: this.formatCreatedAt(createdAt),
      createdAtTimestamp: createdAt.getTime(),
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
          lead('lead-1', 'John Mark Doe', false, 'Referral', [newLead], createdOn(3, 9, 15)),
          lead('lead-2', 'Alice Johnson Smith', false, 'Digital', [newLead], createdOn(2, 13, 30)),
          lead('lead-3', 'Michael Lee Thompson', false, 'Branch', [newLead], createdOn(1, 10, 45))
        ]
      },
      {
        id: 'contacted',
        title: 'Contacted',
        leads: [lead('contacted-1', 'Alex Morgan', true, 'Referral', [newLead], createdOn(4, 11, 20))]
      },
      {
        id: 'appointments',
        title: 'Appointments',
        leads: [
          lead(
            'appointment-1',
            'Sarah Ann Thompson',
            true,
            'Digital',
            [generated, appointment],
            createdOn(5, 14)
          )
        ]
      },
      {
        id: 'meetings',
        title: 'Meetings',
        leads: [
          lead(
            'meeting-1',
            'Emily Rose Carter',
            true,
            'Branch',
            [generated, appointment],
            createdOn(6, 9, 30)
          )
        ]
      },
      {
        id: 'follow-up',
        title: 'Follow-Up',
        leads: [
          lead('follow-up-1', 'Alex Morgan Smith', true, 'Referral', [generated], createdOn(8, 16)),
          lead('follow-up-2', 'Emily Jane Cooper', true, 'Digital', [generated], createdOn(7, 10, 30)),
          lead('follow-up-3', 'Michael Lee Johnson', true, 'Branch', [generated], createdOn(6, 14, 15)),
          lead('follow-up-4', 'John Mark Doe', true, 'Referral', [generated], createdOn(5, 9)),
          lead('follow-up-7', 'Robert James Wilson', true, 'Branch', [generated], createdOn(4, 15, 45)),
          lead('follow-up-8', 'Laura Elizabeth Taylor', true, 'Event', [generated], createdOn(3, 13, 30)),
          lead('follow-up-9', 'Christopher Paul Martinez', true, 'Referral', [generated], createdOn(2, 16, 20)),
          lead('follow-up-6', 'Jessica Marie Davis', false, 'Digital', [generated, parked], createdOn(1, 11, 45)),
          lead('follow-up-5', 'David Robert Brown', false, 'Event', [generated, dropLead], createdOn(1, 9, 15))
        ]
      }
    ];
  }

  private formatCreatedAt(value: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = value.getDate().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    const period = value.getHours() >= 12 ? 'PM' : 'AM';
    const hour = value.getHours() % 12 || 12;

    return `Created ${months[value.getMonth()]}/${day}/${value.getFullYear()} · ${hour}:${minutes} ${period}`;
  }
}
