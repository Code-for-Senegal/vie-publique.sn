/**
 * Composable pour l'arbre hiérarchique des entités publiques
 */

import type { StateEntityTreeNode } from '~/types/state-entity';

export function useStateTree() {
  const {
    data: rawTree,
    pending,
    error,
    refresh,
  } = useAsyncData<any[]>('state-tree', () => $fetch('/api/state/tree'), {
    server: true,
  });

  // Grouper les entités par type (Institutions vs Ministères)
  const tree = computed(() => {
    if (!rawTree.value) return []

    const institutions: any[] = []
    const ministries: any[] = []

    rawTree.value.forEach((entity: any) => {
      const typeCode = entity.type_info?.code || 'other'

      if (typeCode === 'presidency' || typeCode === 'primature') {
        institutions.push(entity)
      } else if (typeCode === 'ministry') {
        ministries.push(entity)
      }
    })

    // Créer les groupes
    const groups: any[] = []

    if (institutions.length > 0) {
      groups.push({
        id: 'group-institutions',
        name: 'Institutions',
        children: institutions,
        children_count: institutions.length,
        is_group: true,
        has_public_page: false,
      })
    }

    if (ministries.length > 0) {
      groups.push({
        id: 'group-ministries',
        name: 'Ministères',
        children: ministries,
        children_count: ministries.length,
        is_group: true,
        has_public_page: false,
      })
    }

    return groups
  });

  // État d'expansion des noeuds (côté client uniquement)
  const expandedNodes = ref<Set<number>>(new Set());

  // Méthodes pour gérer l'expansion
  const toggleNode = (nodeId: number) => {
    if (expandedNodes.value.has(nodeId)) {
      expandedNodes.value.delete(nodeId);
    } else {
      expandedNodes.value.add(nodeId);
    }
  };

  const expandNode = (nodeId: number) => {
    expandedNodes.value.add(nodeId);
  };

  const collapseNode = (nodeId: number) => {
    expandedNodes.value.delete(nodeId);
  };

  const expandAll = () => {
    const allNodeIds: number[] = [];
    const collectIds = (nodes: StateEntityTreeNode[]) => {
      nodes.forEach((node) => {
        allNodeIds.push(node.id);
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    if (tree.value) {
      collectIds(tree.value);
      expandedNodes.value = new Set(allNodeIds);
    }
  };

  const collapseAll = () => {
    expandedNodes.value.clear();
  };

  const isExpanded = (nodeId: number) => {
    return expandedNodes.value.has(nodeId);
  };

  // Statistiques de l'arbre
  const stats = computed(() => {
    if (!tree.value) return null;

    let totalNodes = 0;
    let maxDepth = 0;
    const nodesByLevel: Record<number, number> = {};

    const traverse = (nodes: StateEntityTreeNode[], level = 0) => {
      nodes.forEach((node) => {
        totalNodes++;
        maxDepth = Math.max(maxDepth, level);
        nodesByLevel[level] = (nodesByLevel[level] || 0) + 1;

        if (node.children.length > 0) {
          traverse(node.children, level + 1);
        }
      });
    };

    traverse(tree.value);

    return {
      totalNodes,
      maxDepth,
      nodesByLevel,
      rootNodes: tree.value.length,
    };
  });

  // Recherche dans l'arbre
  const searchInTree = (query: string) => {
    if (!tree.value || !query) return [];

    const results: StateEntityTreeNode[] = [];
    const searchTerm = query.toLowerCase();

    const search = (nodes: StateEntityTreeNode[]) => {
      nodes.forEach((node) => {
        const matchName = node.name.toLowerCase().includes(searchTerm);
        const matchAcronym = node.acronym?.toLowerCase().includes(searchTerm);
        const matchShortName = node.short_name?.toLowerCase().includes(searchTerm);

        if (matchName || matchAcronym || matchShortName) {
          results.push(node);
        }

        if (node.children.length > 0) {
          search(node.children);
        }
      });
    };

    search(tree.value);
    return results;
  };

  // Trouver le chemin vers un noeud
  const findPathToNode = (targetId: number): StateEntityTreeNode[] | null => {
    if (!tree.value) return null;

    const path: StateEntityTreeNode[] = [];

    const findPath = (nodes: StateEntityTreeNode[]): boolean => {
      for (const node of nodes) {
        path.push(node);

        if (node.id === targetId) {
          return true;
        }

        if (node.children.length > 0 && findPath(node.children)) {
          return true;
        }

        path.pop();
      }

      return false;
    };

    return findPath(tree.value) ? path : null;
  };

  return {
    // Données
    tree,
    stats,

    // États
    pending,
    error,
    expandedNodes: readonly(expandedNodes),

    // Actions d'expansion
    toggleNode,
    expandNode,
    collapseNode,
    expandAll,
    collapseAll,
    isExpanded,

    // Utilitaires
    searchInTree,
    findPathToNode,
    refresh,
  };
}
