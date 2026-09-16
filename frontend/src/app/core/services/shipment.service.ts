import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedShipments } from '../../models/shipment.model';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private baseUrl = 'http://localhost:3000/api/shipments';

  constructor(private http: HttpClient) {}

  getAll(params?: {
    status?: string;
    late?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedShipments> {
    return this.http.get<PagedShipments>(this.baseUrl, {
      params: params as any,
    });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  addEvent(id: number, status: string, note?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/events`, {
      status,
      note,
    });
  }

  create(data: {
    customerId: number;
    destination: string;
    promisedDate: string;
  }) {
    return this.http.post(this.baseUrl, data);
  }
}
