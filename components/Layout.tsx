
import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, Users, Scissors,
  DollarSign, BarChart3, Sparkles, Settings,
  CreditCard, Menu, X, LogOut, Moon, Sun,
  Bell, User, Check, ChevronDown, MessageSquare, Plus,
  Copy, ExternalLink, Share2
} from 'lucide-react';
import { ViewMode } from '../types';
import { Badge } from './Badge';
import { Logo } from './Logo';
import { supabase } from '../utils/supabaseClient';


interface LayoutProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface NavItemProps {
  item: any;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

// --- MOCK NOTIFICATIONS DATA ---
const NOTIFICATIONS = [
  { id: 1, title: 'Novo agendamento: Ana Clara', time: 'Há 5 min', isRead: false, type: 'appointment' },
  { id: 2, title: 'Conta de Luz vence amanhã', time: 'Há 2 horas', isRead: false, type: 'alert' },
  { id: 3, title: 'Meta mensal atingida! 🚀', time: 'Há 1 dia', isRead: true, type: 'success' },
];

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick, isMobile = false }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-btn transition-all duration-200 w-full
        ${isActive
          ? 'bg-brand-soft text-brand-primary font-medium'
          : 'text-brand-muted hover:bg-brand-surface hover:text-brand-text'
        }
        ${isActive && !isMobile ? 'border-r-4 border-brand-primary rounded-r-none' : ''}
      `}
    >
      <Icon size={isMobile ? 24 : 20} className={isActive ? 'text-brand-primary' : 'text-brand-muted'} />
      <span className={isMobile ? 'text-xs mt-1' : ''}>{item.label}</span>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, isDarkMode, toggleTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Close dropdowns when clicking outside
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { view: ViewMode.DASHBOARD, label: 'Início', icon: LayoutDashboard },
    { view: ViewMode.SCHEDULE, label: 'Atendimentos', icon: Calendar },
    { view: ViewMode.SERVICES, label: 'Serviços', icon: Scissors },
    { view: ViewMode.CLIENTS, label: 'Clientes', icon: Users },
    { view: ViewMode.COSTS, label: 'Custos', icon: DollarSign },
    { view: ViewMode.REPORTS, label: 'Relatórios', icon: BarChart3 },
    { view: ViewMode.AI_CHAT, label: 'Beautinhos IA', icon: Sparkles },
  ];

  const checkIsActive = (view: ViewMode) => {
    return currentView === view || (view === ViewMode.CLIENTS && currentView === ViewMode.CLIENT_DETAILS);
  };

  const getPageTitle = () => {
    const item = menuItems.find(i => i.view === currentView);
    if (currentView === ViewMode.CLIENT_DETAILS) return 'Detalhes do Cliente';
    if (currentView === ViewMode.SETTINGS) return 'Configurações';
    if (currentView === ViewMode.PLANS) return 'Planos e Assinatura';
    return item ? item.label : 'Agenda.ai';
  };

  const handleCopyLink = () => {
    // Generates a link that actually works in this prototype environment
    const url = `${window.location.origin}${window.location.pathname}?view=public`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length;

  // Reusable Link Widget Component
  const BookingLinkWidget = () => (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-3 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-text font-medium text-xs">
          <Share2 size={14} className="text-brand-primary" />
          <span>Link de Agendamento</span>
        </div>
        <button
          onClick={() => onNavigate(ViewMode.PUBLIC_SERVICE)}
          className="text-[10px] flex items-center gap-1 text-brand-primary hover:underline"
          title="Ver como cliente"
        >
          Prévia <ExternalLink size={10} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 flex items-center overflow-hidden">
          <span className="text-xs text-brand-muted truncate select-all">agenda.beauty/studio-glamour</span>
        </div>
        <button
          onClick={handleCopyLink}
          className={`p-1.5 rounded-lg transition-all ${linkCopied ? 'bg-green-100 text-green-600' : 'bg-brand-soft text-brand-primary hover:bg-brand-primary hover:text-white'}`}
          title="Copiar Link"
        >
          {linkCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-brand-surface font-sans transition-colors duration-300 overflow-hidden">

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-bg border-r border-brand-border h-full transition-colors duration-300 z-20">
        <div className="p-6 flex items-center h-20">
          <Logo size="md" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 py-4 custom-scrollbar">
          {menuItems.map((item) => (
            <NavItem
              key={item.view}
              item={item}
              isActive={checkIsActive(item.view)}
              onClick={() => {
                onNavigate(item.view);
                setIsSidebarOpen(false);
              }}
            />
          ))}
        </div>

        <div className="p-4 border-t border-brand-border space-y-4">
          <BookingLinkWidget />

          <div className="bg-gradient-to-r from-brand-primary to-[#8B5CF6] rounded-card p-4 text-white shadow-lg shadow-brand-primary/10">
            <p className="text-sm font-semibold mb-1">Beauty Pro</p>
            <p className="text-xs opacity-90 mb-3">Sua assinatura expira em 5 dias.</p>
            <button
              onClick={() => onNavigate(ViewMode.PLANS)}
              className="text-xs bg-white/20 hover:bg-white/30 w-full py-1.5 rounded-lg transition-colors font-medium"
            >
              Renovar Agora
            </button>
          </div>
        </div>
      </aside>

      {/* --- RIGHT COLUMN (HEADER + CONTENT) --- */}
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* --- TOP BAR (HEADER) --- */}
        <header className="h-14 md:h-20 bg-brand-bg border-b border-brand-border flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300 sticky top-0 z-30">

          {/* Left: Mobile Menu & Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-brand-text hover:bg-brand-surface rounded-full"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-brand-text truncate">{getPageTitle()}</h1>
          </div>

          {/* Right: Actions (Theme, Notif, Profile) */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Theme Toggle (Desktop only for visual balance) */}
            <button onClick={toggleTheme} className="hidden md:flex p-2 text-brand-muted hover:text-brand-text hover:bg-brand-surface rounded-full transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-soft rounded-full transition-all relative"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-brand-danger rounded-full border-2 border-brand-bg"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-brand-bg border border-brand-border rounded-card shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-4 border-b border-brand-border flex justify-between items-center">
                    <h3 className="font-semibold text-brand-text">Notificações</h3>
                    <button className="text-xs text-brand-primary hover:underline">Marcar lidas</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {NOTIFICATIONS.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-brand-border last:border-0 hover:bg-brand-surface/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-brand-soft/30' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-brand-text">{notif.title}</p>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-1.5"></span>}
                        </div>
                        <p className="text-xs text-brand-muted">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-brand-surface/50 text-center border-t border-brand-border">
                    <button className="text-xs font-medium text-brand-muted hover:text-brand-text">Ver todas</button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full border border-brand-border hover:border-brand-primary transition-colors bg-brand-surface"
              >
                <div className="hidden md:block text-right">
                  <p className="text-xs font-semibold text-brand-text leading-none">Dra. Júlia</p>
                  <p className="text-xs text-brand-muted leading-none mt-1">Profissional</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                  JM
                </div>
                <ChevronDown size={14} className="text-brand-muted hidden md:block mr-1" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-brand-bg border border-brand-border rounded-card shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-4 border-b border-brand-border md:hidden">
                    <p className="font-semibold text-brand-text">Dra. Júlia Martins</p>
                    <p className="text-xs text-brand-muted">julia@agenda.beauty</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { onNavigate(ViewMode.SETTINGS); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-brand-text hover:bg-brand-surface rounded-lg transition-colors">
                      <User size={16} /> Meu Perfil
                    </button>
                    <button onClick={() => { onNavigate(ViewMode.SETTINGS); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-brand-text hover:bg-brand-surface rounded-lg transition-colors">
                      <Settings size={16} /> Configurações
                    </button>
                    <div className="my-1 border-t border-brand-border"></div>
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-brand-text hover:bg-brand-surface rounded-lg transition-colors md:hidden">
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                      {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                    </button>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-brand-danger hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <LogOut size={16} /> Sair
                    </button>

                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20 md:pb-0">
            {children}
          </div>
        </main>

      </div>

      {/* --- MOBILE DRAWER (SIDEBAR) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-3/4 max-w-[300px] bg-brand-bg shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-brand-border">
            <div className="p-6 flex justify-between items-center border-b border-brand-border h-20">
              <Logo size="sm" />
              <button onClick={() => setIsSidebarOpen(false)} className="text-brand-muted hover:text-brand-text bg-brand-surface p-1 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => (
                <NavItem
                  key={item.view}
                  item={item}
                  isMobile={true}
                  isActive={checkIsActive(item.view)}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsSidebarOpen(false);
                  }}
                />
              ))}

              <div className="pt-4">
                <BookingLinkWidget />
              </div>

            </div>

            <div className="p-4 border-t border-brand-border bg-brand-surface/30">
              <button
                onClick={async () => {
                  setIsSidebarOpen(false);
                  await supabase.auth.signOut();
                }}
                className="flex items-center gap-3 px-4 py-3 text-brand-danger w-full font-medium"
              >
                <LogOut size={20} />
                <span>Sair do sistema</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-bg border-t border-brand-border h-[60px] flex justify-around items-center px-2 z-30 transition-colors duration-300 pb-safe">
        <button onClick={() => onNavigate(ViewMode.DASHBOARD)} className={`flex flex-col items-center p-2 ${currentView === ViewMode.DASHBOARD ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-1 font-medium">Início</span>
        </button>
        <button onClick={() => onNavigate(ViewMode.SCHEDULE)} className={`flex flex-col items-center p-2 ${currentView === ViewMode.SCHEDULE ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <Calendar size={20} />
          <span className="text-[10px] mt-1 font-medium">Agenda</span>
        </button>
        <button onClick={() => onNavigate(ViewMode.PUBLIC_SERVICE)} className="flex flex-col items-center p-2 -mt-8">
          <div className="bg-brand-primary text-white p-3 rounded-full shadow-lg shadow-brand-primary/40 ring-4 ring-brand-surface">
            <Plus size={24} />
          </div>
        </button>
        <button onClick={() => onNavigate(ViewMode.CLIENTS)} className={`flex flex-col items-center p-2 ${currentView === ViewMode.CLIENTS ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <Users size={20} />
          <span className="text-[10px] mt-1 font-medium">Clientes</span>
        </button>
        <button onClick={() => onNavigate(ViewMode.AI_CHAT)} className={`flex flex-col items-center p-2 ${currentView === ViewMode.AI_CHAT ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <Sparkles size={20} />
          <span className="text-[10px] mt-1 font-medium">IA</span>
        </button>
      </div>

    </div>
  );
};
