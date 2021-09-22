import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekInfoModalComponent } from './week-info-modal.component';

describe('WeekInfoModalComponent', () => {
  let component: WeekInfoModalComponent;
  let fixture: ComponentFixture<WeekInfoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeekInfoModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
