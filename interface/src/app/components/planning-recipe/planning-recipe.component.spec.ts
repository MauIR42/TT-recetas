import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningRecipeComponent } from './planning-recipe.component';

describe('PlanningRecipeComponent', () => {
  let component: PlanningRecipeComponent;
  let fixture: ComponentFixture<PlanningRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanningRecipeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
