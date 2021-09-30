import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';
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

  user_id : number = -1;

  menu : any = {
    'Planeación': {
      'start': moment().startOf('week').add(7 ,'d'),
      'end'  : moment().endOf('week').add(7 ,'d'),
      'next' : 'Preparación',
      'date_string' : '',
      'total': 2,
      'recipe': [
        [ 
        {'status': 4, 'active':true, 'id_recipe':1, 'id_user_recipe':46, 'ingredient_percentage':100},
          {'status': 4, 'active':true, 'id_recipe':2, 'id_user_recipe':47, 'ingredient_percentage':90},
        ],
        [],
        [],
        [],
        [],
        [],
        [],
      ]
    },
    'Preparación': {
      'start': moment().startOf('week'),
      'end'  : moment().endOf('week'),
      'next' : 'Planeación',
      'date_string': '',
      'total': 1,
      'recipe' : [
        [
          {'status': 3, 'active':false, 'id_recipe':1, 'id_user_recipe':15, 'ingredient_percentage':100, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':2, 'id_user_recipe':16, 'ingredient_percentage':90, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':3, 'id_user_recipe':17, 'ingredient_percentage':80, 'quantity': 1},
          {'status': 2, 'active':true, 'id_recipe':4, 'id_user_recipe':18, 'ingredient_percentage':70, 'quantity': 1},
          {'status': 3, 'active':false, 'id_recipe':5, 'id_user_recipe':19, 'ingredient_percentage':60, 'quantity': 1},
        ],[
          {'status': 3, 'active':false, 'id_recipe':6, 'id_user_recipe':20, 'ingredient_percentage':50, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':7, 'id_user_recipe':21, 'ingredient_percentage':40, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':8, 'id_user_recipe':22, 'ingredient_percentage':30, 'quantity': 1},
          {'status': 2, 'active':true, 'id_recipe':9, 'id_user_recipe':23, 'ingredient_percentage':20, 'quantity': 1},
          {'status': 3, 'active':false, 'id_recipe':10, 'id_user_recipe':24, 'ingredient_percentage':10, 'quantity': 1},
        ],[
          {'status': 3, 'active':false, 'id_recipe':1, 'id_user_recipe':25, 'ingredient_percentage':100, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':2, 'id_user_recipe':26, 'ingredient_percentage':90, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':3, 'id_user_recipe':27, 'ingredient_percentage':80, 'quantity': 1},
          {'status': 2, 'active':true, 'id_recipe':4, 'id_user_recipe':28, 'ingredient_percentage':70, 'quantity': 1},
          {'status': 3, 'active':false, 'id_recipe':5, 'id_user_recipe':29, 'ingredient_percentage':60, 'quantity': 1},
        ],[
          {'status': 3, 'active':false, 'id_recipe':6, 'id_user_recipe':30, 'ingredient_percentage':50, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':7, 'id_user_recipe':31, 'ingredient_percentage':40, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':8, 'id_user_recipe':32, 'ingredient_percentage':30, 'quantity': 1},
          {'status': 2, 'active':true, 'id_recipe':9, 'id_user_recipe':33, 'ingredient_percentage':20, 'quantity': 1},
          {'status': 3, 'active':false, 'id_recipe':10, 'id_user_recipe':34, 'ingredient_percentage':10, 'quantity': 1},
        ],[
          {'status': 3, 'active':false, 'id_recipe':1, 'id_user_recipe':35, 'ingredient_percentage':100, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':2, 'id_user_recipe':36, 'ingredient_percentage':90, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':3, 'id_user_recipe':37, 'ingredient_percentage':80, 'quantity': 1},
          {'status': 2, 'active':true, 'id_recipe':4, 'id_user_recipe':38, 'ingredient_percentage':70, 'quantity': 1},
          {'status': 3, 'active':false, 'id_recipe':5, 'id_user_recipe':39, 'ingredient_percentage':60, 'quantity': 1},
        ],[
          {'status': 3, 'active':false, 'id_recipe':6, 'id_user_recipe':41, 'ingredient_percentage':50, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':7, 'id_user_recipe':42, 'ingredient_percentage':40, 'quantity': 1},
          {'status': 1, 'active':true, 'id_recipe':8, 'id_user_recipe':43, 'ingredient_percentage':30, 'quantity': 1},
          {'status': 2, 'active':true, 'id_recipe':9, 'id_user_recipe':44, 'ingredient_percentage':20, 'quantity': 1},
          {'status': 3, 'active':false, 'id_recipe':10, 'id_user_recipe':45, 'ingredient_percentage':10, 'quantity': 1},
        ],[
        ],
      ]
    }
  }

  cooked : number = 0;
  // total : number = 1;
  day_cooked : number = 0;

  // total_planned : number = 2;

  days : any = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  recomendation_sections : any = ["Aprovecha tus ingredientes", "Lo que te ha gustado", "Lo que no has probado", "Los desayunos", "Las comidas", "Las cenas"];

  recommendations : any = [
    {
      recipe: [
        {'id_recipe':10, 'ingredient_percentage':10},
        {'id_recipe':9, 'ingredient_percentage':10},
        {'id_recipe':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'id_recipe':10, 'ingredient_percentage':10},
        {'id_recipe':9, 'ingredient_percentage':10},
        {'id_recipe':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'id_recipe':10, 'ingredient_percentage':10},
        {'id_recipe':9, 'ingredient_percentage':10},
        {'id_recipe':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'id_recipe':10, 'ingredient_percentage':10},
        {'id_recipe':9, 'ingredient_percentage':10},
        {'id_recipe':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'id_recipe':10, 'ingredient_percentage':10},
        {'id_recipe':9, 'ingredient_percentage':10},
        {'id_recipe':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'id_recipe':10, 'ingredient_percentage':10},
        {'id_recipe':9, 'ingredient_percentage':10},
        {'id_recipe':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    }
  ];


  recipes_info : any = {
    1 : {'name':'receta 1', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que habíadsuiwEVBWEUBVUEOWVBWVBDBDSBVODSBBhhrpvfibnvifbnibnsdvvwebvebnhml.,mhnbgfvdc"},
    2 : {'name':'receta 2', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    3 : {'name':'receta 3', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    4 : {'name':'receta 4', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    5 : {'name':'receta 5', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    6 : {'name':'receta 6', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    7 : {'name':'receta 7', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    8 : {'name':'receta 8', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    9 : {'name':'receta 9', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    10 : {'name':'receta 10', 'duration':20, 'cooked':5, 'image':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
  }

  current_day : number = 0;
  recommendation_list: number = -1;

  current_left : string = 'caret-left-square-fill-white.svg';
  current_right : string = 'caret-right-square-fill-white.svg';

  delete_img = 'x-circle-fill-orange.svg';

  range_string : string = '';

  actual_modal : any;

  show_modal : boolean = false;
  has_recommendations: boolean = true;
  is_recommended = false;

  side_bar_icon = "arrow-left-white.svg";

  // day_recipe : number = 0;
  recipe_index : number = -1;

  show : any = {
    'recommendation' : false,
    'recipe' : false,
    'user_recipes': true,
  }

  selected_index : number = 0;

  status_type: any = {
    1 : 'pendiente',
    2 : 'realizada',
    3 : 'desactivada',
    4 : 'planeada',
  }


  constructor(private router: Router, private spinner: NgxSpinnerService, private ls : LocalStorageService) { }

  ngOnInit(): void {

    this.menu['Planeación']['date_string'] = 'del ' + this.menu[ 'Planeación' ]['start'].format("DD") + ' al ' +this.menu[ 'Planeación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");;

    this.menu['Preparación']['date_string'] = 'del ' + this.menu[ 'Preparación' ]['start'].format("DD") + ' al ' +this.menu[ 'Preparación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");

    this.range_string = this.menu[this.current]['date_string'];

    this.user_id = this.ls.getItem("TT_id");
    if(! this.user_id)
      this.router.navigate([""]);
    // $(document).ready(function() {
    //   $("#planning_modal").modal("show");
    // });

  }

  get_recipe(day: number, index: number,event: any, is_recommended: boolean = false){
    event.preventDefault();
    console.log(day,index);
    if(is_recommended){
      this.is_recommended = true;
      this.recommendation_list = day;
      // this.selected_index = -1;
    }
    else{
      this.is_recommended = false;
      // this.current_day = day;
      this.selected_index = day;
      // this.recommendation_list = -1;
    }
    this.recipe_index = index;
    this.change_view('recipe')
  }

  change_day(type: number){
    this.current_day =  (this.current_day + type) % 7;
    if( this.current_day < 0)
      this.current_day = 6;
  }

  change_menu(next : string){
    // let aux = this.current;
    this.current = next;
    this.range_string = this.menu[this.current]['date_string'];
    if(!this.show['user_recipes'])
      this.change_view("user_recipes");
    // this.next = aux;
  }

  delete_recipe(day:number,index : number){
    let recipe = this.menu[this.current]['recipe'][day][index];
    let text = '¿Estás seguro que deseas eliminar la receta ' + this.recipes_info[ recipe['id_recipe'] ]['name'] + '?';
    console.log(day, index);
    this.actual_modal = {
      'type' : 'delete_planned_recipe',
      'text' : text,
      'info' : {'day': day, 'index':index}
    };
    $('#conf_modal').modal("show");
  }

  check_action(event: any){
    if(event['accepted']){
      if(event['action'] == 'delete_planned_recipe'){
        this.menu[this.current]['recipe'][event['info']['day']].splice(event['info']['index'],1);
        this.menu[this.current]['total'] -= 1;
        this.recipe_index = -1;
        this.change_view('user_recipes');
      }else if( event['action'] == 'delete_prepare_recipe'){
        console.log("agregar función de desactivar");
        this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = false;
        this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status'] = 3;
        // this.recipe_index = -1;
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

  deactivate_recipe(){
    console.log( this.selected_index, this.recipe_index)
    let recipe = this.menu[ this.current ]['recipe'][ this.selected_index ][ this.recipe_index ]['name'];
    console.log("a eliminar", recipe);
    let text = '¿Estás seguro que deseas desactivar la receta ' + recipe + '?\n Puedes reactivarlo en otro momento si cambias de parecer';
    console.log(text)
    this.actual_modal = {
      'type' : 'delete_prepare_recipe',
      'text' : text,
      // 'info' : index
    };
    $('#conf_modal').modal("show");
  }

  reactivate_recipe(){
    //mostrar loader, acomodar ingredientes.
    this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = true;
    this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status'] = 1;
  }

  load_more_recommendations(name : string){
    console.log("cargar más recomendaciones de : ", name);
  }

  add_recipe(){
    console.log("agregar receta");
    let recipe : any;
    console.log("lista de recomendación: ", this.recommendation_list);
    if(this.recommendation_list != -1){
      recipe = this.recommendations[this.recommendation_list]['recipe'][this.recipe_index];
      let week_view = this.menu[this.current]['recipe'][this.current_day];
      let found = false;
      for(let i = 0; i < week_view.length; i++){
        if(week_view[i]['id_recipe'] == recipe['id_recipe']){
          console.log("se agrega una nueva porción");
          found = true;
        }
      }
      if(!found){
        week_view.push({'status': 4, 
                        'active':true, 
                        'id_recipe': recipe['id_recipe'], 
                        'ingredient_percentage': recipe['ingredient_percentage']
                      });
        this.menu[ this.current ]['total'] += 1;
      }
    }
    else{
      recipe = this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ];
    }
    console.log(recipe);
  }

  change_view(element : string){
    console.log("entra a change");
    if(element != 'recipe'){
      this.is_recommended = false;
      this.recommendation_list = -1;
      this.recipe_index = -1;
      this.selected_index = -1;
    }

    for(let key in this.show){
      if(key == element)
        this.show[key] = true;
      else
        this.show[key] = false;
    }
  }

  open_rate_modal(){
    $("#rate_modal").modal('show')
  }

  complete_recipe(){
    this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['status'] = 2;
  }

}
