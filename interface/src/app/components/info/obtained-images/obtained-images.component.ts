import { Component, OnInit } from '@angular/core';

import { PlanningService } from '../../../services/planning.service';

import { SERVER_MESSAGES } from '../../../messages/messages';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-obtained-images',
  templateUrl: './obtained-images.component.html',
  styleUrls: ['./obtained-images.component.css']
})

export class ObtainedImagesComponent implements OnInit {

  recipes: any = [];
  error_server: string = '';

  root = 'assets/images/recipes/';

  constructor( private spinner: NgxSpinnerService, private ps : PlanningService ) { }

  ngOnInit(): void {

    this.ps.get_recipe_info({'all': 1}).subscribe( (data : any)=>{
      console.log(data)
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("loader");
        return;
      }
      this.recipes = data['recipes'];
    })
  }

}
