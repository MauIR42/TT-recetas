import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  menu : string = "perfil";

  user_info : any = {
    'name': "Mauricio Isaac",
    'last_name': "Romero Ponce",
    'birthday': "20/05/1998",
    'genre': 'Hombre',
    'email': "mauricio.200598@gmail.com"

  };

  constructor() { }

  ngOnInit(): void {
  }


  open_modal_edit(event: any){
    console.log("abrir");
  }

}
