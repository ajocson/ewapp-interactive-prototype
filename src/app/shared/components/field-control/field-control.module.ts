import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FieldControlComponent } from './field-control.component';

@NgModule({
  declarations: [FieldControlComponent],
  imports: [CommonModule],
  exports: [FieldControlComponent]
})
export class FieldControlModule {}
