import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user_info : any = {
    'first_name' : '',
    'last_name' : '',
    'birthday' : '',
    'gender' : '',
    'email' : '',
    'email_check' : '',
    'password' : '',
    'check_password' : '',
    'check_1': false,
    'check_2' : false,

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
    'email' : {'regex': 'email', 'requiered': true},
    'email_check' : {'equal':'email', 'requiered': true},
    'password' : {'regex': 'password'},
    'check_password' : {'equal':'password', 'requiered': true},
    'check_1': {'requiered': true},
    'check_2' : {'requiered': true},
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
    'email' : {'show': false, 'message': ''},
    'email_check' : {'show': false, 'message': ''},
    'password' : {'show': false, 'message': ''},
    'check_password' : {'show': false, 'message': ''},
    'check_1': {'show': false, 'message': ''},
    'check_2' : {'show': false, 'message': ''},
  }
  constructor(private us : UserService) { }

  ngOnInit(): void {
  }

  check_form(event:any){
    console.log(event)
    event.preventDefault;
    // console.log(this.user_info)  
    let confirm = true;
    for(let key in this.validations){
        let value : any = this.validations[key];
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
    }
    
    if( confirm ){
      console.log("se envia")
    }

  }

}
