import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ShipmentService } from '../../core/services/shipment.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector: 'app-shipment-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shipment-create.component.html',
  styleUrl: './shipment-create.component.scss',
})
export class ShipmentCreateComponent implements OnInit {
  customers: any[] = [];
  loadingCustomers = true;
  submitting = false;
  error = '';

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private customerService: CustomerService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      destination: ['', Validators.required],
      promisedDate: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.loadingCustomers = false;
      },
      error: () => {
        this.error = 'Failed to load customers';
        this.loadingCustomers = false;
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = '';

    this.shipmentService.create(this.form.value as any).subscribe({
      next: (shipment: any) => {
        this.router.navigate(['/shipments', shipment.id]);
      },
      error: () => {
        this.submitting = false;
        this.error = 'Failed to create shipment';
      },
    });
  }
}
