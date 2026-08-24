import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TagModule } from '../shared/components/tag/tag.module';
import { ButtonModule } from '../shared/components/button/button.module';
import { StepperModule } from '../shared/components/stepper/stepper.module';
import { TabGroupModule } from '../shared/components/tab-group/tab-group.module';
import { ActionCardModule } from '../shared/components/action-card/action-card.module';
import { SectionMessageModule } from '../shared/components/section-message/section-message.module';
import { ScheduledActivityCardModule } from '../shared/components/scheduled-activity-card/scheduled-activity-card.module';
import { FieldControlModule } from '../shared/components/field-control/field-control.module';

import { IconButtonComponent } from './icon-button/icon-button.component';
import { GlobalHeaderComponent } from './global-header/global-header.component';
import { LeadBoardComponent } from './lead-board/lead-board.component';
import { LeadCardComponent } from './lead-card/lead-card.component';
import { LeadActivityDrawerComponent } from './lead-activity-drawer/lead-activity-drawer.component';
import { SideNavigationComponent } from './side-navigation/side-navigation.component';
import { StatusTagComponent } from './status-tag/status-tag.component';

@NgModule({
  declarations: [
    GlobalHeaderComponent,
    IconButtonComponent,
    LeadActivityDrawerComponent,
    LeadBoardComponent,
    LeadCardComponent,
    SideNavigationComponent,
    StatusTagComponent
  ],
  imports: [ActionCardModule, CommonModule, FormsModule, ButtonModule, FieldControlModule, ScheduledActivityCardModule, SectionMessageModule, StepperModule, TabGroupModule, TagModule],
  exports: [
    GlobalHeaderComponent,
    IconButtonComponent,
    LeadActivityDrawerComponent,
    LeadBoardComponent,
    LeadCardComponent,
    SideNavigationComponent,
    StatusTagComponent
  ]
})
export class LamComponentsModule {}
