import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { StockService } from '../../../services/stock.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocalStorageService } from '../../../services/local-storage.service';
import { SERVER_MESSAGES } from '../../../messages/messages';

declare const $ : any;

@Component({
  selector: 'app-ingredient-modal',
  templateUrl: './ingredient-modal.component.html',
  styleUrls: ['./ingredient-modal.component.css']
})
export class IngredientModalComponent implements OnInit {


  stock_items : any = [];
  available_ingredients : any = [];

  preview : any = {
    'id': -1,
    'name': 'test',
    'unit': 'pzs'
  };

  ingredient_selected : any = this.preview;

  quantity : number = 0;

  error_server : string = '';

  stock_added : any = {};

  edit_mode : boolean = false;
  edit_id : number = -1;

  type: string = "Agregar";
  @Input() set edit_info(value : any){
    console.log(value)
    if(value){
      let units : any = {
        'L' : 'ml',
        'Kg': 'gr'
      }
      this.quantity = value['quantity'];
      
      for(let i =0; i<this.available_ingredients.length; i++){
        if(this.available_ingredients[i]['id'] == value['ingredient_id']){
          this.ingredient_selected = this.available_ingredients[i];
          break;
        }
      }
      this.edit_id = value['id'];
      this.edit_mode = true;
      this.type = 'Editar';
      $('#ingredient_modal').modal("show");

    }
  }

  @Output() elements_edited = new EventEmitter<any>();

  constructor(private ss: StockService, private ls : LocalStorageService, 
              private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.ss.get_ingredients().subscribe( 
      (data: any)=>{
        console.log(data)
        this.spinner.show("ingredient_modal");
        if(data['error']){
          this.error_server = SERVER_MESSAGES[data['message']];
          this.spinner.hide("ingredient_modal");
          return;
        }
        this.available_ingredients = data['ingredients'];

    });
  }

  add_item(event: any){
    event.preventDefault();
    if(this.ingredient_selected.id == -1){
      this.error_server = 'Selecciona un ingrediente de la lista';
      return;
    }
    if(! (Number.isFinite(this.quantity)) || this.quantity <= 0 ){
      this.error_server = 'La cantidad seleccionada no es valida';
      return;
    }
    if( this.ingredient_selected.name in this.stock_added ){
      for(let i=0; i<this.stock_items.length; i++){
        if(this.stock_items[i].name == this.ingredient_selected.name)
          this.stock_items[ i ]['quantity'] =  this.stock_items[ i  ]['quantity'] + this.quantity;
      }
    }else{
      let quantity = {
        'quantity' : this.quantity
      }
      this.stock_items.push(Object.assign(quantity,this.ingredient_selected))
      this.stock_added[this.ingredient_selected.name] = this.stock_items.length -1;
    }
    this.ingredient_selected = this.preview;
    this.quantity = 0;
  }

  delete_item(event : any,index: number){
    event.preventDefault();
    let name = this.stock_items[ index ]['name'];
    delete this.stock_added[ name ];
    console.log(this.stock_added)
    this.stock_items.splice(index,1);
  }

  edit_ingredient(){
    if(this.ingredient_selected.id == -1){
      this.error_server = 'Selecciona un ingrediente de la lista';
      return;
    }
    if(! (Number.isFinite(this.quantity)) || this.quantity <= 0 ){
      this.error_server = 'La cantidad seleccionada no es valida';
      return;
    }
    
    this.error_server = '';
    let form : any = new FormData();
    form.append('item_id', this.edit_id);
    form.append('ingredient_id', this.ingredient_selected['id'])
    form.append('quantity', this.quantity)
    form.append('type', '1')
    this.ss.put_stock(form).subscribe((data : any)=>{
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("ingredient_modal");
        return;
      }
      this.stock_items = [];
      this.stock_added = {};
      this.ingredient_selected = this.preview;
      this.quantity = 0;
      this.type = "Agregar";
      this.edit_mode = false;
      this.elements_edited.emit("Ingrediente editado");
      $('#ingredient_modal').modal("hide");
    });
  }

  save_ingredients(){
    this.error_server = '';
    if(this.stock_items.length == 0){
      this.error_server = 'No hay elementos agregados.';
      return;
    }
    let items = []
    for(let i=0; i<this.stock_items.length; i++){
      let ingredient = this.stock_items[i];
      items.push({
        'id' : ingredient.id,
        'quantity' : ingredient.quantity,
        'type': 1
      })
    }

    let form = new FormData();
    form.append('user_id', this.ls.getItem('TT_id'));
    form.append('ingredients', JSON.stringify(items));
    this.spinner.show("ingredient_modal");
    this.ss.post_stock(form).subscribe( (data : any)=>{
      console.log(data)
      if(data['error']){
        this.error_server = SERVER_MESSAGES[data['message']];
        this.spinner.hide("ingredient_modal");
        return;
      }
      this.stock_items = [];
      this.stock_added = {};
      this.ingredient_selected = this.preview;
      this.quantity = 0;
      this.elements_edited.emit("Ingredientes agregados");
      $('#ingredient_modal').modal("hide");
    });
  }

  cancel(){
    $('#ingredient_modal').modal("hide");
    this.stock_items = [];
    this.stock_added = {};
    this.ingredient_selected = this.preview;
    this.quantity = 0;
    this.type = "Agregar";
    this.edit_mode = false;
  }


}
