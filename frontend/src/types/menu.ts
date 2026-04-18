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
  /** Sous-menus : si false, l’entrée n’apparaît pas dans le déroulant. */
  is_visible?: boolean;
  children: MenuItemApi[];
}
