import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WeatherService } from '../../core/services/weather.service';
import { Forecast, ForecastDay } from '../../core/models/weather.models';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';


registerLocaleData(localeEs);

@Component({
  selector: 'app-forecast-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-detail.html',
  styleUrls: ['./forecast-detail.css']
})
export class ForecastDetailComponent {
  zipCode = signal<string>('');
  forecast = signal<Forecast | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    const zipCode = this.route.snapshot.paramMap.get('zipCode');
    
    if (!zipCode) {
      this.router.navigate(['/']);
      return;
    }

    this.zipCode.set(zipCode);
    this.loadForecast(zipCode);
  }

  private loadForecast(zipCode: string) {
    this.loading.set(true);
    this.error.set(null);

    this.weatherService.getForecast(zipCode).subscribe({
      next: (forecast) => {
        this.forecast.set(forecast);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  refresh() {
    this.weatherService.invalidateCache(this.zipCode());
    this.loadForecast(this.zipCode());
  }

  goBack() {
    this.router.navigate(['/weather']);
  }

  getIconUrl(iconCode: string): string {
    return this.weatherService.getIconUrl(iconCode);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} de ${month}`;
  }

  getDayName(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}
}