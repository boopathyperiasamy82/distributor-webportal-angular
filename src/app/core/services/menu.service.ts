import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface MenuItem {
  menuCode: string;
  menuDescription: string;
  parentCode: string;
  access: string;
  icon: string;
  children: MenuItem[];
}

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
    return this.http.get('/assets/menus.xml', { responseType: 'text' }).pipe(
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
        return items;
      })
    );
  }

  buildMenuTree(items: MenuItem[], allowedCodes: Set<string>): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const roots: MenuItem[] = [];
    
    // Create a map of all items that are accessible
    items.forEach(item => {
      // Allow access if allowedCodes has '*', or if user has access to this menu code, 
      // or if it's a parent menu (which we'll filter out later if it has no children)
      if (allowedCodes.has('*') || allowedCodes.has(item.menuCode) || !item.parentCode) {
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

    // Filter out empty roots for users who don't have access to '*'
    if (!allowedCodes.has('*')) {
       return roots.filter(root => root.children.length > 0);
    }
    
    return roots;
  }
}
