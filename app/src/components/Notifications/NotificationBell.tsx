import React, { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import clsx from 'clsx';

const NotificationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div className="absolute top-12 right-0 w-80 bg-[var(--table-bg)] text-[var(--fg)] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold">Notificaciones</h4>
        <button onClick={markAllAsRead} className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
          <CheckCheck size={14}/> Marcar todas como leídas
        </button>
      </div>
      <ul className="max-h-96 overflow-y-auto">
        {notifications.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No hay notificaciones</li>}
        {notifications.map((n: Notification) => (
          <li
            key={n.id}
            className={clsx('p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-[var(--bg-secondary)] cursor-pointer', { 'bg-blue-50 dark:bg-blue-900/20': !n.isRead })}
            onClick={() => markAsRead(n.id)}
          >
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="p-2 rounded-full hover:bg-vibePink/20 dark:hover:bg-vibePurple/20 transition relative"
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
    </div>
  );
}; 