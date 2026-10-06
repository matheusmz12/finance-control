import { useCallback, useEffect, useRef, useState } from "react";

// Controla o <Toast>: showToast("Mensagem") ou showToast("Erro", true). Some após 3s.
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((text, error = false) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text, error });
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [toast, showToast];
}
