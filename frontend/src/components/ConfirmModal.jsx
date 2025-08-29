import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirm"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message || "Are you sure?"}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          No
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
