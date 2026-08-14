import { CommonModule } from '@angular/common';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LamComponentsModule } from './components/lam-components.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [BrowserModule, CommonModule, FormsModule, LamComponentsModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [AppComponent]
})
export class AppModule {}
