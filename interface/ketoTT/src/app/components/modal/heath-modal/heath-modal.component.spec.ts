import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeathModalComponent } from './heath-modal.component';

describe('HeathModalComponent', () => {
  let component: HeathModalComponent;
  let fixture: ComponentFixture<HeathModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeathModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeathModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
