import { Component, OnInit, Input } from '@angular/core';
declare const $: any;
@Component({
  selector: 'app-heath-modal',
  templateUrl: './heath-modal.component.html',
  styleUrls: ['./heath-modal.component.css']
})
export class HeathModalComponent implements OnInit {

  @Input() height : number = 0;

  form_info : any = {
    'waist': {'value': 0, 'validations': ['not_null', 'positive_number']},
    'weight': {'value': 0, 'validations': ['not_null', 'positive_number']}
  }

  constructor() { }

  ngOnInit(): void {
  }

  close_modal(){
    $('#health_form').modal('hide');
  }

}
