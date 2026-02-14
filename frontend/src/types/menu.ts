/**
 * Types pour les entrées de menu (API GET /api/menu/items/).
 * Structure récursive : chaque item peut avoir des children.
 */
export interface MenuItemApi {
  id: string;
  name: string;
  slug: string;
  url: string;
  icon: string;
  order: number;
  is_active: boolean;
  children: MenuItemApi[];
}
