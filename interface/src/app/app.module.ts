import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login/login.component';
import { FormsModule } from '@angular/forms';
import { RecoveryPasswordComponent } from './components/recovery-password/recovery-password.component';
import { RegisterComponent } from './components/register/register.component';
import { HeaderComponent } from './components/header/header.component';
import { StockComponent } from './components/stock/stock.component';
import { ConfirmationModalComponent } from './components/modal/confirmation-modal/confirmation-modal.component';
import { UserInfoComponent } from './components/user-info/user-info.component';

import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { FormModalComponent } from './components/modal/form-modal/form-modal.component';
import { HeathModalComponent } from './components/modal/heath-modal/heath-modal.component';
import { IngredientModalComponent } from './components/modal/ingredient-modal/ingredient-modal.component';
import { DatetimeOnePipe } from './pipes/datetime-one.pipe';
import { PlanningRecipeComponent } from './components/planning-recipe/planning-recipe.component';
import { WeekInfoModalComponent } from './components/modal/week-info-modal/week-info-modal.component';
import { ModalRateRecipeComponent } from './components/modal/modal-rate-recipe/modal-rate-recipe.component';
import { ObtainedImagesComponent } from './components/info/obtained-images/obtained-images.component';
import { TermsComponent } from './components/info/terms/terms.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RecoveryPasswordComponent,
    RegisterComponent,
    HeaderComponent,
    StockComponent,
    ConfirmationModalComponent,
    UserInfoComponent,
    ResetPasswordComponent,
    FormModalComponent,
    HeathModalComponent,
    IngredientModalComponent,
    DatetimeOnePipe,
    PlanningRecipeComponent,
    WeekInfoModalComponent,
    ModalRateRecipeComponent,
    ObtainedImagesComponent,
    TermsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
