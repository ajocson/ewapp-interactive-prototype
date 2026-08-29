import { Injectable } from '@angular/core';

export type LeadJourneyTab = 'info' | 'profile' | 'proposals' | 'applications';

interface LeadJourneyState {
  unlockedTab: LeadJourneyTab;
  info?: Record<string, string | boolean>;
  profile?: Record<string, string | boolean>;
}

const TABS: readonly LeadJourneyTab[] = ['info', 'profile', 'proposals', 'applications'];

@Injectable({ providedIn: 'root' })
export class LeadJourneyStateService {
  /** Journey progress is retained for the open app session only and resets on reload. */
  private readonly states: Record<string, LeadJourneyState> = {};

  canAccess(leadId: string, tab: LeadJourneyTab): boolean {
    return TABS.indexOf(tab) <= TABS.indexOf(this.stateFor(leadId).unlockedTab);
  }

  highestUnlockedTab(leadId: string): LeadJourneyTab {
    return this.stateFor(leadId).unlockedTab;
  }

  unlock(leadId: string, tab: LeadJourneyTab): void {
    const state = this.stateFor(leadId);
    if (TABS.indexOf(tab) > TABS.indexOf(state.unlockedTab)) state.unlockedTab = tab;
  }

  saveInfo(leadId: string, info: Record<string, string | boolean>): void {
    this.stateFor(leadId).info = { ...info };
  }

  info(leadId: string): Record<string, string | boolean> | undefined {
    return this.stateFor(leadId).info;
  }

  saveProfile(leadId: string, profile: Record<string, string | boolean>): void {
    this.stateFor(leadId).profile = { ...profile };
  }

  profile(leadId: string): Record<string, string | boolean> | undefined {
    return this.stateFor(leadId).profile;
  }

  private stateFor(leadId: string): LeadJourneyState {
    return this.states[leadId] ??= { unlockedTab: 'info' };
  }

}
