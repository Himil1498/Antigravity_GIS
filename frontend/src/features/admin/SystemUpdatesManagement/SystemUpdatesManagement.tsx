import React, { useState, useEffect } from 'react';
import { updatesApi, SystemUpdate } from '../../../services/api/systemUpdatesApiService';
import { useAppDispatch } from '../../../store';
import { addNotification } from '../../../store/slices/ui';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const SystemUpdatesManagement: React.FC = () => {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation Dialog States
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [publishDialog, setPublishDialog] = useState<{ open: boolean; update: SystemUpdate | null }>({ open: false, update: null });
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'feature',
    version_tag: '',
    is_published: false
  });

  const dispatch = useAppDispatch();

  const notify = (message: string, type: 'success' | 'error') => {
    const title = type === 'success' ? 'Success' : 'Error';
    dispatch(addNotification({ type, title, message }));
  };

  useEffect(() => {
    document.title = 'Manage System Updates | OptiConnect GIS';
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const res = await updatesApi.getAllUpdatesAdmin();
      setUpdates(res.data || []);
    } catch (error) {
      notify('Failed to load system updates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (update?: SystemUpdate) => {
    if (update) {
      setEditingId(update.id);
      setFormData({
        title: update.title,
        content: update.content,
        type: update.type,
        version_tag: update.version_tag || '',
        is_published: update.is_published
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        type: 'feature',
        version_tag: '',
        is_published: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatesApi.updateSystemUpdate(editingId, formData);
        notify(formData.is_published ? 'Update published successfully' : 'Update saved as draft', 'success');
      } else {
        await updatesApi.createUpdate(formData);
        notify(formData.is_published ? 'Update published successfully' : 'Draft created', 'success');
      }
      setIsModalOpen(false);
      fetchUpdates();
    } catch (error) {
      notify('Error saving update', 'error');
    }
  };

  const handlePublishClick = (update: SystemUpdate) => {
    setPublishDialog({ open: true, update });
  };

  const confirmPublish = async () => {
    if (!publishDialog.update) return;
    const update = publishDialog.update;
    try {
      await updatesApi.updateSystemUpdate(update.id, {
        title: update.title,
        content: update.content,
        type: update.type,
        version_tag: update.version_tag,
        is_published: true
      });
      notify('Update published successfully', 'success');
      fetchUpdates();
    } catch (error) {
      notify('Failed to publish update', 'error');
    } finally {
      setPublishDialog({ open: false, update: null });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await updatesApi.deleteUpdate(deleteDialog.id);
      notify('Update deleted', 'success');
      fetchUpdates();
    } catch (error) {
      notify('Failed to delete update', 'error');
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'bugfix': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'maintenance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'announcement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'auto-release': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 dark:from-pink-400 dark:to-pink-600 bg-clip-text text-transparent">System Updates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage release notes, announcements, and system alerts.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Draft
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title & Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {updates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No system updates found.
                  </td>
                </tr>
              ) : (
                updates.map((update) => (
                  <tr key={update.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {update.is_automated && <span title="Automated Release">🤖</span>}
                        {update.title}
                      </div>
                      {update.version_tag && (
                        <div className="text-xs text-gray-500 font-mono mt-1">{update.version_tag}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBadgeColor(update.type)}`}>
                        {update.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {update.is_published ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(update.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!update.is_published && (
                        <button
                          onClick={() => handlePublishClick(update)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(update)}
                        className="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(update.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700 slide-up">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit System Update' : 'New System Update'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="update-form" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. Platform Version 1.2 Released"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="feature">Feature</option>
                      <option value="bugfix">Bug Fix</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version Tag (Optional)</label>
                    <input
                      type="text"
                      value={formData.version_tag}
                      onChange={(e) => setFormData({...formData, version_tag: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:text-white font-mono"
                      placeholder="e.g. v1.2.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (Markdown Supported)</label>
                  <textarea
                    required
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="- Added new IPAM features&#10;- Fixed bugs in map rendering"
                  ></textarea>
                </div>

                <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/50">
                  <input
                    id="publish-checkbox"
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="publish-checkbox" className="ml-2 block text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                    <span className="font-semibold block">Publish Immediately</span>
                    <span className="text-xs opacity-80">Check this to push a real-time notification to all users across the platform.</span>
                  </label>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="update-form"
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors shadow-sm font-medium text-sm"
              >
                {formData.is_published ? 'Publish Update' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete System Update"
        message="Are you sure you want to delete this update? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <ConfirmDialog
        isOpen={publishDialog.open}
        onClose={() => setPublishDialog({ open: false, update: null })}
        onConfirm={confirmPublish}
        title="Publish System Update"
        message={`Are you sure you want to publish "${publishDialog.update?.title}"? This will send a platform-wide notification to all users.`}
        confirmText="Publish Now"
        type="success"
      />
    </div>
  );
};

export default SystemUpdatesManagement;
