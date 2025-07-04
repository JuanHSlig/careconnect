# CAREConnect

Aplicación web para la gestión de relaciones con clientes basada en la métrica CARE (Cuidar, Activar Conversaciones, Relaciones Estratégicas). Desarrollada para el Torneo de Vibe Coding.

## 🚀 Instalación y ejecución

1. Instala las dependencias:
   ```sh
   cd app
   npm install
   ```
2. Inicia la aplicación en modo desarrollo:
   ```sh
   npm start
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧩 Funcionalidades principales

- **Gestión de clientes:**
  - CRUD de clientes (nombre, estado, tipo, contactos, última interacción)
  - Múltiples contactos por cliente
- **Registro de conversaciones:**
  - Formulario para registrar conversaciones (cliente, tipo, fecha, notas, potencial de recompra)
  - Listado de conversaciones
- **Dashboard de métricas CARE:**
  - Cards y gráficos con métricas principales (total de conversaciones, por tipo, distribución de clientes, duración promedio de relaciones, oportunidades de recompra)
- **Customer Journey:**
  - Línea de tiempo visual y vista tabular del progreso e interacciones de cada cliente
- **Persistencia:**
  - Todos los datos se guardan en localStorage (no requiere backend)
- **Diseño "Vibe Coding":**
  - Colores vibrantes, gradientes, animaciones, modo oscuro, micro-interacciones, responsive
- **Usabilidad para no técnicos:**
  - Navegación clara, formularios explicativos, botones grandes, feedback visual, confirmaciones
- **Creatividad:**
  - Gamificación (badges), mensajes motivacionales, celebraciones visuales (confetti), integración Giphy, easter eggs, tema personalizable, atajos de teclado

## 📁 Estructura de archivos

```
src/
├── components/
│   ├── Dashboard/
│   ├── ClientForm/
│   ├── ConversationForm/
│   ├── CustomerJourney/
│   └── common/ (Button, Modal, etc.)
├── contexts/
│   └── AppContext.tsx
├── types/
│   └── index.ts
├── utils/
│   └── storage.ts
└── App.tsx
```

## 📝 Tipos principales (TypeScript)

```typescript
interface Client {
  id: string;
  name: string;
  status: 'active' | 'dormant' | 'unknown';
  type: 'ordinary' | 'premium';
  contacts: Contact[];
  createdAt: Date;
  lastInteraction?: Date;
}

interface Conversation {
  id: string;
  clientId: string;
  type: 'strategic' | 'presale' | 'postsale';
  date: Date;
  notes: string;
  repurchaseOpportunity: boolean;
}
```

## 🧪 Pruebas de funcionalidades

1. **Clientes:**
   - Agrega, edita y elimina clientes.
   - Añade varios contactos por cliente.
   - Verifica la fecha de última interacción.
2. **Conversaciones:**
   - Registra nuevas conversaciones y verifica su aparición en el listado.
   - Marca oportunidades de recompra.
3. **Dashboard:**
   - Visualiza métricas y gráficos.
4. **Customer Journey:**
   - Consulta la línea de tiempo y el historial de cada cliente.
5. **Creatividad:**
   - Desbloquea badges, busca mensajes motivacionales, prueba atajos y busca easter eggs.

## 📦 Build de producción

```sh
npm run build
```

## 🏆 Requisitos de entrega
- Repositorio público en GitHub
- README completo y en español
- Código limpio y comentado
- Demo funcional desplegable

---

**Objetivo:** Crear una herramienta intuitiva, visualmente atractiva y creativa para líderes de áreas, reflejando el espíritu "vibe coding".
