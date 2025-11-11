import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherTabs } from './weather-tabs';

describe('WeatherTabs', () => {
  let component: WeatherTabs;
  let fixture: ComponentFixture<WeatherTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
