export interface Shipment {
  id: number;
  customerName: string;
  destination: string;
  status: string;
  promisedDate: string;
  isLate: boolean;
  daysLate: number;
}

export interface PagedShipments {
  data: Shipment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
