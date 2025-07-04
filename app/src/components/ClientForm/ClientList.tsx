import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Client } from '../../types';
import { Button } from '../common/Button';
import { ClientForm } from './ClientForm';
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

export const ClientList: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useAppContext();
  const [openForm, setOpenForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
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

  const handleSave = async (client: Client) => {
    setLoading(true);
    if (client.id && clients.some(c => c.id === client.id)) {
      await updateClient(client.id, client);
    } else {
      await addClient(client);
    }
    setLoading(false);
    setOpenForm(false);
    setEditClient(null);
  };

  const handleDelete = async (client: Client) => {
    setLoading(true);
    await deleteClient(client.id);
    setLoading(false);
    setConfirmDelete(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>Clientes</h2>
        <Button onClick={() => { setEditClient(null); setOpenForm(true); }}>Nuevo Cliente</Button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', color: 'white' }}>
              <th className="py-3 px-4 font-medium">Nombre</th>
              <th className="py-3 px-4 font-medium">Tipo</th>
              <th className="py-3 px-4 font-medium">Estado</th>
              <th className="py-3 px-4 font-medium">Contactos</th>
              <th className="py-3 px-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay clientes registrados.</td></tr>
            )}
            {clients.map(client => (
              <tr key={client.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--primary)]/20 transition-colors">
                <td className="py-3 px-4 text-gray-900 dark:text-white">{client.name}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">
                  <select style={selectStyle} value={client.type} disabled>
                    <option value="ordinary">Ordinario</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">
                  <select style={selectStyle} value={client.status} disabled>
                    <option value="active">Activo</option>
                    <option value="dormant">Dormido</option>
                    <option value="unknown">Desconocido</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">{client.contacts?.length || 0}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">
                  <Button onClick={() => { setEditClient(client); setOpenForm(true); }}>Editar</Button>
                  <Button variant="danger" onClick={() => setConfirmDelete(client)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ClientForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
        initial={editClient || undefined}
      />
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="¿Eliminar cliente?">
        <div>¿Seguro que deseas eliminar a <b>{confirmDelete?.name}</b>? Esta acción no se puede deshacer.</div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}; 