import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Conversation } from '../../types';
import { Button } from '../common/Button';
import { ConversationForm } from './ConversationForm';
import { Modal } from '../common/Modal';

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

export const ConversationList: React.FC = () => {
  const { conversations, clients, addConversation, updateConversation, deleteConversation } = useAppContext();
  const [openForm, setOpenForm] = useState(false);
  const [editConv, setEditConv] = useState<Conversation | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const isDark = useIsDarkMode();
  const titleColor = isDark ? 'var(--accent)' : 'var(--primary)';
  const tableStyle = {
    background: 'var(--table-bg)',
    color: 'var(--fg)',
    border: `1px solid ${isDark ? 'var(--accent)' : 'var(--primary)'}`,
    boxShadow: isDark
      ? '0 2px 8px rgba(30,61,120,0.25)'
      : '0 2px 8px rgba(30,61,120,0.10)',
    borderRadius: 10,
  };
  const selectStyle = {
    background: isDark ? '#232b3a' : 'var(--table-bg)',
    color: isDark ? '#EAEAEA' : 'var(--fg)',
    border: `1px solid ${isDark ? '#334155' : (isDark ? 'var(--accent)' : 'var(--primary)')}`,
    borderRadius: 6,
    padding: '0.25rem 0.5rem',
    outline: 'none',
  };

  const handleSave = async (conv: Conversation) => {
    setLoading(true);
    if (conv.id && conversations.some(c => c.id === conv.id)) {
      await updateConversation(conv.id, conv);
    } else {
      await addConversation(conv);
    }
    setLoading(false);
    setOpenForm(false);
    setEditConv(null);
  };

  const handleDelete = async (conv: Conversation) => {
    setLoading(true);
    await deleteConversation(conv.id);
    setLoading(false);
    setConfirmDelete(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>Conversaciones</h2>
        <Button onClick={() => { setEditConv(null); setOpenForm(true); }}>Nueva Conversación</Button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', color: 'white' }}>
              <th className="py-3 px-4 font-medium">Cliente</th>
              <th className="py-3 px-4 font-medium">Tipo</th>
              <th className="py-3 px-4 font-medium">Fecha</th>
              <th className="py-3 px-4 font-medium">Notas</th>
              <th className="py-3 px-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conversations.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay conversaciones registradas.</td></tr>
            )}
            {conversations.map(conv => (
              <tr key={conv.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--primary)]/20 transition-colors">
                <td className="py-3 px-4 text-gray-900 dark:text-white">{clients.find(c => c.id === conv.clientId)?.name || '-'}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{conv.type === 'strategic' ? 'Estratégica' : conv.type === 'presale' ? 'Preventa' : 'Posventa'}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{new Date(conv.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{conv.notes}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">
                  <Button onClick={() => { setEditConv(conv); setOpenForm(true); }}>Editar</Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(conv)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConversationForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editConv || undefined}
      />
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="¿Eliminar conversación?">
        <div>¿Seguro que deseas eliminar esta conversación? Esta acción no se puede deshacer.</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete)} disabled={loading}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}; 