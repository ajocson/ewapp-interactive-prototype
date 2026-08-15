import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TagModule } from '../shared/components/tag/tag.module';

import { IconButtonComponent } from './icon-button/icon-button.component';
import { GlobalHeaderComponent } from './global-header/global-header.component';
import { LeadBoardComponent } from './lead-board/lead-board.component';
import { LeadCardComponent } from './lead-card/lead-card.component';
import { SideNavigationComponent } from './side-navigation/side-navigation.component';
import { StatusTagComponent } from './status-tag/status-tag.component';

@NgModule({
  declarations: [
    GlobalHeaderComponent,
    IconButtonComponent,
    LeadBoardComponent,
    LeadCardComponent,
    SideNavigationComponent,
    StatusTagComponent
  ],
  imports: [CommonModule, TagModule],
  exports: [
    GlobalHeaderComponent,
    IconButtonComponent,
    LeadBoardComponent,
    LeadCardComponent,
    SideNavigationComponent,
    StatusTagComponent
  ]
})
export class LamComponentsModule {}
