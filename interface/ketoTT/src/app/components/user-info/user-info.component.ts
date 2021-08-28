import { Component, OnInit } from '@angular/core';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { UserService } from '../../services/user.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { SERVER_MESSAGES } from '../../messages/messages';
import { forkJoin  } from 'rxjs';
declare const $ : any;

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

  };

  user_id : number = -1;

  error_server: string = "";

  show_success : boolean = false;

  graphs: any = [];
  graphs_empty: boolean = false;

  health_type : any = {};

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
      this.us.get_user_health_data({'user_id':this.user_id})
    ]
    forkJoin(petitions).subscribe( (data : any)=>{
      console.log(data);
      let info_data = data[0];
      let health_info = data[1];

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
        for(let key in health_info['data'])
          console.log(health_info['data'][key])
      }

    });

    // let ctx = $("#IMC");
    // const labels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"]
    // const data = {
    //   labels: labels,
    //   datasets: [{
    //     label: 'Indice de masa corporal',
    //     data: [40, 39, 35, 34, 30, 29, 25],
    //     fill: false,
    //     borderColor: '#FDC216',
    //     tension: 0.1
    //   }],
    // };
    // let IMC = new Chart(ctx, {type: 'line',
    //     data: data
    //   });

    // let ctx_peso = $("#peso");
    // const data_peso = {
    //   labels: labels,
    //   datasets: [{
    //     label: 'Pesos registrados',
    //     data: [40, 39, 80, 81, 56, 55, 40],
    //     fill: false,
    //     borderColor: '#0AAFC6',
    //     tension: 0.1
    //   }],
    // };
    // let peso = new Chart(ctx_peso, {type: 'line',
    //     data: data_peso
    //   });

    // let ctx_abdomen = $("#abdomen");
    // const data_abdomen = {
    //   labels: labels,
    //   datasets: [{
    //     label: 'Pesos registrados',
    //     data: [40, 39, 80, 81, 56, 55, 40],
    //     fill: false,
    //     borderColor: '#0AAFC6',
    //     tension: 0.1
    //   }],
    // };
    // let abdomen = new Chart(ctx_abdomen, {type: 'line',
    //     data: data_abdomen
    // });
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

}
