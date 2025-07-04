import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { MessageCircle } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const { clients, conversations } = useAppContext();
  const recent = [...conversations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-[var(--accent)]" /> Actividad Reciente
      </h3>
      <ul className="space-y-4">
        {recent.map(conv => {
          const client = clients.find(c => c.id === conv.clientId);
          return (
            <li key={conv.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-[var(--primary)] dark:text-[var(--secondary)] text-sm font-medium">
                {client?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{client?.name}</span> - {' '}
                  {conv.type === 'strategic' ? 'Estrategica' : conv.type === 'presale' ? 'Preventa' : 'Posventa'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(conv.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}; 