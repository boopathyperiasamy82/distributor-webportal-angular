import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-salesman',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-salesman.component.html',
  styleUrls: ['../product/master-product.component.scss']
})
export class MasterSalesmanComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  salesmen = signal<any[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredSalesmen = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.salesmen().filter(s =>
      !q ||
      (s.SalesmanCode || s.salesman_code || '').toLowerCase().includes(q) ||
      (s.SalesmanName || s.salesman_name || '').toLowerCase().includes(q) ||
      (s.RouteCode || s.route_code || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Salesman Master - BSR Solutions');
    this.loadSalesmen();
  }

  loadSalesmen(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('salesman', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.salesmen.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
