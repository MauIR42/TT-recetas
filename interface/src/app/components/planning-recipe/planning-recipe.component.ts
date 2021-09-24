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
      'date_string' : ''
    },
    'Preparación': {
      'start': moment().startOf('week'),
      'end'  : moment().endOf('week'),
      'next' : 'Planeación',
      'date_string': ''
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

  range_string : string = '';

  to_make_recipes : any = [
    [
      // {'name':'receta 1', 'id_recipe':15, 'duration':20, 'cooked':5, 'ingredient_percentage':100, 'image':"assets/images/test1.jpg", 'id_user_recipe':15, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que habíadsuiwEVBWEUBVUEOWVBWVBDBDSBVODSBBhhrpvfibnvifbnibnsdvvwebvebnhml.,mhnbgfvdc"},
      // {'name':'receta 2', 'id_recipe':15, 'duration':30, 'cooked':3, 'ingredient_percentage':80, 'image':"assets/images/test1.jpg", 'id_user_recipe':16, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 3', 'id_recipe':15, 'duration':40, 'cooked':2, 'ingredient_percentage':75, 'image':"assets/images/test1.jpg", 'id_user_recipe':17, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 4', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':60, 'image':"assets/images/test1.jpg", 'id_user_recipe':18, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 5', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':58, 'image':"assets/images/test1.jpg", 'id_user_recipe':19, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    ],[
      // {'name':'receta 6', 'id_recipe':15, 'duration':20, 'cooked':5, 'ingredient_percentage':59, 'image':"assets/images/test1.jpg", 'id_user_recipe':20, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 7', 'id_recipe':15, 'duration':30, 'cooked':3, 'ingredient_percentage':38, 'image':"assets/images/test1.jpg", 'id_user_recipe':21, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 8', 'id_recipe':15, 'duration':40, 'cooked':2, 'ingredient_percentage':20, 'image':"assets/images/test1.jpg", 'id_user_recipe':22, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 9', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':15, 'image':"assets/images/test1.jpg", 'id_user_recipe':23, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 10', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':0, 'image':"assets/images/test1.jpg", 'id_user_recipe':24, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    ],[
      // {'name':'receta 1', 'id_recipe':15, 'duration':20, 'cooked':5, 'ingredient_percentage':100, 'image':"assets/images/test1.jpg", 'id_user_recipe':25, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 2', 'id_recipe':15, 'duration':30, 'cooked':3, 'ingredient_percentage':80, 'image':"assets/images/test1.jpg", 'id_user_recipe':26, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 3', 'id_recipe':15, 'duration':40, 'cooked':2, 'ingredient_percentage':75, 'image':"assets/images/test1.jpg", 'id_user_recipe':27, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 4', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':60, 'image':"assets/images/test1.jpg", 'id_user_recipe':28, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 5', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':58, 'image':"assets/images/test1.jpg", 'id_user_recipe':29, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    ],[
      // {'name':'receta 6', 'id_recipe':15, 'duration':20, 'cooked':5, 'ingredient_percentage':59, 'image':"assets/images/test1.jpg", 'id_user_recipe':30, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 7', 'id_recipe':15, 'duration':30, 'cooked':3, 'ingredient_percentage':38, 'image':"assets/images/test1.jpg", 'id_user_recipe':31, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 8', 'id_recipe':15, 'duration':40, 'cooked':2, 'ingredient_percentage':20, 'image':"assets/images/test1.jpg", 'id_user_recipe':32, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 9', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':15, 'image':"assets/images/test1.jpg", 'id_user_recipe':33, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 10', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':0, 'image':"assets/images/test1.jpg", 'id_user_recipe':34, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    ],[
      // {'name':'receta 1', 'id_recipe':15, 'duration':20, 'cooked':5, 'ingredient_percentage':100, 'image':"assets/images/test1.jpg", 'id_user_recipe':35, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 2', 'id_recipe':15, 'duration':30, 'cooked':3, 'ingredient_percentage':80, 'image':"assets/images/test1.jpg", 'id_user_recipe':36, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 3', 'id_recipe':15, 'duration':40, 'cooked':2, 'ingredient_percentage':75, 'image':"assets/images/test1.jpg", 'id_user_recipe':37, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 4', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':60, 'image':"assets/images/test1.jpg", 'id_user_recipe':38, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 5', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':58, 'image':"assets/images/test1.jpg", 'id_user_recipe':39, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    ],[
      // {'name':'receta 6', 'id_recipe':15, 'duration':20, 'cooked':5, 'ingredient_percentage':59, 'image':"assets/images/test1.jpg", 'id_user_recipe':40, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 7', 'id_recipe':15, 'duration':30, 'cooked':3, 'ingredient_percentage':38, 'image':"assets/images/test1.jpg", 'id_user_recipe':41, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 8', 'id_recipe':15, 'duration':40, 'cooked':2, 'ingredient_percentage':20, 'image':"assets/images/test1.jpg", 'id_user_recipe':42, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 9', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':15, 'image':"assets/images/test1.jpg", 'id_user_recipe':43, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
      // {'name':'receta 10', 'id_recipe':15, 'duration':70, 'cooked':18, 'ingredient_percentage':0, 'image':"assets/images/test1.jpg", 'id_user_recipe':44, 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    ],[
    ],
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

    this.menu['Planeación']['date_string'] = 'del ' + this.menu[ 'Planeación' ]['start'].format("DD") + ' al ' +this.menu[ 'Planeación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");;

    this.menu['Preparación']['date_string'] = 'del ' + this.menu[ 'Preparación' ]['start'].format("DD") + ' al ' +this.menu[ 'Preparación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");

    this.range_string = this.menu[this.current]['date_string'];
    // $(document).ready(function() {
    //   $("#planning_modal").modal("show");
    // });

  }

  get_recipe(element: any,event: any = null){
    if(event)
      event.preventDefault();
    console.log(element);
    this.current_recipe = element['id_user_recipe'];
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
    this.range_string = this.menu[this.current]['date_string'];
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
