const API_URL = "http://localhost:4000";

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('careconnect_token');
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// Clientes
export const fetchClients = async () => {
  const res = await fetch(`${API_URL}/clients`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const createClient = async (client: any) => {
  const res = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  });
  return res.json();
};

export const updateClient = async (id: string, client: any) => {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  });
  return res.json();
};

export const deleteClient = async (id: string) => {
  const res = await fetch(`${API_URL}/clients/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return res.json();
};

// Contactos
export const fetchContacts = async () => {
  const res = await fetch(`${API_URL}/contacts`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const createContact = async (contact: any) => {
  const res = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(contact),
  });
  return res.json();
};

export const updateContact = async (id: string, contact: any) => {
  const res = await fetch(`${API_URL}/contacts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(contact),
  });
  return res.json();
};

export const deleteContact = async (id: string) => {
  const res = await fetch(`${API_URL}/contacts/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return res.json();
};

// Conversaciones
export const fetchConversations = async () => {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const createConversation = async (conv: any) => {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(conv),
  });
  return res.json();
};

export const updateConversation = async (id: string, conv: any) => {
  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(conv),
  });
  return res.json();
};

export const deleteConversation = async (id: string) => {
  const res = await fetch(`${API_URL}/conversations/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return res.json();
};

// Rutas de configuración de usuario
export const getUserSettings = async () => {
  const res = await fetch(`${API_URL}/user/settings`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const updateUserSettings = async (settings: any) => {
  const res = await fetch(`${API_URL}/user/settings`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ settings })
  });
  return res.json();
};

export const updateUserProfile = async (profileData: any) => {
  const res = await fetch(`${API_URL}/user/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return res.json();
};

export const updateUserPassword = async (passwordData: any) => {
  const res = await fetch(`${API_URL}/user/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData)
  });
  return res.json();
}; 