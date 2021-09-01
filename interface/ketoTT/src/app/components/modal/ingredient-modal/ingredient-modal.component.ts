import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ingredient-modal',
  templateUrl: './ingredient-modal.component.html',
  styleUrls: ['./ingredient-modal.component.css']
})
export class IngredientModalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  check(){
    console.log("algo")
  }

}
