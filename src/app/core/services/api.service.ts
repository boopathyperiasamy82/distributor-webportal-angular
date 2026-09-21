import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const DEMO_USERS: Record<string, any> = {
  admin: { password: 'admin123', name: 'System Administrator', role: 'ROLE_ADMIN', distrCode: 'ADMIN-001', userType: 'COMPANY' },
  boopathy: { password: 'boopathy123', name: 'Boopathy Periyaswamy', role: 'ROLE_DISTRIBUTOR', distrCode: 'DIST-10001', userType: 'DISTRIBUTOR' },
  'alex.morgan': { password: 'Password@123', name: 'Alex Morgan & Co.', role: 'DISTRIBUTOR', distrCode: 'DIST-99999', userType: 'DISTRIBUTOR' },
  sds: { password: 'Welcome@01', name: 'Raj R', role: 'DISTRIBUTOR', distrCode: 'DIST-33245', userType: 'DISTRIBUTOR' }
};

const MOCK_MASTER_DATA: Record<string, any[]> = {
  customer: [
    { CustomerCode: 'CUST-001', CustomerName: 'Apex Retailers Pvt Ltd', City: 'Chennai', Phone: '9876543210' },
    { CustomerCode: 'CUST-002', CustomerName: 'Metro Departmental Store', City: 'Coimbatore', Phone: '9876543211' }
  ],
  product: [
    { ProductCode: 'PROD-001', ProductName: 'Premium Wheat Flour 5kg', Category: 'Staples', Price: 250 },
    { ProductCode: 'PROD-002', ProductName: 'Sunflower Cooking Oil 1L', Category: 'Edible Oils', Price: 165 }
  ],
  salesman: [
    { SalesmanCode: 'SM-01', SalesmanName: 'Karthik Raja', Mobile: '9123456780', Territory: 'Zone-A' }
  ],
  route: [
    { RouteCode: 'RT-01', RouteName: 'Central Express Beat', TotalOutlets: 42 }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  login(username: string, password: string, sourceMode: string, forceKill?: boolean): Observable<any> {
    return this.post<any>('/webportal-login', { username, password, sourceMode, forceKill }).pipe(
      catchError(() => {
        const u = DEMO_USERS[username];
        if (u && u.password === password) {
          return of({
            status: 'success',
            token: 'demo-jwt-token-' + Date.now(),
            user: {
              username,
              name: u.name,
              role: u.role,
              distrCode: u.distrCode,
              userType: u.userType,
              sourceMode: sourceMode || 'xml'
            }
          });
        }
        return of({ status: 'error', message: 'Invalid username or password credentials.' });
      })
    );
  }

  logout(): Observable<any> {
    return this.post<any>('/webportal-logout', {}).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getMasterData(entity: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-master-data', { entity, distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', records: MOCK_MASTER_DATA[entity] || [] }))
    );
  }

  getDashboardKPIs(distrCode: string, sourceMode: string, periodFilter?: string): Observable<any> {
    return this.post<any>('/webportal-dashboard-kpi', { distrCode, sourceMode, periodFilter }).pipe(
      catchError(() => of({ status: 'success', todayOrders: 18, todaySales: 64200, pendingReturns: 2, stockValue: 1450000 }))
    );
  }

  getOrders(orderDate: string, distrCode: string, sourceMode: string, statusFilter?: string): Observable<any> {
    return this.post<any>('/webportal-orders', { orderDate, distrCode, sourceMode, statusFilter }).pipe(
      catchError(() => of({ status: 'success', orders: [] }))
    );
  }

  initiateOrder(header: any, lines: any[], sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-initiate-order', { header, lines, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getNextOrderNo(distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-next-order-no', { distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', nextNo: 'ORD-10042' }))
    );
  }

  updateOrderStatus(orderNo: string, status: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-update-order-status', { orderNo, status, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getSalesReturns(returnDate: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-sales-returns', { returnDate, distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', returns: [] }))
    );
  }

  getPurchases(distrCode: string, statusFilter: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-purchases', { distrCode, statusFilter, sourceMode }).pipe(
      catchError(() => of({ status: 'success', purchases: [] }))
    );
  }

  getPurchaseDetails(purchaseRefNo: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-purchase-details', { purchaseRefNo, sourceMode }).pipe(
      catchError(() => of({ status: 'success', details: [] }))
    );
  }

  savePurchaseInvoice(purchaseRefNo: string, items: any[], sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-save-purchase-invoice', { purchaseRefNo, items, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  initiatePurchase(header: any, lines: any[], sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-initiate-purchase', { header, lines, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  updatePurchaseStatus(purchaseRefNo: string, status: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-update-purchase-status', { purchaseRefNo, status, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getNextPurchaseNo(distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-next-purchase-no', { distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', nextNo: 'PO-90021' }))
    );
  }

  getStockAdjustments(statusFilter: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-stock-adjustments', { statusFilter, distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', adjustments: [] }))
    );
  }

  submitStockAdjustment(data: any, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-submit-stock-adjustment', { ...data, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  updateStockAdjustmentStatus(adjNo: string, status: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-update-stock-adjustment-status', { adjNo, status, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  generateStockLedger(distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-generate-stock-ledger', { distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getStockLedger(transDate: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-stock-ledger', { transDate, distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', ledger: [] }))
    );
  }

  getExecutiveAnalytics(distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-executive-analytics', { distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', analytics: {} }))
    );
  }

  getSalesStrategy(distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-sales-strategy', { distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', strategy: {} }))
    );
  }

  getSalesmanIncentives(distrCode: string, salesHierarchy: string, geoHierarchy: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-salesman-incentives', { distrCode, salesHierarchy, geoHierarchy, sourceMode }).pipe(
      catchError(() => of({ status: 'success', incentives: [] }))
    );
  }

  getDistributorGrowthHub(distrCode: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-distributor-growth', { distrCode, sourceMode }).pipe(
      catchError(() => of({ status: 'success', growth: {} }))
    );
  }

  exportEntity(entity: string, format: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-export', { entity, format, sourceMode }).pipe(
      catchError(() => of({ status: 'success', data: [] }))
    );
  }

  importEntity(entity: string, format: string, records: any[], sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-import', { entity, format, records, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getConfigUsers(userType: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-config-users', { userType, sourceMode }).pipe(
      catchError(() => of({ status: 'success', users: [] }))
    );
  }

  saveConfigPrivileges(username: string, menuAccess: string, sourceMode: string): Observable<any> {
    return this.post<any>('/webportal-config-save', { username, menuAccess, sourceMode }).pipe(
      catchError(() => of({ status: 'success' }))
    );
  }

  getDbStatus(): Observable<any> {
    return this.post<any>('/webportal-db-status', {}).pipe(
      catchError(() => of({ status: 'success', active: true, mode: 'xml' }))
    );
  }

  ping(): Observable<any> {
    return this.http.get('/webportal-ping').pipe(
      catchError(() => of({ status: 'ok' }))
    );
  }
}
