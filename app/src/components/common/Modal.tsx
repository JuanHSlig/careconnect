import React from 'react';
import clsx from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

function useIsDarkMode() {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setIsDark(document.documentElement.classList.contains('dark') || mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDark;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, actions }) => {
  const isDark = useIsDarkMode();
  const titleColor = isDark ? 'var(--accent)' : 'var(--primary)';
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[var(--main-bg)] text-[var(--fg)] rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-modalIn border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold" style={{ color: titleColor }}>{title}</div>
          <button
            className="text-gray-400 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {actions && <div className="flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
};

// Animaciones Tailwind personalizadas (agregar en tailwind.config.js):
// fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
// modalIn: { '0%': { transform: 'scale(0.95)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } } 