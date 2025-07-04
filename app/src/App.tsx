import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon, Users, MessageCircle, BarChart2, Activity, LogOut, User, Settings } from 'lucide-react';
import clsx from 'clsx';
import { ClientList } from './components/ClientForm/ClientList';
import { ConversationList } from './components/ConversationForm/ConversationList';
import { Dashboard } from './components/Dashboard/Dashboard';
import { CustomerJourney } from './components/CustomerJourney/CustomerJourney';
import { Login } from './components/Auth/Login';
import { Settings as SettingsComponent } from './components/Settings/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationBell } from './components/Notifications/NotificationBell';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={20} /> },
  { key: 'clients', label: 'Clientes', icon: <Users size={20} /> },
  { key: 'conversations', label: 'Conversaciones', icon: <MessageCircle size={20} /> },
  { key: 'journey', label: 'Customer Journey', icon: <Activity size={20} /> },
  { key: 'settings', label: 'Configuración', icon: <Settings size={20} /> },
];

// --- Theme Context ---
export type ThemeName = 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'custom';
export interface CustomTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}
interface ThemeContextType {
  theme: ThemeName;
  customTheme: CustomTheme;
  setTheme: (theme: ThemeName) => void;
  setCustomTheme: (custom: CustomTheme) => void;
}
const defaultCustom: CustomTheme = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
};
const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  customTheme: defaultCustom,
  setTheme: () => {},
  setCustomTheme: () => {},
});
export const useTheme = () => useContext(ThemeContext);

// --- ThemeProvider ---
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(() => (localStorage.getItem('theme') as ThemeName) || 'default');
  const [customTheme, setCustomTheme] = useState<CustomTheme>(() => {
    const saved = localStorage.getItem('customTheme');
    return saved ? JSON.parse(saved) : defaultCustom;
  });
  // Sincroniza con localStorage
  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('customTheme', JSON.stringify(customTheme)); }, [customTheme]);
  return (
    <ThemeContext.Provider value={{ theme, customTheme, setTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

function AppContent() {
  const [view, setView] = useState('dashboard');
  const [dark, setDark] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, customTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    const isDark = document.documentElement.classList.contains('dark');
    // Paletas mucho más oscuras en dark
    const themes = {
      default: {
        light: { primary: '#3B82F6', secondary: '#10B981', accent: '#3B82F6', background: '#F8FAFC', surface: '#FFFFFF', fg: '#1A1A1A' },
        dark:  { primary: '#3B82F6', secondary: '#10B981', accent: '#3B82F6', background: '#101014', surface: '#18181c', fg: '#EAEAEA' }
      },
      ocean: {
        light: { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#0891B2', background: '#F0F9FF', surface: '#E0F2FE', fg: '#1A1A1A' },
        dark:  { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#0891B2', background: '#10141a', surface: '#18222a', fg: '#EAEAEA' }
      },
      forest: {
        light: { primary: '#059669', secondary: '#10B981', accent: '#047857', background: '#F0FDF4', surface: '#DCFCE7', fg: '#1A1A1A' },
        dark:  { primary: '#059669', secondary: '#10B981', accent: '#047857', background: '#10181a', surface: '#18241e', fg: '#EAEAEA' }
      },
      sunset: {
        light: { primary: '#F59E0B', secondary: '#EF4444', accent: '#DC2626', background: '#FFFBEB', surface: '#FEF3C7', fg: '#1A1A1A' },
        dark:  { primary: '#F59E0B', secondary: '#EF4444', accent: '#DC2626', background: '#18120b', surface: '#231a10', fg: '#EAEAEA' }
      },
      purple: {
        light: { primary: '#8B5CF6', secondary: '#A855F7', accent: '#7C3AED', background: '#FAF5FF', surface: '#F3E8FF', fg: '#1A1A1A' },
        dark:  { primary: '#8B5CF6', secondary: '#A855F7', accent: '#7C3AED', background: '#18142a', surface: '#231a47', fg: '#EAEAEA' }
      }
    };
    // Tema personalizado: fondo dark fijo muy oscuro
    if (theme === 'custom') {
      const t = isDark
        ? {
            primary: customTheme.primary,
            secondary: customTheme.secondary,
            accent: customTheme.accent,
            background: '#18181c',
            surface: '#23232a',
            fg: '#EAEAEA'
          }
        : {
            primary: customTheme.primary,
            secondary: customTheme.secondary,
            accent: customTheme.accent,
            background: customTheme.background,
            surface: customTheme.surface,
            fg: '#1A1A1A'
          };
      document.documentElement.style.setProperty('--primary', t.primary);
      document.documentElement.style.setProperty('--secondary', t.secondary);
      document.documentElement.style.setProperty('--accent', t.accent);
      document.documentElement.style.setProperty('--bg', t.background);
      document.documentElement.style.setProperty('--bg-secondary', t.surface);
      document.documentElement.style.setProperty('--main-bg', t.background);
      document.documentElement.style.setProperty('--fg', t.fg);
    } else {
      const themeKey = (theme in themes ? theme : 'default') as keyof typeof themes;
      const t = isDark ? themes[themeKey].dark : themes[themeKey].light;
      document.documentElement.style.setProperty('--primary', t.primary);
      document.documentElement.style.setProperty('--secondary', t.secondary);
      document.documentElement.style.setProperty('--accent', t.accent);
      document.documentElement.style.setProperty('--bg', t.background);
      document.documentElement.style.setProperty('--bg-secondary', t.surface);
      document.documentElement.style.setProperty('--main-bg', t.background);
      document.documentElement.style.setProperty('--fg', t.fg);
    }
  }, [dark, theme, customTheme]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppProvider>
      <NotificationProvider>
        <div className={clsx('flex flex-col md:flex-row min-h-screen font-vibe', dark ? 'text-white' : 'text-gray-900')}>
          <aside className="w-full md:w-60 flex flex-col gap-2 p-4 bg-white/80 dark:bg-gray-800/80 shadow-xl">
            <div className="text-2xl font-bold mb-8 tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-vibePurple to-vibePink bg-clip-text text-transparent">CAREConnect</span>
            </div>
            
            {/* Información del usuario */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user?.email}
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {NAV.map(item => (
                <button
                  key={item.key}
                  className={clsx('flex items-center gap-3 px-4 py-2 rounded-lg transition-all',
                    view === item.key ? 'bg-vibePurple text-white shadow' : 'hover:bg-vibePink/20 dark:hover:bg-vibePurple/20')}
                  onClick={() => setView(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-auto flex items-center gap-2">
              <NotificationBell />
              <button
                className="p-2 rounded-full hover:bg-vibePink/20 dark:hover:bg-vibePurple/20 transition"
                onClick={() => setDark(d => !d)}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun /> : <Moon />}
              </button>
            </div>
            
            <div className="mt-auto flex flex-col gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
          <main className="flex-1 p-8 overflow-y-auto main-bg w-full">
            {view === 'dashboard' && <Dashboard />}
            {view === 'clients' && <ClientList />}
            {view === 'conversations' && <ConversationList />}
            {view === 'journey' && <CustomerJourney />}
            {view === 'settings' && <SettingsComponent />}
          </main>
        </div>
      </NotificationProvider>
    </AppProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
