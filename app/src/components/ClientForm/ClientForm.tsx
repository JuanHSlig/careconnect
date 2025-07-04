import React, { useState } from 'react';
import { Client, Contact } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initial?: Client;
}

const emptyContact = (): Contact => ({ id: crypto.randomUUID(), name: '', email: '', phone: '' });

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

export const ClientForm: React.FC<ClientFormProps> = ({ open, onClose, onSave, initial }) => {
  const [name, setName] = useState(initial?.name || '');
  const [status, setStatus] = useState<Client['status']>(initial?.status || 'unknown');
  const [type, setType] = useState<Client['type']>(initial?.type || 'ordinary');
  const [contacts, setContacts] = useState<Contact[]>(initial?.contacts || [emptyContact()]);
  const [error, setError] = useState('');
  const isDark = useIsDarkMode();
  const titleColor = isDark ? 'var(--accent)' : 'var(--primary)';
  const inputStyle = {
    background: 'var(--table-bg)',
    color: 'var(--fg)',
    border: `1px solid ${isDark ? 'var(--accent)' : 'var(--primary)'}`,
    borderRadius: 6,
    padding: '0.5rem 0.75rem',
    outline: 'none',
    marginBottom: 0,
  };

  const handleContactChange = (idx: number, field: keyof Contact, value: string) => {
    setContacts(cs => cs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addContact = () => setContacts(cs => [...cs, emptyContact()]);
  const removeContact = (idx: number) => setContacts(cs => cs.length > 1 ? cs.filter((_, i) => i !== idx) : cs);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio');
    if (contacts.some(c => !c.name.trim())) return setError('Todos los contactos deben tener nombre');
    setError('');
    onSave({
      id: initial?.id || crypto.randomUUID(),
      name,
      status,
      type,
      contacts,
      createdAt: initial?.createdAt || new Date(),
      lastInteraction: initial?.lastInteraction,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar Cliente' : 'Nuevo Cliente'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          style={inputStyle}
          placeholder="Nombre del cliente"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value as Client['status'])}>
            <option value="active">Activo</option>
            <option value="dormant">Dormido</option>
            <option value="unknown">Desconocido</option>
          </select>
          <select style={inputStyle} value={type} onChange={e => setType(e.target.value as Client['type'])}>
            <option value="ordinary">Ordinario</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
          <div className="font-semibold mb-1" style={{ color: titleColor }}>Contactos</div>
          {contacts.map((contact, idx) => (
            <div key={contact.id} className="flex flex-wrap gap-2 mb-2">
              <input
                style={inputStyle}
                placeholder="Nombre"
                value={contact.name}
                onChange={e => handleContactChange(idx, 'name', e.target.value)}
                required
              />
              <input
                style={inputStyle}
                placeholder="Email"
                value={contact.email || ''}
                onChange={e => handleContactChange(idx, 'email', e.target.value)}
                type="email"
              />
              <input
                style={inputStyle}
                placeholder="Teléfono"
                value={contact.phone || ''}
                onChange={e => handleContactChange(idx, 'phone', e.target.value)}
                type="tel"
              />
              <Button type="button" variant="danger" onClick={() => removeContact(idx)} disabled={contacts.length === 1}>-</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addContact}>Agregar contacto</Button>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{initial ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}; 