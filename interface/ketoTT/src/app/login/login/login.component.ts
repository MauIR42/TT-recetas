import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

import { SERVER_MESSAGES } from '../../messages/messages';
declare const $ : any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email : string = '';
  password : string = '';
  email_error : string = '';
  password_error : string = '';
  login_error : string = '';

  constructor(private us : UserService, private spinner: NgxSpinnerService, 
              private ls : LocalStorageService, private router: Router) { 
    if( this.ls.getItem('TT_id') )
      this.router.navigate(["perfil"])
  }

  ngOnInit(): void {
  }



  login(){
    this.email_error = '';
    this.password_error = '';
    let ok = true;
    if(! (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) ){
      this.email_error = "El dato proporcionado no es un correo.";
      ok = false;
    }
      
    if(! (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[/#$&])[A-Za-z\d/#$&]{8,}$/.test(this.password)) ){
      this.password_error = "La contraseña debe tener al menos 8 caracteres y debe contener al menos un número, un caracter especial ( /, #, $ o  &) y una letra mayúscula.";
      ok = false;
    }
    this.spinner.show("loader");
    if(ok){
      this.us.auth_user({'username':this.email, 'pass':this.password}).subscribe( (data : any) =>{
        if(data['error']){
          this.login_error = SERVER_MESSAGES[data['message']];
          this.spinner.hide("loader");
          return;
        }
        this.ls.setItem("TT_id", data['id']);
        this.spinner.hide("loader");
        this.router.navigate(["perfil"]);
      });
    }

  }

}
