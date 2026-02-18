
import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight, ChevronLeft, MapPin, Instagram, Phone, Calendar, ShieldCheck, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Heading1, Heading2, BodyText, Label } from './Typography';
import { ViewMode } from '../types';
import { Logo } from './Logo';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../utils/supabaseClient';


interface AuthProps {
  view: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

// Helper to map camelCase to snake_case for DB
const mapToDbDetails = (data: any) => ({
  business_name: data.businessName,
  slug: data.slug,
  description: data.description,
  cover_color: data.coverColor,
  cover_image: data.coverImage,
  logo: data.logo,
  theme_color: data.themeColor,
  phone: data.phone,
  address: data.address,
  open_days: data.openDays,
  open_time: data.openTime,
  close_time: data.closeTime,
  owner_name: data.ownerName,
  owner_title: data.ownerTitle,
  email: data.email
});

export const AuthScreens: React.FC<AuthProps> = ({ view, onNavigate }) => {
  const { resetData, setBusinessSettings, businessSettings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [onboardingData, setOnboardingData] = useState(businessSettings);
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });


  const handleFinishOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Map data to match database column names (snake_case)
      const dbData = mapToDbDetails(onboardingData);

      const { error: upsertError } = await supabase
        .from('business_settings')
        .upsert({
          ...dbData,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      // Apply the onboarding data to the context
      setBusinessSettings(onboardingData);
      // Reset other data to start fresh for new user
      resetData();
      // Navigate to dashboard
      onNavigate(ViewMode.DASHBOARD);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateSetting = (key: keyof typeof businessSettings, value: any) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (loginError) throw loginError;

      // onNavigate will be handled by the session listener in App.tsx
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name,
          }
        }
      });

      if (signupError) throw signupError;

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        // Email confirmation required
        onNavigate(ViewMode.VERIFY_EMAIL); // We need to add this to types.ts first, but for now let's handle in component or add a local state view
        return;
      }

      // Set the initial onboarding data from signup
      setOnboardingData(prev => ({
        ...prev,
        ownerName: signupData.name,
        email: signupData.email
      }));

      onNavigate(ViewMode.ONBOARDING_1);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // -- VERIFY EMAIL SCREEN --
  if (view === 'VERIFY_EMAIL' as ViewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
          <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <Heading2>Verifique seu e-mail</Heading2>
          <BodyText>
            Enviamos um link de confirmação para <strong>{signupData.email}</strong>.
            <br />
            Clique no link para ativar sua conta e continuar.
          </BodyText>

          <Card className="p-6">
            <BodyText className="text-sm text-brand-muted mb-4">
              Já confirmou? Tente fazer login.
            </BodyText>
            <Button className="w-full" onClick={() => onNavigate(ViewMode.LOGIN)}>
              Ir para Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // -- LOGIN SCREEN --
  if (view === ViewMode.LOGIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4 flex flex-col items-center">
            <Logo size="lg" showText={false} />
            <div>
              <Heading1>Agenda.ai</Heading1>
              <BodyText>Gerencie seu negócio com inteligência e simplicidade.</BodyText>
            </div>
          </div>

          <Card className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-in fade-in duration-300">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleLogin}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar no sistema'}
            </Button>


            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-brand-border"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-brand-muted">Ou</span></div>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => onNavigate(ViewMode.SIGNUP)}>
              Criar conta
            </Button>
          </Card>

          <div className="text-center">
            <button
              onClick={() => onNavigate(ViewMode.ADMIN_LOGIN)}
              className="text-xs text-brand-muted hover:text-brand-primary flex items-center gap-1 mx-auto transition-colors"
            >
              <ShieldCheck size={12} /> Acesso Administrativo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- SIGN UP SCREEN --
  if (view === ViewMode.SIGNUP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} />
            </div>
            <Heading2>Crie sua conta</Heading2>
            <BodyText>Comece a transformar seu negócio hoje.</BodyText>
          </div>

          <Card className="space-y-5">
            <Input
              label="Nome Completo"
              placeholder="Seu nome"
              icon={<User size={18} />}
              value={signupData.name}
              onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
            />
            <Input
              label="E-mail Profissional"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail size={18} />}
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Crie uma senha forte"
              icon={<Lock size={18} />}
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            />

            <div className="pt-2">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <Button
                className="w-full h-12 text-base"
                onClick={handleSignup}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Continuar'} <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>

          </Card>

          <div className="text-center">
            <Button variant="ghost" className="text-sm" onClick={() => onNavigate(ViewMode.LOGIN)}>
              Já tenho uma conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -- ONBOARDING LAYOUT WRAPPER --
  const Stepper = ({ step }: { step: number }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-brand-primary' : 'w-2 bg-brand-border'}`} />
      ))}
    </div>
  );

  const OnboardingWrapper = ({ step, title, subtitle, children, nextView, prevView, onNext }: any) => (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="text-center mb-6">
          <Stepper step={step} />
          <Heading2>{title}</Heading2>
          <BodyText className="mt-2">{subtitle}</BodyText>
        </div>
        <Card className="space-y-6">
          {children}
          <div className="flex gap-4 pt-4">
            {prevView && (
              <Button variant="secondary" onClick={() => onNavigate(prevView)} className="flex-1">
                <ChevronLeft size={20} /> Voltar
              </Button>
            )}
            <Button onClick={onNext || (() => onNavigate(nextView))} className="flex-1">
              Continuar <ChevronRight size={20} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  // -- ONBOARDING STEP 1: INFO --
  if (view === ViewMode.ONBOARDING_1) {
    return (
      <OnboardingWrapper
        step={1}
        title="Sobre o seu negócio"
        subtitle="Vamos personalizar o app para você."
        nextView={ViewMode.ONBOARDING_2}
        prevView={ViewMode.SIGNUP}
      >
        <Input
          label="Nome do Negócio"
          placeholder="Ex: Studio Glamour"
          value={onboardingData.businessName}
          onChange={(e) => handleUpdateSetting('businessName', e.target.value)}
        />
        <div className="space-y-1.5">
          <Label>Tipo de Negócio</Label>
          <select
            className="w-full h-[44px] rounded-input border border-brand-border bg-white px-4 text-brand-text focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
            value={onboardingData.description.split(' - ')[0]}
            onChange={(e) => handleUpdateSetting('description', `${e.target.value} - ${onboardingData.description.split(' - ')[1] || ''}`)}
          >
            <option>Salão de Beleza</option>
            <option>Manicure / Nail Designer</option>
            <option>Estética Facial/Corporal</option>
            <option>Barbearia</option>
            <option>Makeup Artist</option>
            <option>Clínica de Saúde</option>
            <option>Outro</option>
          </select>
        </div>
        <Input
          label="WhatsApp Profissional"
          placeholder="(00) 00000-0000"
          icon={<Phone size={18} />}
          value={onboardingData.phone}
          onChange={(e) => handleUpdateSetting('phone', e.target.value)}
        />
        <Input
          label="Instagram"
          placeholder="@seu.perfil"
          icon={<Instagram size={18} />}
          onChange={(e) => handleUpdateSetting('slug', e.target.value.replace('@', ''))}
        />
      </OnboardingWrapper>
    );
  }

  // -- ONBOARDING STEP 2: HORÁRIOS --
  if (view === ViewMode.ONBOARDING_2) {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const toggleDay = (day: string) => {
      const currentDays = onboardingData.openDays || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      handleUpdateSetting('openDays', newDays);
    };

    return (
      <OnboardingWrapper
        step={2}
        title="Defina seus horários"
        subtitle="Quando você costuma atender?"
        nextView={ViewMode.ONBOARDING_3}
        prevView={ViewMode.ONBOARDING_1}
      >
        <div className="space-y-4">
          <Label>Dias de funcionamento</Label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => {
              const isActive = (onboardingData.openDays || []).includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${isActive
                    ? 'bg-brand-primary text-white shadow-md scale-105'
                    : 'bg-brand-surface text-brand-muted border border-brand-border hover:border-brand-primary/30'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Abertura"
            type="time"
            value={onboardingData.openTime}
            onChange={(e) => handleUpdateSetting('openTime', e.target.value)}
          />
          <Input
            label="Fechamento"
            type="time"
            value={onboardingData.closeTime}
            onChange={(e) => handleUpdateSetting('closeTime', e.target.value)}
          />
        </div>
        <div className="p-4 bg-brand-soft rounded-lg text-sm text-brand-primary flex gap-3">
          <Check size={20} className="shrink-0" />
          <p>Você poderá ajustar horários específicos e pausas nas configurações depois.</p>
        </div>
      </OnboardingWrapper>
    );
  }

  // -- ONBOARDING STEP 3: REVISÃO --
  if (view === ViewMode.ONBOARDING_3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface p-4">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="text-center mb-8">
            <Stepper step={3} />
            <Heading1>Tudo pronto! 🎉</Heading1>
            <BodyText className="mt-2">Confira se está tudo certo para começarmos.</BodyText>
          </div>

          <Card className="space-y-6">
            <div className="flex items-center gap-4 p-4 border border-brand-border rounded-xl bg-brand-surface/50">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-brand-border text-brand-primary">
                <Calendar size={20} />
              </div>
              <div>
                <Heading2 className="text-lg">{onboardingData.businessName || 'Seu Negócio'}</Heading2>
                <BodyText className="text-sm">{onboardingData.description.split(' - ')[0] || 'Seu Ramo'}</BodyText>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-brand-border">
                <span className="text-brand-muted">WhatsApp</span>
                <span className="font-medium text-brand-text">{onboardingData.phone || '(00) 00000-0000'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-brand-border">
                <span className="text-brand-muted">Horário</span>
                <span className="font-medium text-brand-text">{onboardingData.openTime} - {onboardingData.closeTime}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-brand-border">
                <span className="text-brand-muted">Dias</span>
                <span className="font-medium text-brand-text">
                  {onboardingData.openDays?.join(', ') || 'Nenhum dia selecionado'}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleFinishOnboarding}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Finalizar e Acessar App'}
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => onNavigate(ViewMode.ONBOARDING_1)}>
              Voltar e editar
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};
