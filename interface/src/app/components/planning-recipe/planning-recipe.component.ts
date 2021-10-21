import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from '../../services/local-storage.service';
import { PlanningService } from '../../services/planning.service';
import { SERVER_MESSAGES } from '../../messages/messages';
import { Router } from '@angular/router';
import { forkJoin  } from 'rxjs';
import { StockService } from '../../services/stock.service';
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
      'week_done' : [0,0,0,0,0,0,0],
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
      'week_done' : [0,0,0,0,0,0,0],
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
      // 'week_done' : [0,0,0,0,0,0,0],
      'recipe': [[],[],[],[],[],[],[]]
    },
    'Preparación': {
      'start': moment().startOf('week').add(1 ,'d'),
      'end'  : moment().endOf('week').add(1 ,'d'),
      'next' : 'Planeación',
      'date_string': '',
      'total': -1,
      'week_done' : [0,0,0,0,0,0,0],
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

  recommendations : any = [
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
  ];


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

  recipes_info : any = {};

  current_day : number = 0;
  recommendation_list: number = -1;

  current_left : string = 'caret-left-square-fill-white.svg';
  current_right : string = 'caret-right-square-fill-white.svg';

  delete_img = 'x-circle-fill-orange.svg';

  range_string : string = '';

  actual_modal : any;

  has_recommendations: boolean = false;
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

  to_delete : any = {};

  current_recipe : any;

  ingredients: any = {
    'pending': {},
    'in_stock' : {}
  }


  constructor(private router: Router, private spinner: NgxSpinnerService, private ls : LocalStorageService, private ps : PlanningService, private ss: StockService) { }

  ngOnInit(): void {

    this.menu['Planeación']['date_string'] = 'del ' + this.menu[ 'Planeación' ]['start'].format("DD") + ' al ' +this.menu[ 'Planeación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");

    this.menu['Preparación']['date_string'] = 'del ' + this.menu[ 'Preparación' ]['start'].format("DD") + ' al ' +this.menu[ 'Preparación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");

    this.range_string = this.menu[this.current]['date_string'];

    this.user_id = this.ls.getItem("TT_id");
    if(! this.user_id)
      this.router.navigate([""]);

    this.load_schedule();

  }

  load_schedule(){
    let services = [
      this.ps.get_planning_info({'user_id': this.user_id, 'week_start': moment().startOf('week').add(1 ,'d').format('YYYY-MM-DD'), 'current_week':1  }),
      this.ps.get_planning_info({'user_id': this.user_id, 'week_start': moment().startOf('week').add(8 ,'d').format('YYYY-MM-DD'), 'create': "True"  }),
    ];
    forkJoin(services).subscribe( (data : any)=>{ 

      console.log(data);
      this.check_schedule('Preparación', data[0]);
      if('recipes' in data[1])
        this.check_schedule('Planeación', data[1]);
      if(this.debug){
        this.menu = this.fake_menu;
        this.recommendations = this.fake_recommendations;
        this.recipes_info = this.fake_recipes_info;
      }
      this.cooked = data[0]['week_info']['total_done'];
      // console.log(this.menu);
      this.to_show = {
        'charts' : data[0]['week_info']['has_stats'],
        'inventory' : data[0]['week_info']['inventory_updated']
      }

      if( this.to_show['inventory'] )
        this.load_inventory()

      // console.log(this.to_show);
    });
  }

  check_schedule(menu:string,data:any){

    if(data['error']){
        // this.error_server = SERVER_MESSAGES[data['message']];
        // this.spinner.hide("loader");
        return;
    }
    this.menu[menu]['recipe'] =  data['week_recipes'];
    this.menu[menu]['id'] = data['week_info']['id'];
    this.menu[menu]['total'] = data['week_info']['total'];
    this.menu[menu]['week_done'] = data['week_info']['week_done'];
    this.add_recipe_info(data['recipes']);

  }

  load_inventory(){
    this.ss.get_stock({'user_id': this.user_id, 'planning':1}).subscribe( (data : any) =>{
      if(data['error']){
        // this.error_server = SERVER_MESSAGES[data['message']];
        // this.spinner.hide("loader");
        return;
      }
      console.log(data);
      this.ingredients['pending'] = data['pendientes']
      this.ingredients['in_stock'] = data['subidos']
      // console.log(this.recipes_info)
      this.get_percentages()
      this.get_recommendations();
    });
  }

  get_percentages(){
    for( let key in this.menu){
      let main_list = this.menu[key]['recipe'];
      for(let i= main_list.length -1; i>= 0; i--){
        for(let j= main_list[i].length -1; j>= 0; j--){
          // console.log(main_list[i][j])
          if(main_list[i][j]['status_id'] != 3){
            let recipe_ingredients = this.recipes_info[ main_list[i][j]['recipe_id'] ];
            let total_ingredients = Object.keys(recipe_ingredients['ingredient_list']).length;
            let all_ingredients = total_ingredients;
            let percentage_recipe = 100 / total_ingredients ;
            let current_percentage = 0;
            main_list[i][j]['pending'] = {}
            console.log(recipe_ingredients['ingredient_list']) 
            for(let key in this.ingredients['pending']){
              console.log(key)
              if(key in recipe_ingredients['ingredient_list'] ){
                let difference = this.ingredients['pending'][key] - recipe_ingredients['ingredient_list'][key]['quantity'];
                if( difference > 0){ //no obtuvo nada y quedan pendientes
                  main_list[i][j]['pending'][ key ] = recipe_ingredients['ingredient_list'][key]['quantity'];
                  this.ingredients['pending'][key] = difference;
                }
                else{
                  if( difference < 0){ //le faltaron todos o alguno pero ya no hay pendientes
                    main_list[i][j]['pending'][ key ] = this.ingredients['pending'][key];
                    current_percentage += (Math.abs(difference) * percentage_recipe) / recipe_ingredients['ingredient_list'][key]['quantity'];
                  }
                  else{
                    main_list[i][j]['pending'][ key ] = recipe_ingredients['ingredient_list'][key]['quantity'];
                  }
                  delete this.ingredients['pending'][key];
                }
                all_ingredients --;
              }
            }
            // console.log(current_percentage)
            // console.log(all_ingredients)
            current_percentage += all_ingredients * percentage_recipe;
            main_list[i][j]['ingredient_percentage'] = Math.round( current_percentage )
          }else
            main_list[i][j]['ingredient_percentage'] = 0
        }
      }
    }
    console.log(this.menu);
  }



  get_recipe(day: number, index: number,event: any, is_recommended: boolean = false){
    event.preventDefault();
    let recipe_id = -1;
    let pending = {};
    if(is_recommended){
      this.is_recommended = true;
      this.recommendation_list = day;
      recipe_id = this.recommendations[ day ]['recipe'][ index ]['recipe_id'];
      // pending = {}
    }
    else{
      this.is_recommended = false;
      this.selected_index = day;
      recipe_id = this.menu[ this.current]['recipe'][ day ][ index ]['recipe_id'];
      pending = this.menu[ this.current ]['recipe'][ day ][ index ]['pending'];
    }
    this.recipe_index = index;
    this.ps.get_recipe_info({'recipe_id': recipe_id}).subscribe( (data:any)=>{
        // console.log(data);
        if(data['error']){
          // this.error_server = SERVER_MESSAGES[data['message']];
          // this.spinner.hide("loader");
          return;
        }
        console.log( data['ingredients'] )
        console.log(pending)
        this.current_recipe = {
          'id' : recipe_id,
          'steps': data['steps'],
          'ingredients': data['ingredients'],
          'pending' : pending

        }

        this.change_view('recipe');
        // console.log(this.current_recipe);
    });
    
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
    console.log(recipe);
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
        let recipe : any = this.menu[this.current]['recipe'][event['info']['day']].splice(event['info']['index'],1)[0];
        // console.log(recipe);
        if('id' in recipe){
          recipe['active'] = false;
          this.to_delete[ recipe['recipe_id'] + '_' + event['info']['day'] ] = recipe;
        }

        this.menu[this.current]['total'] -= 1;
        this.recipe_index = -1;
        this.change_view('user_recipes');
      }else if( event['action'] == 'delete_prepare_recipe'){
        // console.log("agregar función de desactivar");
        let form = new FormData();
        if(this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'] == 1)
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 3
        else
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'] --
        form.append('user_recipe',this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['id'].toString());
        form.append('quantity', this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'].toString());
        form.append('status_id', this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'].toString());
        this.ps.put_recipe(form).subscribe((data:any)=>{
          // console.log(data);
          if(data['error']){
            // this.error_server = SERVER_MESSAGES[scale_data['message']];
            // this.spinner.hide("loader");
            return;
          }
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = false;
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 3;
          this.load_inventory();
        });
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
    let recipe = this.menu[ this.current ]['recipe'][ this.selected_index ][ this.recipe_index ];
    // console.log("a eliminar", recipe);
    let text = '¿Estás seguro que deseas desactivar la receta ' + this.recipes_info[ recipe['recipe_id'] ]['name'] + '?\n Puedes reactivarlo en otro momento si cambias de parecer';
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
    let form = new FormData();
    this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 1
    form.append('user_recipe',this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['id'].toString());
    form.append('quantity', this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'].toString());
    form.append('status_id', this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'].toString());
    this.ps.put_recipe(form).subscribe((data:any)=>{
      // console.log(data);
      if(data['error']){
        // this.error_server = SERVER_MESSAGES[scale_data['message']];
        // this.spinner.hide("loader");
        return;
      }
      this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = true;
      this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 1;
      this.load_inventory();
    });
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
        let key = recipe['recipe_id'] + '_' + this.current_day;
        if(key in this.to_delete){
          let reactivate_recipe = this.to_delete[key]
          reactivate_recipe['active'] = true;
          reactivate_recipe['ingredient_percentage'] = recipe['ingredient_percentage'];
          week_view.push( reactivate_recipe );
          delete this.to_delete[ key ];
        }else{
          week_view.push({'status_id': 4, 
                          'active':true, 
                          'recipe_id': recipe['recipe_id'], 
                          'ingredient_percentage': recipe['ingredient_percentage'],
                          'quantity' : 1,
                          'week_id' : this.menu[ this.current ]['id']
                        });
        }
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

  complete_recipe(to_evaluate : any){
    let form = new FormData();
    form.append('time',to_evaluate['time'].toString());
    form.append('taste',to_evaluate['taste'].toString());
    form.append('difficulty',to_evaluate['difficulty'].toString());
    form.append('user_recipe',this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['id']);
    this.ps.post_recipe_evaluation(form).subscribe( (data:any)=>{
      if(data['error']){
        // this.error_server = SERVER_MESSAGES[scale_data['message']];
        // this.spinner.hide("loader");
        return;
      }
      // console.log("evaluación hecha");
    });
    this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 2;
    this.menu[this.current]['week_done'][this.current_day] ++;
    this.cooked ++;
  }

  add_recipe_info(recipes : any){
    console.log(recipes);
    for( let i = 0; i<recipes.length; i++){
      // console.log(recipes[i]);
      if( ! (recipes[i]['id'] in this.recipes_info ) )
        this.recipes_info[ recipes[i]['id'] ] = recipes[i];
    }
    // console.log(this.recipes_info);
  }

  get_recommendations(){
    let to_send: any = {
      'all' : 'True',
      'user_id': this.user_id,
      'ingredients' : JSON.stringify([])
    }
    this.ps.get_recommendations(to_send).subscribe( (data:any)=>{ //cantidad de ingredientes
      // console.log(data);
      if(data['error']){
        // this.error_server = SERVER_MESSAGES[scale_data['message']];
        // this.spinner.hide("loader");
        return;
      }
      this.add_recipe_info(data['recipes']);
      this.recommendations = data['recommendations'];
      this.has_recommendations = true;

    }); 
  }

  save_changes(){
    let to_create : any = [];
    let to_delete : any = [];
    let start_week = this.menu['Planeación']['start'];
    for(let i = 0; i<this.menu['Planeación']['recipe'].length; i++){
      // console.log(start_week)
      let current_day : any = moment(start_week).add(i ,'d').format("YYYY-MM-DD")
      // console.log(current_day);
      let week_recipes = this.menu['Planeación']['recipe'][i];
      for(let j = 0; j<week_recipes.length; j++){
        if(! ('id' in week_recipes[j]) ){
          week_recipes[j]['preparation_date'] = current_day;
          to_create.push(week_recipes[j])
        }
      }
    }
    for( let key in this.to_delete){
      to_delete.push(this.to_delete[key]);
    }
    let form = new FormData();
    form.append('to_add', JSON.stringify(to_create));
    form.append('to_delete', JSON.stringify(to_delete));
    // console.log(to_create);
    // console.log(to_delete);
    this.ps.post_recipe_planning(form).subscribe( (data:any) =>{
      if(data['error']){
        // this.error_server = SERVER_MESSAGES[scale_data['message']];
        // this.spinner.hide("loader");
        return;
      }

      this.to_delete = {};
      this.load_schedule();

    });
  }

}
