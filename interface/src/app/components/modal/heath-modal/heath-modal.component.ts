import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { SERVER_MESSAGES } from '../../../messages/messages';
import { NgxSpinnerService } from 'ngx-spinner';

declare const $: any;
@Component({
  selector: 'app-heath-modal',
  templateUrl: './heath-modal.component.html',
  styleUrls: ['./heath-modal.component.css']
})
export class HeathModalComponent implements OnInit {

  @Input() height : number = 0;
  @Input() user_id : number = -1;

  @Output() reload_stats = new EventEmitter<any>();

  form_info : any = {
    'diameter': {'value': 0, 'validations': ['not_null', 'positive_number'], 'error':''},
    'weight': {'value': 0, 'validations': ['not_null', 'positive_number'], 'error':''}
  }

  server_error : string = '';

  constructor(private spinner: NgxSpinnerService, private us : UserService) { }

  ngOnInit(): void {
  }

  close_modal(){
    this.form_info['diameter']['value'] = 0;
    this.form_info['weight']['value'] = 0;
    $('#health_form').modal('hide');
  }

  send_data(){
    let correct = true;

    for(let key in this.form_info ){
      console.log(key)
      let value = this.form_info[key];
      console.log(value)
      value['error'] = '';
      for(let i=0; i< value['validations'].length; i++ ){
        console.log(value['validations'][i])
        if(value['validations'][i] == 'not_null' && value['value'] == null )
          value['error'] = "Este campo no puede estar vacío";
        if(value['validations'][i] == 'positive_number' && !(Number.isFinite(value['value']) && value['value'] > 0 ) )
          value['error'] = "Este campo solo acepta enteros positivos";
      }
      if( value['error'].length > 0)
        correct = false;
    }

    if(correct){
      let imc = this.form_info['weight']['value'] / (this.height * this.height);
      let form = new FormData();
      form.append('imc', imc.toString());
      form.append('weight', this.form_info['weight']['value']);
      form.append('diameter', this.form_info['diameter']['value']);
      form.append('user_id', this.user_id.toString());
      this.spinner.show("loader");
      this.us.post_stat_info(form).subscribe( (data: any)=>{
        console.log(data);
        if(data['error']){
          this.spinner.hide("loader");
          this.server_error = SERVER_MESSAGES[data['message']];
          return;
        }

        this.spinner.hide("loader");
        this.close_modal();
      });
    }

  }

}
