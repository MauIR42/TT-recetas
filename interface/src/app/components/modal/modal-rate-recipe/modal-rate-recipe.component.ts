import { Component, OnInit, EventEmitter, Output } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-modal-rate-recipe',
  templateUrl: './modal-rate-recipe.component.html',
  styleUrls: ['./modal-rate-recipe.component.css']
})
export class ModalRateRecipeComponent implements OnInit {

  @Output() done = new EventEmitter<any>();

  data : any = {
    'taste' : 5,
    'difficulty' : 5,
    'time' : 0
  }

  time_error: string = '';

  constructor() { }

  ngOnInit(): void {
    $("#rate_modal").modal('dispose');
    $("#rate_modal").modal({
      keyboard : false,
      show : false,
      backdrop : "static"
    })
  }

  close_modal(){
    // this.reset_values();
    $("#rate_modal").modal("hide");
  }

  save(){
    console.log("mandar");
    this.close_modal();
    this.done.emit(true);
  }

}
