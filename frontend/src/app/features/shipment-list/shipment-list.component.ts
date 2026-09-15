import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShipmentService } from '../../core/services/shipment.service';
import { Shipment } from '../../models/shipment.model';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shipment-list.component.html',
  styleUrl: './shipment-list.component.scss',
})
export class ShipmentListComponent implements OnInit {
  shipments: Shipment[] = [];
  loading = true;
  error = '';

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit() {
    this.shipmentService.getAll().subscribe({
      next: (data) => {
        this.shipments = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load shipments';
        this.loading = false;
      },
    });
  }
  get lateCount(): number {
    return this.shipments.filter((s) => s.isLate).length;
  }
}
