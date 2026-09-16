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
  sortBy = 'promisedDate';
  order: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  statuses = [
    'confirmed',
    'picked_up',
    'departed',
    'arrived_at_hub',
    'out_for_delivery',
    'delivered',
    'refused',
    'lost',
    'damaged',
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
          const params: any = {
            page: this.page,
            pageSize: this.pageSize,
            sortBy: this.sortBy,
            order: this.order,
          };
          if (this.searchTerm) params.search = this.searchTerm;
          if (this.statusFilter) params.status = this.statusFilter;
          return this.shipmentService.getAll(params).pipe(
            catchError(() => {
              this.error = 'Failed to load shipments';
              this.loading = false;
              return of({
                data: [],
                page: 1,
                pageSize: this.pageSize,
                total: 0,
                totalPages: 1,
              });
            }),
          );
        }),
      )
      .subscribe((res) => {
        this.shipments = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      });

    this.reload();
  }

  private reload() {
    this.filterChange$.next(
      `${this.searchTerm}|${this.statusFilter}|${this.sortBy}|${this.order}|${this.page}`,
    );
  }

  onFilterChange() {
    this.page = 1;
    this.reload();
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.order = 'asc';
    }
    this.page = 1;
    this.reload();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.reload();
  }

  sortIcon(column: string): string {
    if (this.sortBy !== column) return '';
    return this.order === 'asc' ? '↑' : '↓';
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.onFilterChange();
  }

  get lateCount(): number {
    return this.shipments?.filter((s) => s.isLate).length ?? 0;
  }
}
