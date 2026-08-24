import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TagModule } from '../tag/tag.module';
import { ScheduledActivityCardComponent } from './scheduled-activity-card.component';

@NgModule({
  declarations: [ScheduledActivityCardComponent],
  imports: [CommonModule, TagModule],
  exports: [ScheduledActivityCardComponent]
})
export class ScheduledActivityCardModule {}
