import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShipmentService } from '../../core/services/shipment.service';
import { Shipment } from '../../models/shipment.model';

@Component({
  selector: 'app-late-shipments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './late-shipments.component.html',
  styleUrl: './late-shipments.component.scss',
})
export class LateShipmentsComponent implements OnInit {
  shipments: Shipment[] = [];
  loading = true;
  error = '';

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit() {
    // late=true + sort=late_first: najgore stanje na vrhu, tačno kako traži zadatak
    this.shipmentService
      .getAll({ late: 'true', sort: 'late_first' })
      .subscribe({
        next: (data) => {
          this.shipments = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load late shipments';
          this.loading = false;
        },
      });
  }
}
