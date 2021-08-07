import { Component, OnInit } from '@angular/core';
declare const $ : any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email : string = '';
  password : string = '';

  constructor() { }

  ngOnInit(): void {
  }

  mostrar(){
    console.log(this.email);
    console.log(this.password);
    $("#test2").removeClass("d-none");
  }

}
