import { Outlet } from "react-router-dom";

export default function Modal({ children, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {children}
        <button onClick={onClose} style={closeButtonStyle}>X</button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: "#494949ff",
  padding: "20px",
  borderRadius: "8px",
  position: "relative",
  minWidth: "300px",
  height: "60vh",
  width: "100vh",
  maxHeight: "70vh",
  overflowY: "auto",
  paddingRight: "10px"
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  cursor: "pointer"
};
