import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShipmentService } from '../../core/services/shipment.service';
import { ALLOWED_TRANSITIONS } from '../../core/transitions';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shipment-detail.component.html',
  styleUrl: './shipment-detail.component.scss',
})
export class ShipmentDetailComponent implements OnInit {
  shipment: any = null;
  loading = true;
  error = '';
  advancing = false;
  advanceError = '';

  constructor(
    private route: ActivatedRoute,
    private shipmentService: ShipmentService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.shipmentService.getById(id).subscribe({
      next: (data) => {
        this.shipment = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load shipment';
        this.loading = false;
      },
    });
  }

  get nextStatuses(): string[] {
    if (!this.shipment) return [];
    return ALLOWED_TRANSITIONS[this.shipment.status] || [];
  }

  advance(status: string) {
    this.advancing = true;
    this.advanceError = '';
    this.shipmentService.addEvent(this.shipment.id, status).subscribe({
      next: () => {
        this.advancing = false;
        this.load(this.shipment.id); // reload da vidiš novi event u timeline-u
      },
      error: (err) => {
        this.advancing = false;
        this.advanceError = err.error?.error || 'Failed to update status';
      },
    });
  }
}
