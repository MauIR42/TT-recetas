import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login/login.component';
import { RecoveryPasswordComponent } from './components/recovery-password/recovery-password.component';
import { HeaderComponent } from './components/header/header.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  { path:'test', component: HeaderComponent },
  { path:'perfil', component: HeaderComponent },
  { path:'estadisticas', component: HeaderComponent },
  { path:'inventario', component: HeaderComponent },
  { path:'bascula', component: HeaderComponent },
  { path:'planeacion_semanal', component: HeaderComponent },
  { path:'dieta_keto', component: HeaderComponent },
  { path:'sindrome_metabolico', component: HeaderComponent },
  { path:'recuperar_contraseña', component: RecoveryPasswordComponent },
  { path:'crear_cuenta', component: RegisterComponent },
  { path: '', component: LoginComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
