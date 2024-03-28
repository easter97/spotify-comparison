import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyComparisonComponent } from './spotify-comparison.component';

describe('SpotifyComparisonComponent', () => {
  let component: SpotifyComparisonComponent;
  let fixture: ComponentFixture<SpotifyComparisonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpotifyComparisonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotifyComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
