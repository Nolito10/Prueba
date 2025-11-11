

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard')
      .then(m => m.DashboardComponent),
    title: 'Weather App - Home'
  },
  {
    path: 'weather',
    loadComponent: () => import('./features/weather-tabs/weather-tabs')
      .then(m => m.WeatherTabsComponent),
    title: 'Current Weather'
  },
  {
    path: 'forecast/:zipCode',
    loadComponent: () => import('./features/forecast-detail/forecast-detail')
      .then(m => m.ForecastDetailComponent),
    title: '5-Day Forecast'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];