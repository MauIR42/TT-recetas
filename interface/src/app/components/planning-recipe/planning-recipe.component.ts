import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
declare const $ : any;
@Component({
  selector: 'app-planning-recipe',
  templateUrl: './planning-recipe.component.html',
  styleUrls: ['./planning-recipe.component.css']
})
export class PlanningRecipeComponent implements OnInit {

  loader_message : string = "Cargando...";
  current : string = "Preparación";

  menu : any = {
    'Planeación': {
      'start': moment().startOf('week').add(7 ,'d'),
      'end'  : moment().endOf('week').add(7 ,'d'),
      'next' : 'Preparación',
    },
    'Preparación': {
      'start': moment().startOf('week'),
      'end'  : moment().endOf('week'),
      'next' : 'Planeación',
    }
  }

  cooked : number = 0;
  total : number = 0;
  day_cooked : number = 0;

  total_planned : number = 2;

  days : any = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  current_day : number = 0;
  current_left : string = 'caret-left-square-fill-white.svg';
  current_right : string = 'caret-right-square-fill-white.svg';
  current_recipe : number = 0;

  delete_img = 'x-circle-fill-orange.svg';

  range_string : string = 'arrow-left-white.svg';

  to_make_recipes = [
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18}],
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18},{'name':'abcde', 'id':19},{'name':'abcde', 'id':20},{'name':'abcde', 'id':21},{'name':'abcde', 'id':22}],
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18}],
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18},{'name':'abcde', 'id':19},{'name':'abcde', 'id':20},{'name':'abcde', 'id':21},{'name':'abcde', 'id':22}],
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18}],
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18},{'name':'abcde', 'id':19},{'name':'abcde', 'id':20},{'name':'abcde', 'id':21},{'name':'abcde', 'id':22}],
    [{'name':'abcde', 'id':15},{'name':'abcde', 'id':16},{'name':'abcde', 'id':17},{'name':'abcde', 'id':18}],
  ];

  planning_recipes = [
    [{'name':'receta_1', 'id':15},{'name':'receta_2', 'id':16},],
    [],
    [],
    [],
    [],
    [],
    [],
  ];

  actual_modal : any;

  show_modal : boolean = false;

  side_bar_icon = "arrow-left-white.svg";

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.range_string = 'del ' + this.menu[ this.current ]['start'].format("DD") + ' al ' +this.menu[ this.current ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");
    // $(document).ready(function() {
    //   $("#planning_modal").modal("show");
    // });

  }

  get_recipe(element: any,event: any = null){
    if(event)
      event.preventDefault();
    console.log(element);
    this.current_recipe = element['id'];
  }

  change_day(type: number){
     this.current_day =  (this.current_day + type) % 7;
     if( this.current_day < 0)
      this.current_day = 6;
    this.current_recipe = 0;
  }

  change_menu(next : string){
    // let aux = this.current;
    this.current = next;
    this.range_string = 'del ' + this.menu[ this.current ]['start'].format("DD") + ' al ' +this.menu[ this.current ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");
    // this.next = aux;
  }

  delete_recipe(index : number){
    let text = '¿Estás seguro que deseas eliminar la receta ' + this.planning_recipes[ this.current_day ][index]['name'] + '?';
    console.log(text)
    this.actual_modal = {
      'type' : 'delete_planned_recipe',
      'text' : text,
      'info' : index
    };
    $('#conf_modal').modal("show");
  }

  check_action(event: any){
    if(event['accepted']){
      if(event['action'] == 'delete_planned_recipe'){
        this.planning_recipes[ this.current_day ].splice(event['info'],1);
        this.total_planned -= 1;
      }
    }
  }

  hide_bar(){
    if(!$("#sidebar-container").is(":hidden")){
      this.side_bar_icon = "arrow-right-white.svg";
      $(document).ready(function() {
        $("#sidebar-container").hide(1000);
      } );
    }
    else{
      this.side_bar_icon = "arrow-left-white.svg";
      $("#sidebar-container").show();
    }
  }
  show_bar(){
  }

}
