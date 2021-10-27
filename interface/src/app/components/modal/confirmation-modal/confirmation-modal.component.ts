import { Component, OnInit, Input,  EventEmitter, Output } from '@angular/core';

declare const $: any;

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

  text: string = '';
  type: string = '';
  info: any;
  has_info : boolean = false;

  extra : any = {
    'buttons' : []
  }

  @Input() set modal_info(val: any){
    if(val){
      console.log(val)
      this.text = val['text'];    
      this.type = val['type'];
      if('info' in val){
        this.has_info = true;
        this.info = val['info'];
      }
      if('extra' in val){
        this.extra = val['extra'];
      }
    }
  }

  @Output() accepted = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }


  close_modal(type: boolean, value = null){
    let aux : any = {'accepted':type, 'action':this.type};
    if( this.has_info )
      aux['info'] = this.info;
    if(value != null)
      aux['value'] = value;
    this.accepted.emit(aux);
    $("#conf_modal").modal("hide");

  }

}
