import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { SERVER_MESSAGES } from '../../messages/messages';
@Component({
  selector: 'app-recovery-password',
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent implements OnInit {

  email : string = '';

  email_error: string = '';

  show_success: boolean = false;

  constructor(private us : UserService, private spinner: NgxSpinnerService, 
              private ls : LocalStorageService, private router: Router) {
    if( this.ls.getItem('TT_id') )
      this.router.navigate(["perfil"])
  }

  ngOnInit(): void {
  }

  send_email(){
    this.email_error = '';
    if(! (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) ){
      this.email_error = "El dato proporcionado no es un correo.";
      return;
    }
    let form = new FormData();
    form.append('email',this.email);
    this.spinner.show("loader");
    this.us.request_recovery_password(form).subscribe( (data : any)=>{
      console.log(data)
      if( data['error'] ){
        this.email_error = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.spinner.hide("loader");
      this.show_success = true;
    });

      
  }

}
