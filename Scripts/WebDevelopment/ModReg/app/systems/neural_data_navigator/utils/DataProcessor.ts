import * as THREE from 'three';

export interface GraphNode {
  id: string;
  name: string;
  val: any;
  type: string;
  depth: number;
  color: string;
  size?: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  collapsed?: boolean;
  children?: string[]; // IDs of children
  parentId?: string;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  color?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const COLORS = [
  '#08f7fe', // Cyan
  '#fe53bb', // Pink
  '#f5d300', // Yellow
  '#09fbd3', // Green
  '#7122fa', // Purple
  '#ff2222', // Red
];

export const processData = (data: any, rootName: string = 'root'): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  const traverse = (obj: any, parentId: string | null, depth: number, key: string) => {
    const id = parentId ? `${parentId}.${key}` : key;
    const type = Array.isArray(obj) ? 'array' : obj === null ? 'null' : typeof obj;
    
    const node: GraphNode = {
      id,
      name: key,
      val: obj,
      type,
      depth,
      color: COLORS[depth % COLORS.length],
      children: [],
      parentId: parentId || undefined,
    };

    nodes.push(node);

    if (parentId) {
      links.push({ source: parentId, target: id });
      // Add child ID to parent node
      const parentNode = nodes.find(n => n.id === parentId);
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(id);
      }
    }

    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((k) => {
        traverse(obj[k], id, depth + 1, k);
      });
    }
  };

  traverse(data, null, 0, rootName);

  // Post-processing for size calculation
  nodes.forEach(node => {
    const childCount = node.children ? node.children.length : 0;
    // Base size 1, add 0.2 per child, max cap at 5, plus random variation
    const baseSize = 1 + (childCount * 0.2);
    const variation = Math.random() * 0.4; // 0 to 0.4 variation
    node.size = Math.min(baseSize, 5) + variation;
  });

  return { nodes, links };
};
