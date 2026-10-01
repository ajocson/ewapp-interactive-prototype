import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '../shared/components/button/button.module';
import { MeshGradientComponent } from './mesh-gradient.component';
import { ProposalApplicationPreviewComponent } from './proposal-application-preview.component';
import { ProposalRecommendationDetailComponent } from './proposal-recommendation-detail.component';

@NgModule({
  declarations: [ProposalApplicationPreviewComponent, ProposalRecommendationDetailComponent],
  imports: [ButtonModule, CommonModule, MeshGradientComponent],
  exports: [ProposalApplicationPreviewComponent, ProposalRecommendationDetailComponent]
})
export class ProposalRecommendationDetailModule {}
