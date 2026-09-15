import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shipment } from '../../models/shipment.model';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private baseUrl = 'http://localhost:3000/api/shipments';

  constructor(private http: HttpClient) {}

  getAll(params?: {
    status?: string;
    late?: string;
    sort?: string;
  }): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(this.baseUrl, { params: params as any });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  addEvent(id: number, status: string, note?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/events`, { status, note });
  }

  create(data: {
    customerId: number;
    destination: string;
    promisedDate: string;
  }) {
    return this.http.post(this.baseUrl, data);
  }
}
