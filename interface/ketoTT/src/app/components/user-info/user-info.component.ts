import { Component, OnInit } from '@angular/core';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

declare const $ : any;

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
    let ctx = $("#IMC");
    const labels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"]
    const data = {
      labels: labels,
      datasets: [{
        label: 'Indice de masa corporal',
        data: [40, 39, 35, 34, 30, 29, 25],
        fill: false,
        borderColor: '#FDC216',
        tension: 0.1
      }],
      // responsive : true,
    };
    let IMC = new Chart(ctx, {type: 'line',
        data: data
      });

    let ctx_peso = $("#peso");
    // const labels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"]
    const data_peso = {
      labels: labels,
      datasets: [{
        label: 'Pesos registrados',
        data: [40, 39, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: '#0AAFC6',
        tension: 0.1
      }],
      // responsive : true,
    };
    let peso = new Chart(ctx_peso, {type: 'line',
        data: data_peso
      });

    let ctx_abdomen = $("#abdomen");
    // const labels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"]
    const data_abdomen = {
      labels: labels,
      datasets: [{
        label: 'Pesos registrados',
        data: [40, 39, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: '#0AAFC6',
        tension: 0.1
      }],
      // responsive : true,
    };
    let abdomen = new Chart(ctx_abdomen, {type: 'line',
        data: data_abdomen
      });
  }


  open_modal_edit(event: any){
    console.log("abrir");
  }

}
