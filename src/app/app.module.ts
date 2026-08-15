import { CommonModule } from '@angular/common';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LamComponentsModule } from './components/lam-components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DraftSiFlowComponent } from './draft-si-flow/draft-si-flow.component';
import { LeadDetailComponent } from './lead-detail/lead-detail.component';
import { ProposalFlowComponent } from './proposal-flow/proposal-flow.component';
import { ActionCardModule } from './shared/components/action-card/action-card.module';
import { ButtonModule } from './shared/components/button/button.module';
import { SectionMessageModule } from './shared/components/section-message/section-message.module';
import { SearchFieldModule } from './shared/components/search-field/search-field.module';
import { StepperModule } from './shared/components/stepper/stepper.module';
import { TabGroupModule } from './shared/components/tab-group/tab-group.module';
import { TagModule } from './shared/components/tag/tag.module';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DraftSiFlowComponent,
    LeadDetailComponent,
    ProposalFlowComponent
  ],
  imports: [BrowserModule, CommonModule, FormsModule, LamComponentsModule, ActionCardModule, ButtonModule, SearchFieldModule, SectionMessageModule, StepperModule, TabGroupModule, TagModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [AppComponent]
})
export class AppModule {}
