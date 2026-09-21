import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-distributor-growth-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distributor-growth-hub.component.html',
  styleUrls: ['./distributor-growth-hub.component.scss']
})
export class DistributorGrowthHubComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  growthData = signal<any>(null);
  loading = signal(false);

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Distributor Growth Hub - BSR Solutions');
    this.loadGrowth();
  }

  loadGrowth(): void {
    this.loading.set(true);
    this.api.getDistributorGrowthHub(this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { this.growthData.set(res.data || res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
