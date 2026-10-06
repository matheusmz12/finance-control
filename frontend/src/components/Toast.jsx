import "../styles/feedback.css";

// Aviso rápido no canto da tela ("Transação excluída"). Some sozinho (ver useToast).
function Toast({ toast }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast ${toast.error ? "is-error" : ""}`}>
          <i className={toast.error ? "bi bi-exclamation-circle" : "bi bi-check-circle"} aria-hidden="true"></i>
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default Toast;
