import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FieldControlComponent } from './field-control.component';
import { ButtonModule } from '../button/button.module';

@NgModule({
  declarations: [FieldControlComponent],
  imports: [CommonModule, ButtonModule],
  exports: [FieldControlComponent]
})
export class FieldControlModule {}
