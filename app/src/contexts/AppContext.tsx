import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchClients, createClient, updateClient, deleteClient,
  fetchContacts, createContact, updateContact, deleteContact,
  fetchConversations, createConversation, updateConversation, deleteConversation
} from "../utils/api";
import { Client, Contact, Conversation } from "../types";

interface AppContextProps {
  clients: Client[];
  contacts: Contact[];
  conversations: Conversation[];
  addClient: (c: Client) => Promise<void>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addContact: (c: Contact) => Promise<void>;
  updateContact: (id: string, c: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addConversation: (c: Conversation) => Promise<void>;
  updateConversation: (id: string, c: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [clientsRaw, contacts, conversationsRaw] = await Promise.all([
          fetchClients(),
          fetchContacts(),
          fetchConversations()
        ]);
        // Convertir fechas a objetos Date
        const clients = clientsRaw.map((client: any) => ({
          ...client,
          createdAt: client.createdAt ? new Date(client.createdAt) : undefined,
          lastInteraction: client.lastInteraction ? new Date(client.lastInteraction) : undefined,
          contacts: contacts.filter((c: any) => c.clientId === client.id)
        }));
        const conversations = conversationsRaw.map((conv: any) => ({
          ...conv,
          date: conv.date ? new Date(conv.date) : undefined,
          repurchaseOpportunity: !!conv.repurchaseOpportunity
        }));
        setClients(clients);
        setContacts(contacts);
        setConversations(conversations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAll();
  }, []);

  // Métodos CRUD
  const addClient = async (client: Client) => {
    // Guardar cliente sin contactos
    const { contacts = [], ...clientData } = client;
    await createClient(clientData);
    // Guardar contactos asociados
    await Promise.all(
      contacts.map((contact: Contact) => createContact({ ...contact, clientId: client.id }))
    );
    // Refrescar datos
    const [clientsRaw, allContacts] = await Promise.all([fetchClients(), fetchContacts()]);
    const clients = clientsRaw.map((c: any) => ({
      ...c,
      contacts: allContacts.filter((ct: any) => ct.clientId === c.id)
    }));
    setClients(clients);
    setContacts(allContacts);
  };
  const updateClientFn = async (id: string, client: Partial<Client>) => {
    const { contacts = [], ...clientData } = client;
    await updateClient(id, clientData);
    // Eliminar contactos previos y volver a crearlos (simplificado)
    const prevContacts = contacts.filter((c: any) => c.clientId === id);
    await Promise.all(prevContacts.map((c: any) => deleteContact(c.id)));
    await Promise.all(
      contacts.map((contact: Contact) => createContact({ ...contact, clientId: id }))
    );
    // Refrescar datos
    const [clientsRaw, allContacts] = await Promise.all([fetchClients(), fetchContacts()]);
    const clients = clientsRaw.map((c: any) => ({
      ...c,
      contacts: allContacts.filter((ct: any) => ct.clientId === c.id)
    }));
    setClients(clients);
    setContacts(allContacts);
  };
  const deleteClientFn = async (id: string) => {
    // Eliminar contactos asociados antes de eliminar el cliente
    const clientContacts = contacts.filter((c: any) => c.clientId === id);
    await Promise.all(clientContacts.map((c: any) => deleteContact(c.id)));
    await deleteClient(id);
    // Refrescar datos
    const [clientsRaw, allContacts] = await Promise.all([fetchClients(), fetchContacts()]);
    const clients = clientsRaw.map((c: any) => ({
      ...c,
      contacts: allContacts.filter((ct: any) => ct.clientId === c.id)
    }));
    setClients(clients);
    setContacts(allContacts);
  };

  const addContact = async (contact: Contact) => {
    await createContact(contact);
    setContacts(await fetchContacts());
  };
  const updateContactFn = async (id: string, c: Partial<Contact>) => {
    await updateContact(id, c);
    setContacts(await fetchContacts());
  };
  const deleteContactFn = async (id: string) => {
    await deleteContact(id);
    setContacts(await fetchContacts());
  };

  const addConversation = async (conv: Conversation) => {
    await createConversation(conv);
    setConversations(await fetchConversations());
  };
  const updateConversationFn = async (id: string, c: Partial<Conversation>) => {
    await updateConversation(id, c);
    setConversations(await fetchConversations());
  };
  const deleteConversationFn = async (id: string) => {
    await deleteConversation(id);
    setConversations(await fetchConversations());
  };

  return (
    <AppContext.Provider value={{
      clients, contacts, conversations,
      addClient, updateClient: updateClientFn, deleteClient: deleteClientFn,
      addContact, updateContact: updateContactFn, deleteContact: deleteContactFn,
      addConversation, updateConversation: updateConversationFn, deleteConversation: deleteConversationFn
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 