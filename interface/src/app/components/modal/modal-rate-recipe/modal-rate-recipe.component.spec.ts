import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRateRecipeComponent } from './modal-rate-recipe.component';

describe('ModalRateRecipeComponent', () => {
  let component: ModalRateRecipeComponent;
  let fixture: ComponentFixture<ModalRateRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRateRecipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
