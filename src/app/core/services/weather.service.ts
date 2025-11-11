
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, asyncScheduler } from 'rxjs';
import { map, catchError, tap, observeOn } from 'rxjs/operators';
import { 
  CurrentWeather, 
  Forecast, 
  ForecastDay,
  WeatherbitCurrentResponse,
  WeatherbitForecastResponse 
} from '../models/weather.models';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly API_BASE_URL = 'https://api.weatherbit.io/v2.0';
  private readonly API_KEY = '177ffa1c3a194eb38fbffbbb6738cf45';
  private readonly CACHE_TTL = 2 * 60 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  getCurrentWeather(zipCode: string): Observable<CurrentWeather> {
    if (!this.isValidZipCode(zipCode)) {
      return throwError(() => new Error('Invalid ZIP code format'));
    }

    const cacheKey = `current_${zipCode}`;
    const cached = this.cacheService.get<CurrentWeather>(cacheKey);
    
    if (cached) {
      console.log(`Clima actual obtenido del caché: ${zipCode}`);
      return of(cached).pipe(
        observeOn(asyncScheduler)
      );
    }

    console.log(`Solicitando clima actual para ZIP code de EE.UU.: ${zipCode}`);
    
    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('key', this.API_KEY);

    return this.http.get<WeatherbitCurrentResponse>(
      `${this.API_BASE_URL}/current`,
      { params }
    ).pipe(
      map(response => {
        if (!response.data || response.data.length === 0) {
          throw new Error('No data found for this ZIP code');
        }

        const data = response.data[0];
        
        return {
          temp: Math.round(data.temp),
          description: data.weather.description,
          humidity: data.rh,
          windSpeed: Math.round(data.wind_spd * 3.6),
          icon: data.weather.icon,
          cityName: data.city_name,
          timestamp: Date.now()
        };
      }),
      tap(weather => this.cacheService.set(cacheKey, weather, this.CACHE_TTL)),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  getForecast(zipCode: string): Observable<Forecast> {
    if (!this.isValidZipCode(zipCode)) {
      return throwError(() => new Error('Invalid ZIP code format'));
    }

    const cacheKey = `forecast_${zipCode}`;
    const cached = this.cacheService.get<Forecast>(cacheKey);
    
    if (cached) {
      console.log(`Pronóstico obtenido del caché: ${zipCode}`);
      return of(cached).pipe(
        observeOn(asyncScheduler)
      );
    }

    console.log(`Solicitando pronóstico para ZIP code de EE.UU.: ${zipCode}`);
    
    const params = new HttpParams()
      .set('postal_code', zipCode)
      .set('country', 'US')
      .set('days', '5')
      .set('key', this.API_KEY);

    return this.http.get<WeatherbitForecastResponse>(
      `${this.API_BASE_URL}/forecast/daily`,
      { params }
    ).pipe(
      map(response => {
        if (!response.data || response.data.length === 0) {
          throw new Error('No forecast data found');
        }

        const days: ForecastDay[] = response.data.slice(0, 5).map(day => ({
          date: day.datetime,
          tempMax: Math.round(day.max_temp),
          tempMin: Math.round(day.min_temp),
          description: day.weather.description,
          icon: day.weather.icon,
          humidity: day.rh,
          windSpeed: Math.round(day.wind_spd * 3.6)
        }));

        return {
          location: zipCode,
          days,
          timestamp: Date.now()
        };
      }),
      tap(forecast => this.cacheService.set(cacheKey, forecast, this.CACHE_TTL)),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  getIconUrl(iconCode: string): string {
    return `https://www.weatherbit.io/static/img/icons/${iconCode}.png`;
  }

  invalidateCache(zipCode: string): void {
    this.cacheService.delete(`current_${zipCode}`);
    this.cacheService.delete(`forecast_${zipCode}`);
  }

  clearAllCache(): void {
    this.cacheService.clear();
  }

  isValidZipCode(zipCode: string): boolean {
    return /^\d{5}$/.test(zipCode);
  }

  private handleError(error: any): Error {
    let message = 'Unable to fetch weather data';

    if (error.status === 0) {
      message = 'Error de Conexion, Revisa tu conexion a Internet.';
    } else if (error.status === 401) {
      message = 'API authentication error.';
    } else if (error.status === 404) {
      message = 'Codigo Zip no encontrado.';
    } else if (error.status === 429) {
      message = 'Demasiadas Peticiones. Intentalo mas Tarde.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    return new Error(message);
  }
}