import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { RecentActivity } from './RecentActivity';

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

// Componente para las tarjetas de métricas
const MetricCard: React.FC<{ title: string; value: number; icon: string; color: string; trend?: string }> = ({ 
  title, value, icon, color, trend 
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`} style={{ backgroundColor: color }}>
        {icon}
      </div>
      {trend && (
        <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
  </div>
);

// Componente para gráficos de barras simples
const SimpleBarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">{item.label}</div>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color 
              }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-gray-900 dark:text-white text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { clients, conversations } = useAppContext();
  const isDark = useIsDarkMode();

  // Cálculos de métricas
  const totalConversations = conversations.length;
  const strategicConversations = conversations.filter(c => c.type === 'strategic').length;
  const presaleConversations = conversations.filter(c => c.type === 'presale').length;
  const postsaleConversations = conversations.filter(c => c.type === 'postsale').length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const dormantClients = clients.filter(c => c.status === 'dormant').length;
  const unknownClients = clients.filter(c => c.status === 'unknown').length;
  const ordinaryClients = clients.filter(c => c.type === 'ordinary').length;
  const premiumClients = clients.filter(c => c.type === 'premium').length;
  const repurchaseOpportunities = conversations.filter(c => c.repurchaseOpportunity).length;

  // Calcular duración promedio
  const now = Date.now();
  const durations = clients.map(c => c.createdAt ? (now - new Date(c.createdAt).getTime()) : 0);
  const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / (1000*60*60*24)) : 0;

  // Datos para gráficos
  const conversationTypes = [
    { label: 'Estratégicas', value: strategicConversations, color: '#3B82F6' },
    { label: 'Preventas', value: presaleConversations, color: '#10B981' },
    { label: 'Posventas', value: postsaleConversations, color: '#F59E0B' }
  ];

  const clientStatuses = [
    { label: 'Activos', value: activeClients, color: '#10B981' },
    { label: 'Dormidos', value: dormantClients, color: '#F59E0B' },
    { label: 'Desconocidos', value: unknownClients, color: '#EF4444' }
  ];

  const clientTypes = [
    { label: 'Ordinarios', value: ordinaryClients, color: '#6B7280' },
    { label: 'Premium', value: premiumClients, color: '#8B5CF6' }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen general de tu CRM</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date().toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Conversaciones"
          value={totalConversations}
          icon="💬"
          color="#3B82F6"
          trend="+12%"
        />
        <MetricCard
          title="Clientes Activos"
          value={activeClients}
          icon="👥"
          color="#10B981"
          trend="+5%"
        />
        <MetricCard
          title="Oportunidades"
          value={repurchaseOpportunities}
          icon="🎯"
          color="#F59E0B"
          trend="+8%"
        />
        <MetricCard
          title="Duración Promedio"
          value={avgDuration}
          icon="📅"
          color="#8B5CF6"
          trend="+2 días"
        />
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tipos de conversaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Tipos de Conversaciones
          </h3>
          <SimpleBarChart data={conversationTypes} />
        </div>

        {/* Estados de clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">👤</span>
            Estados de Clientes
          </h3>
          <SimpleBarChart data={clientStatuses} />
        </div>
      </div>

      {/* Tipos de clientes y tabla de resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tipos de clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🏷️</span>
            Tipos de Clientes
          </h3>
          <SimpleBarChart data={clientTypes} />
        </div>

        {/* Tabla de resumen */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Resumen de Clientes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', color: 'white' }}>
                  <th className="text-left py-3 px-4 font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Conversaciones</th>
                  <th className="text-left py-3 px-4 font-medium">Última Actividad</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map(client => {
                  const clientConversations = conversations.filter(c => c.clientId === client.id);
                  const lastConversation = clientConversations.length > 0 
                    ? new Date(Math.max(...clientConversations.map(c => new Date(c.date).getTime())))
                    : null;
                  
                  return (
                    <tr key={client.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--primary)]/20 transition-colors">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-medium mr-3">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          client.type === 'premium' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {client.type === 'premium' ? 'Premium' : 'Ordinario'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : client.status === 'dormant'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {client.status === 'active' ? 'Activo' : 
                           client.status === 'dormant' ? 'Dormido' : 'Desconocido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {clientConversations.length}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {lastConversation 
                          ? lastConversation.toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short' 
                            })
                          : 'Nunca'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {clients.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                Ver todos los clientes ({clients.length})
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Actividad Reciente */}
      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
}; 