import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';
declare var $ : any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  selected : number = 0;

  user_id : number = -1;

  icons: any = {
    'info_icon' : { 'base' : "assets/images/info-square-fill", 'options' : ['credito_a_imagenes','tyc']},
    'calendar_icon' : {  'base' : "assets/images/calendar3-week-fill" , 'options' : ['planeacion_semanal']},
    'archive_icon' : {  'base' : "assets/images/archive-fill" , 'options' : ['bascula','inventario']},
    'person_icon' : {  'base' : "assets/images/person-circle" , 'options' : ['perfil']},
  }

  current : string = '';

  constructor(private router: Router, private ls: LocalStorageService) { }

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
    this.ls.clean();
    this.router.navigate([""]);
  }
}
