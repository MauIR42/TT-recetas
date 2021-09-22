import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
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

  @Input() set show_modal(val: any){
    if(val){
    }
    else{
      $('#planning_modal').modal('hide');
    }
  }

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

  to_delete : any = {};

  stock_warning = false;
  confirm_send = false;

  constructor(private ls : LocalStorageService, private ss: StockService, private spinner: NgxSpinnerService, 
              private us : UserService) { }

  ngOnInit(): void {
    this.user_id = this.ls.getItem("TT_id");
    let that = this;
    this.reload_stock('');
  }

  close_modal(){
    this.form_info['diameter']['value'] = 0;
    this.form_info['weight']['value'] = 0;
    $('#planning_modal').modal('hide');
  }

  send_data(){
    console.log("entra");
    return;
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

  check_info(){
    let add = false;
    if( this.current_step == 1 && this.check_health_data()){
      this.current_step = this.current_step + 1;
    }
    else if( this.current_step == 2 && this.check_stock_data() ){
      this.send_data();
    }
  }


  check_health_data(){
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
    return correct;
  }

  check_stock_data(){
    this.stock_warning = false;
    if(Object.keys(this.to_delete).length == 0 && !this.confirm_send){
      this.stock_warning = true;
      return false;
    }
    this.confirm_send = false;
    return true;
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
      console.log( stock_data);
      this.stock_items = stock_data['subidos'];
      // this.pending_items = stock_data['pendientes'];
      let that = this;
      $( document ).ready(function() {
        // setTimeout(function () {
          console.log( "ready!" );
          $('#stock').DataTable({ "language": that.language });
          // $('#example2').DataTable();
        // }, 2000);
      });
      this.spinner.hide("loader");
      this.success_message = success_message;

    });
  }


  check_delete(index: any){
    this.stock_warning = false;
    console.log(index);
    if(index in this.to_delete){
      delete this.to_delete[ index ];
    }else
      this.to_delete[ index ] = true;
    console.log(this.to_delete);
  }

}
