import React, { useMemo } from 'react';
import './LessonRenderer.css';

// Function to convert EditorJS data to HTML
const processEditorJSData = (data) => {
  if (!data || !data.blocks) {
    return '<p>No content available</p>';
  }

  return data.blocks.map((block) => {
    switch (block.type) {
      case 'header':
        const level = block.data.level;
        return `<h${level} class="lesson-header lesson-header-${level}">${block.data.text}</h${level}>`;
      
      case 'paragraph':
        return `<p class="lesson-paragraph">${block.data.text}</p>`;
      
      case 'list':
        const listItems = block.data.items.map(item => `<li>${item}</li>`).join('');
        return block.data.style === 'ordered' 
          ? `<ol class="lesson-list lesson-list-ordered">${listItems}</ol>`
          : `<ul class="lesson-list lesson-list-unordered">${listItems}</ul>`;
      
      case 'checklist':
        const checklistItems = block.data.items.map(item => 
          `<div class="lesson-checklist-item">
             <input type="checkbox" ${item.checked ? 'checked' : ''} disabled />
             <span>${item.text}</span>
           </div>`
        ).join('');
        return `<div class="lesson-checklist">${checklistItems}</div>`;
      
      case 'quote':
        return `<blockquote class="lesson-quote">
                  <p>${block.data.text}</p>
                  ${block.data.caption ? `<cite>${block.data.caption}</cite>` : ''}
                </blockquote>`;
      
      case 'code':
        return `<pre class="lesson-code"><code>${block.data.code}</code></pre>`;
      
      case 'embed':
        return `<div class="lesson-embed">
                  <iframe 
                    src="${block.data.embed}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                  ></iframe>
                  ${block.data.caption ? `<p class="lesson-embed-caption">${block.data.caption}</p>` : ''}
                </div>`;
      
      case 'table':
        const tableRows = block.data.content.map(row => {
          const cells = row.map(cell => `<td>${cell}</td>`).join('');
          return `<tr>${cells}</tr>`;
        }).join('');
        return `<table class="lesson-table"><tbody>${tableRows}</tbody></table>`;
      
      case 'image':
        let imageUrl = block.data.file ? block.data.file.url : '';
        // Handle relative URLs
        if (imageUrl && imageUrl.startsWith('/')) {
          // Assuming API endpoint is at same domain or properly CORS configured
          imageUrl = `${process.env.REACT_APP_API_URL || ''}${imageUrl}`;
        }
        
        return `<figure class="lesson-image">
                  <img src="${imageUrl}" alt="${block.data.caption || 'Image'}" />
                  ${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}
                </figure>`;
      
      default:
        return `<div class="lesson-unknown-block">Unsupported block type: ${block.type}</div>`;
    }
  }).join('');
};

const LessonRenderer = ({ content }) => {
  // Try to parse the content as JSON if it's a string
  const editorData = useMemo(() => {
    if (!content) return { blocks: [] };
    
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (e) {
        // If it's not valid JSON, create a simple text block
        return {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: content
              }
            }
          ]
        };
      }
    }
    
    // If it's already an object, use it directly
    return content;
  }, [content]);

  // Generate HTML from the EditorJS data
  const html = useMemo(() => {
    return processEditorJSData(editorData);
  }, [editorData]);

  return (
    <div 
      className="lesson-content-renderer"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default LessonRenderer; 