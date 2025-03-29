import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, title, size = 'medium' }) => {
  useEffect(() => {
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function to unlock scroll when component unmounts or modal closes
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Create modal element in portal
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 