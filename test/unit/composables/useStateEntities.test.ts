import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStateEntities } from '~/composables/useStateEntities';
import type { StateEntityListResponse } from '~/types/state-entity';

// Mock de useRoute et useRouter
const mockRoute = {
  query: {},
};

const mockRouterPush = vi.fn();
const mockRouter = {
  push: mockRouterPush,
};

vi.mock('#app', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
  useAsyncData: vi.fn(),
}));

// Mock de $fetch
global.$fetch = vi.fn();

describe('useStateEntities', () => {
  beforeEach(() => {
    // Reset des mocks
    vi.clearAllMocks();
    mockRoute.query = {};
  });

  it('should initialize with default filters', () => {
    const { filters } = useStateEntities();

    expect(filters.value).toEqual({
      search: '',
      type: undefined,
      status: 'active',
      parent_id: undefined,
      page: 1,
      limit: 20,
      sort: ['name'],
    });
  });

  it('should initialize filters from URL query', () => {
    mockRoute.query = {
      search: 'ANSD',
      type: 'agence',
      page: '2',
    };

    const { filters } = useStateEntities();

    expect(filters.value.search).toBe('ANSD');
    expect(filters.value.type).toBe('agence');
    expect(filters.value.page).toBe(2);
  });

  it('should update search filter', () => {
    const { setSearch } = useStateEntities();

    setSearch('Ministère');

    expect(mockRouterPush).toHaveBeenCalledWith({
      query: expect.objectContaining({
        search: 'Ministère',
        page: 1, // Reset page
      }),
    });
  });

  it('should update type filter', () => {
    const { setType } = useStateEntities();

    setType('ministere');

    expect(mockRouterPush).toHaveBeenCalledWith({
      query: expect.objectContaining({
        type: 'ministere',
        page: 1, // Reset page
      }),
    });
  });

  it('should update page without resetting filters', () => {
    mockRoute.query = { search: 'test', type: 'agence' };

    const { setPage } = useStateEntities();

    setPage(3);

    expect(mockRouterPush).toHaveBeenCalledWith({
      query: expect.objectContaining({
        search: 'test',
        type: 'agence',
        page: 3,
      }),
    });
  });

  it('should reset all filters', () => {
    mockRoute.query = { search: 'test', type: 'agence', page: '3' };

    const { resetFilters, filters } = useStateEntities();

    resetFilters();

    expect(filters.value).toEqual({
      search: '',
      type: undefined,
      status: 'active',
      parent_id: undefined,
      page: 1,
      limit: 20,
      sort: ['name'],
    });

    expect(mockRouterPush).toHaveBeenCalledWith({ query: {} });
  });

  it('should handle status filter correctly', () => {
    const { setStatus } = useStateEntities();

    setStatus('dissolved');

    expect(mockRouterPush).toHaveBeenCalledWith({
      query: expect.objectContaining({
        status: 'dissolved',
        page: 1,
      }),
    });
  });

  it('should handle parent_id filter correctly', () => {
    const { setParentId } = useStateEntities();

    setParentId(42);

    expect(mockRouterPush).toHaveBeenCalledWith({
      query: expect.objectContaining({
        parent_id: 42,
        page: 1,
      }),
    });
  });
});
