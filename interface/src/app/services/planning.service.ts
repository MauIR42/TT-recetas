import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType, HttpEvent, HttpRequest } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PlanningService {

  url : string = '';
  url_planning : string = 'planning';
  url_evaluation : string = 'recipe_evaluation';
  url_recommendations : string = 'recommendation';
  url_recipe : string = 'recipe';

  constructor(private http: HttpClient) { 
    this.url = environment.server_direction;
  }


  get_planning_info(data:any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_planning, {headers: header, params: data});
  }

  post_recipe_evaluation(data:any){
    return this.http.post(this.url + this.url_evaluation, data, {});
  }

  put_recipe(data:any){
    return this.http.put(this.url + this.url_planning, data, {}); 
  }

  get_recommendations(data:any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_recommendations, {headers: header, params: data});
  }

  post_recipe_planning(data:any){
   return this.http.post(this.url + this.url_planning, data, {});  
  }

  get_recipe_info(data:any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_recipe, {headers: header, params: data});
  }
}
