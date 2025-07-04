const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 4000;
const JWT_SECRET = 'careconnect-secret-key-2024';

app.use(cors());
app.use(express.json());

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Inicializa la base de datos
const db = new sqlite3.Database('./careconnect.db');

// Crea tablas si no existen
db.serialize(() => {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    profileImage TEXT,
    settings TEXT,
    createdAt TEXT
  )`);
  
  // Tabla de clientes con userId
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT,
    type TEXT,
    stage TEXT DEFAULT 'Desconocido',
    contacts TEXT,
    createdAt DATETIME,
    lastInteraction DATETIME,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    clientId TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    FOREIGN KEY (clientId) REFERENCES clients (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    clientId TEXT,
    type TEXT,
    date TEXT,
    notes TEXT,
    repurchaseOpportunity INTEGER,
    FOREIGN KEY (clientId) REFERENCES clients (id)
  )`);

  // Crear tabla de notificaciones
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      link TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Crear usuarios de prueba si no existen
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row.count === 0) {
      // Usuario 1: Administrador
      const hashedPassword1 = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO users (id, username, email, password, name, profileImage, settings, createdAt) VALUES
        ('u1', 'admin', 'admin@careconnect.com', ?, 'Administrador', NULL, '{"theme":"default","notifications":{"email":true,"push":true,"reminders":true},"privacy":{"profileVisibility":"public","dataSharing":false}}', '2024-01-01')
      `, [hashedPassword1]);
      
      // Usuario 2: Vendedor
      const hashedPassword2 = bcrypt.hashSync('vendedor123', 10);
      db.run(`INSERT INTO users (id, username, email, password, name, profileImage, settings, createdAt) VALUES
        ('u2', 'vendedor', 'vendedor@careconnect.com', ?, 'María González', NULL, '{"theme":"ocean","notifications":{"email":true,"push":true,"reminders":true},"privacy":{"profileVisibility":"public","dataSharing":true}}', '2024-01-15')
      `, [hashedPassword2]);
      
      // Usuario 3: Gerente
      const hashedPassword3 = bcrypt.hashSync('gerente123', 10);
      db.run(`INSERT INTO users (id, username, email, password, name, profileImage, settings, createdAt) VALUES
        ('u3', 'gerente', 'gerente@careconnect.com', ?, 'Carlos Rodríguez', NULL, '{"theme":"forest","notifications":{"email":true,"push":false,"reminders":true},"privacy":{"profileVisibility":"private","dataSharing":false}}', '2024-02-01')
      `, [hashedPassword3]);
      
      // Datos de ejemplo para el usuario admin (u1)
      const clients = [
        { name: 'Acme Corp', status: 'active', type: 'premium', stage: 'Cliente', contacts: '[{"name":"Ana Pérez","email":"ana@acme.com"}]', userId: 'u1' },
        { name: 'Beta S.A.', status: 'dormant', type: 'ordinary', stage: 'Cliente', contacts: '[{"name":"Marta Ruiz","email":"marta@beta.com"}]', userId: 'u1' },
        { name: 'Gamma Ltd', status: 'active', type: 'ordinary', stage: 'Cliente', contacts: '[{"name":"Carlos Díaz","email":"carlos@gamma.com"}]', userId: 'u1' },
        { name: 'Delta Industries', status: 'active', type: 'premium', stage: 'Cliente', contacts: '[{"name":"Elena Morales","email":"elena@delta.com"}]', userId: 'u1' }
      ];
      clients.forEach((client) => {
        db.run(`INSERT INTO clients (name, status, type, stage, contacts, userId, createdAt, lastInteraction) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)`, [client.name, client.status, client.type, client.stage, client.contacts, client.userId, new Date().toISOString(), new Date().toISOString()]);
      });
      
      // Datos de ejemplo para el usuario vendedor (u2)
      const vendedorClients = [
        { name: 'TechStart Inc', status: 'active', type: 'premium', stage: 'Cliente', contacts: '[{"name":"Roberto Silva","email":"roberto@techstart.com"}]', userId: 'u2' },
        { name: 'Green Solutions', status: 'active', type: 'ordinary', stage: 'Cliente', contacts: '[{"name":"Carmen Vega","email":"carmen@techstart.com"}]', userId: 'u2' },
        { name: 'Innovate Labs', status: 'dormant', type: 'ordinary', stage: 'Cliente', contacts: '[{"name":"Patricia López","email":"patricia@innovatelabs.com"}]', userId: 'u2' },
        { name: 'Future Systems', status: 'active', type: 'premium', stage: 'Cliente', contacts: '[{"name":"Fernando Torres","email":"fernando@futuresystems.com"}]', userId: 'u2' }
      ];
      vendedorClients.forEach((client) => {
        db.run(`INSERT INTO clients (name, status, type, stage, contacts, userId, createdAt, lastInteraction) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)`, [client.name, client.status, client.type, client.stage, client.contacts, client.userId, new Date().toISOString(), new Date().toISOString()]);
      });
      
      // Datos de ejemplo para el usuario gerente (u3)
      const gerenteClients = [
        { name: 'MegaCorp', status: 'active', type: 'premium', stage: 'Cliente', contacts: '[{"name":"Sofía Ramírez","email":"sofia@megacorp.com"}]', userId: 'u3' },
        { name: 'Global Enterprises', status: 'active', type: 'premium', stage: 'Cliente', contacts: '[{"name":"Miguel Ángel","email":"miguel@megacorp.com"}]', userId: 'u3' },
        { name: 'Strategic Partners', status: 'active', type: 'ordinary', stage: 'Cliente', contacts: '[{"name":"Alejandro Ruiz","email":"alejandro@strategicpartners.com"}]', userId: 'u3' },
        { name: 'Elite Solutions', status: 'dormant', type: 'ordinary', stage: 'Cliente', contacts: '[{"name":"Valentina Herrera","email":"valentina@elitesolutions.com"}]', userId: 'u3' }
      ];
      gerenteClients.forEach((client) => {
        db.run(`INSERT INTO clients (name, status, type, stage, contacts, userId, createdAt, lastInteraction) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)`, [client.name, client.status, client.type, client.stage, client.contacts, client.userId, new Date().toISOString(), new Date().toISOString()]);
      });
      
      // Contactos para usuario admin
      const adminContacts = [
        { id: 'ct1', clientId: 'c1', name: 'Ana Pérez', email: 'ana@acme.com', phone: '555-1234' },
        { id: 'ct2', clientId: 'c1', name: 'Luis Gómez', email: 'luis@acme.com', phone: '555-5678' },
        { id: 'ct3', clientId: 'c2', name: 'Marta Ruiz', email: 'marta@beta.com', phone: '555-8765' },
        { id: 'ct4', clientId: 'c3', name: 'Carlos Díaz', email: 'carlos@gamma.com', phone: '555-4321' },
        { id: 'ct5', clientId: 'c4', name: 'Elena Morales', email: 'elena@delta.com', phone: '555-9876' }
      ];
      adminContacts.forEach((contact) => {
        db.run(`INSERT INTO contacts (id, clientId, name, email, phone) VALUES (?, ?, ?, ?, ?)`, [contact.id, contact.clientId, contact.name, contact.email, contact.phone]);
      });
      
      // Contactos para usuario vendedor
      const vendedorContacts = [
        { id: 'ct6', clientId: 'c5', name: 'Roberto Silva', email: 'roberto@techstart.com', phone: '555-1111' },
        { id: 'ct7', clientId: 'c5', name: 'Carmen Vega', email: 'carmen@techstart.com', phone: '555-2222' },
        { id: 'ct8', clientId: 'c6', name: 'Diego Mendoza', email: 'diego@greensolutions.com', phone: '555-3333' },
        { id: 'ct9', clientId: 'c7', name: 'Patricia López', email: 'patricia@innovatelabs.com', phone: '555-4444' },
        { id: 'ct10', clientId: 'c8', name: 'Fernando Torres', email: 'fernando@futuresystems.com', phone: '555-5555' }
      ];
      vendedorContacts.forEach((contact) => {
        db.run(`INSERT INTO contacts (id, clientId, name, email, phone) VALUES (?, ?, ?, ?, ?)`, [contact.id, contact.clientId, contact.name, contact.email, contact.phone]);
      });
      
      // Contactos para usuario gerente
      const gerenteContacts = [
        { id: 'ct11', clientId: 'c9', name: 'Sofía Ramírez', email: 'sofia@megacorp.com', phone: '555-6666' },
        { id: 'ct12', clientId: 'c9', name: 'Miguel Ángel', email: 'miguel@megacorp.com', phone: '555-7777' },
        { id: 'ct13', clientId: 'c10', name: 'Isabella Castro', email: 'isabella@globalenterprises.com', phone: '555-8888' },
        { id: 'ct14', clientId: 'c11', name: 'Alejandro Ruiz', email: 'alejandro@strategicpartners.com', phone: '555-9999' },
        { id: 'ct15', clientId: 'c12', name: 'Valentina Herrera', email: 'valentina@elitesolutions.com', phone: '555-0000' }
      ];
      gerenteContacts.forEach((contact) => {
        db.run(`INSERT INTO contacts (id, clientId, name, email, phone) VALUES (?, ?, ?, ?, ?)`, [contact.id, contact.clientId, contact.name, contact.email, contact.phone]);
      });
      
      // Conversaciones para usuario admin
      const adminConversations = [
        { id: 'conv1', clientId: 'c1', type: 'strategic', date: '2024-01-10', notes: 'Kickoff inicial del proyecto', repurchaseOpportunity: 0 },
        { id: 'conv2', clientId: 'c1', type: 'presale', date: '2024-02-05', notes: 'Presentación de propuesta comercial', repurchaseOpportunity: 1 },
        { id: 'conv3', clientId: 'c1', type: 'postsale', date: '2024-03-15', notes: 'Seguimiento postventa y soporte', repurchaseOpportunity: 0 },
        { id: 'conv4', clientId: 'c1', type: 'strategic', date: '2024-04-20', notes: 'Reunión estratégica trimestral', repurchaseOpportunity: 1 },
        { id: 'conv5', clientId: 'c2', type: 'presale', date: '2024-02-20', notes: 'Primera llamada de prospección', repurchaseOpportunity: 0 },
        { id: 'conv6', clientId: 'c2', type: 'postsale', date: '2024-03-25', notes: 'Soporte técnico y resolución de dudas', repurchaseOpportunity: 0 },
        { id: 'conv7', clientId: 'c3', type: 'strategic', date: '2024-03-15', notes: 'Onboarding y capacitación inicial', repurchaseOpportunity: 0 },
        { id: 'conv8', clientId: 'c3', type: 'strategic', date: '2024-04-10', notes: 'Revisión de objetivos y KPIs', repurchaseOpportunity: 1 },
        { id: 'conv9', clientId: 'c3', type: 'postsale', date: '2024-05-05', notes: 'Feedback de satisfacción del cliente', repurchaseOpportunity: 0 },
        { id: 'conv10', clientId: 'c4', type: 'presale', date: '2024-04-15', notes: 'Presentación de soluciones personalizadas', repurchaseOpportunity: 1 }
      ];
      adminConversations.forEach((conversation) => {
        db.run(`INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES (?, ?, ?, ?, ?, ?)`, [conversation.id, conversation.clientId, conversation.type, conversation.date, conversation.notes, conversation.repurchaseOpportunity ? 1 : 0]);
      });
      
      // Conversaciones para usuario vendedor
      const vendedorConversations = [
        { id: 'conv11', clientId: 'c5', type: 'strategic', date: '2024-01-25', notes: 'Análisis de necesidades del cliente', repurchaseOpportunity: 0 },
        { id: 'conv12', clientId: 'c5', type: 'presale', date: '2024-02-15', notes: 'Demo de productos y servicios', repurchaseOpportunity: 1 },
        { id: 'conv13', clientId: 'c5', type: 'postsale', date: '2024-03-20', notes: 'Implementación y configuración', repurchaseOpportunity: 0 },
        { id: 'conv14', clientId: 'c6', type: 'presale', date: '2024-02-12', notes: 'Propuesta de soluciones verdes', repurchaseOpportunity: 1 },
        { id: 'conv15', clientId: 'c6', type: 'postsale', date: '2024-03-18', notes: 'Seguimiento de implementación', repurchaseOpportunity: 0 },
        { id: 'conv16', clientId: 'c7', type: 'strategic', date: '2024-03-08', notes: 'Evaluación de oportunidades', repurchaseOpportunity: 0 },
        { id: 'conv17', clientId: 'c8', type: 'presale', date: '2024-04-25', notes: 'Presentación de innovaciones tecnológicas', repurchaseOpportunity: 1 },
        { id: 'conv18', clientId: 'c8', type: 'postsale', date: '2024-05-10', notes: 'Capacitación del equipo', repurchaseOpportunity: 0 }
      ];
      vendedorConversations.forEach((conversation) => {
        db.run(`INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES (?, ?, ?, ?, ?, ?)`, [conversation.id, conversation.clientId, conversation.type, conversation.date, conversation.notes, conversation.repurchaseOpportunity ? 1 : 0]);
      });
      
      // Conversaciones para usuario gerente
      const gerenteConversations = [
        { id: 'conv19', clientId: 'c9', type: 'strategic', date: '2024-02-10', notes: 'Reunión ejecutiva de alto nivel', repurchaseOpportunity: 1 },
        { id: 'conv20', clientId: 'c9', type: 'presale', date: '2024-03-01', notes: 'Presentación de soluciones empresariales', repurchaseOpportunity: 1 },
        { id: 'conv21', clientId: 'c9', type: 'postsale', date: '2024-04-05', notes: 'Seguimiento de implementación corporativa', repurchaseOpportunity: 0 },
        { id: 'conv22', clientId: 'c10', type: 'strategic', date: '2024-02-25', notes: 'Análisis de mercado global', repurchaseOpportunity: 1 },
        { id: 'conv23', clientId: 'c10', type: 'presale', date: '2024-03-15', notes: 'Propuesta de expansión internacional', repurchaseOpportunity: 1 },
        { id: 'conv24', clientId: 'c11', type: 'presale', date: '2024-03-20', notes: 'Alianza estratégica', repurchaseOpportunity: 0 },
        { id: 'conv25', clientId: 'c11', type: 'postsale', date: '2024-04-25', notes: 'Seguimiento de colaboración', repurchaseOpportunity: 0 },
        { id: 'conv26', clientId: 'c12', type: 'strategic', date: '2024-04-15', notes: 'Evaluación de renovación de contrato', repurchaseOpportunity: 0 }
      ];
      gerenteConversations.forEach((conversation) => {
        db.run(`INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES (?, ?, ?, ?, ?, ?)`, [conversation.id, conversation.clientId, conversation.type, conversation.date, conversation.notes, conversation.repurchaseOpportunity ? 1 : 0]);
      });
    }
  });
});

// Rutas de autenticación
app.post('/auth/register', async (req, res) => {
  const { username, email, password, name } = req.body;
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u' + Date.now();
    
    db.run(
      'INSERT INTO users (id, username, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, name, new Date().toISOString()],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: userId, username, email, name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: userId, username, email, name } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar contraseña' });
    }
  });
});

app.get('/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, name, profileImage, settings FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const userData = {
      ...user,
      settings: user.settings ? JSON.parse(user.settings) : {}
    };
    
    res.json({ user: userData });
  });
});

// Rutas para configuraciones de usuario
app.get('/user/settings', authenticateToken, (req, res) => {
  db.get('SELECT settings FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const settings = row.settings ? JSON.parse(row.settings) : {};
    res.json({ settings });
  });
});

app.put('/user/settings', authenticateToken, (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    return res.status(400).json({ error: 'Configuraciones requeridas' });
  }

  db.run(
    'UPDATE users SET settings = ? WHERE id = ?',
    [JSON.stringify(settings), req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.put('/user/profile', authenticateToken, (req, res) => {
  const { name, email, profileImage } = req.body;
  
  db.run(
    'UPDATE users SET name = ?, email = ?, profileImage = ? WHERE id = ?',
    [name, email, profileImage, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.put('/user/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Contraseña actual y nueva contraseña son requeridas' });
  }

  // Verificar contraseña actual
  db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    try {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedNewPassword, req.user.id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ updated: this.changes });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar contraseña' });
    }
  });
});

// CRUD Clientes (requieren autenticación)
app.get('/clients', authenticateToken, (req, res) => {
  db.all('SELECT * FROM clients WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/clients', authenticateToken, (req, res) => {
  const { id, name, status, type, createdAt, lastInteraction } = req.body;
  db.run(
    'INSERT INTO clients (id, userId, name, status, type, createdAt, lastInteraction) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, name, status, type, createdAt, lastInteraction],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id });
    }
  );
});

app.put('/clients/:id', authenticateToken, (req, res) => {
  const { name, status, type, stage, contacts } = req.body;
  const findQuery = 'SELECT * FROM clients WHERE id = ? AND userId = ?';
  db.get(findQuery, [req.params.id, req.user.id], (err, oldClient) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!oldClient) return res.status(404).json({ error: 'Cliente no encontrado' });

    const query = 'UPDATE clients SET name = ?, status = ?, type = ?, stage = ?, contacts = ?, lastInteraction = ? WHERE id = ?';
    db.run(query, [name, status, type, stage, JSON.stringify(contacts), new Date(), req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Generar notificación si cambia el estado
      if (oldClient.status !== status) {
        const notifMsg = `El estado de ${name} cambió a ${status}.`;
        db.run('INSERT INTO notifications (userId, type, message, link) VALUES (?, ?, ?, ?)', [req.user.id, 'status_change', notifMsg, `/clients/${req.params.id}`]);
      }

      // Generar notificación si cambia la etapa
      if (oldClient.stage !== stage) {
        const notifMsg = `La etapa de ${name} cambió a ${stage}.`;
        db.run('INSERT INTO notifications (userId, type, message, link) VALUES (?, ?, ?, ?)', [req.user.id, 'stage_change', notifMsg, `/clients/${req.params.id}`]);
      }

      res.sendStatus(200);
    });
  });
});

app.delete('/clients/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM clients WHERE id=? AND userId=?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// CRUD Contactos (requieren autenticación)
app.get('/contacts', authenticateToken, (req, res) => {
  db.all(`
    SELECT c.* FROM contacts c
    INNER JOIN clients cl ON c.clientId = cl.id
    WHERE cl.userId = ?
  `, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/contacts', authenticateToken, (req, res) => {
  const { id, clientId, name, email, phone } = req.body;
  
  // Verificar que el cliente pertenece al usuario
  db.get('SELECT id FROM clients WHERE id = ? AND userId = ?', [clientId, req.user.id], (err, client) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!client) return res.status(403).json({ error: 'Cliente no encontrado o no autorizado' });
    
    db.run(
      'INSERT INTO contacts (id, clientId, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      [id, clientId, name, email, phone],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
      }
    );
  });
});

app.put('/contacts/:id', authenticateToken, (req, res) => {
  const { name, email, phone } = req.body;
  
  // Verificar que el contacto pertenece a un cliente del usuario
  db.get(`
    SELECT c.id FROM contacts c
    INNER JOIN clients cl ON c.clientId = cl.id
    WHERE c.id = ? AND cl.userId = ?
  `, [req.params.id, req.user.id], (err, contact) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!contact) return res.status(403).json({ error: 'Contacto no encontrado o no autorizado' });
    
    db.run(
      'UPDATE contacts SET name=?, email=?, phone=? WHERE id=?',
      [name, email, phone, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
      }
    );
  });
});

app.delete('/contacts/:id', authenticateToken, (req, res) => {
  // Verificar que el contacto pertenece a un cliente del usuario
  db.get(`
    SELECT c.id FROM contacts c
    INNER JOIN clients cl ON c.clientId = cl.id
    WHERE c.id = ? AND cl.userId = ?
  `, [req.params.id, req.user.id], (err, contact) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!contact) return res.status(403).json({ error: 'Contacto no encontrado o no autorizado' });
    
    db.run('DELETE FROM contacts WHERE id=?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });
});

// CRUD Conversaciones (requieren autenticación)
app.get('/conversations', authenticateToken, (req, res) => {
  db.all(`
    SELECT conv.* FROM conversations conv
    INNER JOIN clients cl ON conv.clientId = cl.id
    WHERE cl.userId = ?
  `, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/conversations', authenticateToken, (req, res) => {
  const { id, clientId, type, date, notes, repurchaseOpportunity } = req.body;
  
  // Verificar que el cliente pertenece al usuario
  db.get('SELECT id FROM clients WHERE id = ? AND userId = ?', [clientId, req.user.id], (err, client) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!client) return res.status(403).json({ error: 'Cliente no encontrado o no autorizado' });
    
    db.run(
      'INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES (?, ?, ?, ?, ?, ?)',
      [id, clientId, type, date, notes, repurchaseOpportunity ? 1 : 0],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
      }
    );
  });
});

app.put('/conversations/:id', authenticateToken, (req, res) => {
  const { type, date, notes, repurchaseOpportunity } = req.body;
  
  // Verificar que la conversación pertenece a un cliente del usuario
  db.get(`
    SELECT conv.id FROM conversations conv
    INNER JOIN clients cl ON conv.clientId = cl.id
    WHERE conv.id = ? AND cl.userId = ?
  `, [req.params.id, req.user.id], (err, conversation) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!conversation) return res.status(403).json({ error: 'Conversación no encontrada o no autorizada' });
    
    db.run(
      'UPDATE conversations SET type=?, date=?, notes=?, repurchaseOpportunity=? WHERE id=?',
      [type, date, notes, repurchaseOpportunity ? 1 : 0, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
      }
    );
  });
});

app.delete('/conversations/:id', authenticateToken, (req, res) => {
  // Verificar que la conversación pertenece a un cliente del usuario
  db.get(`
    SELECT conv.id FROM conversations conv
    INNER JOIN clients cl ON conv.clientId = cl.id
    WHERE conv.id = ? AND cl.userId = ?
  `, [req.params.id, req.user.id], (err, conversation) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!conversation) return res.status(403).json({ error: 'Conversación no encontrada o no autorizada' });
    
    db.run('DELETE FROM conversations WHERE id=?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: this.changes });
    });
  });
});

// Obtener notificaciones
app.get('/api/notifications', authenticateToken, (req, res) => {
  db.all('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Marcar como leída
app.post('/api/notifications/:id/read', authenticateToken, (req, res) => {
  db.run('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Notificación no encontrada o sin permiso.' });
    res.sendStatus(200);
  });
});

// Marcar todas como leídas
app.post('/api/notifications/read-all', authenticateToken, (req, res) => {
  db.run('UPDATE notifications SET isRead = 1 WHERE userId = ?', [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});

// Al crear conversación
app.post('/api/conversations', authenticateToken, (req, res) => {
  const { clientId, type, date, notes, repurchaseOpportunity } = req.body;
  const clientNameQuery = 'SELECT name FROM clients WHERE id = ?';
  db.get(clientNameQuery, [clientId], (err, client) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const query = 'INSERT INTO conversations (clientId, type, date, notes, repurchaseOpportunity, userId) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(query, [clientId, type, date, notes, repurchaseOpportunity, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Generar notificación
      const notifMsg = `Nueva conversación de ${type} con ${client?.name || 'un cliente'}.`;
      db.run('INSERT INTO notifications (userId, type, message, link) VALUES (?, ?, ?, ?)', [req.user.id, 'new_conversation', notifMsg, `/clients/${clientId}`]);

      res.status(201).json({ id: this.lastID });
    });
  });
});

// Al actualizar cliente (ej: cambio de estado)
app.put('/api/clients/:id', authenticateToken, (req, res) => {
  const { name, status, type, stage, contacts } = req.body;
  const findQuery = 'SELECT * FROM clients WHERE id = ? AND userId = ?';
  db.get(findQuery, [req.params.id, req.user.id], (err, oldClient) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!oldClient) return res.status(404).json({ error: 'Cliente no encontrado' });

    const query = 'UPDATE clients SET name = ?, status = ?, type = ?, stage = ?, contacts = ?, lastInteraction = ? WHERE id = ?';
    db.run(query, [name, status, type, stage, JSON.stringify(contacts), new Date(), req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Generar notificación si cambia el estado
      if (oldClient.status !== status) {
        const notifMsg = `El estado de ${name} cambió a ${status}.`;
        db.run('INSERT INTO notifications (userId, type, message, link) VALUES (?, ?, ?, ?)', [req.user.id, 'status_change', notifMsg, `/clients/${req.params.id}`]);
      }

      // Generar notificación si cambia la etapa
      if (oldClient.stage !== stage) {
        const notifMsg = `La etapa de ${name} cambió a ${stage}.`;
        db.run('INSERT INTO notifications (userId, type, message, link) VALUES (?, ?, ?, ?)', [req.user.id, 'stage_change', notifMsg, `/clients/${req.params.id}`]);
      }

      res.sendStatus(200);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
}); 