import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, CheckSquare, Square } from 'lucide-react';
import { ModuloAcceso } from '@/types/user';
import { toast } from '@/store/useToastStore';
import UserCreatedModal from './UserCreatedModal';

interface UserFormProps {
  isOpen: boolean;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const AVAILABLE_MODULES: { key: ModuloAcceso; label: string; desc: string; badge?: string }[] = [
  { key: 'SUNAT', label: 'Módulo SUNAT', desc: 'Buzón electrónico y visor de notificaciones' },
  { key: 'SUNAFIL', label: 'Módulo SUNAFIL', desc: 'Casilla electrónica laboral', badge: 'BETA' },
  { key: 'AUDITORIA', label: 'Auditoría del Sistema', desc: 'Logs de seguridad y rastreo de acciones' },
  { key: 'GESTION_EMPRESAS', label: 'Gestión de Empresas', desc: 'Crear, editar y sincronizar empresas' },
];

const EMPTY_USER = {
  nombres: '',
  apellidos: '',
  dni: '',
  password: '',
  rol: 'USUARIO_LOCAL',
  telegramChatId: '',
  modulosPermitidos: ['SUNAT'] as ModuloAcceso[],
};

export const UserForm: React.FC<UserFormProps> = ({ isOpen, onSubmit, onCancel }) => {
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [loading, setLoading] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<{
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    password?: string;
  } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const getAutoEmailPreview = () => {
    const firstInitial = newUser.nombres.trim().charAt(0).toLowerCase();
    const lastName = newUser.apellidos.trim().split(/\s+/)[0]?.toLowerCase() || '';
    const dni = newUser.dni.trim();
    if (!firstInitial && !lastName && !dni) return 'ejemplo@oracon.com';
    return `${firstInitial}${lastName}${dni}@oracon.com`;
  };

  const toggleModule = (moduleKey: ModuloAcceso) => {
    setNewUser(prev => {
      const exists = prev.modulosPermitidos.includes(moduleKey);
      const updated = exists
        ? prev.modulosPermitidos.filter(m => m !== moduleKey)
        : [...prev.modulosPermitidos, moduleKey];
      return { ...prev, modulosPermitidos: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.dni.trim().length !== 8) {
      toast.warning('El DNI debe contener exactamente 8 dígitos.', 'Validación de DNI');
      return;
    }
    const emailPreview = getAutoEmailPreview();
    const tempUserData = {
      nombres: newUser.nombres,
      apellidos: newUser.apellidos,
      email: emailPreview,
      dni: newUser.dni,
      password: newUser.password,
    };

    setLoading(true);
    try {
      await onSubmit(newUser);
      setCreatedUserData(tempUserData);
      setIsSuccessModalOpen(true);
      setNewUser(EMPTY_USER);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear usuario', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewUser(EMPTY_USER);
    onCancel();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative w-full max-w-xl bg-[#111827] rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-indigo-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Crear Nuevo Usuario</h3>
              <p className="text-xs text-gray-400">Ingrese datos del usuario y asigne sus módulos permitidos.</p>
            </div>
          </div>
          <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nombres</label>
              <input
                required
                value={newUser.nombres}
                onChange={e => setNewUser({...newUser, nombres: e.target.value})}
                className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                placeholder="Juan Carlos"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Apellidos</label>
              <input
                required
                value={newUser.apellidos}
                onChange={e => setNewUser({...newUser, apellidos: e.target.value})}
                className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                placeholder="Pérez Gómez"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">DNI (8 dígitos)</label>
              <input
                required
                maxLength={8}
                value={newUser.dni}
                onChange={e => setNewUser({...newUser, dni: e.target.value.replace(/\D/g, '')})}
                className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all font-mono"
                placeholder="74589632"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Contraseña</label>
              <input
                required
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-400">Correo asignado:</span>
            </div>
            <span className="text-xs font-bold text-indigo-300 font-mono">{getAutoEmailPreview()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Rol</label>
              <select
                value={newUser.rol}
                onChange={e => setNewUser({...newUser, rol: e.target.value})}
                className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
              >
                <option value="USUARIO_LOCAL">Usuario</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Telegram Chat ID (Opcional)</label>
              <input
                value={newUser.telegramChatId}
                onChange={e => setNewUser({...newUser, telegramChatId: e.target.value})}
                className="w-full bg-[#1f2937] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                placeholder="Ej: 987654321"
              />
            </div>
          </div>

          {/* ASIGNACIÓN DE MÓDULOS */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Módulos Permitidos para este Usuario
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_MODULES.map(mod => {
                const isChecked = newUser.modulosPermitidos.includes(mod.key);
                return (
                  <div
                    key={mod.key}
                    onClick={() => toggleModule(mod.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{mod.label}</span>
                        {mod.badge && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 rounded font-bold">
                            {mod.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? 'Creando...' : '+ Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  <UserCreatedModal
    isOpen={isSuccessModalOpen}
    onClose={() => {
      setIsSuccessModalOpen(false);
      setCreatedUserData(null);
      onCancel();
    }}
    userData={createdUserData}
  />
</>
  );
};

