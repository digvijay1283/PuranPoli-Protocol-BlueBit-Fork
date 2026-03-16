import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { graphApi, workspaceApi } from "../services/api";
import CustomNode from "../components/CustomNode";

const nodeTypes = { custom: CustomNode };
const createNodeId = () => `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
const createEdgeId = () => `edge_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
const SUPPLIER_NODE_TYPE = "Tier1Supplier";
const SUPPLIER_NODE_META = {
  title: "My Node",
  subtitle: "Supplier End Point",
  icon: "person_pin_circle",
  iconClass: "bg-blue-100 text-blue-600",
};

export default function SupplierGraphBuilder() {
  const { workspaceId } = useParams();
  const reactFlowWrapper = useRef(null);

  const [workspace, setWorkspace] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Editable fields for the selected node
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");

  // Load workspace and graph
  useEffect(() => {
    const load = async () => {
      try {
        const wsData = await workspaceApi.get(workspaceId);
        setWorkspace(wsData.workspace ?? wsData);

        const graphData = await graphApi.getGraph(workspaceId);
        const rawNodes = graphData.nodes ?? [];
        const rawEdges = graphData.edges ?? [];

        setNodes(
          rawNodes.map((n) => ({
            id: n.id,
            type: "custom",
            position: n.position ?? { x: Math.random() * 600, y: Math.random() * 400 },
            data: {
              ...(n.data || {}),
              label: n.data?.name || n.id,
            },
          }))
        );

        setEdges(
          rawEdges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: "#b1b2ff" },
          }))
        );
      } catch {
        // leave empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId, setNodes, setEdges]);

  // On connect two nodes
  const onConnect = useCallback(
    async (connection) => {
      try {
        const edgeId = createEdgeId();
        const data = await graphApi.createEdge({
          edge_id: edgeId,
          source_node: connection.source,
          target_node: connection.target,
          workspace: workspaceId,
          material: "",
          lead_time: 0,
          dependency_percent: 0,
          transport_mode: "",
          risk_score: 0,
        });
        const newEdge = data.edge ?? data ?? {};
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              id: newEdge.id ?? edgeId,
              animated: true,
              style: { stroke: "#b1b2ff" },
            },
            eds
          )
        );
      } catch {
        // silent
      }
    },
    [workspaceId, setEdges]
  );

  // Drag & drop support
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      const draggedType = event.dataTransfer.getData("application/reactflow");
      if (!draggedType || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const type = SUPPLIER_NODE_TYPE;
      const nodeId = createNodeId();
      const name = `${SUPPLIER_NODE_META.title} ${nodeId.slice(-4)}`;

      try {
        const data = await graphApi.createNode({
          id: nodeId,
          name,
          type,
          workspace: workspaceId,
          position,
        });
        const n = data.node ?? data ?? {};
        const newNode = {
          id: n.id || nodeId,
          type: "custom",
          position: n.position ?? position,
          data: {
            ...(n.data || {}),
            label: n.data?.name || n.id || nodeId,
          },
        };
        setNodes((nds) => [...nds, newNode]);
      } catch {
        // silent
      }
    },
    [reactFlowInstance, workspaceId, setNodes]
  );

  // Node click
  const onNodeClick = useCallback(
    (_event, node) => {
      setSelectedNode(node);
      setEditName(node.data.name || node.data.label || "");
      setEditCountry(node.data.country || "");
    },
    []
  );

  // Save node edits
  const handleSaveNode = async () => {
    if (!selectedNode) return;
    try {
      await graphApi.updateNode(selectedNode.id, {
        name: editName,
        country: editCountry,
      });
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? {
                ...n,
                data: { ...n.data, name: editName, label: editName, country: editCountry },
              }
            : n
        )
      );
      setSelectedNode(null);
    } catch {
      // silent
    }
  };

  // Delete node
  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    try {
      await graphApi.deleteNode(selectedNode.id);
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    } catch {
      // silent
    }
  };

  // Draggable sidebar item
  const onDragStart = (event) => {
    event.dataTransfer.setData("application/reactflow", SUPPLIER_NODE_TYPE);
    event.dataTransfer.effectAllowed = "move";
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-[#6d6fd8]">
            progress_activity
          </span>
          <span className="text-sm">Loading graph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-[#6d6fd8]"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Dashboard
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="text-base font-semibold text-slate-800">
            {workspace?.name || "Graph Builder"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/publish/${workspaceId}`}
            className="flex items-center gap-1.5 rounded-lg bg-[#6d6fd8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#5b5dc0]"
          >
            <span className="material-symbols-outlined text-[16px]">
              publish
            </span>
            Publish
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node palette sidebar */}
        <div className="w-56 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Node
          </p>
          <div className="space-y-1">
            <div
              draggable
              onDragStart={onDragStart}
              className="flex cursor-grab items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-[#b1b2ff]/10 active:cursor-grabbing"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SUPPLIER_NODE_META.iconClass}`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {SUPPLIER_NODE_META.icon}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-700">
                  {SUPPLIER_NODE_META.title}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {SUPPLIER_NODE_META.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ReactFlow canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
          >
            <Background color="#b1b2ff" gap={20} size={1} />
            <Controls
              className="!rounded-xl !border-slate-200 !shadow-sm"
            />
            <MiniMap
              nodeColor="#b1b2ff"
              maskColor="rgba(177,178,255,0.1)"
              className="!rounded-xl !border-slate-200"
            />
          </ReactFlow>
        </div>

        {/* Details panel */}
        {selectedNode && (
          <div className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Node Details
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6d6fd8] focus:ring-2 focus:ring-[#b1b2ff]/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Type
                </label>
                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  My Node
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Country
                </label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6d6fd8] focus:ring-2 focus:ring-[#b1b2ff]/30"
                  placeholder="e.g. United States"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveNode}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#6d6fd8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#5b5dc0]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    save
                  </span>
                  Save
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
