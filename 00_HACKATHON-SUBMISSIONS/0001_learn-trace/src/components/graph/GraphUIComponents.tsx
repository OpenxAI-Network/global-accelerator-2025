import React from "react";

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

interface Props {
  contextMenu: ContextMenu;
  setContextMenu: (menu: ContextMenu) => void;
  noteModal: NoteModal;
  setNoteModal: (modal: NoteModal) => void;
  noteViewer: NoteViewer;
  setNoteViewer: (viewer: NoteViewer) => void;
  resourceModal: ResourceModal;
  setResourceModal: (modal: ResourceModal) => void;
  resourceViewer: ResourceViewer;
  setResourceViewer: (viewer: ResourceViewer) => void;
  handleExtendChat: (nodeId: string) => void;
  handleCreateNote: (nodeId: string) => void;
  handleCreateResource: (nodeId: string) => void;
  saveNote: () => void;
  saveResource: () => void;
  handleEditNote: () => void;
  handleDeleteNote: () => void;
  handleEditResource: () => void;
  handleDeleteResource: () => void;
  handleOpenResource: () => void;
}

export default function GraphUIComponents({
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
}: Props) {
  return (
    <>
      {/* Context Menu */}
      {contextMenu.show && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() =>
              setContextMenu({ show: false, x: 0, y: 0, nodeId: null })
            }
          />

          <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 200)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 140)}px`,
              minWidth: "180px",
            }}
          >
            <button
              onClick={() => {
                if (contextMenu.nodeId) {
                  handleExtendChat(contextMenu.nodeId);
                }
                setContextMenu({ show: false, x: 0, y: 0, nodeId: null });
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
            >
              <span>💬</span>
              Extend Chat
            </button>
            <button
              onClick={() => {
                if (contextMenu.nodeId) {
                  handleCreateNote(contextMenu.nodeId);
                }
                setContextMenu({ show: false, x: 0, y: 0, nodeId: null });
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
            >
              <span>📝</span>
              Create Note
            </button>
            <button
              onClick={() => {
                if (contextMenu.nodeId) {
                  handleCreateResource(contextMenu.nodeId);
                }
                setContextMenu({ show: false, x: 0, y: 0, nodeId: null });
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm flex items-center gap-2"
            >
              <span>🔗</span>
              Add External Resource
            </button>
          </div>
        </>
      )}

      {/* Note Modal */}
      {noteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {noteModal.noteId ? "Edit Note" : "Create Note"}
            </h3>
            <textarea
              value={noteModal.content}
              onChange={(e) =>
                setNoteModal({
                  ...noteModal,
                  content: e.target.value
                })
              }
              placeholder="Enter your note..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-gray-900"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() =>
                  setNoteModal({
                    show: false,
                    nodeId: null,
                    noteId: null,
                    content: "",
                  })
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                disabled={!noteModal.content.trim()}
                className="px-4 py-2 bg-[#F59E0B] text-white rounded hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {noteModal.noteId ? "Update Note" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {resourceModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {resourceModal.resourceId ? "Edit Resource" : "Add External Resource"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={resourceModal.title}
                  onChange={(e) =>
                    setResourceModal({
                      ...resourceModal,
                      title: e.target.value
                    })
                  }
                  placeholder="Enter resource title..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Link
                </label>
                <input
                  type="url"
                  value={resourceModal.resourceLink}
                  onChange={(e) =>
                    setResourceModal({
                      ...resourceModal,
                      resourceLink: e.target.value
                    })
                  }
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() =>
                  setResourceModal({
                    show: false,
                    nodeId: null,
                    resourceId: null,
                    title: "",
                    resourceLink: "",
                  })
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveResource}
                disabled={!resourceModal.title.trim() || !resourceModal.resourceLink.trim()}
                className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resourceModal.resourceId ? "Update Resource" : "Save Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Viewer Modal */}
      {noteViewer.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw max-h-80vh overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                {noteViewer.title}
              </h3>
              <button
                onClick={() =>
                  setNoteViewer({
                    show: false,
                    noteId: null,
                    title: "",
                    content: "",
                    createdAt: "",
                  })
                }
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Created: {noteViewer.createdAt}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">{noteViewer.content}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteNote}
                className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleEditNote}
                className="px-4 py-2 bg-[#F59E0B] text-white rounded hover:bg-[#D97706] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Viewer Modal */}
      {resourceViewer.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                {resourceViewer.title}
              </h3>
              <button
                onClick={() =>
                  setResourceViewer({
                    show: false,
                    resourceId: null,
                    title: "",
                    resourceLink: "",
                    resourceType: "",
                    createdAt: "",
                  })
                }
                className="text-black-900 hover:text-gray-600 text-xl leading-none"
              >
                x
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Created: {resourceViewer.createdAt}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 break-all">{resourceViewer.resourceLink}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteResource}
                className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleEditResource}
                className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#059669] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleOpenResource}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Open Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}