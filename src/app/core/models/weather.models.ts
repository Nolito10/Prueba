
export interface Location {
  zipCode: string;
  name?: string; 
  addedAt: Date; 
}


export interface CurrentWeather {
  temp: number; 
  description: string; 
  humidity: number; 
  windSpeed: number; 
  icon: string; 
  cityName: string; 
  timestamp: number; 
}


export interface ForecastDay {
  date: string; 
  tempMax: number; 
  tempMin: number;
  description: string; 
  icon: string; 
  humidity: number; 
  windSpeed: number; 
}

/**
 * Pronóstico a 5 días
 */
export interface Forecast {
  location: string; // Código postal
  days: ForecastDay[]; // Array de 5 días
  timestamp: number; // Para caché
}

/**
 * Estructura del caché
 */
export interface CacheItem<T> {
  data: T; 
  expiresAt: number; 
}

/**
 * Respuesta de la API 
 */
export interface WeatherbitCurrentResponse {
  data: Array<{
    temp: number;
    weather: {
      description: string;
      icon: string;
    };
    rh: number; 
    wind_spd: number;
    city_name: string;
  }>;
}

export interface WeatherbitForecastResponse {
  data: Array<{
    datetime: string;
    max_temp: number;
    min_temp: number;
    weather: {
      description: string;
      icon: string;
    };
    rh: number;
    wind_spd: number;
  }>;
}