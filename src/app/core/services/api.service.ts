import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  login(username: string, password: string, sourceMode: string, forceKill?: boolean): Observable<any> {
    return this.post('/webportal-login', { username, password, sourceMode, forceKill });
  }

  logout(): Observable<any> {
    return this.post('/webportal-logout', {});
  }

  getMasterData(entity: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-master-data', { entity, distrCode, sourceMode });
  }

  getDashboardKPIs(distrCode: string, sourceMode: string, periodFilter?: string): Observable<any> {
    return this.post('/webportal-dashboard-kpi', { distrCode, sourceMode, periodFilter });
  }

  getOrders(orderDate: string, distrCode: string, sourceMode: string, statusFilter?: string): Observable<any> {
    return this.post('/webportal-orders', { orderDate, distrCode, sourceMode, statusFilter });
  }

  initiateOrder(header: any, lines: any[], sourceMode: string): Observable<any> {
    return this.post('/webportal-initiate-order', { header, lines, sourceMode });
  }

  getNextOrderNo(distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-next-order-no', { distrCode, sourceMode });
  }

  updateOrderStatus(orderNo: string, status: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-update-order-status', { orderNo, status, sourceMode });
  }

  getSalesReturns(returnDate: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-sales-returns', { returnDate, distrCode, sourceMode });
  }

  getPurchases(distrCode: string, statusFilter: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-purchases', { distrCode, statusFilter, sourceMode });
  }

  getPurchaseDetails(purchaseRefNo: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-purchase-details', { purchaseRefNo, sourceMode });
  }

  savePurchaseInvoice(purchaseRefNo: string, items: any[], sourceMode: string): Observable<any> {
    return this.post('/webportal-save-purchase-invoice', { purchaseRefNo, items, sourceMode });
  }

  initiatePurchase(header: any, lines: any[], sourceMode: string): Observable<any> {
    return this.post('/webportal-initiate-purchase', { header, lines, sourceMode });
  }

  updatePurchaseStatus(purchaseRefNo: string, status: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-update-purchase-status', { purchaseRefNo, status, sourceMode });
  }

  getNextPurchaseNo(distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-next-purchase-no', { distrCode, sourceMode });
  }

  getStockAdjustments(statusFilter: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-stock-adjustments', { statusFilter, distrCode, sourceMode });
  }

  submitStockAdjustment(data: any, sourceMode: string): Observable<any> {
    return this.post('/webportal-submit-stock-adjustment', { ...data, sourceMode });
  }

  updateStockAdjustmentStatus(adjNo: string, status: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-update-stock-adjustment-status', { adjNo, status, sourceMode });
  }

  generateStockLedger(distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-generate-stock-ledger', { distrCode, sourceMode });
  }

  getStockLedger(transDate: string, distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-stock-ledger', { transDate, distrCode, sourceMode });
  }

  getExecutiveAnalytics(distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-executive-analytics', { distrCode, sourceMode });
  }

  getSalesStrategy(distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-sales-strategy', { distrCode, sourceMode });
  }

  getSalesmanIncentives(distrCode: string, salesHierarchy: string, geoHierarchy: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-salesman-incentives', { distrCode, salesHierarchy, geoHierarchy, sourceMode });
  }

  getDistributorGrowthHub(distrCode: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-distributor-growth', { distrCode, sourceMode });
  }

  exportEntity(entity: string, format: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-export', { entity, format, sourceMode });
  }

  importEntity(entity: string, format: string, records: any[], sourceMode: string): Observable<any> {
    return this.post('/webportal-import', { entity, format, records, sourceMode });
  }

  getConfigUsers(userType: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-config-users', { userType, sourceMode });
  }

  saveConfigPrivileges(username: string, menuAccess: string, sourceMode: string): Observable<any> {
    return this.post('/webportal-config-save', { username, menuAccess, sourceMode });
  }

  getDbStatus(): Observable<any> {
    return this.post('/webportal-db-status', {});
  }

  ping(): Observable<any> {
    return this.http.get('/webportal-ping');
  }
}
