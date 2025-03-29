import React, { useEffect, useRef, useState, memo } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import ImageTool from '@editorjs/image';
import api from '../../../services/api';
import './LessonEditor.css';

// Create a stable configuration object outside the component
const EDITOR_JS_TOOLS = {
  header: {
    class: Header,
    inlineToolbar: true,
    config: {
      placeholder: 'Enter a header',
      levels: [1, 2, 3, 4, 5, 6],
      defaultLevel: 2
    }
  },
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: 'unordered'
    }
  },
  checklist: {
    class: Checklist,
    inlineToolbar: true,
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
    config: {
      quotePlaceholder: 'Enter a quote',
      captionPlaceholder: 'Quote\'s author',
    },
  },
  code: {
    class: CodeTool,
    config: {
      placeholder: 'Enter code here...'
    }
  },
  embed: {
    class: Embed,
    inlineToolbar: true,
    config: {
      services: {
        youtube: true,
        vimeo: true,
      }
    }
  },
  table: {
    class: Table,
    inlineToolbar: true,
    config: {
      rows: 2,
      cols: 3,
    },
  },
  image: {
    class: ImageTool,
    config: {
      uploader: {
        /**
         * Upload file to Firebase via backend API
         * @param {File} file - file selected from the device or pasted by drag-n-drop
         * @return {Promise.<{success, file: {url}}>}
         */
        uploadByFile: async (file) => {
          try {
            console.log('Uploading file to Firebase:', file);
            // Create a FormData instance
            const formData = new FormData();
            formData.append('file', file);
            
            // Upload the image directly to Firebase via our upload endpoint
            const response = await api.post('/uploads/firebase', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log('Upload response:', response.data);
            
            // Check if the upload was successful
            if (response.data && response.data.success) {
              const fileUrl = response.data.data.fileUrl;
              console.log('File uploaded successfully, URL:', fileUrl);
              
              // Return the success response in the format EditorJS expects
              return {
                success: 1,
                file: {
                  url: fileUrl,
                  // Return additional metadata if needed
                  name: response.data.data.fileName || 'image',
                  size: response.data.data.fileSize || 0
                }
              };
            } else {
              console.error('File upload failed:', response.data);
              throw new Error(response.data?.message || 'Failed to upload image');
            }
          } catch (error) {
            console.error('Image upload error:', error);
            return {
              success: 0,
              message: error.message || 'Image upload failed'
            };
          }
        },
        
        /**
         * Upload image by URL
         * @param {string} url - pasted image URL
         * @return {Promise.<{success, file: {url}}>}
         */
        uploadByUrl: async (url) => {
          try {
            console.log('Uploading by URL:', url);
            // Validate the URL on the server
            const response = await api.post('/uploads/url', { url });
            console.log('URL upload response:', response.data);
            
            if (response.data && response.data.success) {
              return {
                success: 1,
                file: {
                  url: response.data.url,
                }
              };
            } else {
              return {
                success: 0,
                message: 'URL processing failed'
              };
            }
          } catch (error) {
            console.error('URL upload error:', error);
            return {
              success: 0,
              message: 'URL upload failed'
            };
          }
        }
      },
      // Additional config options
      captionPlaceholder: 'Add a caption to the image',
      buttonContent: 'Upload an image',
      types: 'image/*, .gif, .jpg, .jpeg, .png',
      field: 'file',
      actions: [{
        name: 'withBorder',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>',
        title: 'With border',
      }, {
        name: 'stretched',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>',
        title: 'Stretch image',
      }]
    }
  }
};

// Cache for editor instances to prevent creating multiple instances
const editorInstancesCache = new Map();

// Support both data and initialData for backward compatibility
const LessonEditor = memo(({ initialData, data, onChange }) => {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const editorInstance = useRef(null);
  const changeTimeoutRef = useRef(null);
  const uniqueId = useRef(`editor-${Math.random().toString(36).substring(2, 9)}`);
  
  // Determine which data prop to use
  const editorData = initialData || data || { blocks: [] };
  
  // Initialize editor once when component mounts
  useEffect(() => {
    if (!editorRef.current || isInitialized) return;
    
    const initEditor = async () => {
      try {
        // Check if we already have an editor for this ref
        if (editorInstance.current) {
          console.log('Editor already initialized, skipping initialization');
          return;
        }
        
        console.log('Initializing EditorJS...');
        
        // Initialize Editor.js
        const editor = new EditorJS({
          holder: editorRef.current,
          tools: EDITOR_JS_TOOLS,
          data: editorData,
          autofocus: true,
          placeholder: 'Let\'s create an amazing lesson!',
          onChange: () => {
            // Clear any existing timeout
            if (changeTimeoutRef.current) {
              clearTimeout(changeTimeoutRef.current);
            }
            
            // Set a new timeout
            changeTimeoutRef.current = setTimeout(async () => {
              if (editor && onChange) {
                try {
                  const savedData = await editor.save();
                  onChange(savedData);
                } catch (error) {
                  console.error('Editor.js save error:', error);
                }
              }
            }, 2000); // 2 second debounce - longer to avoid conflicts while typing
          },
          onReady: () => {
            console.log('Editor.js is ready');
            setIsReady(true);
            setIsInitialized(true);
          }
        });
        
        // Store the editor instance
        editorInstance.current = editor;
        editorInstancesCache.set(uniqueId.current, editor);
        
      } catch (error) {
        console.error('Error initializing Editor.js:', error);
        setIsReady(true);
      }
    };
    
    // Initialize with a delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      initEditor();
    }, 200);
    
    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [editorData.blocks ? false : true]); // Only reinitialize if editorData changes from empty to having blocks
  
  // Cleanup editor when component unmounts
  useEffect(() => {
    return () => {
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy();
          editorInstancesCache.delete(uniqueId.current);
          console.log('Editor instance destroyed on unmount');
        } catch (error) {
          console.error('Error destroying Editor.js instance:', error);
        }
      }
    };
  }, []);
  
  return (
    <div className="lesson-editor">
      <div className="lesson-editor-container">
        <div 
          ref={editorRef} 
          className="lesson-editor-content"
          style={{ minHeight: '400px', width: '100%', outline: 'none' }}
          data-editor-id={uniqueId.current}
        ></div>
        {!isReady && (
          <div className="lesson-editor-loading">
            <span>Loading editor...</span>
          </div>
        )}
      </div>
    </div>
  );
});

LessonEditor.displayName = 'LessonEditor';

export default LessonEditor; 