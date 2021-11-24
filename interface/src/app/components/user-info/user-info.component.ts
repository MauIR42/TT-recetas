import { Component, OnInit } from '@angular/core';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { UserService } from '../../services/user.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { SERVER_MESSAGES } from '../../messages/messages';
import { forkJoin  } from 'rxjs';
declare var $ : any;

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  user_info : any = {
    'first_name': "",
    'last_name': "",
    'birthday': "",
    'gender': '',
    'username': "",
    'height' : 0
  };

  user_id : number = -1;

  error_server: string = "";

  show_success : boolean = false;

  // graphs: any = [{'id':'peso'},{'id':'abdomen'},{'id':'IMC'}];
  graphs : any = [];
  graphs_empty: boolean = false;

  no_recipes : boolean = true;

  health_type : any = {};

  recipes : any = [];

  table : any;

  detail_info : any = [];

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

  current_recipe : string = '';

  constructor(private us : UserService, private spinner: NgxSpinnerService, 
              private ls : LocalStorageService, private router: Router) { 
    this.user_id = this.ls.getItem('TT_id');
    if(! this.user_id)
      this.router.navigate([""])
    this.spinner.show("loader");
  }

  ngOnInit(): void {
    let petitions = [
      this.us.get_user_info({'user_id':this.user_id}),
      this.us.get_user_health_data({'user_id':this.user_id}),
      this.us.get_user_recipe_data({'user_id':this.user_id, 'all':1})
    ]
    forkJoin(petitions).subscribe( (data : any)=>{
      console.log(data);
      let info_data = data[0];
      let health_info = data[1];
      let recipe_data = data[2];

      if(info_data['error']){
        this.error_server = SERVER_MESSAGES[info_data['message']];
        this.spinner.hide("loader");
        return;
      }
      info_data['user_info']['user_id'] = this.user_id;
      this.user_info = info_data['user_info'];
      this.spinner.hide("loader");

      if(health_info['error']){
        this.error_server = SERVER_MESSAGES[health_info['message']];
        this.spinner.hide("loader");
        return;
      }

      if( ! health_info['data']['has_data']){
        this.health_type = health_info['data']['info'];
        this.graphs_empty = true;
      }
      else{
        let blue = true;
        for(let key in health_info['data']['info']){
          let color = (blue) ? '#0AAFC6' : '#FDC216';
          blue = !blue;
          this.create_stat(health_info['data']['info'][key],color);
        }
      }

      if( recipe_data['recipes'].length > 0){
        this.no_recipes = false;
        this.recipes = recipe_data['recipes'];
        let that = this;
        $( document ).ready(function() {
          that.table = $('#recipe_table').DataTable({ 
            "language": that.language,
            "columnDefs": [
              {
                  "targets": [ 3 ],
                  "visible": false,
                  "searchable": false
            }]
          });
           $('#recipe_table tbody').on('click', 'tr', function ( this : any) {
            var data = that.table.row( this ).data();
            that.load_recipe_detail_info({'name':data[0], 'id':data[3]});
          } );
        });

      }

    });
}


  open_modal_edit(name:string, event: any){
    event.preventDefault();
    console.log('test');
    $('#'+ name).modal("show");
  }

  check_result(data : any){
    console.log(data);
    this.user_info = data['data'];
    this.show_success = true;
  }

  create_stat(info : any, color: string){
    console.log(info)
    this.graphs.push({'id':info['stat']});
    $(document).ready(function() {
    let ctx = $("#" + info['stat']);
    const chart_info = {
        labels: info['labels'],
        datasets: [{
          label: info['stat'],
          data: info['value'],
          fill: false,
          borderColor: color,
          tension: 0.1
        }],
      };
      // let that = this;
      let aux = new Chart(ctx, {type: 'line',
          data: chart_info,
          options: {
              scales: {
                  y: {
                      ticks: {
                          callback: function(value, index, values) {
                              return value + ' ' + ( (info['unit'] != null) ? info['unit'] : '');
                          }
                      }
                  }
              }
          }
      });
    });

  }

  load_recipe_detail_info(data_recipe : any){
    this.us.get_user_recipe_data({'user_id':this.user_id, 'recipe_id':data_recipe['id']}).subscribe( (data : any)=>{
      console.log(data);
      this.detail_info = data['recipes'];
      this.current_recipe = data_recipe['name'];
    });
  }

}
