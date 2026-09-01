import React, { useState, useMemo, useEffect } from 'react';
import { WBSNode, Activity } from '../../types/p6';
import { Folder, ChevronRight, Check, Search, Layers } from 'lucide-react';

interface CascadingWBSSelectorProps {
  wbsNodes: WBSNode[];
  activities?: Activity[];
  selectedWbsId: string;
  onSelectWbsId: (wbsId: string) => void;
  className?: string;
}

export const CascadingWBSSelector: React.FC<CascadingWBSSelectorProps> = ({
  wbsNodes,
  activities = [],
  selectedWbsId,
  onSelectWbsId,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'cascade' | 'search'>('cascade');
  const [searchQuery, setSearchQuery] = useState('');

  // Map parentWbsId -> child nodes
  const childrenMap = useMemo(() => {
    const map = new Map<string | null, WBSNode[]>();
    wbsNodes.forEach(w => {
      const pId = w.parentWbsId;
      if (!map.has(pId)) map.set(pId, []);
      map.get(pId)!.push(w);
    });
    return map;
  }, [wbsNodes]);

  // Map wbsId -> WBSNode
  const nodeMap = useMemo(() => {
    const map = new Map<string, WBSNode>();
    wbsNodes.forEach(w => map.set(w.wbsId, w));
    return map;
  }, [wbsNodes]);

  // Root nodes (Level 1)
  const rootNodes = useMemo(() => {
    const wbsIdSet = new Set(wbsNodes.map(w => w.wbsId));
    let roots = wbsNodes.filter(w => !w.parentWbsId || !wbsIdSet.has(w.parentWbsId));
    if (roots.length === 0 && wbsNodes.length > 0) roots = [wbsNodes[0]];
    return roots;
  }, [wbsNodes]);

  // Track the selected path array: [L1_id, L2_id, L3_id, ...]
  const [selectedPath, setSelectedPath] = useState<string[]>(() => {
    if (!selectedWbsId) return [rootNodes[0]?.wbsId || ''];
    // Reconstruct ancestor path from selectedWbsId
    const path: string[] = [];
    let curr: string | null = selectedWbsId;
    const visited = new Set<string>();
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      path.unshift(curr);
      const parentNode = nodeMap.get(curr);
      curr = parentNode?.parentWbsId || null;
    }
    return path.length > 0 ? path : [rootNodes[0]?.wbsId || ''];
  });

  // Sync external selectedWbsId and wbsNodes changes
  useEffect(() => {
    if (!selectedWbsId || !nodeMap.has(selectedWbsId)) {
      const fallbackId = rootNodes[0]?.wbsId || '';
      setSelectedPath(fallbackId ? [fallbackId] : []);
      return;
    }
    const path: string[] = [];
    let curr: string | null = selectedWbsId;
    const visited = new Set<string>();
    while (curr && !visited.has(curr) && nodeMap.has(curr)) {
      visited.add(curr);
      path.unshift(curr);
      const parentNode = nodeMap.get(curr);
      curr = parentNode?.parentWbsId || null;
    }
    if (path.length > 0) {
      setSelectedPath(path);
    } else {
      const fallbackId = rootNodes[0]?.wbsId || '';
      setSelectedPath(fallbackId ? [fallbackId] : []);
    }
  }, [selectedWbsId, nodeMap, rootNodes]);

  // Handle tier selection at a given level depth (0 = L1, 1 = L2, 2 = L3, ...)
  const handleSelectTier = (levelIndex: number, newWbsId: string) => {
    if (!newWbsId) return;
    const newPath = selectedPath.slice(0, levelIndex);
    newPath.push(newWbsId);
    setSelectedPath(newPath);
    onSelectWbsId(newWbsId);
  };

  // Build the tiers of options to display
  const tiers = useMemo(() => {
    const list: { levelNum: number; parentNode: WBSNode | null; options: WBSNode[]; selectedId: string }[] = [];

    // Tier 1: Root nodes
    list.push({
      levelNum: 1,
      parentNode: null,
      options: rootNodes,
      selectedId: selectedPath[0] || rootNodes[0]?.wbsId || '',
    });

    // Subsequent tiers based on current path
    for (let i = 0; i < selectedPath.length; i++) {
      const currentParentId = selectedPath[i];
      const parentNode = nodeMap.get(currentParentId) || null;
      const children = childrenMap.get(currentParentId) || [];

      if (children.length > 0) {
        list.push({
          levelNum: (parentNode?.level || i + 1) + 1,
          parentNode,
          options: children,
          selectedId: selectedPath[i + 1] || '',
        });
      }
    }

    return list;
  }, [rootNodes, selectedPath, nodeMap, childrenMap]);

  // Current active target node
  const activeNode = useMemo(() => {
    const lastId = selectedPath[selectedPath.length - 1];
    return nodeMap.get(lastId) || nodeMap.get(selectedWbsId) || rootNodes[0] || null;
  }, [selectedPath, selectedWbsId, nodeMap, rootNodes]);

  // Activity count under active node
  const childActivityCount = useMemo(() => {
    if (!activeNode) return 0;
    return activities.filter(a => a.wbsId === activeNode.wbsId).length;
  }, [activeNode, activities]);

  // Filtered search list
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return wbsNodes.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return wbsNodes
      .filter(w => w.name.toLowerCase().includes(q) || w.shortCode.toLowerCase().includes(q))
      .slice(0, 60);
  }, [wbsNodes, searchQuery]);

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 ${className}`}>
      {/* Header with Mode Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Target WBS Level Selector
            </span>
            <span className="text-[10px] text-slate-500">
              Select Group-wise: choose Level 1 → Level 2 → Level 3 → Level 4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode('cascade')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              viewMode === 'cascade' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Level by Level
          </button>
          <button
            type="button"
            onClick={() => setViewMode('search')}
            className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
              viewMode === 'search' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Search All
          </button>
        </div>
      </div>

      {/* Mode A: Cascading Level-by-Level Dropdowns */}
      {viewMode === 'cascade' ? (
        <div className="space-y-3">
          {/* Cascading Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tiers.map((tier, idx) => {
              const label =
                idx === 0
                  ? 'Level 1: Project Root'
                  : `Level ${tier.levelNum}: under [${tier.parentNode?.shortCode || 'Parent'}]`;

              return (
                <div key={idx} className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block truncate" title={label}>
                    {label}
                  </label>
                  <div className="relative">
                    <select
                      value={tier.selectedId}
                      onChange={e => handleSelectTier(idx, e.target.value)}
                      className={`w-full appearance-none bg-white border rounded-xl py-2 pl-3 pr-8 text-xs font-semibold focus:outline-none transition-all shadow-2xs cursor-pointer ${
                        tier.selectedId
                          ? 'border-blue-300 text-slate-900 ring-1 ring-blue-100'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      <option value="">-- Select Level {tier.levelNum} Branch --</option>
                      {tier.options.map(opt => (
                        <option key={opt.wbsId} value={opt.wbsId}>
                          [{opt.shortCode}] {opt.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Breadcrumb Trail & Summary Badge */}
          {activeNode && (
            <div className="p-2.5 bg-white border border-blue-200 rounded-xl flex items-center justify-between text-xs shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 truncate">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-600 shrink-0">Active Target:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] truncate">
                  {selectedPath.map((pathId, i) => {
                    const node = nodeMap.get(pathId);
                    if (!node) return null;
                    const isLast = i === selectedPath.length - 1;
                    return (
                      <React.Fragment key={pathId}>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            isLast
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isLast) handleSelectTier(i, pathId);
                          }}
                        >
                          L{node.level}: {node.shortCode}
                        </span>
                        {!isLast && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                  {activeNode.name}
                </span>
                {childActivityCount > 0 && (
                  <span className="bg-slate-100 text-slate-600 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {childActivityCount} acts
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode B: Search All WBS Nodes */
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search among all ${wbsNodes.length} WBS nodes...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {searchResults.map(w => {
              const isSelected = selectedWbsId === w.wbsId;
              return (
                <div
                  key={w.wbsId}
                  onClick={() => {
                    onSelectWbsId(w.wbsId);
                  }}
                  className={`p-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">
                      L{w.level} [{w.shortCode}]
                    </span>
                    <span className="truncate">{w.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
