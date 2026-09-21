import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-order-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-booking.component.html',
  styleUrls: ['./order-booking.component.scss']
})
export class OrderBookingComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  currentView = signal<'list' | 'entry'>('list');
  orders = signal<any[]>([]);
  loading = signal(false);
  submitting = signal(false);
  currentStatus = signal('ALL');
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  expandedOrders = signal<Set<string>>(new Set());

  // Master data
  masterSalesmen = signal<any[]>([]);
  masterRoutes = signal<any[]>([]);
  masterCustomers = signal<any[]>([]);
  masterProducts = signal<any[]>([]);
  masterUoms = signal<any[]>([]);

  // Entry form
  orderNo = signal('');
  orderDate = signal(new Date().toISOString().split('T')[0]);
  selectedSalesman = signal('');
  selectedRoute = signal('');
  selectedCustomer = signal('');
  selectedProduct = signal('');
  selectedUom = signal('');
  inputQty = signal<number | null>(null);
  editSellingRate = signal(false);
  availableUoms = signal<any[]>([]);
  entryLineItems = signal<any[]>([]);

  get canEditSellingRate(): boolean {
    const user = this.auth.getUser();
    return user?.editSellingRate === 'Y' || this.auth.isAdmin();
  }

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Order Booking - BSR Solutions');
    this.loadOrders();
    this.loadMasterData();
  }

  loadOrders(): void {
    this.loading.set(true);
    const sf = this.currentStatus() === 'ALL' ? '' : this.currentStatus();
    this.api.getOrders(this.selectedDate(), this.distrCode, this.sourceMode, sf).subscribe({
      next: (res: any) => { this.orders.set(res.orders || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadMasterData(): void {
    this.api.getMasterData('salesman', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterSalesmen.set(r.records || []));
    this.api.getMasterData('route', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterRoutes.set(r.records || []));
    this.api.getMasterData('customer', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterCustomers.set(r.records || []));
    this.api.getMasterData('product', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterProducts.set(r.records || []));
    this.api.getMasterData('product_uoms', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterUoms.set(r.records || []));
  }

  openInitiateView(): void {
    this.entryLineItems.set([]);
    this.selectedSalesman.set(''); this.selectedRoute.set(''); this.selectedCustomer.set('');
    this.selectedProduct.set(''); this.selectedUom.set(''); this.inputQty.set(null);
    const now = new Date();
    this.orderNo.set(`ORD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`);
    this.orderDate.set(now.toISOString().split('T')[0]);
    this.api.getNextOrderNo(this.distrCode, this.sourceMode).subscribe((r: any) => { if (r?.orderNo) this.orderNo.set(r.orderNo); });
    this.currentView.set('entry');
  }

  onProductChange(): void {
    const prodCode = this.selectedProduct();
    const matching = this.masterUoms().filter((u: any) => u.ProductCode === prodCode);
    if (matching.length > 0) {
      this.availableUoms.set(matching);
      const base = matching.find((u: any) => u.IsBaseUOM === 'Y') || matching[0];
      this.selectedUom.set(base?.UOMCode || '');
    } else {
      const prod = this.masterProducts().find((p: any) => (p.ProductCode || p.product_code) === prodCode);
      this.availableUoms.set([{ UOMCode: prod?.BaseUOM || 'PCS', UOMDescription: prod?.BaseUOM || 'PCS', ConversionFactor: 1.0 }]);
      this.selectedUom.set(prod?.BaseUOM || 'PCS');
    }
  }

  addLine(): void {
    const prodCode = this.selectedProduct();
    const qty = this.inputQty();
    if (!prodCode || !qty || qty <= 0) return;
    const prod = this.masterProducts().find((p: any) => (p.ProductCode || p.product_code) === prodCode);
    if (!prod) return;
    const sellingRate = parseFloat(prod.SellingRate || prod.selling_rate || 0);
    const mrp = parseFloat(prod.MRP || prod.mrp || 0);
    const taxPct = 12.0;
    const gross = parseFloat((qty * sellingRate).toFixed(2));
    const tax = parseFloat((gross * taxPct / 100).toFixed(2));
    const net = parseFloat((gross + tax).toFixed(2));
    const items = [...this.entryLineItems()];
    const existing = items.findIndex((i: any) => i.prodCode === prodCode);
    if (existing >= 0) {
      items[existing].qty += qty;
      items[existing].gross = parseFloat((items[existing].qty * sellingRate).toFixed(2));
      items[existing].tax = parseFloat((items[existing].gross * taxPct / 100).toFixed(2));
      items[existing].net = parseFloat((items[existing].gross + items[existing].tax).toFixed(2));
    } else {
      items.push({ lineNo: items.length+1, prodCode, prodName: prod.ProductName || prod.product_name, uom: this.selectedUom(), qty, mrp, sellingRate, taxPct, gross, tax, net });
    }
    this.entryLineItems.set(items);
    this.selectedProduct.set(''); this.selectedUom.set(''); this.inputQty.set(null);
  }

  removeLine(idx: number): void { this.entryLineItems.set(this.entryLineItems().filter((_,i) => i !== idx)); }

  get orderGross(): number { return this.entryLineItems().reduce((s,i) => s + i.gross, 0); }
  get orderTax(): number { return this.entryLineItems().reduce((s,i) => s + i.tax, 0); }
  get orderNet(): number { return this.entryLineItems().reduce((s,i) => s + i.net, 0); }

  async submitOrder(): Promise<void> {
    if (!this.selectedSalesman() || !this.selectedRoute() || !this.selectedCustomer()) { alert('Please fill all required header fields.'); return; }
    if (this.entryLineItems().length === 0) { alert('Please add at least one product.'); return; }
    this.submitting.set(true);
    const cust = this.masterCustomers().find((c: any) => (c.CustomerCode || c.customer_code) === this.selectedCustomer());
    const header = { orderNo: this.orderNo(), orderDate: this.orderDate(), distrCode: this.distrCode, cmpCode: 'CMP001', salesman: this.selectedSalesman(), route: this.selectedRoute(), customerCode: this.selectedCustomer(), customerName: cust?.CustomerName || this.selectedCustomer(), totalGross: this.orderGross.toFixed(2), totalTax: this.orderTax.toFixed(2), totalNet: this.orderNet.toFixed(2), status: 'Pending' };
    this.api.initiateOrder(header, this.entryLineItems(), this.sourceMode).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        if (res?.status === 'success') { alert(`Order ${res.orderNo || this.orderNo()} created successfully!`); this.currentView.set('list'); this.loadOrders(); }
        else alert(res?.message || 'Failed');
      },
      error: (err: any) => { this.submitting.set(false); alert(err.message); }
    });
  }

  toggleExpand(orderNo: string): void {
    const s = new Set(this.expandedOrders());
    s.has(orderNo) ? s.delete(orderNo) : s.add(orderNo);
    this.expandedOrders.set(s);
  }

  isExpanded(orderNo: string): boolean { return this.expandedOrders().has(orderNo); }

  updateOrderStatus(orderNo: string, status: string): void {
    this.api.updateOrderStatus(orderNo, status, this.sourceMode).subscribe({
      next: (res: any) => { if (res?.status === 'success') this.loadOrders(); else alert(res?.message); }
    });
  }

  statusTabs = ['ALL', 'Pending', 'Confirmed', 'Cancelled'];
}
