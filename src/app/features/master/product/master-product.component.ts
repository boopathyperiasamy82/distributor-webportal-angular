import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-product.component.html',
  styleUrls: ['./master-product.component.scss']
})
export class MasterProductComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  products = signal<any[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.products().filter(p =>
      !q ||
      (p.ProductCode || p.product_code || '').toLowerCase().includes(q) ||
      (p.ProductName || p.product_name || '').toLowerCase().includes(q) ||
      (p.Category || p.category || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Product Master - BSR Solutions');
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('product', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.products.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
