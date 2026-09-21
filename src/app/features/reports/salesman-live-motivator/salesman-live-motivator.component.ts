import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-salesman-live-motivator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salesman-live-motivator.component.html',
  styleUrls: ['./salesman-live-motivator.component.scss']
})
export class SalesmanLiveMotivatorComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  liveData = signal<any[]>([]);
  period = signal('TODAY');
  private intervalId: any;

  ngOnInit(): void {
    this.titleService.setTitle('Live Motivator - BSR Solutions');
    this.loadData();
    this.intervalId = setInterval(() => this.loadData(), 30000); // 30s poll
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadData(): void {
    const mock = [
      { name: 'John Doe', target: 50000, achieved: 45000, tier: 2 },
      { name: 'Jane Smith', target: 60000, achieved: 62000, tier: 3 },
      { name: 'Mike Johnson', target: 40000, achieved: 20000, tier: 0 }
    ];
    this.liveData.set(mock);
  }

  getPct(achieved: number, target: number): number {
    return Math.min((achieved / target) * 100, 100);
  }
}
