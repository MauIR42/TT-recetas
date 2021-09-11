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
  success_message : string = '';

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

  stock_items : any = [ ];

  pending_items : any = [];

  modal_info : any = {
    'remove_scale' : '¿Deseas desvincularse de la báscula? Para volver a usarla deberá reiniciar el proceso.',
    'restart_scale' : '¿Deseas reiniciar la báscula? Esta acción no se puede deshacer.',
    'delete_item' : '¿Deseas eliminar este ingrediente de tu inventario? Esta acción no se puede deshacer.'
  }

  actual_modal : any;

  new_admin: number = -1;

  delete_index : number = -1;

  edit_item : any = null;

  language : any = {
    "emptyTable":     "No hay ingredientes en la tabla",
    "info":           "mostrando _START_ a _END_ de  _TOTAL_ ingredientes",
    "infoEmpty":      "No hay ingredientes por mostrar",
    "infoFiltered":   "(filtrado de un total de _MAX_ ingredientes)",
    "lengthMenu":     "mostrar hasta _MENU_ ingredientes",
    "search":         "Buscar:",
    "zeroRecords":    "No se encontraron datos",
    "paginate": {
        "first":      "Primera",
        "last":       "Última",
        "next":       "Siguiente",
        "previous":   "Anterior"
    },
    "aria": {
        "sortAscending":  ": activar para ordenar en ascenso",
        "sortDescending": ": activar para ordenar en descenso"
    }
  }

  constructor(private router: Router, private ls : LocalStorageService, private ss: StockService, private spinner: NgxSpinnerService) {
    this.menu = this.router.url.replace(/\//g, '');
    if(this.menu == 'inventario')
      this.loader_message = 'cargando inventario';
    else
      this.loader_message = 'obteniendo información de báscula';
    this.spinner.show("loader");
   }

  ngOnInit(): void {
    // let header: any = ['titulo1', 'titulo2', 'titulo3'];
    // let data: any = [['test','test2','test3'], ['test','test2','test3'], ['test','test2','test3'], ['test','test2','test3']];
    this.user_id = this.ls.getItem("TT_id");
    if(! this.user_id)
      this.router.navigate([""])
    let services = [
      this.ss.get_scale_info({'user_id': this.user_id}),
      this.ss.get_stock({'user_id': this.user_id}),
    ]

    forkJoin(services).subscribe( (data)=>{
      console.log(data)
      let scale_data : any = data[0];
      let stock_data : any = data[1];
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

      if(stock_data['error']){
        this.error_server = SERVER_MESSAGES[stock_data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.stock_items = stock_data['subidos'];
      this.pending_items = stock_data['pendientes'];
      let that = this;
      $( document ).ready(function() {
          console.log( "ready!" );
          $('#stock').DataTable({ "language": that.language });
          $('#pending_stock').DataTable({ "language": that.language });
      });
      this.spinner.hide("loader");
    });

  }

  start_edit(event:any, item:any){
    event.preventDefault();
    this.edit_item = item;
  }

  // edit_item(event: any, index: number){
  //   event.preventDefault();
  //   console.log("editar ingrediente", index);
  // }

  delete_item(){
    if(this.delete_index > -1){
      let form = new FormData();
      form.append('item_id',this.stock_items[this.delete_index]['id']);
      form.append('deactivate', '1');
      this.spinner.show("loader");
      this.ss.put_stock(form).subscribe( (data : any)=>{
        if(data['error']){
          this.error_server = SERVER_MESSAGES[data['message']];
          this.spinner.hide("loader");
          return;
        }
        this.spinner.hide("loader");
        this.reload_stock("Ingrediente eliminado");
      });
    }
  }

  restart_scale(){
    this.spinner.show('loader');
    let form = new FormData();
    this.spinner.show("loader");
    this.ss.restart_scale({"user_id" : this.user_id.toString()}).subscribe( (data : any)=>{
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

  open_modal(type : string, event : any = null, delete_index : any = null){
    console.log(delete_index)
    if(event != null)
      event.preventDefault();
    if(delete_index != null)
      this.delete_index = delete_index;

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
      else if( result['action'] == 'delete_item' )
        this.delete_item();
    }
  }

  open_ingredient_modal(event:any){
    event.preventDefault();
    $('#ingredient_modal').modal('show');
  }

  reload_stock(success_message: string){
    $('#stock').DataTable().destroy();
    $('#pending_stock').DataTable().destroy();
    this.stock_items  = [ ];
    this.pending_items  = [];
    this.delete_index  = -1;
    this.spinner.show("loader");
    this.ss.get_stock({'user_id': this.user_id}).subscribe( (stock_data : any) =>{
      if(stock_data['error']){
        this.error_server = SERVER_MESSAGES[stock_data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.stock_items = stock_data['subidos'];
      this.pending_items = stock_data['pendientes'];
      let that = this;
      $( document ).ready(function() {
          console.log( "ready!" );
          $('#stock').DataTable({ "language": that.language });
          $('#pending_stock').DataTable({ "language": that.language });
      });
      this.spinner.hide("loader");
      this.success_message = success_message;

    });
  }

}
