import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    border: 'border-success-200 dark:border-success-800',
    icon: 'text-success-600 dark:text-success-400',
    title: 'text-success-800 dark:text-success-200',
    message: 'text-success-700 dark:text-success-300',
  },
  error: {
    bg: 'bg-error-50 dark:bg-error-900/20',
    border: 'border-error-200 dark:border-error-800',
    icon: 'text-error-600 dark:text-error-400',
    title: 'text-error-800 dark:text-error-200',
    message: 'text-error-700 dark:text-error-300',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    border: 'border-warning-200 dark:border-warning-800',
    icon: 'text-warning-600 dark:text-warning-400',
    title: 'text-warning-800 dark:text-warning-200',
    message: 'text-warning-700 dark:text-warning-300',
  },
  info: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    border: 'border-primary-200 dark:border-primary-800',
    icon: 'text-primary-600 dark:text-primary-400',
    title: 'text-primary-800 dark:text-primary-200',
    message: 'text-primary-700 dark:text-primary-300',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type];
        const colors = colorMap[toast.type];

        return (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border shadow-lg
              animate-slide-in ${colors.bg} ${colors.border}
            `}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${colors.title}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`text-sm mt-1 ${colors.message}`}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${colors.icon}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function toastSuccess(title: string, message?: string) {
  const event = new CustomEvent('toast', {
    detail: { type: 'success', title, message }
  });
  window.dispatchEvent(event);
}
