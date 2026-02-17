
import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Shield, HelpCircle } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Heading2, BodyText, Subtitle } from '../Typography';

export const PlansView: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: 'basic',
            name: 'Iniciante',
            icon: Star,
            description: 'Para quem está começando a organizar a agenda.',
            price: { monthly: 0, yearly: 0 },
            features: [
                'Agenda Online Simples',
                'Até 50 agendamentos/mês',
                'Gestão de Clientes básica',
                'Lembretes por E-mail',
                'Suporte por E-mail'
            ],
            cta: 'Começar Grátis',
            variant: 'ghost',
            highlight: false
        },
        {
            id: 'pro',
            name: 'Profissional',
            icon: Zap,
            description: 'Tudo para crescer e fidelizar suas clientes.',
            price: { monthly: 49, yearly: 39 }, // 39 * 12 no anual
            features: [
                'Agendamentos Ilimitados',
                'Lembretes via WhatsApp Automático',
                'Controle Financeiro Completo',
                'Beautinhos IA (50 análises/mês)',
                'Página de Agendamento Personalizada',
                'Suporte Prioritário'
            ],
            cta: 'Assinar Profissional',
            variant: 'primary',
            highlight: true
        },
        {
            id: 'empire',
            name: 'Império',
            icon: Crown,
            description: 'Gestão completa para salões e equipes.',
            price: { monthly: 99, yearly: 79 },
            features: [
                'Múltiplos Profissionais (até 5)',
                'Comissionamento Automático',
                'Gestão de Estoque',
                'Beautinhos IA Ilimitada',
                'Relatórios Avançados de BI',
                'Gerente de Conta Dedicado'
            ],
            cta: 'Falar com Vendas',
            variant: 'secondary',
            highlight: false
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
            
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <Heading2 className="text-3xl">Invista no crescimento do seu negócio</Heading2>
                <BodyText className="text-lg">
                    Escolha o plano ideal para sua fase atual. Cancele a qualquer momento.
                </BodyText>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-brand-text' : 'text-brand-muted'}`}>Mensal</span>
                    <button 
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-14 h-8 bg-brand-primary rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-brand-text' : 'text-brand-muted'}`}>
                        Anual
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            -20% OFF
                        </span>
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4 px-2">
                {plans.map((plan) => (
                    <Card 
                        key={plan.id} 
                        className={`
                            relative flex flex-col p-6 transition-all duration-300
                            ${plan.highlight 
                                ? 'border-2 border-brand-primary shadow-xl shadow-brand-primary/10 scale-105 z-10' 
                                : 'border border-brand-border hover:border-brand-primary/30 opacity-90 hover:opacity-100'
                            }
                        `}
                        noPadding
                    >
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                                MAIS POPULAR
                            </div>
                        )}

                        <div className="space-y-4 flex-1">
                            {/* Icon & Title */}
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${plan.highlight ? 'bg-brand-primary text-white' : 'bg-brand-soft text-brand-primary'}`}>
                                    <plan.icon size={24} />
                                </div>
                                <div>
                                    <Subtitle className="text-lg">{plan.name}</Subtitle>
                                    {plan.id === 'basic' && <Badge variant="neutral">Grátis para sempre</Badge>}
                                </div>
                            </div>

                            <p className="text-sm text-brand-muted min-h-[40px]">{plan.description}</p>

                            {/* Price */}
                            <div className="py-2">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-brand-muted align-top mt-1">R$</span>
                                    <span className="text-4xl font-bold text-brand-text">
                                        {billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                                    </span>
                                    <span className="text-brand-muted">/mês</span>
                                </div>
                                {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                                    <p className="text-xs text-brand-success mt-1 font-medium">
                                        Economize R$ {((plan.price.monthly - plan.price.yearly) * 12).toFixed(0)} por ano
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-brand-border" />

                            {/* Features */}
                            <ul className="space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-brand-text">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.highlight ? 'bg-green-100 text-green-700' : 'bg-brand-surface text-brand-muted'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="leading-tight">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8">
                            <Button 
                                variant={plan.variant as any} 
                                className={`w-full ${plan.highlight ? 'shadow-lg shadow-brand-primary/25' : ''}`}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Trust / Guarantee Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
                    <div className="p-2 bg-white rounded-lg text-brand-primary shadow-sm">
                        <Shield size={24} />
                    </div>
                    <div>
                        <Subtitle className="text-base">Garantia de 7 dias</Subtitle>
                        <BodyText className="text-sm mt-1">Teste o plano Profissional ou Império sem riscos. Se não amar, devolvemos seu dinheiro.</BodyText>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
                    <div className="p-2 bg-white rounded-lg text-brand-primary shadow-sm">
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <Subtitle className="text-base">Precisa de ajuda?</Subtitle>
                        <BodyText className="text-sm mt-1">Nossa equipe de suporte especializada em beleza está pronta para te ajudar na migração.</BodyText>
                    </div>
                </div>
            </div>

        </div>
    )
}
