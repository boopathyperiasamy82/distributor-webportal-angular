import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-customer.component.html',
  styleUrls: ['../product/master-product.component.scss', '../salesman/master-salesman.component.scss']
})
export class MasterCustomerComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  customers = signal<any[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredCustomers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.customers().filter(c =>
      !q ||
      (c.CustomerCode || c.customer_code || '').toLowerCase().includes(q) ||
      (c.CustomerName || c.customer_name || '').toLowerCase().includes(q) ||
      (c.City || c.city || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Customer Master - BSR Solutions');
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('customer', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.customers.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
