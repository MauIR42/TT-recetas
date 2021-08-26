import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setItem(name: string,data : any){
    localStorage.setItem(name, JSON.stringify(data))

  }

  getItem(name: string){
    var element = localStorage.getItem(name)
    return (element != null)? JSON.parse(element) : null;
  }

  clean(){
    localStorage.clear();
  }
}
