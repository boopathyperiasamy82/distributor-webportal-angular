import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface MenuItem {
  menuCode: string;
  menuDescription: string;
  parentCode: string;
  access: string;
  icon: string;
  children: MenuItem[];
}

const FALLBACK_MENU_ITEMS: MenuItem[] = [
  { menuCode: 'MASTER', menuDescription: 'Master', parentCode: '', access: 'Y', icon: 'layers', children: [] },
  { menuCode: 'MASTER_PRODUCT', menuDescription: 'Product', parentCode: 'MASTER', access: 'Y', icon: 'package', children: [] },
  { menuCode: 'MASTER_SALESMAN', menuDescription: 'Salesman', parentCode: 'MASTER', access: 'Y', icon: 'user-check', children: [] },
  { menuCode: 'MASTER_ROUTE', menuDescription: 'Route', parentCode: 'MASTER', access: 'Y', icon: 'map-pin', children: [] },
  { menuCode: 'MASTER_CUSTOMER', menuDescription: 'Customer', parentCode: 'MASTER', access: 'Y', icon: 'users', children: [] },
  { menuCode: 'MASTER_SALES_HIERARCHY', menuDescription: 'Sales Hierarchy', parentCode: 'MASTER', access: 'Y', icon: 'network', children: [] },
  { menuCode: 'MASTER_GEO_HIERARCHY', menuDescription: 'Geo Hierarchy', parentCode: 'MASTER', access: 'Y', icon: 'globe', children: [] },
  { menuCode: 'MASTER_DISTRIBUTOR_GEO_MAPPING', menuDescription: 'Distributor Sales and Geo Mapping', parentCode: 'MASTER', access: 'Y', icon: 'map-pin', children: [] },
  
  { menuCode: 'TRANSACTION', menuDescription: 'Transaction', parentCode: '', access: 'Y', icon: 'arrow-left-right', children: [] },
  { menuCode: 'TXN_ORDER_BOOKING', menuDescription: 'Order Booking', parentCode: 'TRANSACTION', access: 'Y', icon: 'clipboard-list', children: [] },
  { menuCode: 'TXN_SALES_RETURN', menuDescription: 'Sales Return', parentCode: 'TRANSACTION', access: 'Y', icon: 'rotate-ccw', children: [] },
  { menuCode: 'TXN_COLLECTION', menuDescription: 'Collection', parentCode: 'TRANSACTION', access: 'Y', icon: 'banknote', children: [] },
  
  { menuCode: 'INVENTORY', menuDescription: 'Inventory', parentCode: '', access: 'Y', icon: 'archive', children: [] },
  { menuCode: 'INV_PURCHASE', menuDescription: 'Purchase', parentCode: 'INVENTORY', access: 'Y', icon: 'shopping-cart', children: [] },
  { menuCode: 'INV_ORDER_TO_SALES', menuDescription: 'Order to Sales', parentCode: 'INVENTORY', access: 'Y', icon: 'truck', children: [] },
  { menuCode: 'INV_STOCK_ADJUSTMENT', menuDescription: 'Stock Adjustment', parentCode: 'INVENTORY', access: 'Y', icon: 'sliders', children: [] },
  
  { menuCode: 'REPORT_DISTRIBUTOR', menuDescription: 'Distributor Reports & Analytics', parentCode: '', access: 'Y', icon: 'building', children: [] },
  { menuCode: 'RPT_DAILY_STOCK', menuDescription: 'Daily Stock Report', parentCode: 'REPORT_DISTRIBUTOR', access: 'Y', icon: 'file-bar-chart', children: [] },
  { menuCode: 'RPT_STOCK_LEDGER', menuDescription: 'Stock Ledger Report', parentCode: 'REPORT_DISTRIBUTOR', access: 'Y', icon: 'book-open', children: [] },
  { menuCode: 'RPT_INVENTORY_SUMMARY', menuDescription: 'Inventory Summary Report', parentCode: 'REPORT_DISTRIBUTOR', access: 'Y', icon: 'pie-chart', children: [] },
  { menuCode: 'RPT_EXECUTIVE_ANALYTICS', menuDescription: 'Executive Analytics Dashboard', parentCode: 'REPORT_DISTRIBUTOR', access: 'Y', icon: 'trending-up', children: [] },
  { menuCode: 'SLS_DISTRIBUTOR_GROWTH_HUB', menuDescription: 'Distributor Business Growth & ROI Hub', parentCode: 'REPORT_DISTRIBUTOR', access: 'Y', icon: 'zap', children: [] },
  { menuCode: 'RPT_DISTRIBUTOR_BANK_AUTO_PO', menuDescription: 'Bank OD Interest & AI Auto-PO Optimizer', parentCode: 'REPORT_DISTRIBUTOR', access: 'Y', icon: 'shield-check', children: [] },
  
  { menuCode: 'REPORT_CUSTOMER', menuDescription: 'Customer (Retailer) Reports', parentCode: '', access: 'Y', icon: 'users', children: [] },
  { menuCode: 'SLS_STRATEGY_CUSTOMER_360', menuDescription: 'Sales Strategy & Customer 360° Report', parentCode: 'REPORT_CUSTOMER', access: 'Y', icon: 'target', children: [] },
  { menuCode: 'RPT_CUSTOMER_CREDIT_HEALTH', menuDescription: 'Retailer Credit Health & BNPL Limit Engine', parentCode: 'REPORT_CUSTOMER', access: 'Y', icon: 'credit-card', children: [] },
  
  { menuCode: 'REPORT_SALESMAN', menuDescription: 'Salesman Reports & Gamification', parentCode: '', access: 'Y', icon: 'award', children: [] },
  { menuCode: 'SLS_INCENTIVE_GAMIFICATION', menuDescription: 'Salesman MTD Incentives & 3D Gamification', parentCode: 'REPORT_SALESMAN', access: 'Y', icon: 'trophy', children: [] },
  { menuCode: 'RPT_SALESMAN_NEXT_TIER_BEAT', menuDescription: 'Salesman Live Target Bonus & Beat Route GPS', parentCode: 'REPORT_SALESMAN', access: 'Y', icon: 'map-pin', children: [] },
  
  { menuCode: 'PLUG', menuDescription: 'Plug', parentCode: '', access: 'Y', icon: 'plug', children: [] },
  { menuCode: 'PLUG_EXPORT', menuDescription: 'Export', parentCode: 'PLUG', access: 'Y', icon: 'download', children: [] },
  { menuCode: 'PLUG_IMPORT', menuDescription: 'Import', parentCode: 'PLUG', access: 'Y', icon: 'upload', children: [] },
  
  { menuCode: 'CONFIGURATION', menuDescription: 'Configuration', parentCode: '', access: 'Y', icon: 'settings', children: [] },
  { menuCode: 'CONFIG_USER_PRIVILEGES', menuDescription: 'User Privileges', parentCode: 'CONFIGURATION', access: 'Y', icon: 'shield-alert', children: [] }
];

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);

  readonly menuCodeToRoute: Record<string, string> = {
    'MASTER_PRODUCT': '/dashboard/master/product',
    'MASTER_SALESMAN': '/dashboard/master/salesman',
    'MASTER_ROUTE': '/dashboard/master/route',
    'MASTER_CUSTOMER': '/dashboard/master/customer',
    'MASTER_SALES_HIERARCHY': '/dashboard/master/sales-hierarchy',
    'MASTER_GEO_HIERARCHY': '/dashboard/master/geo-hierarchy',
    'MASTER_DISTRIBUTOR_GEO_MAPPING': '/dashboard/master/distributor-geo-mapping',
    'TXN_ORDER_BOOKING': '/dashboard/transaction/order-booking',
    'TXN_SALES_RETURN': '/dashboard/transaction/sales-return',
    'TXN_COLLECTION': '/dashboard/transaction/collection',
    'INV_PURCHASE': '/dashboard/inventory/purchase',
    'INV_ORDER_TO_SALES': '/dashboard/inventory/order-to-sale',
    'INV_STOCK_ADJUSTMENT': '/dashboard/inventory/stock-adjustment',
    'RPT_DAILY_STOCK': '/dashboard/reports/dashboard-home',
    'RPT_STOCK_LEDGER': '/dashboard/reports/stock-ledger',
    'RPT_INVENTORY_SUMMARY': '/dashboard/reports/inventory-summary',
    'RPT_EXECUTIVE_ANALYTICS': '/dashboard/reports/executive-analytics',
    'SLS_DISTRIBUTOR_GROWTH_HUB': '/dashboard/reports/distributor-growth-hub',
    'RPT_DISTRIBUTOR_BANK_AUTO_PO': '/dashboard/reports/distributor-bank-auto-po',
    'SLS_STRATEGY_CUSTOMER_360': '/dashboard/reports/sales-strategy',
    'RPT_CUSTOMER_CREDIT_HEALTH': '/dashboard/reports/retailer-credit-bnpl',
    'SLS_INCENTIVE_GAMIFICATION': '/dashboard/reports/salesman-incentive',
    'RPT_SALESMAN_NEXT_TIER_BEAT': '/dashboard/reports/salesman-live-motivator',
    'PLUG_EXPORT': '/dashboard/plug/export',
    'PLUG_IMPORT': '/dashboard/plug/import',
    'CONFIG_USER_PRIVILEGES': '/dashboard/configuration/user-privileges'
  };

  getRouteForCode(menuCode: string): string {
    return this.menuCodeToRoute[menuCode] || '';
  }

  loadMenus(): Observable<MenuItem[]> {
    return this.http.get('assets/menus.xml', { responseType: 'text' }).pipe(
      map(xmlString => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const items: MenuItem[] = [];
        const menuNodes = xmlDoc.getElementsByTagName('menu');
        
        for (let i = 0; i < menuNodes.length; i++) {
          const node = menuNodes[i];
          items.push({
            menuCode: node.getElementsByTagName('menuCode')[0]?.textContent || '',
            menuDescription: node.getElementsByTagName('menuDescription')[0]?.textContent || '',
            parentCode: node.getElementsByTagName('parentCode')[0]?.textContent || '',
            access: node.getElementsByTagName('access')[0]?.textContent || '',
            icon: node.getElementsByTagName('icon')[0]?.textContent || '',
            children: []
          });
        }
        return items.length > 0 ? items : FALLBACK_MENU_ITEMS;
      }),
      catchError(() => of(FALLBACK_MENU_ITEMS))
    );
  }

  buildMenuTree(items: MenuItem[], allowedCodes: Set<string>): MenuItem[] {
    const isWildcard = !allowedCodes || allowedCodes.size === 0 || allowedCodes.has('*');
    const itemMap = new Map<string, MenuItem>();
    const roots: MenuItem[] = [];
    
    items.forEach(item => {
      if (isWildcard || allowedCodes.has(item.menuCode) || !item.parentCode) {
         itemMap.set(item.menuCode, { ...item, children: [] });
      }
    });

    itemMap.forEach(item => {
      if (item.parentCode) {
        const parent = itemMap.get(item.parentCode);
        if (parent) {
          parent.children.push(item);
        }
      } else {
        roots.push(item);
      }
    });

    if (!isWildcard) {
       return roots.filter(root => root.children.length > 0);
    }
    
    return roots;
  }
}
