import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-order-to-sale',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-to-sale.component.html',
  styleUrls: ['./order-to-sale.component.scss']
})
export class OrderToSaleComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  orders = signal<any[]>([]);
  loading = signal(false);
  expandedOrders = signal<Set<string>>(new Set());

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Order to Sale / Dispatch - BSR Solutions');
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    // Fetch only confirmed orders
    this.api.getOrders('', this.distrCode, this.sourceMode, 'Confirmed').subscribe({
      next: (res: any) => { this.orders.set(res.orders || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleExpand(orderNo: string): void {
    const s = new Set(this.expandedOrders());
    s.has(orderNo) ? s.delete(orderNo) : s.add(orderNo);
    this.expandedOrders.set(s);
  }

  isExpanded(orderNo: string): boolean { return this.expandedOrders().has(orderNo); }

  convertToSale(orderNo: string): void {
    if (confirm(`Convert Order ${orderNo} to Sales Invoice / Dispatch?`)) {
      this.api.updateOrderStatus(orderNo, 'Dispatched', this.sourceMode).subscribe({
        next: (res: any) => { if (res?.status === 'success') { alert('Dispatched successfully'); this.loadOrders(); } }
      });
    }
  }
}
