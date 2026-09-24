import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '../shared/components/button/button.module';
import { MeshGradientComponent } from './mesh-gradient.component';
import { ProposalRecommendationDetailComponent } from './proposal-recommendation-detail.component';

@NgModule({
  declarations: [ProposalRecommendationDetailComponent],
  imports: [ButtonModule, CommonModule, MeshGradientComponent],
  exports: [ProposalRecommendationDetailComponent]
})
export class ProposalRecommendationDetailModule {}
