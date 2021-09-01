import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from '../../services/local-storage.service';
import { StockService } from '../../services/stock.service';
import { forkJoin  } from 'rxjs';
import { SERVER_MESSAGES } from '../../messages/messages';

declare const $ : any;

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {


  user_id : string = '';

  user_type :number = 1;

  loader_message : string = '';

  error_server: string = '';

  scale_regex : any = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;

  scale_input_error: string = '';

  scale_id : number = -1;

  type_info : any = {
    1 : {'name':'Sin báscula', form_use:true, text: 1 },
    2 : {'name':'Con báscula', form_use:false, text:2},
    3 : {'name':'Administrador', form_use:false, text:2},
    4 : {'name':'Sin báscula', form_use:true, text: 1},
    5 : {'name':'Sin báscula', form_use:true, text: 1},
  }

  scale_users : any = [ ];

  current_users : any = [ ];


  associated_scale : string = "";

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

  new_admin: number = -1;

  constructor(private router: Router, private ls : LocalStorageService, private ss: StockService, private spinner: NgxSpinnerService) {
    this.menu = this.router.url.replace(/\//g, '');
    if(this.menu == 'inventario')
      this.loader_message = 'cargando inventario';
    else
      this.loader_message = 'obteniendo información de báscula';
    this.spinner.show("loader");
   }

  ngOnInit(): void {
    this.user_id = this.ls.getItem("TT_id");
    if(! this.user_id)
      this.router.navigate([""])
    let services = [
      this.ss.get_scale_info({'user_id': this.user_id}),
      // this.ss.get_inventory_info({'user_id': this.user_id}),
    ]

    forkJoin(services).subscribe( (data)=>{
      // console.log(data)
      let scale_data : any = data[0];

      if(scale_data['error']){
        this.error_server = SERVER_MESSAGES[scale_data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.user_type = scale_data['user_type'];
      if( this.user_type == 3 ){
        this.process_users(scale_data['current_users'])
        this.scale_id = scale_data['scale_id'];
      }
      this.spinner.hide("loader");
    });


  }


  edit_item(event: any, item_id: number){
    event.preventDefault();
    console.log("editar ingrediente", item_id);
  }

  delete_item(event: any, item_id: number){
    event.preventDefault();
    console.log("eliminar ingrediente", item_id);
  }

  restart_scale(){
    this.spinner.show('loader');
    let form = new FormData();
    // form.append("scale_id", this.scale_id.toString());
    // form.append('restart', '1');
    this.spinner.show("loader");
    this.ss.restart_scale({"scale_id" : this.scale_id.toString()}).subscribe( (data : any)=>{
      // console.log(data);
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.user_type = 1;
      this.scale_id = -1;
      this.scale_users = [];
      this.current_users = [];
      this.associated_scale = "";
      this.spinner.hide("loader");
    });
  }

  change_user_type(event : any, status:number, user_id: any, position : number = -1 ){
    if( event != null)
      event.preventDefault();
    let form = new FormData();
    let is_current = 0;
    let new_status = 1;
    this.error_server = '';

    if(status == 2 && this.current_users.length + 1 == 5){
      this.error_server = "No puedes agregar más usuarios, has llegado al máximo.";
      return;
    }

    if(status == 3){ //3 a 1 y 1 a 3
      form.append('admin_id', this.user_id);
      is_current = 1;
      new_status = 2;
    }

    else if(this.user_id == user_id){ // 2 a 1, 4 a 1
      is_current = 1;
    }
    form.append('user_id',user_id.toString());
    form.append('status_id',status.toString());
    this.spinner.show("loader");
    this.ss.change_user_type(form).subscribe( (data : any)=>{
      if(data['error']){
            this.error_server = SERVER_MESSAGES[data['message']];
            this.spinner.hide("loader");
            return;
          }
          if( is_current){
            this.user_type = new_status;
            this.current_users = [];
            this.scale_users = [];
          }
          else if( status == 2)
            this.add_user(user_id, position);
          else if( status == 5 || status == 1){
            if( status == 1 )
              this.remove_user(user_id,this.current_users);
            this.scale_users.splice(position,1);
          }

          this.spinner.hide("loader");
      });
  }

  remove_user(id:number, elements: any){
    let position = -1;
    for(let i =0 ; i<elements.length; i++){
      if(id == elements[i]['id']){
        position = i;
        break;
      }
    }
    if(position > -1){
      elements.splice(position,1);
    }
  }

  add_user(user_id : number, position: number){
    this.scale_users[position]['pending'] = false;
    this.current_users.push({
      'name' : this.scale_users[position]['name'],
      'id' : this.scale_users[position]['id']
    })
  }

  check(){
    console.log("se revisa");
  }

  send_scale_id(){
    this.scale_input_error = '';
    if(this.associated_scale.length < 0){
      this.scale_input_error = 'Debes llenar este campo';
      return;
    }
    else if( !(this.scale_regex.test(this.associated_scale) ) ){
      this.scale_input_error = 'Sigue la estructura del código de la báscula (lineas incluidas)';
      return;
    }
    let form = new FormData();

    form.append('user_id', this.user_id);
    form.append('scale_code', this.associated_scale);
    this.spinner.show("loader");
    this.ss.post_scale_request(form).subscribe( (data : any)=>{
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.user_type = data['user_type'];
      if(this.user_type == 3){
        this.ss.get_scale_info({'user_id': this.user_id}).subscribe( (data: any)=>{
          if(data['error']){
            this.error_server = SERVER_MESSAGES[data['message']];
            this.spinner.hide("loader");
            return;
          }
          this.process_users(data['current_users'])
        });
      }
      this.spinner.hide("loader");
    });
  }

  process_users(data: any){
    this.current_users = [];
    this.scale_users = [];
    for(let i =0; i<data.length; i++){
      data[i]['name'] = data[i]['first_name'] + ' ' + data[i]['last_name'];
      data[i]['pending'] = (data[i]['user_type'] == 4) ? true : false;
      delete data[i]['first_name'];
      delete data[i]['last_name'];
      if(! data[i]['pending'])
        this.current_users.push({
          'name': data[i]['name'],
          'id' : data[i]['id']
        })
    }
    this.scale_users = data;
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

  check_action(result : any){
    if( result['accepted'] ){
      if(result['action'] == 'remove_scale')
        this.change_user_type(null,1, this.user_id);
      else if( result['action'] == 'restart_scale' )
        this.restart_scale();
    }
  }

}
