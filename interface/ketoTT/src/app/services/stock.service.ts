import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType, HttpEvent, HttpRequest } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  url : string = '';
  url_scale : string = 'scale';

  constructor(private http: HttpClient) {
    this.url = environment.server_direction;
   }


  get_scale_info(data:any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_scale, {headers: header, params: data});
  }

  post_scale_request(data: any){
    return this.http.post(this.url + this.url_scale, data, {});
  }

  change_user_type(data: any){
    return this.http.put(this.url + this.url_scale, data, {});
  }

  restart_scale(data: any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.delete(this.url + this.url_scale, { headers: header, params: data} );
  }
}
