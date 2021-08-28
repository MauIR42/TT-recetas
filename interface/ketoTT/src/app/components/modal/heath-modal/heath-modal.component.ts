import { Component, OnInit, Input } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-heath-modal',
  templateUrl: './heath-modal.component.html',
  styleUrls: ['./heath-modal.component.css']
})
export class HeathModalComponent implements OnInit {


  data: any;

  constructor() { }

  ngOnInit(): void {
  }

  close_modal(){
    $('#health_form').modal('hide');
  }

}
