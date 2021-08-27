import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { SERVER_MESSAGES } from '../../messages/messages';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  loader_message: string = 'revisando...';
  show_success: boolean = false;
  send_data: boolean = true;

  pass: string = '';
  pass_check: string = '';

  pass_error: string = '';
  pass_check_error: string = '';

  user_token: string = '';

  server_error: string = '';

  constructor(private us : UserService, private spinner: NgxSpinnerService, 
              private router: Router, private ar: ActivatedRoute,
              private ls : LocalStorageService) {
    if( this.ls.getItem('TT_id') )
      this.router.navigate(["perfil"]);
    this.spinner.show("loader");
    let aux = this.ar.snapshot.paramMap.get('recovery_token');
    if(aux)
      this.user_token = aux;  
    console.log(this.user_token);
  }

  ngOnInit(): void {
    this.us.check_recovery_token({'token': this.user_token}).subscribe( (data:any) =>{
      console.log(data);
      if(data['error']){
        this.spinner.hide("loader");
        this.router.navigate([""]);
      }
      this.spinner.hide("loader");
      this.send_data = false;
    });
      
  }

  reset_password(){
    console.log(this.pass,this.pass_check)
    this.pass_error = '';
    this.pass_check_error = '';
    // let send = true;
    if( !(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[/#$&])[A-Za-z\d/#$&]{8,}$/.test(this.pass)) ){
      this.pass_error = "Contraseña no valida.";
      return;    
    }

    if( this.pass != this.pass_check){
      this.pass_check_error = 'Las contraseñas no coinciden';
      return;
    }
    let form = new FormData();
    form.append('pass',this.pass);
    // form.append('user_id', this.user_id);
    form.append('token', this.user_token);
    this.spinner.show("loader");
    this.us.reset_password(form).subscribe( (data: any)=>{
      console.log(data);
      this.spinner.hide("loader");
      if(data['error']){
        this.server_error = SERVER_MESSAGES[data['message']];
        return;
      }
      this.show_success = true;
      setTimeout(() => {
        this.router.navigate([""]);
      }, 5000);

    });
  }

}
