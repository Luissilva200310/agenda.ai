import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { Calendar } from './Calendar';
import { Heading1, Heading2, Subtitle, BodyText, Label } from './Typography';
import { Calendar as CalendarIcon, Search, User, Scissors, Bell } from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Introduction */}
      <div className="space-y-4 max-w-3xl">
        <Heading1>Design System Oficial</Heading1>
        <BodyText>
          Esta é a biblioteca viva de componentes do Agenda Beauty. 
          A interface foi pensada para transmitir organização e clareza, 
          utilizando o princípio "Clean & Breathable".
        </BodyText>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Color Palette */}
        <section className="space-y-6">
          <Heading2>Paleta de Cores</Heading2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ColorSwatch name="Primary" hex="#6C4CF1" bg="bg-brand-primary" text="text-white" />
            <ColorSwatch name="Primary Soft" hex="#F1EEFF" bg="bg-brand-soft" text="text-brand-primary" border />
            <ColorSwatch name="Success" hex="#22C55E" bg="bg-brand-success" text="text-white" />
            <ColorSwatch name="Danger" hex="#EF4444" bg="bg-brand-danger" text="text-white" />
            <ColorSwatch name="Text Primary" hex="#111827" bg="bg-brand-text" text="text-white" />
            <ColorSwatch name="Text Muted" hex="#6B7280" bg="bg-brand-muted" text="text-white" />
            <ColorSwatch name="Border" hex="#E5E7EB" bg="bg-brand-border" text="text-brand-text" border />
            <ColorSwatch name="Surface" hex="#F9FAFB" bg="bg-brand-surface" text="text-brand-text" border />
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <Heading2>Tipografia (Poppins)</Heading2>
          <Card className="space-y-6">
            <div className="border-b border-brand-border pb-4">
              <Heading1>Título H1 - 32px (600)</Heading1>
              <Label>Heading 1</Label>
            </div>
            <div className="border-b border-brand-border pb-4">
              <Heading2>Título H2 - 24px (600)</Heading2>
              <Label>Heading 2</Label>
            </div>
            <div className="border-b border-brand-border pb-4">
              <Subtitle>Subtítulo - 18px (500)</Subtitle>
              <Label>Subtitle</Label>
            </div>
            <div className="border-b border-brand-border pb-4">
              <BodyText>
                Texto Padrão - 16px (400). O Agenda Beauty resolve o problema da agenda bagunçada 
                e financeiro desorganizado.
              </BodyText>
              <Label className="mt-2 block">Body</Label>
            </div>
          </Card>
        </section>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Buttons */}
        <section className="space-y-6">
          <Heading2>Botões</Heading2>
          <Card className="flex flex-wrap gap-4 items-center">
            <Button>Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Zone</Button>
            <Button variant="primary" isLoading>Loading</Button>
          </Card>
          <div className="mt-4">
            <Label>Specs</Label>
            <BodyText className="mt-1">Altura: 44px | Radius: 16px</BodyText>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-6">
          <Heading2>Campos de Entrada</Heading2>
          <Card className="space-y-4">
            <Input label="Nome da Cliente" placeholder="Ex: Maria Silva" />
            <Input 
              label="Buscar Serviço" 
              placeholder="Pesquisar..." 
              icon={<Search size={20} />} 
            />
            <Input label="Com Erro" value="Input Inválido" error="Este campo é obrigatório" readOnly />
          </Card>
          <div className="mt-4">
            <Label>Specs</Label>
            <BodyText className="mt-1">Altura: 44px | Radius: 12px</BodyText>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Calendar */}
         <section className="space-y-6">
          <Heading2>Calendário</Heading2>
          <div className="max-w-md">
            <Calendar />
          </div>
          <div className="mt-4">
            <Label>Specs</Label>
            <BodyText className="mt-1">
              Visualização Mensal | Estados: Default, Today, Selected
            </BodyText>
          </div>
        </section>

         {/* Popups / Modals */}
         <section className="space-y-6">
          <Heading2>Popups & Modais</Heading2>
          <Card className="flex flex-col items-start gap-4">
            <BodyText>
              O componente Modal é utilizado para confirmações, formulários rápidos e detalhes.
              Possui overlay escuro e animação de entrada.
            </BodyText>
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<Bell size={18} />}>
              Abrir Modal de Exemplo
            </Button>
          </Card>

          {/* Demonstration Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirmar Agendamento"
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => setIsModalOpen(false)}>Confirmar</Button>
              </>
            }
          >
            <div className="space-y-4">
              <BodyText>
                Você está agendando <strong>Corte + Hidratação</strong> para a cliente <strong>Ana Clara</strong>.
              </BodyText>
              
              <div className="bg-brand-surface p-4 rounded-lg space-y-2 border border-brand-border">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Data:</span>
                  <span className="font-medium text-brand-text">24/10/2023 às 14:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Valor:</span>
                  <span className="font-medium text-brand-text">R$ 180,00</span>
                </div>
              </div>

              <Input label="Observações (Opcional)" placeholder="Alguma restrição ou pedido especial?" />
            </div>
          </Modal>
        </section>
      </div>

      {/* Components Showcase */}
      <section className="space-y-6">
        <Heading2>Cards de Navegação</Heading2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center">
              <CalendarIcon size={24} strokeWidth={1.5} />
            </div>
            <Subtitle>Agenda Inteligente</Subtitle>
            <BodyText className="text-sm">Organize seus horários sem conflitos.</BodyText>
            <Button variant="secondary" className="w-full mt-2">Ver Agenda</Button>
          </Card>

          <Card className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-50 text-brand-success flex items-center justify-center">
              <User size={24} strokeWidth={1.5} />
            </div>
            <Subtitle>Gestão de Clientes</Subtitle>
            <BodyText className="text-sm">Histórico completo de atendimentos.</BodyText>
            <Button variant="secondary" className="w-full mt-2">Ver Clientes</Button>
          </Card>

          <Card className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Scissors size={24} strokeWidth={1.5} />
            </div>
            <Subtitle>Serviços</Subtitle>
            <BodyText className="text-sm">Cadastre seus preços e duração.</BodyText>
            <Button variant="secondary" className="w-full mt-2">Configurar</Button>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-6 pb-12">
        <Heading2>Badges & Status</Heading2>
        <Card className="flex flex-wrap gap-4">
          <Badge variant="success">Confirmado</Badge>
          <Badge variant="warning">Pendente</Badge>
          <Badge variant="danger">Cancelado</Badge>
          <Badge variant="neutral">Rascunho</Badge>
          <Badge variant="primary">Novo</Badge>
        </Card>
      </section>

    </div>
  );
};

const ColorSwatch: React.FC<{ name: string; hex: string; bg: string; text: string; border?: boolean }> = ({ 
  name, hex, bg, text, border 
}) => (
  <div className="flex flex-col gap-2">
    <div className={`h-20 w-full rounded-card ${bg} ${border ? 'border border-gray-200' : ''} flex items-center justify-center shadow-sm`}>
      <span className={`text-xs font-semibold ${text}`}>{hex}</span>
    </div>
    <div>
      <p className="font-medium text-brand-text text-sm">{name}</p>
    </div>
  </div>
);