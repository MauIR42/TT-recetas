import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from '../../services/local-storage.service';
import { PlanningService } from '../../services/planning.service';
import { Router } from '@angular/router';
import { forkJoin  } from 'rxjs';
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

  fake_menu : any = {
    'Planeación': {
      'start': moment().startOf('week').add(8 ,'d'),
      'end'  : moment().endOf('week').add(8 ,'d'),
      'next' : 'Preparación',
      'date_string' : '',
      'total': 2,
      'recipe': [
        [ 
        {'status_id': 4, 'active':true, 'recipe_id':1, 'id':46, 'ingredient_percentage':100},
          {'status_id': 4, 'active':true, 'recipe_id':2, 'id':47, 'ingredient_percentage':90},
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
      'start': moment().startOf('week').add(1 ,'d'),
      'end'  : moment().endOf('week').add(1 ,'d'),
      'next' : 'Planeación',
      'date_string': '',
      'total': 1,
      'recipe' : [
        [
          {'status_id': 3,  'active':false, 'recipe_id':1, 'id':15, 'ingredient_percentage':100, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':2, 'id':16, 'ingredient_percentage':90, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':3, 'id':17, 'ingredient_percentage':80, 'quantity': 1},
          {'status_id': 2, 'active':true, 'recipe_id':4, 'id':18, 'ingredient_percentage':70, 'quantity': 1},
          {'status_id': 3, 'active':false, 'recipe_id':5, 'id':19, 'ingredient_percentage':60, 'quantity': 1},
        ],[
          {'status_id': 3, 'active':false, 'recipe_id':6, 'id':20, 'ingredient_percentage':50, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':7, 'id':21, 'ingredient_percentage':40, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':8, 'id':22, 'ingredient_percentage':30, 'quantity': 1},
          {'status_id': 2, 'active':true, 'recipe_id':9, 'id':23, 'ingredient_percentage':20, 'quantity': 1},
          {'status_id': 3, 'active':false, 'recipe_id':10, 'id':24, 'ingredient_percentage':10, 'quantity': 1},
        ],[
          {'status_id': 3, 'active':false, 'recipe_id':1, 'id':25, 'ingredient_percentage':100, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':2, 'id':26, 'ingredient_percentage':90, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':3, 'id':27, 'ingredient_percentage':80, 'quantity': 1},
          {'status_id': 2, 'active':true, 'recipe_id':4, 'id':28, 'ingredient_percentage':70, 'quantity': 1},
          {'status_id': 3, 'active':false, 'recipe_id':5, 'id':29, 'ingredient_percentage':60, 'quantity': 1},
        ],[
          {'status_id': 3, 'active':false, 'recipe_id':6, 'id':30, 'ingredient_percentage':50, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':7, 'id':31, 'ingredient_percentage':40, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':8, 'id':32, 'ingredient_percentage':30, 'quantity': 1},
          {'status_id': 2, 'active':true, 'recipe_id':9, 'id':33, 'ingredient_percentage':20, 'quantity': 1},
          {'status_id': 3, 'active':false, 'recipe_id':10, 'id':34, 'ingredient_percentage':10, 'quantity': 1},
        ],[
          {'status_id': 3, 'active':false, 'recipe_id':1, 'id':35, 'ingredient_percentage':100, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':2, 'id':36, 'ingredient_percentage':90, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':3, 'id':37, 'ingredient_percentage':80, 'quantity': 1},
          {'status_id': 2, 'active':true, 'recipe_id':4, 'id':38, 'ingredient_percentage':70, 'quantity': 1},
          {'status_id': 3, 'active':false, 'recipe_id':5, 'id':39, 'ingredient_percentage':60, 'quantity': 1},
        ],[
          {'status_id': 3, 'active':false, 'recipe_id':6, 'id':41, 'ingredient_percentage':50, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':7, 'id':42, 'ingredient_percentage':40, 'quantity': 1},
          {'status_id': 1, 'active':true, 'recipe_id':8, 'id':43, 'ingredient_percentage':30, 'quantity': 1},
          {'status_id': 2, 'active':true, 'recipe_id':9, 'id':44, 'ingredient_percentage':20, 'quantity': 1},
          {'status_id': 3, 'active':false, 'recipe_id':10, 'id':45, 'ingredient_percentage':10, 'quantity': 1},
        ],[
        ],
      ]
    }
  }

  menu : any = {
    'Planeación': {
      'start': moment().startOf('week').add(8 ,'d'),
      'end'  : moment().endOf('week').add(8 ,'d'),
      'next' : 'Preparación',
      'date_string' : '',
      'total': -1,
      'recipe': [[],[],[],[],[],[],[]]
    },
    'Preparación': {
      'start': moment().startOf('week').add(1 ,'d'),
      'end'  : moment().endOf('week').add(1 ,'d'),
      'next' : 'Planeación',
      'date_string': '',
      'total': -1,
      'recipe' : [[],[],[],[],[],[],[]]
    }
  }

  cooked : number = 0;
  // total : number = 1;
  day_cooked : number = 0;

  // total_planned : number = 2;

  days : any = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  recomendation_sections : any = ["Aprovecha tus ingredientes", "Lo que te ha gustado", "Lo que no has probado", "Los desayunos", "Las comidas", "Las cenas"];

  fake_recommendations : any = [
    {
      recipe: [
        {'recipe_id':10, 'ingredient_percentage':10},
        {'recipe_id':9, 'ingredient_percentage':10},
        {'recipe_id':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'recipe_id':10, 'ingredient_percentage':10},
        {'recipe_id':9, 'ingredient_percentage':10},
        {'recipe_id':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'recipe_id':10, 'ingredient_percentage':10},
        {'recipe_id':9, 'ingredient_percentage':10},
        {'recipe_id':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'recipe_id':10, 'ingredient_percentage':10},
        {'recipe_id':9, 'ingredient_percentage':10},
        {'recipe_id':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'recipe_id':10, 'ingredient_percentage':10},
        {'recipe_id':9, 'ingredient_percentage':10},
        {'recipe_id':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    },{
      recipe: [
        {'recipe_id':10, 'ingredient_percentage':10},
        {'recipe_id':9, 'ingredient_percentage':10},
        {'recipe_id':8, 'ingredient_percentage':10},
      ],
      has_more : true,
      offset : 0
    }
  ];

  recommendations : any = [];


  fake_recipes_info : any = {
    1 : {'name':'receta 1', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que habíadsuiwEVBWEUBVUEOWVBWVBDBDSBVODSBBhhrpvfibnvifbnibnsdvvwebvebnhml.,mhnbgfvdc"},
    2 : {'name':'receta 2', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    3 : {'name':'receta 3', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    4 : {'name':'receta 4', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    5 : {'name':'receta 5', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    6 : {'name':'receta 6', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    7 : {'name':'receta 7', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    8 : {'name':'receta 8', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    9 : {'name':'receta 9', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
    10 : {'name':'receta 10', 'total_time':20, 'cooked':5, 'image_url':"assets/images/test1.jpg", 'description': "Esta es una breve descripción de la receta para que el usuario recuerde que había."},
  }

  example_image = 'assets/images/test1.jpg';

  recipes_info : any = [];

  current_day : number = 0;
  recommendation_list: number = -1;

  current_left : string = 'caret-left-square-fill-white.svg';
  current_right : string = 'caret-right-square-fill-white.svg';

  delete_img = 'x-circle-fill-orange.svg';

  range_string : string = '';

  actual_modal : any;

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

  debug : boolean = false;

  to_show : any = null; //booleans to check with the update week info modal


  constructor(private router: Router, private spinner: NgxSpinnerService, private ls : LocalStorageService, private ps : PlanningService) { }

  ngOnInit(): void {

    this.menu['Planeación']['date_string'] = 'del ' + this.menu[ 'Planeación' ]['start'].format("DD") + ' al ' +this.menu[ 'Planeación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");;

    this.menu['Preparación']['date_string'] = 'del ' + this.menu[ 'Preparación' ]['start'].format("DD") + ' al ' +this.menu[ 'Preparación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");

    this.range_string = this.menu[this.current]['date_string'];

    this.user_id = this.ls.getItem("TT_id");
    if(! this.user_id)
      this.router.navigate([""]);

    

    let services = [
      this.ps.get_planning_info({'user_id': this.user_id, 'week_start': moment().startOf('week').add(1 ,'d').format('YYYY-MM-DD')  }),
      this.ps.get_planning_info({'user_id': this.user_id, 'week_start': moment().startOf('week').add(8 ,'d').format('YYYY-MM-DD'), 'create': "True"  }),
    ]

    forkJoin(services).subscribe( (data : any)=>{ 
      console.log(data);
      if(this.debug){
        this.menu = this.fake_menu;
        this.recommendations = this.fake_recommendations;
        this.recipes_info = this.fake_recipes_info;
      }else{
        this.menu['Preparación']['recipe'] =  data[0]['week_recipes'];
        this.menu['Planeación']['recipe'] = data[1]['week_recipes'];
        this.menu['Preparación']['id'] = data[0]['week_info']['id'];
        this.menu['Planeación']['id'] = data[1]['week_info']['id'];

        this.menu['Preparación']['total'] = data[0]['week_info']['total'];
        this.menu['Planeación']['total'] = data[1]['week_info']['total'];

        this.add_recipe_info(data[0]['recipes']);
        this.add_recipe_info(data[1]['recipes']);
        // console.log( this.recipes_info);
      }
      this.to_show = {
        'charts' : data[0]['week_info']['has_stats'],
        'inventory' : data[0]['week_info']['inventory_updated']
      }

      // console.log(this.to_show);
    });

    

    // let that = this;

  }

  get_recipe(day: number, index: number,event: any, is_recommended: boolean = false){
    event.preventDefault();
    // console.log(day,index);
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
    let text = '¿Estás seguro que deseas eliminar la receta ' + this.recipes_info[ recipe['recipe_id'] ]['name'] + '?';
    // console.log(day, index);
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
        // console.log("agregar función de desactivar");
        this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = false;
        this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 3;
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
    // console.log( this.selected_index, this.recipe_index)
    let recipe = this.menu[ this.current ]['recipe'][ this.selected_index ][ this.recipe_index ]['name'];
    // console.log("a eliminar", recipe);
    let text = '¿Estás seguro que deseas desactivar la receta ' + recipe + '?\n Puedes reactivarlo en otro momento si cambias de parecer';
    // console.log(text)
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
    this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 1;
  }

  load_more_recommendations(name : string){
    console.log("cargar más recomendaciones de : ", name);
  }

  add_recipe(){
    // console.log("agregar receta");
    let recipe : any;
    // console.log("lista de recomendación: ", this.recommendation_list);
    if(this.recommendation_list != -1){
      recipe = this.recommendations[this.recommendation_list]['recipe'][this.recipe_index];
      let week_view = this.menu[this.current]['recipe'][this.current_day];
      let found = false;
      for(let i = 0; i < week_view.length; i++){
        if(week_view[i]['recipe_id'] == recipe['recipe_id']){
          // console.log("se agrega una nueva porción");
          found = true;
        }
      }
      if(!found){
        week_view.push({'status_id': 4, 
                        'active':true, 
                        'recipe_id': recipe['recipe_id'], 
                        'ingredient_percentage': recipe['ingredient_percentage']
                      });
        this.menu[ this.current ]['total'] += 1;
      }
    }
    else{
      recipe = this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ];
    }
    // console.log(recipe);
  }

  change_view(element : string){
    // console.log("entra a change");
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
    this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 2;
  }

  add_recipe_info(recipes : any){
    // console.log(recipes);
    for( let i = 0; i<recipes.length; i++){
      // console.log(recipes[i]);
      if( ! (recipes[i]['id'] in this.recipes_info ) )
        this.recipes_info[ recipes[i]['id'] ] = recipes[i];
    }
    console.log(this.recipes_info);
  }

}
