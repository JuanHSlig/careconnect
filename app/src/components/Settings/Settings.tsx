import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Camera, 
  Palette, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSettings, updateUserSettings, updateUserProfile, updateUserPassword } from '../../utils/api';
import { useTheme, ThemeName, CustomTheme } from '../../App';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

const defaultThemes = {
  default: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#3B82F6',
    background: '#F8FAFC',
    surface: '#FFFFFF'
  },
  ocean: {
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    accent: '#0891B2',
    background: '#F0F9FF',
    surface: '#E0F2FE'
  },
  forest: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#047857',
    background: '#F0FDF4',
    surface: '#DCFCE7'
  },
  sunset: {
    primary: '#F59E0B',
    secondary: '#EF4444',
    accent: '#DC2626',
    background: '#FFFBEB',
    surface: '#FEF3C7'
  },
  purple: {
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#7C3AED',
    background: '#FAF5FF',
    surface: '#F3E8FF'
  }
};

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, customTheme, setTheme, setCustomTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    displayName: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: true,
      reminders: true
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false
    },
    theme: 'default' as keyof typeof defaultThemes | 'custom',
    customTheme: defaultThemes.default
  });

  // Cargar configuraciones guardadas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getUserSettings();
        if (response.settings) {
          const savedSettings = response.settings;
          setSettings(prev => ({
            ...prev,
            ...savedSettings,
            displayName: user?.name || prev.displayName,
            email: user?.email || prev.email
          }));
          
          // Aplicar tema guardado
          if (savedSettings.theme) {
            if (savedSettings.theme === 'custom' && savedSettings.customTheme) {
              document.documentElement.style.setProperty('--primary', savedSettings.customTheme.primary);
              document.documentElement.style.setProperty('--secondary', savedSettings.customTheme.secondary);
              document.documentElement.style.setProperty('--accent', savedSettings.customTheme.accent);
              document.documentElement.style.setProperty('--bg', savedSettings.customTheme.background);
              document.documentElement.style.setProperty('--bg-secondary', savedSettings.customTheme.surface);
            } else if (savedSettings.theme in defaultThemes) {
              const theme = defaultThemes[savedSettings.theme as keyof typeof defaultThemes];
              document.documentElement.style.setProperty('--primary', theme.primary);
              document.documentElement.style.setProperty('--secondary', theme.secondary);
              document.documentElement.style.setProperty('--accent', theme.accent);
              document.documentElement.style.setProperty('--bg', theme.background);
              document.documentElement.style.setProperty('--bg-secondary', theme.surface);
            }
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const applyTheme = (themeName: keyof typeof defaultThemes | 'custom') => {
    const isDark = document.documentElement.classList.contains('dark');
    if (themeName === 'custom') {
      document.documentElement.style.setProperty('--primary', customTheme.primary);
      document.documentElement.style.setProperty('--secondary', customTheme.secondary);
      document.documentElement.style.setProperty('--accent', customTheme.accent);
      if (isDark) {
        // Oscurecer los fondos personalizados en dark
        document.documentElement.style.setProperty('--bg', '#181f2a');
        document.documentElement.style.setProperty('--bg-secondary', '#232b3a');
        document.documentElement.style.setProperty('--main-bg', '#181f2a');
      } else {
        document.documentElement.style.setProperty('--bg', customTheme.background);
        document.documentElement.style.setProperty('--bg-secondary', customTheme.surface);
        document.documentElement.style.setProperty('--main-bg', customTheme.background);
      }
    } else if (themeName in defaultThemes) {
      const theme = defaultThemes[themeName];
      document.documentElement.style.setProperty('--primary', theme.primary);
      document.documentElement.style.setProperty('--secondary', theme.secondary);
      document.documentElement.style.setProperty('--accent', theme.accent);
      document.documentElement.style.setProperty('--bg', theme.background);
      document.documentElement.style.setProperty('--bg-secondary', theme.surface);
      document.documentElement.style.setProperty('--main-bg', theme.background);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Guardar configuración del perfil
      if (settings.displayName !== user?.name || settings.email !== user?.email || profileImage) {
        await updateUserProfile({
          name: settings.displayName,
          email: settings.email,
          profileImage: profileImage
        });
      }

      // Guardar configuración de contraseña
      if (settings.currentPassword && settings.newPassword) {
        if (settings.newPassword !== settings.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        await updateUserPassword({
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword
        });
      }

      // Guardar configuraciones generales
      await updateUserSettings({
        theme: theme,
        customTheme: customTheme,
        notifications: settings.notifications,
        privacy: settings.privacy
      });
      
      alert('Configuración guardada exitosamente');
      
      // Limpiar campos de contraseña
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      alert(error.message || 'Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: <User className="h-4 w-4" /> },
    { id: 'appearance', label: 'Apariencia', icon: <Palette className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacidad', icon: <Shield className="h-4 w-4" /> }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left',
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                )}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Información del Perfil</h2>
                
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Foto de perfil</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JPG, PNG o GIF. Máximo 5MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cambiar contraseña</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.currentPassword}
                          onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nueva contraseña
                        </label>
                        <input
                          type="password"
                          value={settings.newPassword}
                          onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirmar nueva contraseña
                        </label>
                        <input
                          type="password"
                          value={settings.confirmPassword}
                          onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personalización de Apariencia</h2>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temas predefinidos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(defaultThemes).map(([tKey, tVal]) => (
                      <button
                        key={tKey}
                        onClick={() => {
                          setTheme(tKey as ThemeName);
                          applyTheme(tKey as ThemeName);
                        }}
                        className={clsx(
                          'p-4 rounded-lg border-2 transition-all',
                          theme === tKey
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tVal.primary }}></div>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{tKey}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 rounded" style={{ backgroundColor: tVal.primary }}></div>
                          <div className="h-2 rounded" style={{ backgroundColor: tVal.secondary }}></div>
                          <div className="h-2 rounded" style={{ backgroundColor: tVal.accent }}></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tema personalizado</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(customTheme).map(([key, value]) => (
                      <div key={key} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg flex flex-col items-stretch">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                          {key === 'primary' ? 'Color Principal' :
                           key === 'secondary' ? 'Color Secundario' :
                           key === 'accent' ? 'Color de Acento' :
                           key === 'background' ? 'Color De Fondo' :
                           'Color De Superficie'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => {
                              setCustomTheme({ ...customTheme, [key]: e.target.value });
                              setTimeout(() => applyTheme('custom'), 100);
                            }}
                            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              setCustomTheme({ ...customTheme, [key]: e.target.value });
                              setTimeout(() => applyTheme('custom'), 100);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuración de Notificaciones</h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                          {key === 'email' ? 'Notificaciones por email' : 
                           key === 'push' ? 'Notificaciones push' : 
                           'Recordatorios'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {key === 'email' ? 'Recibe actualizaciones importantes por email' :
                           key === 'push' ? 'Notificaciones en tiempo real en tu navegador' :
                           'Recordatorios de tareas pendientes'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, [key]: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuración de Privacidad</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Visibilidad del perfil</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Controla quién puede ver tu información de perfil
                    </p>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisibility: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Público</option>
                      <option value="private">Privado</option>
                      <option value="contacts">Solo contactos</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Compartir datos de uso</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Permite que CAREConnect use datos anónimos para mejorar el servicio
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, dataSharing: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                onClick={() => {
                  setSettings({
                    displayName: user?.name || '',
                    email: user?.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    notifications: {
                      email: true,
                      push: true,
                      reminders: true
                    },
                    privacy: {
                      profileVisibility: 'public',
                      dataSharing: false
                    },
                    theme: 'default',
                    customTheme: defaultThemes.default
                  });
                  setProfileImage(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Restablecer
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 