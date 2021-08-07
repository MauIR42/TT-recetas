import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare const $ : any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  selected : number = 0;

  user_id : number = -1;

  icons: any = {
    'info_icon' : { 'base' : "assets/images/info-square-fill", 'options' : ['dieta_keto','sindrome_metabolico']},
    'calendar_icon' : {  'base' : "assets/images/calendar3-week-fill" , 'options' : ['planeacion_semanal']},
    'archive_icon' : {  'base' : "assets/images/archive-fill" , 'options' : ['bascula','inventario']},
    'person_icon' : {  'base' : "assets/images/person-circle" , 'options' : ['estadisticas', 'perfil']},
  }

  current : string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.current = this.router.url.replace(/\//g, '');
    for(let icon in this.icons){
      if( this.icons[icon]['options'].includes(this.current) ){
        this.icons[icon]['base'] += ".svg";
      }
      else
        this.icons[icon]['base'] += "-white.svg";
    }
  }

  logout(){
    console.log("logout");
  }
}
