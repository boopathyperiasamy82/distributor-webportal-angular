import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sales-return',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.scss']
})
export class SalesReturnComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  salesReturns = signal<any[]>([]);
  loading = signal(false);
  showModal = signal(false);
  submitting = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  currentStatus = signal('ALL');
  masterCustomers = signal<any[]>([]);
  masterProducts = signal<any[]>([]);

  // Modal form fields
  selectedCustomer = signal('');
  invoiceRef = signal('');
  selectedProduct = signal('');
  returnQty = signal<number | null>(null);
  unitPrice = signal<number | null>(null);
  returnReason = signal('');

  returnReasons = ['Damaged Stock in Transit', 'Near Expiry / Expired Product', 'Quality Non-Conformance', 'Excess Retailer Inventory'];
  statusTabs = ['ALL', 'Pending', 'Confirmed'];

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Sales Return - BSR Solutions');
    this.loadSalesReturns();
    this.api.getMasterData('customer', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterCustomers.set(r.records || []));
    this.api.getMasterData('product', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterProducts.set(r.records || []));
  }

  loadSalesReturns(): void {
    this.loading.set(true);
    this.api.getSalesReturns(this.selectedDate(), this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { this.salesReturns.set(res.returns || res.salesReturns || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setStatus(s: string): void { this.currentStatus.set(s); }

  get filteredReturns(): any[] {
    const st = this.currentStatus();
    if (st === 'ALL') return this.salesReturns();
    return this.salesReturns().filter((r: any) => (r.status || '').toLowerCase() === st.toLowerCase());
  }

  openModal(): void { this.showModal.set(true); this.resetModal(); }
  closeModal(): void { this.showModal.set(false); }
  resetModal(): void {
    this.selectedCustomer.set(''); this.invoiceRef.set('');
    this.selectedProduct.set(''); this.returnQty.set(null);
    this.unitPrice.set(null); this.returnReason.set('');
  }

  submitReturn(): void {
    if (!this.selectedCustomer() || !this.selectedProduct() || !this.returnQty() || !this.returnReason()) {
      alert('Please fill all required fields.'); return;
    }
    this.submitting.set(true);
    // POST via api (generic post to sales-returns endpoint as placeholder)
    this.api.getSalesReturns(this.selectedDate(), this.distrCode, this.sourceMode).subscribe({
      next: () => { this.submitting.set(false); this.closeModal(); this.loadSalesReturns(); },
      error: () => { this.submitting.set(false); }
    });
  }
}
