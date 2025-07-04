import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { User, TrendingUp, Award, MessageCircle } from 'lucide-react';

function getBadges(convs: any[]) {
  const badges = [];
  if (convs.length >= 1) badges.push({ label: 'Primer contacto', color: 'var(--primary)', icon: '👋' });
  if (convs.length >= 5) badges.push({ label: 'Cliente frecuente', color: 'var(--accent)', icon: '🔁' });
  if (convs.some(c => c.repurchaseOpportunity)) badges.push({ label: 'Oportunidad de recompra', color: 'var(--secondary)', icon: '💸' });
  if (convs.filter(c => c.type === 'strategic').length >= 3) badges.push({ label: 'Estratega', color: 'var(--danger)', icon: '♟️' });
  return badges;
}

function getProgress(convs: any[]) {
  if (convs.length >= 8) return { percent: 100, label: 'Fidelización', icon: <Award className="inline w-4 h-4 mb-1 text-yellow-400" /> };
  if (convs.length >= 4) return { percent: 60, label: 'Desarrollo', icon: <TrendingUp className="inline w-4 h-4 mb-1 text-blue-400" /> };
  if (convs.length >= 1) return { percent: 30, label: 'Inicio', icon: <MessageCircle className="inline w-4 h-4 mb-1 text-green-400" /> };
  return { percent: 0, label: 'Sin interacciones', icon: <User className="inline w-4 h-4 mb-1 text-gray-400" /> };
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

export const CustomerJourney: React.FC = () => {
  const { clients, conversations } = useAppContext();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const isDark = useIsDarkMode();
  const client = clients.find(c => c.id === selectedClient) || clients[0];
  const clientConvs = conversations.filter(c => c.clientId === client?.id);
  const badges = getBadges(clientConvs);
  const progress = getProgress(clientConvs);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-300">
            {client?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{client?.name}</div>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <span key={badge.label} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow" style={{ background: badge.color, color: 'white' }}>{badge.icon} {badge.label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Selecciona cliente</label>
          <select className="w-full md:w-64 bg-[var(--table-bg)] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white" value={client?.id} onChange={e => setSelectedClient(e.target.value)}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[180px]">
          <span className="text-sm text-gray-500 dark:text-gray-400">Progreso del journey</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{progress.label}</span>
            {progress.icon}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-1">
            <div style={{ width: `${progress.percent}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} className="h-3 rounded-full transition-all"></div>
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      <div className="text-center">
        {progress.percent === 100 && <div className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2">¡Felicidades! Has fidelizado a este cliente. <Award className="inline w-5 h-5 mb-1 text-yellow-400" /></div>}
        {progress.percent === 60 && <div className="text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-2">¡Vas por buen camino! Sigue generando valor. <TrendingUp className="inline w-5 h-5 mb-1 text-blue-400" /></div>}
        {progress.percent === 30 && <div className="text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center gap-2">¡Primeros pasos! No olvides registrar nuevas interacciones. <MessageCircle className="inline w-5 h-5 mb-1 text-green-400" /></div>}
        {progress.percent === 0 && <div className="text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center gap-2">Aún no hay interacciones. ¡Inicia el journey! <User className="inline w-5 h-5 mb-1 text-gray-400" /></div>}
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Línea de tiempo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--primary)] dark:text-[var(--accent)]">
            <MessageCircle className="w-5 h-5" /> Línea de tiempo
          </div>
          <div className="flex flex-col gap-4">
            {clientConvs.length === 0 && <div className="text-gray-400">Sin interacciones registradas.</div>}
            {clientConvs.map(conv => (
              <div key={conv.id} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--primary)' }}></div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{new Date(conv.date).toLocaleDateString()} - {conv.type === 'strategic' ? 'Estratégica' : conv.type === 'presale' ? 'Preventa' : 'Posventa'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{conv.notes}</div>
                  {conv.repurchaseOpportunity && <span className="text-xs font-bold ml-2 text-[var(--secondary)]">Potencial de recompra</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tabla de historial */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--primary)] dark:text-[var(--accent)]">
            <User className="w-5 h-5" /> Historial tabular
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', color: 'white' }}>
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Notas</th>
                  <th className="p-2">Recompra</th>
                </tr>
              </thead>
              <tbody>
                {clientConvs.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin interacciones.</td></tr>
                )}
                {clientConvs.map(conv => (
                  <tr key={conv.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--primary)]/20 transition-colors">
                    <td className="p-2 text-gray-900 dark:text-white">{new Date(conv.date).toLocaleDateString()}</td>
                    <td className="p-2 text-gray-900 dark:text-white">{conv.type === 'strategic' ? 'Estratégica' : conv.type === 'presale' ? 'Preventa' : 'Posventa'}</td>
                    <td className="p-2 text-gray-900 dark:text-white">{conv.notes}</td>
                    <td className="p-2 text-center text-gray-900 dark:text-white">{conv.repurchaseOpportunity ? '✔️' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 