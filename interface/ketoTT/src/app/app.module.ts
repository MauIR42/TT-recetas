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
