import { Component, OnInit, Input } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
