import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastDetailComponent } from './forecast-detail';

describe('ForecastDetailComponent', () => {
  let component: ForecastDetailComponent;
  let fixture: ComponentFixture<ForecastDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ForecastDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForecastDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
