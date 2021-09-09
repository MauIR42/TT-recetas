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

  @Input() set modal_info(val: any){
    if(val){
      this.text = val['text'];    
      this.type = val['type'];
    }
  }

  @Output() accepted = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }


  close_modal(type: boolean){
    this.accepted.emit({'accepted':type, 'action':this.type});
    $("#conf_modal").modal("hide");

  }

}
