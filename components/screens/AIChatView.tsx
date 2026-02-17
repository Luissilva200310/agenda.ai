
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send, Sparkles, Image as ImageIcon, Zap, Brain, X, Loader2, MessageSquare, Trash2, Menu, History } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card } from '../Card';
import { Heading2, BodyText } from '../Typography';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { useAppContext } from '../../context/AppContext';


// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error("Failed to convert file to base64"));
            }
        };
        reader.onerror = error => reject(error);
    });
};

type ChatMode = 'fast' | 'standard' | 'thinking';

interface ChatMessage {
    role: 'ai' | 'user';
    text: string;
    image?: string;
    isThinking?: boolean;
}

interface ChatSession {
    id: string;
    title: string;
    date: string; // ISO string
    messages: ChatMessage[];
}

// --- SYSTEM INSTRUCTION: SUPER BEAUTINHO (ATUALIZADO) ---
const BEAUTY_EXPERT_PROMPT = `
Você é o **Super Beautinho**, o mentor de negócios definitivo para profissionais da beleza.
Sua missão: Transformar profissionais (cabeleireiras, manicures, esteticistas) em empresárias ricas, organizadas e estrategistas.

⚠️ **REGRA DE OURO 1: LINGUAGEM SIMPLES**
- Fale a língua da profissional. **Proibido usar termos difíceis**, "economês" ou palavras complexas sem explicar.
- Seja direto ao ponto. Respostas curtas e poderosas são melhores que textos longos.
- Use analogias do dia a dia do salão (ex: "Isso é igual tintura sem oxidante, não funciona").

❓ **REGRA DE OURO 2: PERGUNTE ANTES DE RESPONDER**
- Se a usuária fizer uma pergunta vaga (ex: "Quanto cobro no corte?", "Como atraio clientes?", "Estou sem dinheiro"), **NÃO dê uma resposta genérica**.
- **PARE e faça perguntas** para entender o cenário dela primeiro.
- Só dê o plano de ação quando tiver certeza do problema.
- Exemplo de resposta quando faltar contexto: "Amiga, para eu te falar o preço exato e você ter lucro, preciso saber: quanto você paga de aluguel hoje e quanto tempo você leva para fazer esse serviço? Me conta aqui 👇"

🎯 **SEUS PILARES**
1. **Lucro na veia:** Tudo deve focar em colocar dinheiro no bolso dela.
2. **Posicionamento:** Ajude-a a deixar de ser "quebra-galho" para ser "autoridade".
3. **Gestão Descomplicada:** Ensine a separar o dinheiro da casa do dinheiro do salão de forma fácil.

📲 **ESPECIALIDADES**
- **Precificação:** Cálculo de custo por hora e margem de lucro.
- **Marketing:** Estratégias para Instagram que trazem clientes pagantes (não apenas likes).
- **Vendas:** Como fechar pacotes e responder clientes no WhatsApp.
- **Gestão:** Como organizar a agenda e lidar com faltas.

🧩 **FORMATO DE RESPOSTA (SOMENTE QUANDO TIVER INFORMAÇÕES SUFICIENTES)**
Se você já entendeu o problema, use esta estrutura em Markdown:

**🔎 O que está acontecendo**
(Diagnóstico rápido e simples)

**⚠️ Onde você está errando**
(O erro comum que ela nem percebeu)

**🚀 O que vamos fazer**
(A estratégia direta)

**🛠 Passo a Passo**
1. Faça isso
2. Depois isso

**💰 Resultado**
(O quanto ela vai ganhar a mais com isso)

🔥 **TOM DE VOZ**
Confiante, Estratégico, Simples, Direto, Focado em resultado.
Você é o parceiro de negócios que quer ver ela crescer.
`;

export const AIChatView: React.FC = () => {
    // --- STATE ---
    // Persistent Sessions
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ai_chat_sessions');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Mobile toggle

    // Current View State
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>('standard');
    const [attachedImage, setAttachedImage] = useState<{ data: string, mimeType: string, preview: string } | null>(null);

    const { appointments, clients, services, costs, businessSettings } = useAppContext();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Context Summary for AI to understand the business state
    const businessContext = `
DADOS REAIS DO NEGÓCIO PARA O MENTOR:
- Nome do Negócio: ${businessSettings.businessName}
- Profissional: ${businessSettings.ownerName} (${businessSettings.ownerTitle})
- Quantidade de Clientes: ${clients.length}
- Quantidade de Agendamentos: ${appointments.length}
- Serviços oferecidos: ${services.map(s => `${s.name} (R$ ${s.price})`).join(', ')}
- Resumo Financeiro Úteis:
  * Total de Custos cadastrados: ${costs.length}
  * Soma de custos: R$ ${costs.reduce((acc, c) => acc + c.value, 0).toFixed(2)}
  * Soma de faturamento (agendamentos): R$ ${appointments.reduce((acc, a) => acc + (a.value || 0), 0).toFixed(2)}
`;


    // Initial Load / Session Switch
    useEffect(() => {
        if (currentSessionId) {
            const session = sessions.find(s => s.id === currentSessionId);
            if (session) {
                setChatHistory(session.messages);
            }
        } else {
            // New Session Default State with Market Context
            setChatHistory([
                { role: 'ai', text: 'Olá! Sou o **Super Beautinho**, seu mentor de negócios. 💅✨\n\nEstou aqui para te ajudar a ter mais lucro e menos dor de cabeça.\n\nSe tiver dúvidas sobre preço, clientes ou gestão, pode perguntar! Se eu precisar de mais detalhes para te dar a melhor resposta, eu vou te perguntar, ok?\n\nQual é o seu maior desafio hoje?' }
            ]);
        }
    }, [currentSessionId, sessions]);

    // Save to LocalStorage whenever sessions change
    useEffect(() => {
        localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);

    // --- ACTIONS ---

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setChatMessage('');
        setAttachedImage(null);
        setIsHistoryOpen(false);
    };

    const handleSelectSession = (id: string) => {
        setCurrentSessionId(id);
        setIsHistoryOpen(false);
    };

    const handleDeleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        if (currentSessionId === id) {
            handleNewChat();
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToBase64(file);
                setAttachedImage({
                    data: base64,
                    mimeType: file.type,
                    preview: URL.createObjectURL(file)
                });
                if (mode === 'fast') setMode('standard');
            } catch (err) {
                console.error("Error processing image", err);
            }
        }
    };

    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleSendMessage = async () => {
        if ((!chatMessage.trim() && !attachedImage) || isLoading) return;

        // Cancel any previous pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const userMsg: ChatMessage = {
            role: 'user',
            text: chatMessage,
            image: attachedImage?.preview
        };

        const updatedHistory = [...chatHistory, userMsg];
        setChatHistory(updatedHistory);

        let activeSessionId = currentSessionId;

        if (!activeSessionId) {
            const newId = Math.random().toString(36).substr(2, 9);
            const title = userMsg.text.slice(0, 30) + (userMsg.text.length > 30 ? '...' : '') || 'Imagem Enviada';
            const newSession: ChatSession = {
                id: newId,
                title,
                date: new Date().toISOString(),
                messages: updatedHistory
            };
            setSessions(prev => [newSession, ...prev]);
            setCurrentSessionId(newId);
            activeSessionId = newId;
        } else {
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedHistory } : s));
        }

        setChatMessage('');
        const currentImage = attachedImage;
        setAttachedImage(null);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || '');

            let modelName = 'gemini-1.5-flash';

            if (mode === 'fast' && !currentImage) {
                modelName = 'gemini-1.5-flash';
            } else if (mode === 'thinking') {
                modelName = 'gemini-1.5-pro';
            } else {
                modelName = 'gemini-1.5-flash';
            }

            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: BEAUTY_EXPERT_PROMPT + "\n\n" + businessContext
            }, {

                // Pass signal in request options (Note: generative-ai sdk might need a wrapper or manual check if signal isn't native)
                // Actually, the SDK doesn't natively support signal yet in all versions, 
                // so we will wrap it with a promise race or check isLoading.
            });

            const parts: any[] = [];
            if (currentImage) {
                parts.push({
                    inlineData: {
                        mimeType: currentImage.mimeType,
                        data: currentImage.data
                    }
                });
            }

            const recentHistory = chatHistory.slice(-6);
            let contextPrompt = "";
            recentHistory.forEach(msg => {
                contextPrompt += `${msg.role === 'user' ? 'Usuária' : 'Super Beautinho'}: ${msg.text}\n`;
            });
            contextPrompt += `Usuária: ${userMsg.text}`;

            if (userMsg.text || contextPrompt) {
                parts.push({ text: contextPrompt });
            }

            // Simple timeout implementation for the signal
            const timeoutPromise = new Promise((_, reject) => {
                const timer = setTimeout(() => reject(new Error('TIMEOUT')), 30000);
                abortControllerRef.current?.signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(new Error('ABORTED'));
                });
            });

            const generatePromise = model.generateContent({
                contents: [{ role: 'user', parts }]
            });

            const result: any = await Promise.race([generatePromise, timeoutPromise]);

            const aiText = result.response.text() || "Desculpe, não consegui gerar uma resposta estratégica no momento.";
            const aiMsg: ChatMessage = { role: 'ai', text: aiText, isThinking: mode === 'thinking' };

            const finalHistory = [...updatedHistory, aiMsg];
            setChatHistory(finalHistory);
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: finalHistory } : s));

        } catch (error: any) {
            console.error("Gemini API Error:", error);
            if (error.message === 'ABORTED') return; // Silence aborts

            let text = "Ocorreu um erro ao comunicar com a IA.";
            if (error.message === 'TIMEOUT') text = "A resposta demorou muito. Tente uma pergunta mais curta ou mude para o modo Rápido.";

            const errorMsg: ChatMessage = { role: 'ai', text };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancelRequest = () => {
        abortControllerRef.current?.abort();
        setIsLoading(false);
    };

    // Group sessions by Date (Today, Yesterday, Previous)
    const groupedSessions = sessions.reduce((groups, session) => {
        const date = new Date(session.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let key = 'Antigos';
        if (date.toDateString() === today.toDateString()) key = 'Hoje';
        else if (date.toDateString() === yesterday.toDateString()) key = 'Ontem';

        if (!groups[key]) groups[key] = [];
        groups[key].push(session);
        return groups;
    }, {} as Record<string, ChatSession[]>);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className="md:hidden p-2 bg-brand-surface rounded-lg text-brand-text"
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <Heading2>Beautinhos IA</Heading2>
                        <BodyText className="hidden md:block">Especialista em Gestão e Lucro.</BodyText>
                    </div>
                </div>
                <div className="flex gap-2">
                    {mode === 'thinking' && <Badge variant="primary" className="animate-pulse">Modo Pensador</Badge>}
                    {mode === 'fast' && <Badge variant="warning">Modo Rápido</Badge>}
                    <Badge variant="neutral">Beta</Badge>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden relative">

                {/* --- LEFT SIDEBAR (HISTORY) --- */}
                <div className={`
                absolute inset-y-0 left-0 z-20 w-64 bg-brand-bg/95 backdrop-blur-md border border-brand-border rounded-xl shadow-xl transform transition-transform duration-300
                md:relative md:transform-none md:shadow-none md:bg-transparent md:border-0 md:w-1/4 md:flex md:flex-col
                ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                    <div className="p-4 md:pl-0 flex flex-col h-full">
                        <Button onClick={handleNewChat} leftIcon={<Plus size={18} />} className="w-full mb-4 shadow-sm">
                            Nova Estratégia
                        </Button>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {sessions.length === 0 && (
                                <div className="text-center text-brand-muted text-sm py-4">
                                    <History size={24} className="mx-auto mb-2 opacity-50" />
                                    Nenhuma conversa salva.
                                </div>
                            )}

                            {['Hoje', 'Ontem', 'Antigos'].map(groupKey => {
                                const group = groupedSessions[groupKey];
                                if (!group || group.length === 0) return null;

                                return (
                                    <div key={groupKey}>
                                        <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2 px-2">
                                            {groupKey}
                                        </div>
                                        <div className="space-y-1">
                                            {group.map(session => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => handleSelectSession(session.id)}
                                                    className={`
                                                    group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all text-sm
                                                    ${currentSessionId === session.id
                                                            ? 'bg-brand-soft text-brand-primary font-medium'
                                                            : 'hover:bg-brand-surface text-brand-text'
                                                        }
                                                `}
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <MessageSquare size={14} className="shrink-0" />
                                                        <span className="truncate">{session.title}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsHistoryOpen(false)}
                            className="md:hidden mt-4 w-full py-2 flex items-center justify-center gap-2 text-brand-muted hover:text-brand-text border-t border-brand-border"
                        >
                            <X size={16} /> Fechar
                        </button>
                    </div>
                </div>

                {/* Overlay for mobile sidebar */}
                {isHistoryOpen && (
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
                        onClick={() => setIsHistoryOpen(false)}
                    />
                )}

                {/* --- MAIN CHAT AREA --- */}
                <Card className="flex-1 flex flex-col overflow-hidden relative md:w-3/4" noPadding>
                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-brand-surface/30">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                            max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                        ? 'bg-brand-primary text-white rounded-br-none'
                                        : 'bg-white border border-brand-border text-brand-text rounded-bl-none'
                                    }
                        `}>
                                    {msg.role === 'ai' && (
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider opacity-70">
                                            <Sparkles size={12} /> Super Beautinho {msg.isThinking && <span className="flex items-center gap-1 ml-1 text-[10px]"><Brain size={10} /> (Pensou)</span>}
                                        </div>
                                    )}
                                    {msg.image && (
                                        <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                                            <img src={msg.image} alt="Upload" className="max-w-full max-h-[200px] object-cover" />
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-brand-border rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                                    <Loader2 size={16} className="animate-spin text-brand-primary" />
                                    <span className="text-sm text-brand-muted">
                                        {mode === 'thinking' ? 'Analisando o mercado...' : 'Elaborando estratégia...'}
                                    </span>
                                    <button onClick={handleCancelRequest} className="ml-2 text-xs text-brand-danger hover:underline">Cancelar</button>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Controls Area */}
                    <div className="bg-white border-t border-brand-border p-4 space-y-3">

                        {/* Mode Selector & Attachments */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                            <button
                                onClick={() => setMode('fast')}
                                disabled={!!attachedImage}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'fast' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400' : 'bg-brand-surface text-brand-muted hover:bg-brand-border'} ${!!attachedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Zap size={12} fill={mode === 'fast' ? "currentColor" : "none"} /> Rápido
                            </button>
                            <button
                                onClick={() => setMode('standard')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'standard' ? 'bg-brand-soft text-brand-primary ring-1 ring-brand-primary' : 'bg-brand-surface text-brand-muted hover:bg-brand-border'}`}
                            >
                                <Sparkles size={12} /> Padrão
                            </button>
                            <button
                                onClick={() => setMode('thinking')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'thinking' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-400' : 'bg-brand-surface text-brand-muted hover:bg-brand-border'}`}
                            >
                                <Brain size={12} /> Pensador
                            </button>
                            <div className="w-px h-6 bg-brand-border mx-1"></div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-surface text-brand-text hover:bg-brand-border transition-all"
                            >
                                <ImageIcon size={14} /> Anexar Foto
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </div>

                        {/* Attachment Preview */}
                        {attachedImage && (
                            <div className="relative inline-block">
                                <img src={attachedImage.preview} alt="Preview" className="h-20 w-auto rounded-lg border border-brand-border shadow-sm" />
                                <button
                                    onClick={() => { setAttachedImage(null); if (mode === 'fast') setMode('standard'); }}
                                    className="absolute -top-2 -right-2 bg-brand-danger text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        {/* Text Input */}
                        <div className="flex gap-3 items-center">
                            <input
                                className="flex-1 h-[48px] bg-brand-surface rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-text placeholder-brand-muted"
                                placeholder={mode === 'thinking' ? "Pergunte sobre precificação, marketing, lucro ou gestão..." : "Digite sua mensagem..."}
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || (!chatMessage.trim() && !attachedImage)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-primary/20 ${isLoading || (!chatMessage.trim() && !attachedImage) ? 'bg-brand-border text-brand-muted cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-brand-primary/90'}`}
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
