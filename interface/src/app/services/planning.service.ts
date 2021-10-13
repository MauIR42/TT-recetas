import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType, HttpEvent, HttpRequest } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class PlanningService {

  url : string = '';
  url_planning : string = 'planning';

  constructor(private http: HttpClient) { 
    this.url = environment.server_direction;
  }


  get_planning_info(data:any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_planning, {headers: header, params: data});
  }
}
