import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType, HttpEvent, HttpRequest } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  url : string = '';
  url_user : string = 'user';

  constructor(private http: HttpClient) {
    this.url = environment.server_direction;
  }

  auth_user(data:any){
    console.log(data);
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_user, {headers: header, params: data});
  }

  create_user(data: any){
    console.log(data);
    return this.http.post(this.url + this.url_user, data, {});
  }
}
