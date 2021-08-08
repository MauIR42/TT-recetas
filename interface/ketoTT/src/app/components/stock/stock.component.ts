import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

declare const $ : any;

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  // @ViewChild("modal_component", { static: true }) modal_component:ElementRef;

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

  menu = 'scale';

  stock_items : any = [
    {
      'name' : 'Jamón',
      'id':'1',
      'quantity':'1',
      'q_type': 'kg.',
      'type': 'subido',
      'created_at': '08/08/2021'
    },
    {
      'name' : 'Leche',
      'id':'1',
      'quantity':'1',
      'q_type': 'Lt.',
      'type': 'subido',
      'created_at': '07/08/2021'
    },
    {
      'name' : 'Harina de almendras',
      'id':'1',
      'quantity':'500',
      'q_type': 'gr.',
      'type': 'lista de compra',
      'created_at': '07/08/2021'
    },
    {
      'name' : 'Tocino',
      'id':'1',
      'quantity':'250',
      'q_type': 'gr.',
      'type': 'subido',
      'created_at': '08/08/2021'
    },
    {
      'name' : 'Huevo',
      'id':'1',
      'quantity':'400',
      'q_type': 'gr.',
      'type': 'subido',
      'created_at': '07/08/2021'
    },
    {
      'name' : 'Queso Oaxaca',
      'id':'1',
      'quantity':'1.5',
      'q_type': 'kg.',
      'type': 'lista de compra',
      'created_at': '07/08/2021'
    },
    {
      'name' : 'Aceite de oliva',
      'id':'1',
      'quantity':'200',
      'q_type': 'ml.',
      'type': 'subido',
      'created_at': '08/08/2021'
    },
    {
      'name' : 'Cacao en polvo',
      'id':'1',
      'quantity':'20',
      'q_type': 'gr.',
      'type': 'subido',
      'created_at': '07/08/2021'
    },
    {
      'name' : 'Camaron',
      'id':'1',
      'quantity':'200',
      'q_type': 'gr.',
      'type': 'lista de compra',
      'created_at': '07/08/2021'
    },
  ]

  modal_info : any = {
    'remove_scale' : '¿Deseas desvincularse de la báscula? Para volver a usarla deberá reiniciar el proceso.',
    'restart_scale' : '¿Deseas reiniciar la báscula? esta acción no se puede deshacer.'
  }

  actual_modal : any;

  constructor(private router: Router) {
    console.log(this.router.url)
    this.menu = this.router.url.replace(/\//g, '');
   }

  ngOnInit(): void {
  }

  accept_user(event: any, user_id: number){
    event.preventDefault();
    console.log("aceptar usuario", user_id);
  }

  delete_user(event: any, user_id: number){
    event.preventDefault();
    console.log("eliminar usuario", user_id);
  }

  edit_item(event: any, item_id: number){
    event.preventDefault();
    console.log("editar ingrediente", item_id);
  }

  delete_item(event: any, item_id: number){
    event.preventDefault();
    console.log("eliminar ingrediente", item_id);
  }

  restart_scale(event: any){
    event.preventDefault();
    console.log("reiniciar bascula");
  }

  change_user_type(event : any){
    console.log("listo!");
    event.preventDefault();
  }

  check(){
    console.log("se revisa");
  }

  change_menu(event : any, menu : string){
    event.preventDefault();
    this.menu = menu;

  }

  open_modal(type : string, event : any = null){
    if(event != null)
      event.preventDefault();

    this.actual_modal = {
      'type' : type,
      'text' : this.modal_info[type]
    };
    $('#conf_modal').modal("show");
  }

  check_action(accepted : any){
    console.log(accepted);
  }

}
