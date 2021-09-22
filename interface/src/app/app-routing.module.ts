import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login/login.component';
import { RecoveryPasswordComponent } from './components/recovery-password/recovery-password.component';
import { HeaderComponent } from './components/header/header.component';
import { RegisterComponent } from './components/register/register.component';
import { StockComponent } from './components/stock/stock.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { PlanningRecipeComponent } from './components/planning-recipe/planning-recipe.component'

import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [
  { path:'perfil', component: UserInfoComponent },
  { path:'estadisticas', component: UserInfoComponent },
  { path:'inventario', component: StockComponent },
  { path:'bascula', component: StockComponent },
  { path:'planeacion_semanal', component: PlanningRecipeComponent }, //falta
  { path:'dieta_keto', component: HeaderComponent }, //falta
  { path:'sindrome_metabolico', component: HeaderComponent }, //falta
  { path:'recuperar_contraseña', component: RecoveryPasswordComponent },
  { path:'recuperar_contraseña/:recovery_token', component: ResetPasswordComponent },
  { path:'crear_cuenta', component: RegisterComponent },
  { path: '', component: LoginComponent },
  { path: '**', component: LoginComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
