import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType, HttpEvent, HttpRequest } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  url : string = '';

  constructor(private http: HttpClient) {
    this.url = environment.server_direction;
  }


  create_user(data: any){
    console.log(data);
    return this.http.post(this.url + 'user', data, {});
  }
}
