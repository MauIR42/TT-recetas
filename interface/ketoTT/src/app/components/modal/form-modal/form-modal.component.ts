import { Component, OnInit, Input,  EventEmitter, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../../../services/user.service';
import { SERVER_MESSAGES } from '../../../messages/messages';
declare const $: any;
@Component({
  selector: 'app-form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit {

  @Input() set info(val: any){
    if(val){
      console.log(val)
      this.user_info = Object.assign(this.user_info, val);
      console.log(this.user_info)
    }
  }

  @Output() result = new EventEmitter<any>();

  user_info : any = {
    'first_name' : '',
    'last_name' : '',
    'birthday' : '',
    'gender' : '',
    'username' : '',
    'email_check' : '',
    'password' : '',
    'check_password' : '',
  }

  validations: any = {
    'first_name' : {
      'regex': 'names', 
      'requiered': true
    },
    'last_name' : {
      'regex': 'names', 
      'requiered': true
    },
    'birthday' : {'requiered': true},
    'gender' : {'requiered': true},
    'username' : {'regex': 'email', 'requiered': true},
    'email_check' : {'equal':'username', 'requiered': true},
    'password' : {'regex': 'password'},
    'check_password' : {'equal':'password', 'requiered': true},
  }

  regex : any = {
    'names' : /^[a-zA-Z ]+$/,
    'email': /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    'password': /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[/#$&])[A-Za-z\d/#$&]{8,}$/
  }

  errors : any = {
    'first_name' : {'show': false, 'message': ''},
    'last_name' : {'show': false, 'message': ''},
    'birthday' : {'show': false, 'message': ''},
    'gender' : {'show': false, 'message': ''},
    'username' : {'show': false, 'message': ''},
    'email_check' : {'show': false, 'message': ''},
    'password' : {'show': false, 'message': ''},
    'check_password' : {'show': false, 'message': ''},
  }

  show_pass: boolean = false;

  show_email: boolean = false;

  server_error = '';

  constructor(private spinner: NgxSpinnerService, private us : UserService) { }

  ngOnInit(): void {
  }

  close_modal(){
    this.reset_values();
    $("#edit_form").modal("hide");
  }

  save(){
    let form = new FormData();
    let confirm = true;
    this.server_error = '';
    for(let key in this.validations){
        let value : any = this.validations[key];
        if( (key == 'password' || key == 'check_password') && !this.show_pass )
          continue;
        if( ((key == 'username' || key == 'email_check') && !this.show_email) )
          continue;
        if('requiered' in value && (this.user_info[key].length == 0 || !this.user_info[key] ) ){
          this.errors[key]['show'] = true;
          this.errors[key]['message'] = "Este campo no debe llenarse.";
          confirm = false;
          continue;
        }
        if('regex' in value){
          if(!(this.regex[value['regex']].test(this.user_info[key]))){
            this.errors[key]['show'] = true;
            this.errors[key]['message'] = "Revisa este campo.";
            confirm = false;
            continue;
          }
        }
        if('equal' in value && (this.user_info[key] != this.user_info[value['equal']])){
          this.errors[key]['show'] = true;
          this.errors[key]['message'] = "Los campos no coinciden.";
          confirm = false;
          continue;
        }
        this.errors[key]['show'] = false;
        form.append(key, this.user_info[key]);
    }
    if(confirm){
      this.reset_values();
      form.append('user_id', this.user_info.user_id);
      this.spinner.show("loader");
      this.us.put_user(form).subscribe( (data:any)=>{
        this.spinner.hide("loader");
        if(data['error']){
          // $("#edit_form").modal("hide");
          this.server_error = SERVER_MESSAGES[data['message']];
          return;
        }
        this.result.emit({'error':false, 'data':{
            'first_name': this.user_info.first_name,
            'last_name' : this.user_info.last_name,
            'birthday' : this.user_info.birthday,
            'gender' : this.user_info.gender,
            'username' : this.user_info.username,
          }
        })
        $("#edit_form").modal("hide");
      });
    }
  }

  reset_values(){
    this.show_pass = false;
    this.show_email = false;
    this.user_info.check_password = '';
    this.user_info.email_check = '';
    this.user_info.password = '';
  }

}
