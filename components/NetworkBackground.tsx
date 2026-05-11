'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type Node = { id: string };
type Link = { source: string; target: string };

function buildGraph(nodeCount: number, edgesPerNode: number) {
  const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({ id: `n${i}` }));
  const links: Link[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodeCount; i++) {
    for (let k = 0; k < edgesPerNode; k++) {
      const j = Math.floor(Math.random() * nodeCount);
      if (j === i) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: `n${i}`, target: `n${j}` });
    }
  }
  return { nodes, links };
}

export default function NetworkBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const graph = useMemo(() => buildGraph(30, 2), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10"
      aria-hidden="true"
    >
      {size.w > 0 && (
        <ForceGraph2D
          graphData={graph}
          width={size.w}
          height={size.h}
          backgroundColor="#0a0a0f"
          nodeColor={() => '#7dd3fc'}
          nodeRelSize={3}
          linkColor={() => 'rgba(125, 211, 252, 0.25)'}
          linkWidth={1}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag={false}
          cooldownTime={Infinity}
          d3VelocityDecay={0.2}
        />
      )}
    </div>
  );
}
