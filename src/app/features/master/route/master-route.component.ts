import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-route.component.html',
  styleUrls: ['../product/master-product.component.scss', '../salesman/master-salesman.component.scss']
})
export class MasterRouteComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  routes = signal<any[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredRoutes = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.routes().filter(r =>
      !q ||
      (r.RouteCode || r.route_code || '').toLowerCase().includes(q) ||
      (r.RouteName || r.route_name || '').toLowerCase().includes(q) ||
      (r.Zone || r.zone || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Route Master - BSR Solutions');
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('route', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.routes.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
