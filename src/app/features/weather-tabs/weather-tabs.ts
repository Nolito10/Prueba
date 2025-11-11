// src/app/features/weather-tabs/weather-tabs.ts

import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TabsComponent, Tab } from '../../shared/components/tabs/tabs';
import { LocationService } from '../../core/services/location.service';
import { WeatherService } from '../../core/services/weather.service';
import { CurrentWeather } from '../../core/models/weather.models';

interface WeatherData {
  zipCode: string;
  weather: CurrentWeather | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-weather-tabs',
  standalone: true,
  imports: [CommonModule, TabsComponent, RouterLink],
  templateUrl: './weather-tabs.html',
  styleUrls: ['./weather-tabs.css']
})
export class WeatherTabsComponent implements OnInit {
  weatherData = signal<WeatherData[]>([]);
  selectedZipCode = signal<string | null>(null);

  tabs = computed<Tab[]>(() => {
    return this.weatherData().map(data => ({
      id: data.zipCode,
      title: data.weather?.cityName || data.zipCode,
      closable: true
    }));
  });

  selectedWeather = computed(() => {
    const selected = this.selectedZipCode();
    if (!selected) return null;
    return this.weatherData().find(d => d.zipCode === selected);
  });

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private router: Router
  ) {}

  ngOnInit() {
    const locations = this.locationService.locations();
    
    if (locations.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.syncWeatherData(locations.map(l => l.zipCode));
  }

  private syncWeatherData(zipCodes: string[]) {
    const current = this.weatherData();
    const newData: WeatherData[] = [];

    zipCodes.forEach(zipCode => {
      const existing = current.find(d => d.zipCode === zipCode);
      if (existing && existing.weather) {
        // Ya tenemos los datos cargados, reutilizarlos
        newData.push(existing);
      } else {
        // Nueva ubicación o sin datos, iniciar sin loading
        newData.push({
          zipCode,
          weather: null,
          loading: false,
          error: null
        });
        // Cargar datos (usará caché si existe)
        this.loadWeatherSilently(zipCode);
      }
    });

    this.weatherData.set(newData);

    if (newData.length > 0 && !this.selectedZipCode()) {
      this.selectedZipCode.set(newData[0].zipCode);
    }
  }

  private loadWeatherSilently(zipCode: string) {
    // Cargar sin mostrar loading inicialmente (caché responderá rápido)
    this.weatherService.getCurrentWeather(zipCode).subscribe({
      next: (weather) => {
        this.weatherData.update(data => 
          data.map(d => d.zipCode === zipCode 
            ? { ...d, weather, loading: false, error: null }
            : d
          )
        );
      },
      error: (err) => {
        this.weatherData.update(data =>
          data.map(d => d.zipCode === zipCode
            ? { ...d, loading: false, error: err.message }
            : d
          )
        );
      }
    });
  }

  private loadWeather(zipCode: string) {
    // Método original con loading visible (para refresh manual)
    this.weatherService.getCurrentWeather(zipCode).subscribe({
      next: (weather) => {
        this.weatherData.update(data => 
          data.map(d => d.zipCode === zipCode 
            ? { ...d, weather, loading: false, error: null }
            : d
          )
        );
      },
      error: (err) => {
        this.weatherData.update(data =>
          data.map(d => d.zipCode === zipCode
            ? { ...d, loading: false, error: err.message }
            : d
          )
        );
      }
    });
  }

  onTabSelected(zipCode: string) {
    this.selectedZipCode.set(zipCode);
  }

  onTabClosed(zipCode: string) {
    this.locationService.removeLocation(zipCode);
    this.weatherData.update(data => data.filter(d => d.zipCode !== zipCode));
    
    const remaining = this.weatherData();
    if (remaining.length > 0) {
      this.selectedZipCode.set(remaining[0].zipCode);
    } else {
      this.router.navigate(['/']);
    }
  }

  viewForecast(zipCode: string) {
    this.router.navigate(['/forecast', zipCode]);
  }

  refreshWeather(zipCode: string) {
    this.weatherService.invalidateCache(zipCode);
    this.weatherData.update(data =>
      data.map(d => d.zipCode === zipCode
        ? { ...d, loading: true, error: null, weather: null }
        : d
      )
    );
    this.loadWeather(zipCode);
  }

  getIconUrl(iconCode: string): string {
    return this.weatherService.getIconUrl(iconCode);
  }
}