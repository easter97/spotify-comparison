import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportifyComponent } from './sportify.component';

describe('SportifyComponent', () => {
  let component: SportifyComponent;
  let fixture: ComponentFixture<SportifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
