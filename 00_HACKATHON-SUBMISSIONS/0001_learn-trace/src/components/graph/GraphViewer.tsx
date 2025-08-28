"use client";

import { useEffect, useRef, useState } from "react";
//@ts-ignore
import { Network, DataSet } from "vis-network/standalone";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteNodeAndMessage } from "@/utils/deleteNode";
import GraphUI from "./GraphUI";
import ShareButton from "../ShareButton";

interface NetworkEventParams {
  nodes: string[];
  edges: string[];
  event: Event;
  pointer: {
    DOM: { x: number; y: number };
    canvas: { x: number; y: number };
  };
}

interface Note {
  id: string;
  node_id: string;
  content: string;
  created_at: string;
}

interface ExternalResource {
  id: string;
  node_id: string;
  title: string;
  resource_link: string;
  resource_type: string;
  created_at: string;
}

interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

interface NoteModal {
  show: boolean;
  nodeId: string | null;
  noteId?: string | null;
  content: string;
}

interface NoteViewer {
  show: boolean;
  noteId: string | null;
  title: string;
  content: string;
  createdAt: string;
}

interface ResourceModal {
  show: boolean;
  nodeId: string | null;
  resourceId?: string | null;
  title: string;
  resourceLink: string;
}

interface ResourceViewer {
  show: boolean;
  resourceId: string | null;
  title: string;
  resourceLink: string;
  resourceType: string;
  createdAt: string;
}

export default function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [resources, setResources] = useState<ExternalResource[]>([]);
  const [isTree, setIsTree] = useState(false);

  const testUserId = process.env.NEXT_PUBLIC_TEST_USER_ID;

  const [chatData, setChatData] = useState<{
    title: string;
    is_public: boolean;
  } | null>(null);

  // Modal and UI states
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    show: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  const [noteViewer, setNoteViewer] = useState<NoteViewer>({
    show: false,
    noteId: null,
    title: "",
    content: "",
    createdAt: "",
  });

  const [noteModal, setNoteModal] = useState<NoteModal>({
    show: false,
    nodeId: null,
    noteId: null,
    content: "",
  });

  const [resourceModal, setResourceModal] = useState<ResourceModal>({
    show: false,
    nodeId: null,
    resourceId: null,
    title: "",
    resourceLink: "",
  });

  const [resourceViewer, setResourceViewer] = useState<ResourceViewer>({
    show: false,
    resourceId: null,
    title: "",
    resourceLink: "",
    resourceType: "",
    createdAt: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  // Helper functions
  const detectResourceType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    if (url.includes("notion.so") || url.includes("notion.site"))
      return "notion";
    if (url.includes("github.com")) return "github";
    if (url.includes("docs.google.com")) return "google-docs";
    return "link";
  };

  const getResourceImageURI = (type: string) => {
    switch (type) {
      case "youtube":
        return "/assets/yt-icon.png";
      case "notion":
        return "/assets/notion-icon.png";
      case "github":
        return "/assets/github-icon.png";
      case "google-docs":
        return "/assets/docs-icon.png";
      default:
        return "L";
    }
  };

  // Data fetching
  useEffect(() => {
    if (!chatId) return;

    const fetchGraphData = async () => {
      setLoading(true);

      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from("nodes")
        .select("*")
        .eq("chat_id", chatId);

      if (nodesError) {
        console.error("Error fetching nodes:", nodesError);
        setLoading(false);
        return;
      }

      // Fetch edges
      const { data: edgesData, error: edgesError } = await supabase
        .from("edges")
        .select("*")
        .eq("chat_id", chatId);

      if (edgesError) {
        console.error("Error fetching edges:", edgesError);
        setLoading(false);
        return;
      }

      // Fetch notes and resources
      const nodeIds = nodesData?.map((node) => node.id) || [];
      let notesData: Note[] = [];
      let resourcesData: ExternalResource[] = [];

      if (nodeIds.length > 0) {
        // Fetch notes
        try {
          const { data: fetchedNotes, error: notesError } = await supabase
            .from("notes")
            .select("*")
            .in("node_id", nodeIds);

          if (!notesError && fetchedNotes) {
            notesData = fetchedNotes;
          }
        } catch (err) {
          console.log("Notes table not found, continuing without notes");
        }

        // Fetch external resources
        try {
          const { data: fetchedResources, error: resourcesError } =
            await supabase
              .from("external_resources")
              .select("*")
              .in("node_id", nodeIds);

          if (!resourcesError && fetchedResources) {
            resourcesData = fetchedResources;
          }
        } catch (err) {
          console.log(
            "External resources table not found, continuing without resources"
          );
        }
      }

      // Process nodes
      const parsedNodes = nodesData?.map((node: any) => ({
        id: String(node.id),
        label: node.summary ?? "[No title]",
        title: node.title,
        subtitle: node.title,
      }));

      // Create note nodes and edges
      const noteNodes: any[] = [];
      const noteEdges: any[] = [];

      notesData.forEach((note) => {
        const parentNode = parsedNodes.find(
          (n) => n.id === String(note.node_id)
        );
        if (parentNode) {
          const noteNodeId = `note_${note.id}`;

          noteNodes.push({
            id: noteNodeId,
            label:
              note.content.length > 15
                ? note.content.substring(0, 15) + "..."
                : note.content,
            title: `Note: ${note.content}`,
            color: {
              background: "#F59E0B",
              border: "#D97706",
              highlight: { background: "#FBBF24", border: "#F59E0B" },
              hover: { background: "#FCD34D", border: "#F59E0B" },
            },
            font: {
              color: "#0f0000ff",
              size: 14,
              align: "bottom",
              vadjust: 20,
            },
            shape: "dot",
            size: 14,
            borderWidth: 2,
            shadow: {
              enabled: true,
              color: "rgba(245, 158, 11, 0.3)",
              size: 10,
              x: 0,
              y: 4,
            },
            noteData: {
              id: note.id,
              content: note.content,
              created_at: note.created_at,
            },
          });

          noteEdges.push({
            from: String(note.node_id),
            to: noteNodeId,
            color: { color: "#F59E0B", opacity: 0.8 },
            dashes: [5, 5],
            width: 1,
            arrows: { to: false },
            physics: false,
          });
        }
      });

      // Create resource nodes and edges
      const resourceNodes: any[] = [];
      const resourceEdges: any[] = [];

      resourcesData.forEach((resource) => {
        const parentNode = parsedNodes.find(
          (n) => n.id === String(resource.node_id)
        );
        if (parentNode) {
          const resourceNodeId = `resource_${resource.id}`;
          const resourceType = detectResourceType(resource.resource_link);

          resourceNodes.push({
            id: resourceNodeId,
            label: "",
            title: `${resource.title}`,
            shape: "image",
            image: getResourceImageURI(resourceType),
            color: {
              background: "#10B981",
              border: "#059669",
              highlight: { background: "#34D399", border: "#10B981" },
              hover: { background: "#6EE7B7", border: "#10B981" },
            },
            size: 20,
            borderWidth: 2,
            shadow: {
              enabled: true,
              color: "rgba(16, 185, 129, 0.3)",
              size: 10,
              x: 0,
              y: 4,
            },
            resourceData: {
              id: resource.id,
              title: resource.title,
              resource_link: resource.resource_link,
              resource_type: resourceType,
              created_at: resource.created_at,
            },
          });

          resourceEdges.push({
            from: String(resource.node_id),
            to: resourceNodeId,
            color: { color: "#10B981", opacity: 0.8 },
            dashes: [5, 5],
            width: 1,
            arrows: { to: false },
            physics: false,
          });
        }
      });

      const parsedEdges = edgesData?.map((edge: any) => ({
        from: String(edge.from_node),
        to: String(edge.to_node),
        color: {
          color: "#8B5CF6",
          highlight: "#6D28D9",
          hover: "#A3BFFA",
          opacity: 0.8,
        },
      }));

      setNodes([...parsedNodes, ...noteNodes, ...resourceNodes]);
      setEdges([...parsedEdges, ...noteEdges, ...resourceEdges]);
      setNotes(notesData);
      setResources(resourcesData);
      setLoading(false);
    };

    fetchGraphData();
  }, [chatId]);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId || !testUserId) return;

      const { data, error } = await supabase
        .from("chats")
        .select("title, is_public")
        .eq("id", chatId)
        .eq("user_id", testUserId)
        .single();

      if (!error && data) {
        setChatData(data);
      }
    };

    fetchChatData();
  }, [chatId, testUserId]);

  // Event handlers
  const handleExtendChat = (nodeId: string) => {
    const clickedNode = nodes.find((n) => n.id === nodeId);
    if (
      clickedNode &&
      !nodeId.startsWith("note_") &&
      !nodeId.startsWith("resource_")
    ) {
      router.push(
        `/chat?chatId=${chatId}&parentId=${nodeId}&parentTitle=${encodeURIComponent(
          clickedNode.title
        )}`
      );
    }
  };

  const handleCreateNote = (nodeId: string) => {
    setNoteModal({ show: true, nodeId, noteId: null, content: "" });
  };

  const handleCreateResource = (nodeId: string) => {
    setResourceModal({
      show: true,
      nodeId,
      resourceId: null,
      title: "",
      resourceLink: "",
    });
  };

  const handleShareUpdate = (isPublic: boolean) => {
    if (chatData) {
      setChatData({ ...chatData, is_public: isPublic });
    }
  };

  const saveNote = async () => {
    if (!noteModal.content.trim()) return;

    if (noteModal.noteId) {
      const { error } = await supabase
        .from("notes")
        .update({ content: noteModal.content.trim() })
        .eq("id", noteModal.noteId);

      if (error) {
        console.error("Error updating note:", error);
        alert("Error updating note. Please try again.");
        return;
      }
    } else {
      if (!noteModal.nodeId) return;

      const { error } = await supabase
        .from("notes")
        .insert([
          { node_id: noteModal.nodeId, content: noteModal.content.trim() },
        ]);

      if (error) {
        console.error("Error saving note:", error);
        if (error.code === "PGRST205") {
          alert(
            "Notes table doesn't exist. Please create it in the Supabase dashboard first."
          );
        } else {
          alert("Error saving note. Please try again.");
        }
        return;
      }
    }

    setNoteModal({ show: false, nodeId: null, noteId: null, content: "" });
    window.location.reload();
  };

  const saveResource = async () => {
    if (!resourceModal.title.trim() || !resourceModal.resourceLink.trim())
      return;

    if (resourceModal.resourceId) {
      const { error } = await supabase
        .from("external_resources")
        .update({
          title: resourceModal.title.trim(),
          resource_link: resourceModal.resourceLink.trim(),
          resource_type: detectResourceType(resourceModal.resourceLink),
        })
        .eq("id", resourceModal.resourceId);

      if (error) {
        console.error("Error updating resource:", error);
        alert("Error updating resource. Please try again.");
        return;
      }
    } else {
      if (!resourceModal.nodeId) return;

      const { error } = await supabase.from("external_resources").insert([
        {
          node_id: resourceModal.nodeId,
          title: resourceModal.title.trim(),
          resource_link: resourceModal.resourceLink.trim(),
          resource_type: detectResourceType(resourceModal.resourceLink),
        },
      ]);

      if (error) {
        console.error("Error saving resource:", error);
        if (error.code === "PGRST205") {
          alert(
            "External resources table doesn't exist. Please create it in the Supabase dashboard first."
          );
        } else {
          alert("Error saving resource. Please try again.");
        }
        return;
      }
    }

    setResourceModal({
      show: false,
      nodeId: null,
      resourceId: null,
      title: "",
      resourceLink: "",
    });
    window.location.reload();
  };

  const handleEditNote = () => {
    if (noteViewer.noteId) {
      setNoteModal({
        show: true,
        nodeId: null,
        content: noteViewer.content,
        noteId: noteViewer.noteId,
      });
      setNoteViewer({
        show: false,
        noteId: null,
        title: "",
        content: "",
        createdAt: "",
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!noteViewer.noteId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteViewer.noteId);

    if (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note. Please try again.");
      return;
    }

    setNoteViewer({
      show: false,
      noteId: null,
      title: "",
      content: "",
      createdAt: "",
    });
    window.location.reload();
  };

  const handleEditResource = () => {
    if (resourceViewer.resourceId) {
      setResourceModal({
        show: true,
        nodeId: null,
        resourceId: resourceViewer.resourceId,
        title: resourceViewer.title,
        resourceLink: resourceViewer.resourceLink,
      });
      setResourceViewer({
        show: false,
        resourceId: null,
        title: "",
        resourceLink: "",
        resourceType: "",
        createdAt: "",
      });
    }
  };

  const handleDeleteResource = async () => {
    if (!resourceViewer.resourceId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("external_resources")
      .delete()
      .eq("id", resourceViewer.resourceId);

    if (error) {
      console.error("Error deleting resource:", error);
      alert("Error deleting resource. Please try again.");
      return;
    }

    setResourceViewer({
      show: false,
      resourceId: null,
      title: "",
      resourceLink: "",
      resourceType: "",
      createdAt: "",
    });
    window.location.reload();
  };

  const handleOpenResource = () => {
    if (resourceViewer.resourceLink) {
      window.open(resourceViewer.resourceLink, "_blank");
    }
  };

  // Network initialization
  useEffect(() => {
    if (!loading && containerRef.current && nodes.length > 0) {
      const visNodes = new DataSet(nodes);
      const visEdges = new DataSet(edges);

      const network = new Network(
        containerRef.current,
        { nodes: visNodes, edges: visEdges },
        {
          layout: {
            improvedLayout: true,
            hierarchical: isTree
              ? { enabled: true, direction: "UD", sortMethod: "directed" }
              : false,
          },
          interaction: {
            zoomView: true,
            dragView: true,
            dragNodes: true,
            keyboard: false,
            multiselect: false,
            hover: true,
            navigationButtons: false,
          },
          physics: isTree
            ? false
            : {
                enabled: true,
                stabilization: { iterations: 200 },
                solver: "forceAtlas2Based",
                forceAtlas2Based: {
                  gravitationalConstant: -50,
                  centralGravity: 0.01,
                  springLength: 350,
                  springConstant: 0.005,
                },
              },
          manipulation: { enabled: false },
          nodes: {
            shape: "dot",
            size: 14,
            font: {
              color: "#0f0000ff",
              size: 14,
              align: "bottom",
              vadjust: 20,
            },
            borderWidth: 2,
            color: {
              background: "#4F46E5",
              border: "#3730A3",
              highlight: { background: "#8B5CF6", border: "#6D28D9" },
              hover: { background: "#A3BFFA", border: "#4F46E5" },
            },
            shadow: {
              enabled: true,
              color: "rgba(79, 70, 229, 0.3)",
              size: 10,
              x: 0,
              y: 4,
            },
          },
          edges: {
            smooth: false,
            color: {
              color: "#8B5CF6",
              highlight: "#6D28D9",
              hover: "#A3BFFA",
              inherit: false,
              opacity: 0.8,
            },
            width: 2,
            arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.6 } },
          },
        }
      );

      networkRef.current = network;

      // Network event handlers
      network.on("click", (params: NetworkEventParams) => {
        setContextMenu({ show: false, x: 0, y: 0, nodeId: null });

        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];

          // Handle note node clicks
          if (clickedNodeId.startsWith("note_")) {
            const noteNode = nodes.find((n) => n.id === clickedNodeId);
            if (noteNode && noteNode.noteData) {
              setNoteViewer({
                show: true,
                noteId: noteNode.noteData.id,
                title:
                  noteNode.noteData.content.length > 30
                    ? noteNode.noteData.content.substring(0, 30) + "..."
                    : noteNode.noteData.content,
                content: noteNode.noteData.content,
                createdAt: new Date(
                  noteNode.noteData.created_at
                ).toLocaleDateString(),
              });
            }
            return;
          }

          // Handle resource node clicks
          if (clickedNodeId.startsWith("resource_")) {
            const resourceNode = nodes.find((n) => n.id === clickedNodeId);
            if (resourceNode && resourceNode.resourceData) {
              setResourceViewer({
                show: true,
                resourceId: resourceNode.resourceData.id,
                title: resourceNode.resourceData.title,
                resourceLink: resourceNode.resourceData.resource_link,
                resourceType: resourceNode.resourceData.resource_type,
                createdAt: new Date(
                  resourceNode.resourceData.created_at
                ).toLocaleDateString(),
              });
            }
            return;
          }

          // Handle regular node clicks - show context menu
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (!containerRect) return;

          const x = params.pointer.DOM.x + containerRect.left;
          const y = params.pointer.DOM.y + containerRect.top;

          setTimeout(() => {
            setContextMenu({ show: true, x: x, y: y, nodeId: clickedNodeId });
          }, 10);
        }
      });

      network.on("oncontext", async (params: NetworkEventParams) => {
        params.event.preventDefault();
        const pointer = network.getNodeAt(params.pointer.DOM);
        if (
          pointer &&
          !pointer.toString().startsWith("note_") &&
          !pointer.toString().startsWith("resource_")
        ) {
          const nodeId = pointer;
          const confirmDelete = window.confirm(
            "Delete this node and its message?"
          );
          if (confirmDelete) {
            const err = await deleteNodeAndMessage(nodeId.toString());
            if (!err) {
              setNodes((prev) => prev.filter((n) => n.id !== nodeId));
              setEdges((prev) =>
                prev.filter((e) => e.from !== nodeId && e.to !== nodeId)
              );
            } else {
              alert("Error deleting node. See console for details.");
            }
          }
        }
      });

      return () => {
        network?.destroy();
        networkRef.current = null;
      };
    }
  }, [loading, nodes, edges, chatId, router, isTree]);

  return (
    <GraphUI
      loading={loading}
      isTree={isTree}
      setIsTree={setIsTree}
      containerRef={containerRef}
      contextMenu={contextMenu}
      setContextMenu={setContextMenu}
      noteModal={noteModal}
      setNoteModal={setNoteModal}
      noteViewer={noteViewer}
      setNoteViewer={setNoteViewer}
      resourceModal={resourceModal}
      setResourceModal={setResourceModal}
      resourceViewer={resourceViewer}
      setResourceViewer={setResourceViewer}
      handleExtendChat={handleExtendChat}
      handleCreateNote={handleCreateNote}
      handleCreateResource={handleCreateResource}
      saveNote={saveNote}
      saveResource={saveResource}
      handleEditNote={handleEditNote}
      handleDeleteNote={handleDeleteNote}
      handleEditResource={handleEditResource}
      handleDeleteResource={handleDeleteResource}
      handleOpenResource={handleOpenResource}
      router={router}
      chatId={chatId}
      chatData={chatData}
      onShareUpdate={handleShareUpdate}
    />
  );
}
