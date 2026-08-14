import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IconButtonComponent } from './icon-button/icon-button.component';
import { LeadBoardComponent } from './lead-board/lead-board.component';
import { LeadCardComponent } from './lead-card/lead-card.component';
import { StatusTagComponent } from './status-tag/status-tag.component';

@NgModule({
  declarations: [IconButtonComponent, LeadBoardComponent, LeadCardComponent, StatusTagComponent],
  imports: [CommonModule],
  exports: [IconButtonComponent, LeadBoardComponent, LeadCardComponent, StatusTagComponent]
})
export class LamComponentsModule {}
