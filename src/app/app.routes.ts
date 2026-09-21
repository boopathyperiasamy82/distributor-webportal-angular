import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./features/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent) },
      { path: 'master/product', loadComponent: () => import('./features/master/product/master-product.component').then(m => m.MasterProductComponent) },
      { path: 'master/salesman', loadComponent: () => import('./features/master/salesman/master-salesman.component').then(m => m.MasterSalesmanComponent) },
      { path: 'master/route', loadComponent: () => import('./features/master/route/master-route.component').then(m => m.MasterRouteComponent) },
      { path: 'master/customer', loadComponent: () => import('./features/master/customer/master-customer.component').then(m => m.MasterCustomerComponent) },
      { path: 'master/sales-hierarchy', loadComponent: () => import('./features/master/sales-hierarchy/master-sales-hierarchy.component').then(m => m.MasterSalesHierarchyComponent) },
      { path: 'master/geo-hierarchy', loadComponent: () => import('./features/master/geo-hierarchy/master-geo-hierarchy.component').then(m => m.MasterGeoHierarchyComponent) },
      { path: 'master/distributor-geo-mapping', loadComponent: () => import('./features/master/distributor-geo-mapping/master-distributor-geo-mapping.component').then(m => m.MasterDistributorGeoMappingComponent) },
      { path: 'transaction/order-booking', loadComponent: () => import('./features/transaction/order-booking/order-booking.component').then(m => m.OrderBookingComponent) },
      { path: 'transaction/sales-return', loadComponent: () => import('./features/transaction/sales-return/sales-return.component').then(m => m.SalesReturnComponent) },
      { path: 'transaction/collection', loadComponent: () => import('./features/transaction/collection/collection.component').then(m => m.CollectionComponent) },
      { path: 'inventory/purchase', loadComponent: () => import('./features/inventory/purchase/purchase.component').then(m => m.PurchaseComponent) },
      { path: 'inventory/order-to-sale', loadComponent: () => import('./features/inventory/order-to-sale/order-to-sale.component').then(m => m.OrderToSaleComponent) },
      { path: 'inventory/stock-adjustment', loadComponent: () => import('./features/inventory/stock-adjustment/stock-adjustment.component').then(m => m.StockAdjustmentComponent) },
      { path: 'reports/dashboard-home', loadComponent: () => import('./features/reports/dashboard-home/rpt-dashboard-home.component').then(m => m.RptDashboardHomeComponent) },
      { path: 'reports/stock-ledger', loadComponent: () => import('./features/reports/stock-ledger/stock-ledger.component').then(m => m.StockLedgerComponent) },
      { path: 'reports/inventory-summary', loadComponent: () => import('./features/reports/inventory-summary/inventory-summary.component').then(m => m.InventorySummaryComponent) },
      { path: 'reports/executive-analytics', loadComponent: () => import('./features/reports/executive-analytics/executive-analytics.component').then(m => m.ExecutiveAnalyticsComponent) },
      { path: 'reports/distributor-growth-hub', loadComponent: () => import('./features/reports/distributor-growth-hub/distributor-growth-hub.component').then(m => m.DistributorGrowthHubComponent) },
      { path: 'reports/distributor-bank-auto-po', loadComponent: () => import('./features/reports/distributor-bank-auto-po/distributor-bank-auto-po.component').then(m => m.DistributorBankAutoPoComponent) },
      { path: 'reports/sales-strategy', loadComponent: () => import('./features/reports/sales-strategy/sales-strategy.component').then(m => m.SalesStrategyComponent) },
      { path: 'reports/retailer-credit-bnpl', loadComponent: () => import('./features/reports/retailer-credit-bnpl/retailer-credit-bnpl.component').then(m => m.RetailerCreditBnplComponent) },
      { path: 'reports/salesman-incentive', loadComponent: () => import('./features/reports/salesman-incentive/salesman-incentive.component').then(m => m.SalesmanIncentiveComponent) },
      { path: 'reports/salesman-live-motivator', loadComponent: () => import('./features/reports/salesman-live-motivator/salesman-live-motivator.component').then(m => m.SalesmanLiveMotivatorComponent) },
      { path: 'plug/export', loadComponent: () => import('./features/plug/export/export.component').then(m => m.ExportComponent) },
      { path: 'plug/import', loadComponent: () => import('./features/plug/import/import.component').then(m => m.ImportComponent) },
      { path: 'configuration/user-privileges', loadComponent: () => import('./features/configuration/user-privileges/user-privileges.component').then(m => m.UserPrivilegesComponent) },
      { path: '**', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
