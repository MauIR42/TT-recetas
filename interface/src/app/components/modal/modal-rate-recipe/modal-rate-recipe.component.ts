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
    'time' : 1
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
    this.time_error = '';
    if( !Number.isInteger(this.data['time'])  )
      this.time_error = 'El tiempo debe ser en minutos y sin decimales.';
    else if(this.data['time'] <= 0 )
      this.time_error = 'Debe agregar un tiempo en minutos, si no recuerda el tiempo use un aproximado.';
    else{
      console.log("mandar");
      console.log(this.data);
      this.close_modal();
      this.done.emit(this.data);  
    }
    
  }

}
