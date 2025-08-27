"use client";

import { useEffect, useRef, useState } from "react";
import { Network, DataSet } from "vis-network/standalone";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteNodeAndMessage } from "@/utils/deleteNode";
import GraphUIComponents from "./GraphUIComponents";

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

export default function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
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

  const [isTree, setIsTree] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

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

      // Fetch notes (if notes table exists)
      const nodeIds = nodesData?.map((node) => node.id) || [];
      let notesData: Note[] = [];

      if (nodeIds.length > 0) {
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
      }

      const parsedNodes = nodesData?.map((node: any) => ({
        id: String(node.id),
        label: node.title ?? "[No title]",
        title: node.title,
        subtitle: node.title,
      }));

      // Create note nodes and edges
      const noteNodes: any[] = [];
      const noteEdges: any[] = [];

      notesData.forEach((note, index) => {
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
              highlight: {
                background: "#FBBF24",
                border: "#F59E0B",
              },
              hover: {
                background: "#FCD34D",
                border: "#F59E0B",
              },
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
            color: {
              color: "#F59E0B",
              opacity: 0.8,
            },
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

      setNodes([...parsedNodes, ...noteNodes]);
      setEdges([...parsedEdges, ...noteEdges]);
      setNotes(notesData);
      setLoading(false);
    };

    fetchGraphData();
  }, [chatId]);

  const handleExtendChat = (nodeId: string) => {
    const clickedNode = nodes.find((n) => n.id === nodeId);
    if (clickedNode && !nodeId.startsWith("note_")) {
      router.push(
        `/chat?chatId=${chatId}&parentId=${nodeId}&parentTitle=${encodeURIComponent(
          clickedNode.title
        )}`
      );
    }
  };

  const handleCreateNote = (nodeId: string) => {
    setNoteModal({
      show: true,
      nodeId,
      noteId: null,
      content: "",
    });
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

      const { error } = await supabase.from("notes").insert([
        {
          node_id: noteModal.nodeId,
          content: noteModal.content.trim(),
        },
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
              ? {
                  enabled: true,
                  direction: "UD",
                  sortMethod: "directed",
                }
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
              highlight: {
                background: "#8B5CF6",
                border: "#6D28D9",
              },
              hover: {
                background: "#A3BFFA",
                border: "#4F46E5",
              },
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
            arrows: {
              to: {
                enabled: true,
                type: "arrow",
                scaleFactor: 0.6,
              },
            },
          },
        }
      );

      networkRef.current = network;

      network.on("click", (params: NetworkEventParams) => {
        setContextMenu({ show: false, x: 0, y: 0, nodeId: null });

        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];

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

          const containerRect = containerRef.current?.getBoundingClientRect();
          if (!containerRect) return;

          const x = params.pointer.DOM.x + containerRect.left;
          const y = params.pointer.DOM.y + containerRect.top;

          setTimeout(() => {
            setContextMenu({
              show: true,
              x: x,
              y: y,
              nodeId: clickedNodeId,
            });
          }, 10);
        }
      });

      network.on("oncontext", async (params: NetworkEventParams) => {
        params.event.preventDefault();
        const pointer = network.getNodeAt(params.pointer.DOM);
        if (pointer && !pointer.toString().startsWith("note_")) {
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
    <div className="flex-1 w-full h-full relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsTree((prev) => !prev)}
        className="absolute top-4 right-4 px-3 py-1 bg-[#4F46E5] text-white rounded hover:bg-[#A3BFFA] z-10 cursor-pointer"
      >
        {isTree ? "Graph Mode" : "Tree Mode"}
      </button>

      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-black rounded-lg shadow-soft transition cursor-pointer"
        >
          ← Back to Chat
        </button>
      </div>

      <GraphUIComponents
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        noteModal={noteModal}
        setNoteModal={setNoteModal}
        noteViewer={noteViewer}
        setNoteViewer={setNoteViewer}
        handleExtendChat={handleExtendChat}
        handleCreateNote={handleCreateNote}
        saveNote={saveNote}
        handleEditNote={handleEditNote}
        handleDeleteNote={handleDeleteNote}
      />

      {loading ? (
        <div className="p-4">Loading graph...</div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
}
