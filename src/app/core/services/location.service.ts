// src/app/core/services/location.service.ts

import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Location } from '../models/weather.models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly STORAGE_KEY = 'weather_app_locations';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private locationsSignal = signal<Location[]>([]);
  readonly locations = this.locationsSignal.asReadonly();
  readonly locationCount = computed(() => this.locations().length);

  private selectedLocationSignal = signal<Location | null>(null);
  readonly selectedLocation = this.selectedLocationSignal.asReadonly();

  constructor() {
    this.loadFromStorage();
    
    effect(() => {
      const currentLocations = this.locations();
      this.saveToStorage(currentLocations);
    });
  }

  addLocation(zipCode: string): boolean {
    const cleanZipCode = zipCode.trim();
    
    if (!this.isValidUSZipCode(cleanZipCode)) {
      return false;
    }

    const exists = this.locations().some(loc => loc.zipCode === cleanZipCode);
    if (exists) {
      return false;
    }

    const newLocation: Location = {
      zipCode: cleanZipCode,
      addedAt: new Date()
    };

    this.locationsSignal.update(current => [...current, newLocation]);
    return true;
  }

  removeLocation(zipCode: string): boolean {
    const initialLength = this.locations().length;
    
    this.locationsSignal.update(current => 
      current.filter(loc => loc.zipCode !== zipCode)
    );

    const removed = this.locations().length < initialLength;
    
    if (removed && this.selectedLocation()?.zipCode === zipCode) {
      this.selectedLocationSignal.set(null);
    }
    
    return removed;
  }

  selectLocation(location: Location | null): void {
    this.selectedLocationSignal.set(location);
  }

  getLocation(zipCode: string): Location | undefined {
    return this.locations().find(loc => loc.zipCode === zipCode);
  }

  hasLocation(zipCode: string): boolean {
    return this.locations().some(loc => loc.zipCode === zipCode);
  }

  clearAll(): void {
    this.locationsSignal.set([]);
    this.selectedLocationSignal.set(null);
  }

  validateZipCode(zipCode: string): boolean {
    return this.isValidUSZipCode(zipCode.trim());
  }

  private isValidUSZipCode(zipCode: string): boolean {
    return /^\d{5}$/.test(zipCode);
  }

  private saveToStorage(locations: Location[]): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locations));
    } catch (error) {
      console.error('Storage save error:', error);
    }
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const locations: Location[] = JSON.parse(stored);
        locations.forEach(loc => {
          loc.addedAt = new Date(loc.addedAt);
        });
        this.locationsSignal.set(locations);
      }
    } catch (error) {
      console.error('Storage load error:', error);
      this.locationsSignal.set([]);
    }
  }
}