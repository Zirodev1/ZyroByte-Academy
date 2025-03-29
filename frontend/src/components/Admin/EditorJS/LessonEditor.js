import React, { useEffect, useRef, useState } from 'react';
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

const LessonEditor = ({ initialData, onChange }) => {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Editor.js
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    let editor;
    try {
      editor = new EditorJS({
        holder: editorRef.current,
        tools: {
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
                 * Upload file to the server and return an uploaded image data
                 * @param {File} file - file selected from the device or pasted by drag-n-drop
                 * @return {Promise.<{success, file: {url}}>}
                 */
                uploadByFile: async (file) => {
                  try {
                    // Create a FormData instance
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    // Upload the image to your server
                    // Note: You'll need to implement an image upload endpoint on your backend
                    const response = await api.post('/uploads/images', formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    });
                    
                    return {
                      success: 1,
                      file: {
                        url: response.data.url,
                        // You can also add width, height, etc.
                      }
                    };
                  } catch (error) {
                    console.error('Image upload error:', error);
                    return {
                      success: 0,
                      message: 'Image upload failed'
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
                    // You might want to validate the URL on the server
                    const response = await api.post('/uploads/url', { url });
                    
                    return {
                      success: 1,
                      file: {
                        url: response.data.url,
                      }
                    };
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
              buttonContent: 'Select an image',
              types: 'image/*, .gif, .jpg, .jpeg, .png',
            }
          }
        },
        data: initialData || {},
        placeholder: 'Let\'s create an amazing lesson!',
        onChange: async () => {
          if (onChange) {
            try {
              const savedData = await editor.save();
              onChange(savedData);
            } catch (error) {
              console.error('Editor.js save error:', error);
            }
          }
        },
        onReady: () => {
          setIsReady(true);
        }
      });

      // Store the editor instance in the ref
      editorInstanceRef.current = editor;
    } catch (error) {
      console.error('Error initializing Editor.js:', error);
    }

    // Cleanup function
    return () => {
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        try {
          editorInstanceRef.current.destroy();
          editorInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying Editor.js instance:', error);
        }
      }
    };
  }, [initialData, onChange]);

  return (
    <div className="lesson-editor">
      <div className="lesson-editor-container">
        <div ref={editorRef} className="lesson-editor-content"></div>
        {!isReady && <div className="lesson-editor-loading">Loading editor...</div>}
      </div>
    </div>
  );
};

export default LessonEditor; 