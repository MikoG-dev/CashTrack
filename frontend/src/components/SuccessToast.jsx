import { useEffect, useState } from "react";

const SuccessToast = ({
  message = "Action completed successfully!",
  show,
  onClose,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade-out animation to finish before calling onClose
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded shadow-sm d-flex align-items-center animate__animated ${
        isVisible ? "animate__fadeInUp" : "animate__fadeOutDown"
      }`}
      style={{
        zIndex: 9999,
        minWidth: "280px",
        maxWidth: "400px",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease-out",
      }}
    >
      {/* Icon */}
      <i
        className="bi bi-check-circle-fill me-2"
        style={{ fontSize: "1.5rem" }}
      ></i>

      {/* Message */}
      <small className="fw-medium">{message}</small>
    </div>
  );
};

export default SuccessToast;
