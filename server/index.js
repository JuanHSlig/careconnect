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
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    status TEXT,
    type TEXT,
    createdAt TEXT,
    lastInteraction TEXT,
    FOREIGN KEY (userId) REFERENCES users (id)
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
      db.run(`INSERT INTO clients (id, userId, name, status, type, createdAt, lastInteraction) VALUES
        ('c1', 'u1', 'Acme Corp', 'active', 'premium', '2024-01-01', '2024-06-01'),
        ('c2', 'u1', 'Beta S.A.', 'dormant', 'ordinary', '2024-02-15', '2024-05-10'),
        ('c3', 'u1', 'Gamma Ltd', 'active', 'ordinary', '2024-03-10', '2024-06-05'),
        ('c4', 'u1', 'Delta Industries', 'active', 'premium', '2024-04-01', '2024-06-10')
      `);
      
      // Datos de ejemplo para el usuario vendedor (u2)
      db.run(`INSERT INTO clients (id, userId, name, status, type, createdAt, lastInteraction) VALUES
        ('c5', 'u2', 'TechStart Inc', 'active', 'premium', '2024-01-20', '2024-06-02'),
        ('c6', 'u2', 'Green Solutions', 'active', 'ordinary', '2024-02-10', '2024-05-28'),
        ('c7', 'u2', 'Innovate Labs', 'dormant', 'ordinary', '2024-03-05', '2024-04-15'),
        ('c8', 'u2', 'Future Systems', 'active', 'premium', '2024-04-20', '2024-06-08')
      `);
      
      // Datos de ejemplo para el usuario gerente (u3)
      db.run(`INSERT INTO clients (id, userId, name, status, type, createdAt, lastInteraction) VALUES
        ('c9', 'u3', 'MegaCorp', 'active', 'premium', '2024-02-05', '2024-06-05'),
        ('c10', 'u3', 'Global Enterprises', 'active', 'premium', '2024-02-20', '2024-06-01'),
        ('c11', 'u3', 'Strategic Partners', 'active', 'ordinary', '2024-03-15', '2024-05-30'),
        ('c12', 'u3', 'Elite Solutions', 'dormant', 'ordinary', '2024-04-10', '2024-05-20')
      `);
      
      // Contactos para usuario admin
      db.run(`INSERT INTO contacts (id, clientId, name, email, phone) VALUES
        ('ct1', 'c1', 'Ana Pérez', 'ana@acme.com', '555-1234'),
        ('ct2', 'c1', 'Luis Gómez', 'luis@acme.com', '555-5678'),
        ('ct3', 'c2', 'Marta Ruiz', 'marta@beta.com', '555-8765'),
        ('ct4', 'c3', 'Carlos Díaz', 'carlos@gamma.com', '555-4321'),
        ('ct5', 'c4', 'Elena Morales', 'elena@delta.com', '555-9876')
      `);
      
      // Contactos para usuario vendedor
      db.run(`INSERT INTO contacts (id, clientId, name, email, phone) VALUES
        ('ct6', 'c5', 'Roberto Silva', 'roberto@techstart.com', '555-1111'),
        ('ct7', 'c5', 'Carmen Vega', 'carmen@techstart.com', '555-2222'),
        ('ct8', 'c6', 'Diego Mendoza', 'diego@greensolutions.com', '555-3333'),
        ('ct9', 'c7', 'Patricia López', 'patricia@innovatelabs.com', '555-4444'),
        ('ct10', 'c8', 'Fernando Torres', 'fernando@futuresystems.com', '555-5555')
      `);
      
      // Contactos para usuario gerente
      db.run(`INSERT INTO contacts (id, clientId, name, email, phone) VALUES
        ('ct11', 'c9', 'Sofía Ramírez', 'sofia@megacorp.com', '555-6666'),
        ('ct12', 'c9', 'Miguel Ángel', 'miguel@megacorp.com', '555-7777'),
        ('ct13', 'c10', 'Isabella Castro', 'isabella@globalenterprises.com', '555-8888'),
        ('ct14', 'c11', 'Alejandro Ruiz', 'alejandro@strategicpartners.com', '555-9999'),
        ('ct15', 'c12', 'Valentina Herrera', 'valentina@elitesolutions.com', '555-0000')
      `);
      
      // Conversaciones para usuario admin
      db.run(`INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES
        ('conv1', 'c1', 'strategic', '2024-01-10', 'Kickoff inicial del proyecto', 0),
        ('conv2', 'c1', 'presale', '2024-02-05', 'Presentación de propuesta comercial', 1),
        ('conv3', 'c1', 'postsale', '2024-03-15', 'Seguimiento postventa y soporte', 0),
        ('conv4', 'c1', 'strategic', '2024-04-20', 'Reunión estratégica trimestral', 1),
        ('conv5', 'c2', 'presale', '2024-02-20', 'Primera llamada de prospección', 0),
        ('conv6', 'c2', 'postsale', '2024-03-25', 'Soporte técnico y resolución de dudas', 0),
        ('conv7', 'c3', 'strategic', '2024-03-15', 'Onboarding y capacitación inicial', 0),
        ('conv8', 'c3', 'strategic', '2024-04-10', 'Revisión de objetivos y KPIs', 1),
        ('conv9', 'c3', 'postsale', '2024-05-05', 'Feedback de satisfacción del cliente', 0),
        ('conv10', 'c4', 'presale', '2024-04-15', 'Presentación de soluciones personalizadas', 1)
      `);
      
      // Conversaciones para usuario vendedor
      db.run(`INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES
        ('conv11', 'c5', 'strategic', '2024-01-25', 'Análisis de necesidades del cliente', 0),
        ('conv12', 'c5', 'presale', '2024-02-15', 'Demo de productos y servicios', 1),
        ('conv13', 'c5', 'postsale', '2024-03-20', 'Implementación y configuración', 0),
        ('conv14', 'c6', 'presale', '2024-02-12', 'Propuesta de soluciones verdes', 1),
        ('conv15', 'c6', 'postsale', '2024-03-18', 'Seguimiento de implementación', 0),
        ('conv16', 'c7', 'strategic', '2024-03-08', 'Evaluación de oportunidades', 0),
        ('conv17', 'c8', 'presale', '2024-04-25', 'Presentación de innovaciones tecnológicas', 1),
        ('conv18', 'c8', 'postsale', '2024-05-10', 'Capacitación del equipo', 0)
      `);
      
      // Conversaciones para usuario gerente
      db.run(`INSERT INTO conversations (id, clientId, type, date, notes, repurchaseOpportunity) VALUES
        ('conv19', 'c9', 'strategic', '2024-02-10', 'Reunión ejecutiva de alto nivel', 1),
        ('conv20', 'c9', 'presale', '2024-03-01', 'Presentación de soluciones empresariales', 1),
        ('conv21', 'c9', 'postsale', '2024-04-05', 'Seguimiento de implementación corporativa', 0),
        ('conv22', 'c10', 'strategic', '2024-02-25', 'Análisis de mercado global', 1),
        ('conv23', 'c10', 'presale', '2024-03-15', 'Propuesta de expansión internacional', 1),
        ('conv24', 'c11', 'presale', '2024-03-20', 'Alianza estratégica', 0),
        ('conv25', 'c11', 'postsale', '2024-04-25', 'Seguimiento de colaboración', 0),
        ('conv26', 'c12', 'strategic', '2024-04-15', 'Evaluación de renovación de contrato', 0)
      `);
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
  const { name, status, type, lastInteraction } = req.body;
  db.run(
    'UPDATE clients SET name=?, status=?, type=?, lastInteraction=? WHERE id=? AND userId=?',
    [name, status, type, lastInteraction, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
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

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
}); 