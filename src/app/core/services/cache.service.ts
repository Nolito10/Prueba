// src/app/core/services/cache.service.ts

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CacheItem } from '../models/weather.models';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly DEFAULT_TTL = 2 * 60 * 60 * 1000;
  private readonly CACHE_PREFIX = 'weather_cache_';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    this.cleanExpiredItems();
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    if (!this.isBrowser) return;
    
    try {
      const expiresAt = Date.now() + ttl;
      const cacheItem: CacheItem<T> = { data, expiresAt };
      localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    
    try {
      const cached = localStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      if (Date.now() > cacheItem.expiresAt) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  delete(key: string): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  clear(): void {
    if (!this.isBrowser) return;
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CACHE_PREFIX)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  private cleanExpiredItems(): void {
    if (!this.isBrowser) return;
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CACHE_PREFIX)
      );
      
      keys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem: CacheItem<any> = JSON.parse(cached);
            if (Date.now() > cacheItem.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }
}