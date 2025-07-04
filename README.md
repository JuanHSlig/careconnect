# CAREConnect - Un CRM para la Gestión de Clientes

CAREConnect es una aplicación CRM (Customer Relationship Management) diseñada para ayudar a los equipos a gestionar las interacciones con sus clientes de manera eficiente. Permite registrar conversaciones, administrar una base de datos de clientes, visualizar métricas clave y seguir el "viaje del cliente" a través de diferentes etapas.

## ✨ Funcionalidades Principales

La aplicación está construida con un stack moderno y se centra en una experiencia de usuario clara y productiva.

### 1. **Registro de Conversaciones**
- **Formulario simple e intuitivo** para registrar cada interacción.
- **Campos clave**: Cliente, tipo de conversación (Estratégica, Preventa, Posventa), fecha, notas y potencial de recompra.
- **Guardado instantáneo** y actualización de la fecha de última interacción del cliente.

### 2. **Gestión de Clientes**
- **CRUD completo** para clientes.
- **Información detallada**: Nombre, estado (Activo, Dormido), tipo (Ordinario, Premium) y etapa del journey (Desconocido, Prospecto, Cliente, Facturado).
- **Múltiples contactos** por cliente, con nombre, email y teléfono.

### 3. **Dashboard de Métricas CARE**
- **Visualización de datos clave** en tarjetas modernas.
- **Métricas importantes**: Total de conversaciones, distribución por tipo, estado de clientes y oportunidades de recompra.
- **Gráficos simples** para un entendimiento rápido del estado del negocio.
- **Actividad Reciente**: Un feed con las últimas interacciones para estar siempre al día.

### 4. **Customer Journey Visual**
- **Línea de tiempo** que muestra la progresión de un cliente a través de las etapas: `Desconocido` → `Prospecto` → `Cliente` → `Facturado`.
- **Identificación clara** de la etapa actual de cada cliente.

### 5. **Sistema de Notificaciones**
- **Notificaciones en tiempo real** dentro de la app.
- **Alertas automáticas** para eventos importantes:
  - Nueva conversación registrada.
  - Cambio en el estado o etapa de un cliente.
- **Panel de notificaciones** con contador de no leídas y opción de "marcar todo como leído".

### 6. **Personalización y Temas**
- **Modo claro y oscuro** para adaptarse a las preferencias del usuario.
- **Selector de temas** con paletas de colores predefinidas y la opción de crear un tema personalizado.
- **Configuración de perfil**, incluyendo cambio de contraseña y avatar.

## 🛠️ Stack Tecnológico

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js con Express.
- **Base de Datos**: SQLite para simplicidad y portabilidad.
- **Autenticación**: Basada en JWT (JSON Web Tokens).

## 🚀 Cómo Empezar

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [npm](https://www.npmjs.com/) (generalmente se instala con Node.js)

### Pasos de Instalación

1.  **Clona el repositorio** (o descarga el código fuente).
    ```bash
    git clone <URL-DEL-REPOSITORIO>
    cd careconnect
    ```

2.  **Instala las dependencias** del proyecto. Esto instalará tanto las dependencias del servidor (Express) como las del cliente (React).
    ```bash
    npm install
    ```

3.  **Inicia el servidor backend**. Abrirá el servidor en `http://localhost:4000`. La primera vez que se ejecute, creará el archivo de base de datos `careconnect.db` con datos de ejemplo.
    ```bash
    node server/index.js
    ```
    
    *Nota: Si realizas cambios en la estructura de la base de datos en `server/index.js`, puede que necesites borrar el archivo `careconnect.db` para que se regenere correctamente.*

4.  **Inicia la aplicación frontend**. En otra terminal, ejecuta el siguiente comando. Esto abrirá la aplicación en `http://localhost:3000`.
    ```bash
    npm start
    ```

¡Y listo! Ahora puedes acceder a la aplicación en tu navegador.

### Usuarios de Ejemplo
La aplicación se inicializa con tres usuarios para que puedas probar las diferentes funcionalidades y temas:
- **Usuario**: `admin` / **Contraseña**: `admin123`
- **Usuario**: `vendedor` / **Contraseña**: `vendedor123`
- **Usuario**: `gerente` / **Contraseña**: `gerente123` 