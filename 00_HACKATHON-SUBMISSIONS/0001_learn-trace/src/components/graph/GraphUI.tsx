"use client";

import { RefObject } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import GraphUIComponents from "./GraphUIComponents";
import ShareButton from "../ShareButton";

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

interface GraphUIProps {
  loading: boolean;
  isTree: boolean;
  setIsTree: (value: boolean | ((prev: boolean) => boolean)) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  contextMenu: ContextMenu;
  setContextMenu: (value: ContextMenu) => void;
  noteModal: NoteModal;
  setNoteModal: (value: NoteModal) => void;
  noteViewer: NoteViewer;
  setNoteViewer: (value: NoteViewer) => void;
  resourceModal: ResourceModal;
  setResourceModal: (value: ResourceModal) => void;
  resourceViewer: ResourceViewer;
  setResourceViewer: (value: ResourceViewer) => void;
  handleExtendChat: (nodeId: string) => void;
  handleCreateNote: (nodeId: string) => void;
  handleCreateResource: (nodeId: string) => void;
  saveNote: () => Promise<void>;
  saveResource: () => Promise<void>;
  handleEditNote: () => void;
  handleDeleteNote: () => Promise<void>;
  handleEditResource: () => void;
  handleDeleteResource: () => Promise<void>;
  handleOpenResource: () => void;
  router: AppRouterInstance;
  chatId: string | null;
  chatData: { title: string; is_public: boolean } | null;
  onShareUpdate: (isPublic: boolean) => void;
}

export default function GraphUI({
  loading,
  isTree,
  setIsTree,
  containerRef,
  contextMenu,
  setContextMenu,
  noteModal,
  setNoteModal,
  noteViewer,
  setNoteViewer,
  resourceModal,
  setResourceModal,
  resourceViewer,
  setResourceViewer,
  handleExtendChat,
  handleCreateNote,
  handleCreateResource,
  saveNote,
  saveResource,
  handleEditNote,
  handleDeleteNote,
  handleEditResource,
  handleDeleteResource,
  handleOpenResource,
  router,
  chatId,
  chatData,
  onShareUpdate,
}: GraphUIProps) {
  return (
    <div className="flex-1 w-full h-full relative bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <span>←</span>
              <span>Back to Chat</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900">Knowledge Graph</h1>
            {chatData && (
              <p className="text-sm text-slate-500">{chatData.title}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Share Button */}
            {chatData && chatId && (
              <ShareButton
                chatId={chatId}
                isPublic={chatData.is_public}
                onShareUpdate={onShareUpdate}
              />
            )}
            
            {/* Tree/Graph Toggle */}
            <button
              onClick={() => setIsTree((prev) => !prev)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
            >
              {isTree ? "Graph Mode" : "Tree Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div className="pt-20 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading knowledge graph...</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>
      {/* UI Components (Modals, Context Menu, etc.) */}
      <GraphUIComponents
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
      />
    </div>
  );
}
