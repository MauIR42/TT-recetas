import { Component, OnInit, Input } from '@angular/core';
declare var $ : any;
@Component({
  selector: 'app-table-modal',
  templateUrl: './table-modal.component.html',
  styleUrls: ['./table-modal.component.css']
})
export class TableModalComponent implements OnInit {

  @Input() set table_data( data: any){
    if(data && data.length > 0){
      console.log(data);
      this.data = data;
      let that = this;
      $('#recipe_data').DataTable().destroy();
      $( document ).ready(function() {
        $('#recipe_data').DataTable({ 
          "language": that.language,
        });
        $('#table_modal').modal('show');
      });
    }
  }

  @Input() current_recipe : string = '';

  data : any = [];

  status_name : any = {
    1 : "Por preparar",
    2 : "Realizada",
    3 : "Desactivada",
    4 : "Planeada",
  }

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

  constructor() { }

  ngOnInit(): void {
  }

  close_modal(){
    $('#table_modal').modal('hide');
  }

}
