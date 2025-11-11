// src/app/features/dashboard/dashboard.component.ts

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  zipCode = signal('');
  errorMessage = signal('');
  successMessage = signal('');

  // Computed para verificar si ya existe
  alreadyExists = computed(() => {
    const zip = this.zipCode().trim();
    if (!zip) return false;
    return this.locationService.hasLocation(zip);
  });

  // Computed para verificar si es válido
  isValid = computed(() => {
    const zip = this.zipCode().trim();
    if (!zip) return false;
    return this.locationService.validateZipCode(zip);
  });

  constructor(
    private locationService: LocationService,
    private router: Router
  ) {}

  addLocation() {
    const zip = this.zipCode().trim();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!zip) {
      this.errorMessage.set('POR FAVOR INGRESE UN CÓDIGO POSTAL');
      return;
    }

    if (!this.isValid()) {
      this.errorMessage.set('CODIGO POSTAL NO VÁLIDO');
      return;
    }

    if (this.alreadyExists()) {
      this.errorMessage.set('LA UBICACIÓN YA EXISTE');
      return;
    }

    const added = this.locationService.addLocation(zip);

    if (added) {
      this.successMessage.set('localización agregada con éxito');
      this.zipCode.set('');
      
      setTimeout(() => {
        this.router.navigate(['/weather']);
      }, 1000);
    }
  }

  viewWeather() {
    const locations = this.locationService.locations();
    if (locations.length === 0) {
      this.errorMessage.set('Agregue al menos una ubicación para ver el clima.');
      return;
    }
    this.router.navigate(['/weather']);
  }
}