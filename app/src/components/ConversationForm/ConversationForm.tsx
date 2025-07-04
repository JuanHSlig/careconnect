import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Client, Conversation } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ConversationFormProps {
  open: boolean;
  onClose: () => void;
  initial?: Conversation;
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

export const ConversationForm: React.FC<ConversationFormProps> = ({ open, onClose, initial }) => {
  const { clients, addConversation } = useAppContext();
  const [clientId, setClientId] = useState(initial?.clientId || (clients[0]?.id ?? ''));
  const [type, setType] = useState<Conversation['type']>(initial?.type || 'strategic');
  const [date, setDate] = useState(initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes || '');
  const [repurchaseOpportunity, setRepurchaseOpportunity] = useState(initial?.repurchaseOpportunity || false);
  const [error, setError] = useState('');
  const isDark = useIsDarkMode();
  const titleColor = isDark ? 'var(--accent)' : 'var(--primary)';
  const inputStyle = {
    background: 'var(---bg)',
    color: 'var(--fg)',
    border: `1px solid ${isDark ? 'var(--accent)' : 'var(--primary)'}`,
    borderRadius: 6,
    padding: '0.5rem 0.75rem',
    outline: 'none',
    marginBottom: 0,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return setError('Selecciona un cliente');
    if (!date) return setError('Selecciona una fecha');
    setError('');
    addConversation({
      id: initial?.id || crypto.randomUUID(),
      clientId,
      type,
      date: new Date(date),
      notes,
      repurchaseOpportunity,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar Conversación' : 'Nueva Conversación'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select style={inputStyle} value={clientId} onChange={e => setClientId(e.target.value)} required>
          <option value="">Selecciona un cliente</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={inputStyle} value={type} onChange={e => setType(e.target.value as Conversation['type'])} required>
          <option value="strategic">Estratégica</option>
          <option value="presale">Preventa</option>
          <option value="postsale">Posventa</option>
        </select>
        <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} required />
        <textarea style={inputStyle} placeholder="Notas breves" value={notes} onChange={e => setNotes(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={repurchaseOpportunity} onChange={e => setRepurchaseOpportunity(e.target.checked)} />
          Potencial de recompra
        </label>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{initial ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}; 