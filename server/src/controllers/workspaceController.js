const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const Workspace = require("../models/Workspace");
const { Node } = require("../models/Node");
const Edge = require("../models/Edge");

// ── Existing CRUD ───────────────────────────────────────────────────────────

const listWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({}).sort({ updatedAt: -1 }).lean();

  const results = await Promise.all(
    workspaces.map(async (ws) => {
      const [nodeCount, edgeCount] = await Promise.all([
        Node.countDocuments({ workspace: ws._id }),
        Edge.countDocuments({ workspace: ws._id }),
      ]);
      return { ...ws, nodeCount, edgeCount };
    })
  );

  res.status(StatusCodes.OK).json({ success: true, workspaces: results });
};

const getWorkspace = async (req, res) => {
  const ws = await Workspace.findById(req.params.id).lean();

  if (!ws) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Workspace not found" });
  }

  const [nodeCount, edgeCount] = await Promise.all([
    Node.countDocuments({ workspace: ws._id }),
    Edge.countDocuments({ workspace: ws._id }),
  ]);

  res
    .status(StatusCodes.OK)
    .json({ success: true, workspace: { ...ws, nodeCount, edgeCount } });
};

const createWorkspace = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "name is required" });
  }

  const ws = await Workspace.create({
    name: name.trim(),
    description: description?.trim() || "",
    owner: req.user?.id || null,
  });

  res.status(StatusCodes.CREATED).json({ success: true, workspace: ws });
};

const updateWorkspace = async (req, res) => {
  const { name, description } = req.body;

  const ws = await Workspace.findByIdAndUpdate(
    req.params.id,
    { ...(name && { name: name.trim() }), ...(description !== undefined && { description: description.trim() }) },
    { new: true, runValidators: true }
  );

  if (!ws) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Workspace not found" });
  }

  res.status(StatusCodes.OK).json({ success: true, workspace: ws });
};

const deleteWorkspace = async (req, res) => {
  const ws = await Workspace.findByIdAndDelete(req.params.id);

  if (!ws) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Workspace not found" });
  }

  await Promise.all([
    Node.deleteMany({ workspace: ws._id }),
    Edge.deleteMany({ workspace: ws._id }),
  ]);

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: `Workspace "${ws.name}" deleted` });
};

// ── Supplier: list my workspaces ────────────────────────────────────────────

const listMyWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({ owner: req.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  const results = await Promise.all(
    workspaces.map(async (ws) => {
      const [nodeCount, edgeCount] = await Promise.all([
        Node.countDocuments({ workspace: ws._id }),
        Edge.countDocuments({ workspace: ws._id }),
      ]);
      return { ...ws, nodeCount, edgeCount };
    })
  );

  res.status(StatusCodes.OK).json({ success: true, workspaces: results });
};

// ── Publishing ──────────────────────────────────────────────────────────────

const publishWorkspace = async (req, res) => {
  const { publisherName, tags, description } = req.body;

  const ws = await Workspace.findById(req.params.id);
  if (!ws) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Workspace not found" });
  }

  if (ws.owner && ws.owner.toString() !== req.user.id) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ success: false, message: "Not authorized to publish this workspace" });
  }

  ws.isPublished = true;
  if (typeof publisherName === "string") {
    ws.publisherName = publisherName.trim();
  }
  if (typeof description === "string") {
    ws.description = description.trim();
  }
  ws.publishedAt = new Date();
  if (Array.isArray(tags)) {
    ws.tags = [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
  }
  await ws.save();

  res.status(StatusCodes.OK).json({ success: true, workspace: ws });
};

const unpublishWorkspace = async (req, res) => {
  const ws = await Workspace.findById(req.params.id);
  if (!ws) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Workspace not found" });
  }

  if (ws.owner && ws.owner.toString() !== req.user.id) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ success: false, message: "Not authorized" });
  }

  ws.isPublished = false;
  ws.publishedAt = null;
  await ws.save();

  res.status(StatusCodes.OK).json({ success: true, workspace: ws });
};

// ── Import ──────────────────────────────────────────────────────────────────

const syncWorkspaceCounts = async (workspaceId) => {
  if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) return;
  const [nodeCount, edgeCount] = await Promise.all([
    Node.countDocuments({ workspace: workspaceId }),
    Edge.countDocuments({ workspace: workspaceId }),
  ]);
  await Workspace.findByIdAndUpdate(workspaceId, { nodeCount, edgeCount });
};

const importChain = async (req, res) => {
  const targetWsId = req.params.id;
  const { sourceWorkspaceId, anchorNodeId, entryNodeId } = req.body;

  if (!sourceWorkspaceId || !anchorNodeId || !entryNodeId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: "sourceWorkspaceId, anchorNodeId, and entryNodeId are required" });
  }

  const [targetWs, sourceWs] = await Promise.all([
    Workspace.findById(targetWsId),
    Workspace.findById(sourceWorkspaceId),
  ]);

  if (!targetWs) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Target workspace not found" });
  }
  if (!sourceWs || !sourceWs.isPublished) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Source workspace not found or not published" });
  }

  const [anchorNode, entryNode] = await Promise.all([
    Node.findOne({ id: anchorNodeId, workspace: targetWsId }),
    Node.findOne({ id: entryNodeId, workspace: sourceWorkspaceId }),
  ]);

  if (!anchorNode) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Anchor node not found in target workspace" });
  }
  if (!entryNode) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Entry node not found in source workspace" });
  }

  const [sourceNodes, sourceEdges] = await Promise.all([
    Node.find({ workspace: sourceWorkspaceId }).lean(),
    Edge.find({ workspace: sourceWorkspaceId }).lean(),
  ]);

  // Generate ID mapping
  const shortSrc = sourceWorkspaceId.toString().slice(-6);
  const ts = Date.now();
  const idMap = {};
  for (const sn of sourceNodes) {
    idMap[sn.id] = `imp_${shortSrc}_${sn.id}_${ts}`;
  }

  // Calculate position offset
  const existingNodes = await Node.find({ workspace: targetWsId }).lean();
  let offsetX = 400;
  let offsetY = 0;
  if (existingNodes.length > 0 && sourceNodes.length > 0) {
    const maxX = Math.max(...existingNodes.map((n) => n.position?.x || 0));
    const existingCenterY =
      existingNodes.reduce((sum, n) => sum + (n.position?.y || 0), 0) / existingNodes.length;
    const sourceCenterY =
      sourceNodes.reduce((sum, n) => sum + (n.position?.y || 0), 0) / sourceNodes.length;
    const sourceMinX = Math.min(...sourceNodes.map((n) => n.position?.x || 0));
    offsetX = maxX + 400 - sourceMinX;
    offsetY = existingCenterY - sourceCenterY;
  }

  // Clone nodes
  const clonedNodes = sourceNodes.map((sn) => {
    const { _id, __v, createdAt, updatedAt, ...rest } = sn;
    return {
      ...rest,
      id: idMap[sn.id],
      workspace: targetWsId,
      position: {
        x: (sn.position?.x || 0) + offsetX,
        y: (sn.position?.y || 0) + offsetY,
      },
      imported: true,
      sourceWorkspace: sourceWorkspaceId,
      originalNodeId: sn.id,
    };
  });

  // Clone edges
  const clonedEdges = sourceEdges.map((se) => {
    const { _id, __v, createdAt, updatedAt, ...rest } = se;
    return {
      ...rest,
      edge_id: `imp_edge_${shortSrc}_${se.edge_id}_${ts}`,
      workspace: targetWsId,
      source_node: idMap[se.source_node],
      target_node: idMap[se.target_node],
      imported: true,
      originalEdgeId: se.edge_id,
    };
  });

  // Bridge edge connecting anchor → imported entry
  const bridgeEdge = {
    edge_id: `bridge_${ts}_${Math.floor(Math.random() * 10000)}`,
    workspace: targetWsId,
    source_node: anchorNodeId,
    target_node: idMap[entryNodeId],
    material: "Imported supply link",
    lead_time: 0,
    dependency_percent: 50,
    transport_mode: "",
    risk_score: 0,
    imported: false,
  };

  await Node.insertMany(clonedNodes, { ordered: false });
  await Edge.insertMany([...clonedEdges, bridgeEdge], { ordered: false });

  await Promise.all([
    Workspace.findByIdAndUpdate(sourceWorkspaceId, { $inc: { importCount: 1 } }),
    syncWorkspaceCounts(targetWsId),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    importedNodeCount: clonedNodes.length,
    importedEdgeCount: clonedEdges.length + 1,
    bridgeEdgeId: bridgeEdge.edge_id,
  });
};

module.exports = {
  listWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMyWorkspaces,
  publishWorkspace,
  unpublishWorkspace,
  importChain,
};
