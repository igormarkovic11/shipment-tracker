import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { ShipmentService } from '../../core/services/shipment.service';
import { Shipment } from '../../models/shipment.model';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shipment-list.component.html',
  styleUrl: './shipment-list.component.scss',
})
export class ShipmentListComponent implements OnInit {
  shipments: Shipment[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  statusFilter = '';

  statuses = [
    'confirmed',
    'picked_up',
    'departed',
    'arrived_at_hub',
    'out_for_delivery',
    'delivered',
    'refused',
  ];

  private filterChange$ = new Subject<string>();

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit() {
    this.filterChange$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          this.loading = true;
          const params: any = {};
          if (this.searchTerm) params.search = this.searchTerm;
          if (this.statusFilter) params.status = this.statusFilter;
          return this.shipmentService.getAll(params).pipe(
            catchError(() => {
              this.error = 'Failed to load shipments';
              this.loading = false;
              return of([]);
            }),
          );
        }),
      )
      .subscribe((data) => {
        this.shipments = data;
        this.loading = false;
      });

    this.onFilterChange();
  }

  onFilterChange() {
    this.filterChange$.next(`${this.searchTerm}|${this.statusFilter}`);
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.onFilterChange();
  }

  get lateCount(): number {
    return this.shipments.filter((s) => s.isLate).length;
  }
}
