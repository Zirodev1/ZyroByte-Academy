import React from "react";
import { toast } from "react-toastify";

const LessonForm = ({ 
  form, 
  editing, 
  loading,
  parentModule,
  parentSubModule,
  handleChange, 
  handleRichTextChange,
  handleSubmit, 
  resetForm 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{editing ? "Edit Lesson" : "Create New Lesson"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter lesson title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Order*
              </label>
              <input
                type="number"
                id="order"
                name="order"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lesson order (e.g. 1, 2, 3)"
                value={form.order}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Estimated completion time"
                value={form.duration}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (YouTube or Vimeo)
            </label>
            <input
              type="text"
              id="videoUrl"
              name="videoUrl"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Content*
            </label>
            {/* Simple text editor for now, can be replaced with a rich text editor */}
            <textarea
              id="content"
              name="content"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter lesson content..."
              value={form.content}
              onChange={handleChange}
              rows="10"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use markdown formatting for text styling.
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Publish lesson (make it visible to students)
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            {editing && (
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Saving..." : (editing ? "Update Lesson" : "Create Lesson")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LessonForm; 