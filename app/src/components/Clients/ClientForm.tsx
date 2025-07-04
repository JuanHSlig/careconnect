import React from 'react';

export interface Contact {
  name: string;
  email: string;
  phone?: string;
}

export interface Client {
  id: number;
  name: string;
  status: 'active' | 'dormant' | 'unknown';
  type: 'ordinary' | 'premium';
  stage: 'Desconocido' | 'Prospecto' | 'Cliente' | 'Facturado';
  contacts: Contact[];
  createdAt: string;
  lastInteraction: string;
}

interface ClientFormProps {
  client: Partial<Client>;
  onClientChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onContactChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddContact: () => void;
  onRemoveContact: (index: number) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onClientChange,
  onContactChange,
  onAddContact,
  onRemoveContact,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--fg-secondary)]">Nombre del Cliente</label>
        <input
          type="text"
          name="name"
          id="name"
          value={client.name || ''}
          onChange={onClientChange}
          className="mt-1 block w-full"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-[var(--fg-secondary)]">Estado</label>
          <select name="status" id="status" value={client.status || 'active'} onChange={onClientChange} className="mt-1 block w-full">
            <option value="active">Activo</option>
            <option value="dormant">Dormido</option>
            <option value="unknown">Desconocido</option>
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-[var(--fg-secondary)]">Tipo</label>
          <select name="type" id="type" value={client.type || 'ordinary'} onChange={onClientChange} className="mt-1 block w-full">
            <option value="ordinary">Ordinario</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
            <label htmlFor="stage" className="block text-sm font-medium text-[var(--fg-secondary)]">Etapa</label>
            <select name="stage" id="stage" value={client.stage || 'Desconocido'} onChange={onClientChange} className="mt-1 block w-full">
                <option value="Desconocido">Desconocido</option>
                <option value="Prospecto">Prospecto</option>
                <option value="Cliente">Cliente</option>
                <option value="Facturado">Facturado</option>
            </select>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-[var(--fg)]">Contactos</h3>
        {client.contacts?.map((contact, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-2 border border-[var(--border)] rounded-lg">
            <input
              type="text"
              name="name"
              placeholder="Nombre del contacto"
              value={contact.name}
              onChange={(e) => onContactChange(index, e)}
              className="w-full"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={contact.email}
              onChange={(e) => onContactChange(index, e)}
              className="w-full"
            />
            <div className="flex items-center">
              <input
                type="text"
                name="phone"
                placeholder="Teléfono (opcional)"
                value={contact.phone || ''}
                onChange={(e) => onContactChange(index, e)}
                className="w-full"
              />
              <button type="button" onClick={() => onRemoveContact(index)} className="ml-2 text-red-500">X</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={onAddContact} className="mt-2 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:opacity-90">
          Añadir Contacto
        </button>
      </div>
    </div>
  );
};

export default ClientForm; 