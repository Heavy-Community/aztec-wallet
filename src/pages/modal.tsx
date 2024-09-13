import React from "react";
import "./modal.css";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  body: string;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, title, body }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">{title}</div>
        <div className="modal-body">
          <p>{body}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
