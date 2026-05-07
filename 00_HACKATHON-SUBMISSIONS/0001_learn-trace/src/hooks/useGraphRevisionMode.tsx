// src/hooks/useGraphRevisionMode.ts
import { useCallback, useEffect, useRef, useState } from "react";
//@ts-ignore
import type { Network } from "vis-network/standalone";

export type NodeId = string;

export function useGraphRevisionMode(opts: {
  networkRef: React.MutableRefObject<Network | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isRegularNodeId?: (id: string) => boolean;
}) {
  const {
    networkRef,
    containerRef,
    isRegularNodeId = (id: string) =>
      !(id.startsWith("note_") || id.startsWith("resource_")),
  } = opts;

  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const isRevisionModeRef = useRef(false);
  useEffect(() => {
    isRevisionModeRef.current = isRevisionMode;
  }, [isRevisionMode]);

  const [selected, setSelected] = useState<NodeId[]>([]);
  const selectedSetRef = useRef<Set<NodeId>>(new Set());

  const setVisSelection = useCallback(
    (ids: NodeId[]) => {
      const net = networkRef.current;
      if (!net) return;
      (net as any).setSelection?.(
        { nodes: ids, edges: [] },
        { unselectAll: true, highlightEdges: false }
      ) ?? net.selectNodes(ids);
    },
    [networkRef]
  );

  const syncFromVis = useCallback(() => {
    const net = networkRef.current;
    if (!net) return;
    const ids = net.getSelectedNodes().map(String);
    selectedSetRef.current = new Set(ids);
    setSelected(ids);
  }, [networkRef]);

  const toggle = useCallback(
    (id: NodeId) => {
      const set = selectedSetRef.current;
      if (set.has(id)) set.delete(id);
      else set.add(id);
      const ids = Array.from(set);
      setVisSelection(ids);
      setSelected(ids);
    },
    [setVisSelection]
  );

  const enter = useCallback(() => setIsRevisionMode(true), []);
  const exit = useCallback(() => setIsRevisionMode(false), []);

  // Rebind handlers whenever mode flips
  useEffect(() => {
    const net = networkRef.current;
    if (!net) return;

    // Clear previous
    net.off("click");
    net.off("oncontext");
    net.off("select");
    net.off("deselect");

    if (isRevisionMode) {
      // Interaction options for revision mode
      net.setOptions({
        interaction: { multiselect: true, dragNodes: false, dragView: true },
      });
      // Prevent browser context menu on the canvas
      if (containerRef.current)
        containerRef.current.oncontextmenu = () => false;

      net.on("click", (params: any) => {
  const raw = params?.nodes?.[0];         
  const id = raw != null ? String(raw) : "";  // avoid "[object Array]" bugs
  if (!id || !isRegularNodeId(id)) return;
  // accumulate selection in a Set, then:
  const set = selectedSetRef.current;
  if (set.has(id)) set.delete(id); else set.add(id);
  const ids = Array.from(set);
  networkRef.current?.selectNodes(ids, /* highlightEdges */ false); // simple, cross-version call
});

// when entering revision mode
net.off("click"); net.off("select"); net.off("deselect"); net.off("oncontext"); // clean slate
net.setOptions({ interaction: { multiselect: true, dragNodes: false, dragView: true } }); // enable multi-select
net.on("select", () => {
  const ids = net.getSelectedNodes().map(String);
  selectedSetRef.current = new Set(ids);
  setSelected(ids);
});
net.on("deselect", () => {
  const ids = net.getSelectedNodes().map(String);
  selectedSetRef.current = new Set(ids);
  setSelected(ids);
});
net.on("oncontext", (p: any) => { p?.event?.preventDefault?.(); p?.event?.stopPropagation?.(); }); // no menus

// when exiting revision mode
net.off("click"); net.off("select"); net.off("deselect"); net.off("oncontext"); // remove revision handlers
(net as any).unselectAll?.(); // clear selection if available
selectedSetRef.current.clear();
setSelected([]);
net.setOptions({ interaction: { multiselect: false, dragNodes: true, dragView: true } }); // restore defaults
      net.on("select", syncFromVis);
      net.on("deselect", syncFromVis);
      net.on("oncontext", (p: any) => {
        p?.event?.preventDefault?.();
        p?.event?.stopPropagation?.();
      });
    } else {
      // Restore defaults; keep selection clean
      net.setOptions({
        interaction: { multiselect: false, dragNodes: true, dragView: true },
      });
      if (containerRef.current) containerRef.current.oncontextmenu = null;
      selectedSetRef.current.clear();
      (net as any).unselectAll?.();
      setSelected([]);
    }
  }, [
    isRevisionMode,
    networkRef,
    containerRef,
    isRegularNodeId,
    toggle,
    syncFromVis,
  ]);

  return {
    isRevisionMode,
    enterRevision: enter,
    exitRevision: exit,
    selectedIds: selected,
  };
}
