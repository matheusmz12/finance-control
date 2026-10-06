import { useEffect, useRef } from "react";
import "../styles/feedback.css";

/*
  Janela de confirmação no estilo do app (substitui o window.confirm).
  Fecha com Esc, com "Cancelar" ou clicando fora. O foco começa no "Cancelar",
  para um Enter sem querer não apagar nada.
*/
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    function handleKey(event) {
      if (event.key === "Escape" && !loading) onCancel();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className={`confirm-icon ${danger ? "is-danger" : ""}`} aria-hidden="true">
          <i className={danger ? "bi bi-trash3" : "bi bi-question-lg"}></i>
        </div>

        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>

        <div className="confirm-buttons">
          <button type="button" className="btn-secondary" ref={cancelRef} disabled={loading} onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className={danger ? "btn-danger" : "btn-primary"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Aguarde…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
