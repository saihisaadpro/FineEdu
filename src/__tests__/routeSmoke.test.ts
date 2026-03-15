import { describe, it, expect } from 'vitest';
import { router } from '@/router';

/**
 * Smoke test: validates the router configuration is complete and consistent.
 * Does NOT render React — just inspects the route tree structure.
 */

// Flatten all routes from the nested tree
function flattenRoutes(
  routes: typeof router.routes,
  parentPath = '',
): { path: string; hasElement: boolean; hasErrorElement: boolean; hasGuard: boolean }[] {
  const result: { path: string; hasElement: boolean; hasErrorElement: boolean; hasGuard: boolean }[] = [];

  for (const route of routes) {
    const segment = route.path ?? (route.index ? '(index)' : '(layout)');
    const fullPath = segment === '(index)' ? parentPath || '/' : segment === '(layout)' ? parentPath : `${parentPath}/${segment}`.replace('//', '/');

    const hasElement = !!route.Component || !!route.element;
    const hasErrorElement = !!route.ErrorBoundary || !!route.errorElement;

    // A guard is an element-only route with children (AuthGuard pattern)
    const hasGuard = hasElement && !route.path && !route.index && (route.children?.length ?? 0) > 0;

    result.push({ path: fullPath, hasElement, hasErrorElement, hasGuard });

    if (route.children) {
      result.push(...flattenRoutes(route.children, fullPath));
    }
  }

  return result;
}

describe('Router smoke test', () => {
  const allRoutes = flattenRoutes(router.routes);
  const leafRoutes = allRoutes.filter((r) => !r.hasGuard && r.path !== '(layout)');

  it('has a root route', () => {
    const root = allRoutes.find((r) => r.path === '/');
    expect(root).toBeDefined();
    expect(root?.hasElement).toBe(true);
    expect(root?.hasErrorElement).toBe(true);
  });

  const expectedPaths = [
    '/',
    '/login',
    '/resume',
    '/privacy',
    '/access-denied',
    '/dashboard',
    '/module/:moduleId',
    '/topic/:topicId',
    '/topic/:topicId/assessment',
    '/facilitator',
    '/module-lead',
    '/admin/health',
    '/*',
  ];

  it.each(expectedPaths)('route "%s" exists in config', (path) => {
    const found = leafRoutes.some((r) => r.path === path);
    expect(found).toBe(true);
  });

  it('all AuthGuard layout routes have errorElement', () => {
    const guards = allRoutes.filter((r) => r.hasGuard);
    expect(guards.length).toBeGreaterThanOrEqual(3); // any-auth, facilitator, module-lead, admin
    for (const guard of guards) {
      expect(guard.hasErrorElement).toBe(true);
    }
  });

  it('all leaf routes have an element', () => {
    for (const route of leafRoutes) {
      if (route.path === '(layout)') continue;
      expect(route.hasElement).toBe(true);
    }
  });

  it('total route count is in expected range', () => {
    // Should have ~13 leaf routes + several layout/guard routes
    expect(allRoutes.length).toBeGreaterThan(12);
    expect(allRoutes.length).toBeLessThan(30);
  });
});
