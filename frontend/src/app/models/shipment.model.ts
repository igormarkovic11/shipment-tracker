export interface Shipment {
  id: number;
  customerName: string;
  destination: string;
  status: string;
  promisedDate: string;
  isLate: boolean;
  daysLate: number;
}
