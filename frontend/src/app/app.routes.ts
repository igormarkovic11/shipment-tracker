import { Routes } from '@angular/router';
import { ShipmentListComponent } from './features/shipment-list/shipment-list.component';
import { ShipmentDetailComponent } from './features/shipment-detail/shipment-detail.component';
import { ShipmentCreateComponent } from './features/shipment-create/shipment-create.component';
import { LateShipmentsComponent } from './features/late-shipments/late-shipments.component';

export const routes: Routes = [
  { path: '', component: ShipmentListComponent },
  { path: 'late', component: LateShipmentsComponent },
  { path: 'shipments/new', component: ShipmentCreateComponent },
  { path: 'shipments/:id', component: ShipmentDetailComponent },
];
