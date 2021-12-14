import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from '../../services/local-storage.service';
import { PlanningService } from '../../services/planning.service';
import { SERVER_MESSAGES } from '../../messages/messages';
import { Router } from '@angular/router';
import { forkJoin  } from 'rxjs';
import { StockService } from '../../services/stock.service';
import * as moment from 'moment';
// declare const $ : any;
declare var $: any;

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
    'Preparación': {
      'start': moment().startOf('week').add(1 ,'d'),
      'end'  : moment().endOf('week').add(1 ,'d'),
      'next' : 'Planeación',
      'date_string': '',
      'total': -1,
      'week_done' : [0,0,0,0,0,0,0],
      'recipe' : [[],[],[],[],[],[],[]],
      'message' : 'Encuentra en esta sección las recetas que elegiste para este día, da click sobre una para ver su contenido y realizarla o eliminarla.También puedes ver las recetas de otros días y realizarlas cambiando el día en la barra lateral izquierda.'
    },'Planeación': {
      'start': moment().startOf('week').add(8 ,'d'),
      'end'  : moment().endOf('week').add(8 ,'d'),
      'next' : 'Preparación',
      'date_string' : '',
      'total': -1,
      'week_done' : [0,0,0,0,0,0,0],
      'recipe': [[],[],[],[],[],[],[]],
      'message' : 'Revisa las recetas que has plenado para la siguiente semana. Puedes dar click sobre las recetas para saber que ingredientes te hacen falta o más información de estas.'
    },
  }

  cooked : number = 0;
  // total : number = 1;
  day_cooked : number = 0;

  // total_planned : number = 2;

  days : any = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  recomendation_sections : any = ["Aprovecha tus ingredientes", "Lo que te ha gustado", "Lo que no has probado", "Los desayunos", "Las comidas", "Las cenas"];


  recommendations : any = [
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
    {recipe:[], has_more: false, offset:0},
  ];


  example_image = 'assets/images/test1.jpg';

  root = 'assets/images/recipes/';

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

  to_show : any = null; //booleans to check with the update week info modal

  to_delete : any = {};
  to_add : any = {};

  current_recipe : any;

  stock: any = {};

  limit : number = 3;

  original_stock : any = {};

  error_server : string = '';


  constructor(private router: Router, private spinner: NgxSpinnerService, private ls : LocalStorageService, private ps : PlanningService, private ss: StockService) {}

  ngOnInit(): void {

    this.user_id = this.ls.getItem("TT_id");
    if(! this.user_id)
      this.router.navigate([""]);

    if( moment().isSame( moment().startOf('week'), 'day' ) ){
      this.menu['Planeación']['start'] =   moment().startOf('week').add(1 ,'d') 
      this.menu['Planeación']['end'] = moment().endOf('week').add(1 ,'d') 
      this.menu['Preparación']['start'] = (moment().startOf('week')).subtract(6 ,'d') 
      this.menu['Preparación']['end'] = moment()
    }

    this.menu['Planeación']['date_string'] = 'del ' + this.menu[ 'Planeación' ]['start'].format("DD") + ' al ' +this.menu[ 'Planeación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");
    this.menu['Preparación']['date_string'] = 'del ' + this.menu[ 'Preparación' ]['start'].format("DD") + ' al ' +this.menu[ 'Preparación' ]['end'].locale('es') .format("DD [de] MMMM  [del] YYYY");
    this.range_string = this.menu[this.current]['date_string'];
    this.load_schedule();

  }

  load_schedule(reload = false){
    let services = [
      this.ps.get_planning_info({'user_id': this.user_id, 'week_start': this.menu['Preparación']['start'].format('YYYY-MM-DD'), 'current_week':1  }),
      this.ps.get_planning_info({'user_id': this.user_id, 'week_start': this.menu['Planeación']['start'].format('YYYY-MM-DD')}),
    ];

    this.spinner.show('loader_planning');
    forkJoin(services).subscribe( (data : any)=>{ 

      // console.log(data);
      let has_error = this.check_schedule('Preparación', data[0]);
      has_error = has_error || this.check_schedule('Planeación', data[1]);
      if(has_error)
        return;
      this.cooked = data[0]['week_info']['total_done'];
      if(! reload){
        this.to_show = {
          'charts' : data[0]['week_info']['has_stats'],
          'inventory' : data[0]['week_info']['inventory_updated']
        }
      }
      if( this.to_show['inventory'] ){
        this.load_inventory();
      }else
        this.spinner.hide('loader_planning');

    });
  }

  check_schedule(menu:string,data:any){

    if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_planning");
        return true;
    } 
    console.log(data)
    this.menu[menu]['recipe'] =  data['week_recipes'];
    this.menu[menu]['id'] = data['week_info']['id'];
    this.menu[menu]['total'] = data['week_info']['total'];
    this.menu[menu]['week_done'] = data['week_info']['week_done'];
    if('recipes' in data)
      this.add_recipe_info(data['recipes']);
    // this.spinner.hide("loader_planning");
    return false;
  }

  load_inventory(){
    this.ss.get_stock({'user_id': this.user_id, 'planning':1}).subscribe( (data : any) =>{
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_planning");
        return;
      }
      // console.log(data);
      // this.ingredients['pending'] = data['pendientes'];
      this.original_stock = data['subidos'];
      this.get_percentages();
    });
  }

  get_percentages(){
    Object.assign(this.stock, this.original_stock);
    for( let key in this.menu){ //por cada menu
      let main_list = this.menu[key]['recipe'];
      for(let i= 0; i< main_list.length; i++){ //de cada dia
        for(let j= 0; j< main_list[i].length; j++){ //de cada receta
          main_list[i][j]['has'] = {}
          if( main_list[i][j]['status_id'] != 2 && main_list[i][j]['status_id'] != 3 && main_list[i][j]['active'] ){
            let recipe_ingredients = this.recipes_info[ main_list[i][j]['recipe_id'] ]['ingredient_list'];
            let total_ingredients = 0;
            for(let key in recipe_ingredients)
              if(!recipe_ingredients[key]['is_optional'])
                total_ingredients ++;
            let all_ingredients = total_ingredients;
            let percentage_recipe = 100 / total_ingredients ;
            let current_percentage = 0;

            for( let key in this.stock){
              if(key in recipe_ingredients){
                let difference = this.stock[key] - recipe_ingredients[key]['quantity'] ;
                if( difference > 0){ //sobró stock
                  main_list[i][j]['has'][ key ] = recipe_ingredients[key]['quantity'];
                  this.stock[key] = difference;
                  current_percentage += percentage_recipe
                }
                else{
                  if( difference < 0){ //se acabó el stock y faltó más para la receta
                    main_list[i][j]['has'][ key ] = this.stock[key];
                    current_percentage += (this.stock[key] * percentage_recipe) / recipe_ingredients[key]['quantity'];
                  }
                  else{
                    main_list[i][j]['has'][ key ] = recipe_ingredients[key]['quantity'];
                    current_percentage += percentage_recipe
                  }
                  delete this.stock[key];
                }
              }
            }
            
            // current_percentage += all_ingredients * percentage_recipe;
            main_list[i][j]['ingredient_percentage'] = Math.round( current_percentage )
          }else
            main_list[i][j]['ingredient_percentage'] = 0
        }
      }
    }
    if(this.show['recipe'] && !this.is_recommended){
      this.current_recipe['has'] = this.menu[ this.current ]['recipe'][this.selected_index][this.recipe_index]['has'];
    }

    this.spinner.hide('loader_planning');
    this.get_recommendations();
  }



  get_recipe(day: number, index: number,event: any, is_recommended: boolean = false){
    event.preventDefault();
    let recipe_id = -1;
    let has = {};
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
      has = this.menu[ this.current ]['recipe'][ day ][ index ]['has'];
    }
    this.recipe_index = index;
    this.spinner.show("loader_recipe");
    this.ps.get_recipe_info({'recipe_id': recipe_id}).subscribe( (data:any)=>{
        // console.log(data);
        if(data['error']){
          this.error_server = SERVER_MESSAGES[data['message']];
          this.spinner.hide("loader_recipe");
          return;
        }
        this.current_recipe = {
          'id' : recipe_id,
          'steps': data['steps'],
          'ingredients': data['ingredients'],
          'has' : has

        }

        this.spinner.hide("loader_recipe");
        this.change_view('recipe');
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
    let text = '¿Estás seguro que deseas eliminar la receta ' + this.recipes_info[ recipe['recipe_id'] ]['name'] + '?';
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
        // let recipe : any = this.menu[this.current]['recipe'][event['info']['day']].splice(event['info']['index'],1)[0];
        let recipe : any = this.menu[this.current]['recipe'][event['info']['day']][event['info']['index']];
        // recipe['quantity'] -= 1

        if('id' in recipe){
          recipe['active'] = false;
          this.to_delete[ recipe['recipe_id'] + '_' + event['info']['day'] ] = {'id':recipe['id'], 'quantity':recipe['quantity']};
        }else if ( (recipe['recipe_id'] + '_' + event['info']['day']) in this.to_add){
          this.menu[this.current]['recipe'][event['info']['day']].splice(event['info']['index'],1)
          delete this.to_add[ recipe['recipe_id'] + '_' + event['info']['day'] ];
        }
        this.menu[this.current]['week_done'][event['info']['day']]--;
        this.get_percentages();
        this.menu[this.current]['total'] -= 1;
        this.recipe_index = -1;
        this.change_view('user_recipes');
      }else if( event['action'] == 'delete_prepare_recipe'){
        this.spinner.show("loader_planning");
        let form = new FormData();
        if(this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'] == 1)
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 3
        else
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'] --
        form.append('user_recipe',this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['id'].toString());
        form.append('quantity', this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['quantity'].toString());
        form.append('status_id', this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'].toString());
        this.ps.put_recipe(form).subscribe((data:any)=>{
          if(data['error']){
            this.error_server = SERVER_MESSAGES[data['message']];
            this.spinner.hide("loader_planning");
            $(document).ready(function() { 
              $(window).scrollTop($('#error_message').offset().top)
              // $('body').animate({scrollTop:$('#error_message').offset().top},500)
            });
            // $('html, body').animate({
            //  scrollTop: $("#error_message").offset().top
            //  }, 2000);
            return;
          }
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = false;
          this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 3;
          // this.load_inventory();
          this.get_percentages();
          this.spinner.hide("loader_planning");
        });
      } else if( event['action'] == 'confirm_rate'){
        if(event['value'])
          this.open_rate_modal();
        else
          this.complete_recipe({'no_evaluation': 0});
        

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
    let recipe = this.menu[ this.current ]['recipe'][ this.selected_index ][ this.recipe_index ];
    let text = '¿Estás seguro que deseas desactivar la receta ' + this.recipes_info[ recipe['recipe_id'] ]['name'] + '?\n Puedes reactivarlo en otro momento si cambias de parecer';
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
    this.spinner.show("loader_planning");
    this.ps.put_recipe(form).subscribe((data:any)=>{
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_planning");
        return;
      }
      this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['active'] = true;
      this.menu[this.current]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 1;
      // this.load_inventory();
      this.get_percentages();

      this.spinner.hide("loader_planning");
    });
  }

  load_more_recommendations(index : number){
    let data_dict : any = {
      'user_id': this.user_id,
      'ingredients':JSON.stringify(this.stock),
      'type_id' : index,
      'limit': this.limit
    }

    if( 'offset' in this.recommendations[index])
      data_dict['offset'] = this.recommendations[index]['offset']
    else
      data_dict['not_include'] = JSON.stringify(this.recommendations[index]['not_include'])
    this.spinner.show("loader_recommendation");
    this.ps.get_recommendations(data_dict).subscribe( (data:any)=>{ //cantidad de ingredientes
      console.log(data);
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_recommendation");
        return;
      }
      this.add_recipe_info(data['recipes']);
      this.recommendations[index]['has_more'] = data['recommendation']['has_more'];
      if( 'not_include' in data['recommendation']){
        // this.recommendations[index]['not_include'] += data['recommendation']['not_include'];
        this.recommendations[index]['not_include'].push(... data['recommendation']['not_include']);
      }
      else
        this.recommendations[index]['offset'] = data['recommendation']['offset'];
      // this.recommendations[index]['recipe'] = data['recommendation']['recipe'];
      this.recommendations[index]['recipe'].push(... data['recommendation']['recipe'])
      // this.has_recommendations = true;
      this.spinner.hide("loader_recommendation");

    });

  }

  add_recipe(){
    let recipe : any;
    if(this.recommendation_list != -1){
      recipe = this.recommendations[this.recommendation_list]['recipe'][this.recipe_index];
      let week_view = this.menu[this.current]['recipe'][this.current_day];
      let found = false;
      for(let i = 0; i < week_view.length; i++){
        if(week_view[i]['recipe_id'] == recipe['recipe_id']){
          found = true;
          if(!week_view[i]['active']){
            week_view[i]['active'] = true;
            let key = recipe['recipe_id'] + '_' + this.current_day;
            delete this.to_delete[ key ];
            this.menu[this.current]['week_done'][this.current_day]++;
            this.menu[ this.current ]['total'] += 1;
          }
          break;
        }
      }
      if(!found){ //nuevo, no es porción extra
        let key = recipe['recipe_id'] + '_' + this.current_day;
        // if(key in this.to_delete){
        //   let reactivate_recipe = this.to_delete[key]
        //   reactivate_recipe['active'] = true;
        //   reactivate_recipe['ingredient_percentage'] = recipe['ingredient_percentage'];
          // week_view.push( reactivate_recipe );

          // delete this.to_delete[ key ];
        // }else{
          week_view.push({'status_id': 4, 
                          'active':true, 
                          'recipe_id': recipe['recipe_id'], 
                          'ingredient_percentage': recipe['ingredient_percentage'],
                          'quantity' : 1,
                          'has' : {}
                        });
          this.to_add[ key ] = 1; //15_6
          this.menu[this.current]['week_done'][this.current_day]++;
        // }
        this.menu[ this.current ]['total'] += 1;
      }
      this.get_percentages();
    }
    // else{
    //   recipe = this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ];
    // }
  }

  change_view(element : string){
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

  check_complete_recipe(){
    if( Object.keys(this.current_recipe['has']).length ){
      this.actual_modal = {
        'type' : 'confirm_rate',
        'text' : "No tiene todos los ingredientes para realizar esta receta, si quiere completarla con lo que tiene, ¿quiere evaluarla para siguientes recomendaciones?",
        'extra' : {
          'buttons': [{'text':'Calificar', 'value':1}, {'text':'Completar sin calificar','value':0}]
        }
      };
      $('#conf_modal').modal("show");
    }
    else
      this.open_rate_modal();
  }

  open_rate_modal(){
    $("#rate_modal").modal('show');
  }

  complete_recipe(to_evaluate : any){
    let form = new FormData();
    if( 'no_evaluation' in to_evaluate)
      form.append('no_evaluation', '1');
    else{
      form.append('time',to_evaluate['time'].toString());
      form.append('taste',to_evaluate['taste'].toString());
      form.append('difficulty',to_evaluate['difficulty'].toString());
    }
    form.append('user_recipe',this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['id']);
    form.append('recipe_id', this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['recipe_id']);
    form.append('user_id', this.user_id.toString());
    let recipe = this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ];
    let updated : any = {};
    for(let key in this.recipes_info[ recipe['recipe_id'] ]['ingredient_list']){
      let quantity = this.recipes_info[ recipe['recipe_id'] ]['ingredient_list'][ key ]['quantity']
      updated[ key ] = {'original':quantity}
      if( key in this.current_recipe['has'])
        updated[ key ]['used'] = this.current_recipe['has'][ key ];

    }
    // }else
    // updated = this.current_recipe['has'];
    // return; 
    form.append('items_used', JSON.stringify(updated));
    this.spinner.show("loader_planning");
    this.ps.post_recipe_evaluation(form).subscribe( (data:any)=>{
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_planning");
        return;
      }
      this.spinner.hide("loader_planning");
      for( let key in this.current_recipe['has'] ){
        this.original_stock[ key ] -= this.current_recipe['has'][ key ];
        if( this.original_stock[ key ] == 0)
          delete this.original_stock[ key ];
      }
    });
    this.menu[ this.current ]['recipe'][this.selected_index][ this.recipe_index ]['status_id'] = 2;
    this.menu[this.current]['week_done'][this.current_day] ++;
    this.cooked ++;
  }

  add_recipe_info(recipes : any){
    for( let i = 0; i<recipes.length; i++){
      if( ! (recipes[i]['id'] in this.recipes_info ) )
        this.recipes_info[ recipes[i]['id'] ] = recipes[i];
    }
    console.log(this.recipes_info)
  }

  get_recommendations(){
    let to_send: any = {
      'all' : 'True',
      'user_id': this.user_id,
      'ingredients' : JSON.stringify(this.stock),
      'limit' : this.limit
    }
    this.spinner.show("loader_recommendation");
    this.ps.get_recommendations(to_send).subscribe( (data:any)=>{ //cantidad de ingredientes
      console.log(data);
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_recommendation");
        return;
      }
      this.add_recipe_info(data['recipes']);
      this.recommendations = data['recommendations'];
      this.has_recommendations = true;
      this.spinner.hide("loader_recommendation");

    }); 
  }

  save_changes(){
    let to_create : any = [];
    let to_delete : any = [];
    let start_week = this.menu['Planeación']['start'];

    // let new_pending : any = {};
    let final_update : any = {}
    let count_recipes : any = {}
    let days : any = {}

    for(let key in this.to_add){
      let compose_key = key.split("_");
      let recipe_id = compose_key[0];
      let day = compose_key[1];
      if(! (day in days) )
        days[day] = moment(start_week).add(day ,'d').format("YYYY-MM-DD");
      to_create.push({
        'preparation_date' : days[day],
        'recipe_id' : recipe_id,
        'quantity' : this.to_add[key]
      })
      if( recipe_id in count_recipes)
        count_recipes[ recipe_id ] += this.to_add[key];
      else
        count_recipes[ recipe_id ] = this.to_add[key];
    }
    for(let key in this.to_delete){
      let compose_key = key.split("_");
      let recipe_id = compose_key[0];
      let day = compose_key[1];
      if(! (day in days) )
        days[day] = moment(start_week).add(day ,'d').format("YYYY-MM-DD");
      to_delete.push({
        'id': this.to_delete[key]['id'],
        'preparation_date' : days[day],
        'quantity' : this.to_delete[key]['quantity'],
        'active' : false,
      })
      if( recipe_id in count_recipes)
        count_recipes[ recipe_id ] -= this.to_delete[key]['quantity'];
      else
        count_recipes[ recipe_id ] = -1 * this.to_delete[key]['quantity'];
    }

    for(let key in count_recipes){
      for( let ingredient in this.recipes_info[ key ][ 'ingredient_list' ] ){
        let quantity = this.recipes_info[ key ][ 'ingredient_list' ][ ingredient ]['quantity'];
        if( ! ( ingredient in final_update )  ){
          final_update[ ingredient ] = quantity * count_recipes[ key ];
        }else
          final_update[ ingredient ] += quantity * count_recipes[ key ];
      }
    }
    let form = new FormData();
    form.append('to_add', JSON.stringify(to_create));
    form.append('to_delete', JSON.stringify(to_delete));
    form.append('quantity', JSON.stringify(final_update) );
    form.append('user_id', this.user_id.toString());
    form.append('week_id', this.menu[ 'Planeación' ]['id'].toString())
    this.spinner.show("loader_planning");
    this.ps.post_recipe_planning(form).subscribe( (data:any) =>{
      // console.log(data);
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader_planning");
        return;
      }
      this.to_add = {};
      this.to_delete = {};

      this.spinner.hide("loader_planning");
      this.load_schedule(true);

    });
  }

}
