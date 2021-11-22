import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObtainedImagesComponent } from './obtained-images.component';

describe('ObtainedImagesComponent', () => {
  let component: ObtainedImagesComponent;
  let fixture: ComponentFixture<ObtainedImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObtainedImagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObtainedImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
