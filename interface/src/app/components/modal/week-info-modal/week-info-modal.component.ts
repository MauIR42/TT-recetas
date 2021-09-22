import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import { StockService } from '../../../services/stock.service';
import { SERVER_MESSAGES } from '../../../messages/messages';
import { NgxSpinnerService } from 'ngx-spinner';

declare const $: any;
@Component({
  selector: 'app-week-info-modal',
  templateUrl: './week-info-modal.component.html',
  styleUrls: ['./week-info-modal.component.css']
})
export class WeekInfoModalComponent implements OnInit {

  @Output() reload_stats = new EventEmitter<any>();

  form_info : any = {
    'diameter': {'value': 0, 'validations': ['not_null', 'positive_number'], 'error':''},
    'weight': {'value': 0, 'validations': ['not_null', 'positive_number'], 'error':''}
  }

  server_error : string = '';

  current_step = 1;
  total_steps = 2;

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

  modal_info : any = {
    'delete_item' : '¿Deseas eliminar este ingrediente de tu inventario? Esta acción no se puede deshacer.'
  }

  stock_items : any = [];

  edit_item : any = null;

  success_message : string = '';
  error_server : string = '';

  user_id : number = 0;

  delete_index : number = -1;

  actual_modal : any;

  constructor(private ls : LocalStorageService, private ss: StockService, private spinner: NgxSpinnerService, 
              private us : UserService) { }

  ngOnInit(): void {
    this.user_id = this.ls.getItem("TT_id");
    let that = this;
      $( document ).ready(function() {
          console.log( "ready!" );
          $('#stock').DataTable({ "language": that.language });
      });
    this.reload_stock('');
  }

  close_modal(){
    this.form_info['diameter']['value'] = 0;
    this.form_info['weight']['value'] = 0;
    $('#health_form').modal('hide');
  }

  send_data(){
    let correct = true;

    for(let key in this.form_info ){
      console.log(key)
      let value = this.form_info[key];
      console.log(value)
      value['error'] = '';
      for(let i=0; i< value['validations'].length; i++ ){
        console.log(value['validations'][i])
        if(value['validations'][i] == 'not_null' && value['value'] == null )
          value['error'] = "Este campo no puede estar vacío";
        if(value['validations'][i] == 'positive_number' && !(Number.isFinite(value['value']) && value['value'] > 0 ) )
          value['error'] = "Este campo solo acepta enteros positivos";
      }
      if( value['error'].length > 0)
        correct = false;
    }

    if(correct){
      let imc = this.form_info['weight']['value'] / (2);
      let form = new FormData();
      form.append('imc', imc.toString());
      form.append('weight', this.form_info['weight']['value']);
      form.append('diameter', this.form_info['diameter']['value']);
      form.append('user_id', '0');
      this.spinner.show("loader");
      this.us.post_stat_info(form).subscribe( (data: any)=>{
        console.log(data);
        if(data['error']){
          this.spinner.hide("loader");
          this.server_error = SERVER_MESSAGES[data['message']];
          return;
        }

        this.spinner.hide("loader");
        this.close_modal();
      });
    }

  }

  start_edit(event:any, item:any){
    event.preventDefault();
  }

  reload_stock(success_message: string){
    $('#stock').DataTable().destroy();
    this.stock_items  = [ ];
    this.delete_index  = -1;
    this.spinner.show("loader");
    this.ss.get_stock({'user_id': this.user_id}).subscribe( (stock_data : any) =>{
      if(stock_data['error']){
        this.error_server = SERVER_MESSAGES[stock_data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.stock_items = stock_data['subidos'];
      // this.pending_items = stock_data['pendientes'];
      let that = this;
      $( document ).ready(function() {
          console.log( "ready!" );
          $('#stock').DataTable({ "language": that.language });
      });
      this.spinner.hide("loader");
      this.success_message = success_message;

    });
  }

  check_action(result : any){
    if( result['accepted'] ){
      if( result['action'] == 'delete_item' )
        this.delete_item();
    }
  }

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

}
