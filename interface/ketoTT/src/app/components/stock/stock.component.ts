import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  user_type :number = 3;

  type_info : any = {
    1 : {'name':'Sin báscula', form_use:true, text: 1 },
    2 : {'name':'Con báscula', form_use:false, text:2},
    3 : {'name':'Administrador', form_use:false, text:2},
    4 : {'name':'Sin báscula', form_use:true, text: 1},
    5 : {'name':'Sin báscula', form_use:true, text: 1},
  }

  scale_users : any = [
    {
      'name': 'Martin Perez',
      'id': 504,
      'pending' : true
    },
    {
      'name': 'Juanita Perez',
      'id': 505,
      'pending' : false
    },
    {
      'name': 'Marcos Perez',
      'id': 506,
      'pending' : true
    },
    {
      'name': 'Karen Perez',
      'id': 507,
      'pending' : false
    },

  ];

  current_users : any = [
    {
        'name': 'Juanita Perez',
        'id': 505,
      },
    {
        'name': 'Karen Perez',
        'id': 507,
      },
  ]

  associated_scale : string = "xxx-xxx";

  accept_user(event: any, user_id: number){
    event.preventDefault();
    console.log("aceptar usuario", user_id);
  }

  delete_user(event: any, user_id: number){
    event.preventDefault();+
    console.log("eliminar usuario", user_id);
  }

  constructor() { }

  ngOnInit(): void {
  }

  change_user_type(event : any){
    console.log("listo!");
    event.preventDefault();
  }

  check(){
    console.log("se revisa");
  }

}
