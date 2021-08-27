import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType, HttpEvent, HttpRequest } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  url : string = '';
  url_user : string = 'user';
  url_recovery: string = 'user/recovery';

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

  request_recovery_password(data: any){
    return this.http.post(this.url + this.url_recovery, data, {});
  }

  check_recovery_token(data:any){
    let header = new HttpHeaders();
    header.set('Content-Type', 'application/json');
    return this.http.get(this.url + this.url_recovery, {headers: header, params: data});
  }

  reset_password(data:any){
    return this.http.put(this.url + this.url_recovery, data, {});
  }
}
