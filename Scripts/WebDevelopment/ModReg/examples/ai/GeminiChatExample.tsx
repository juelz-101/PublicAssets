import React, { useState, useEffect, useRef } from 'react';
import type { Chat, Content } from '@google/genai';
import { createChat } from '../../modules/ai/gemini-chat';

const UserIcon: React.FC = () => (
  <svg className="w-8 h-8 text-neon-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ModelIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-neon-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13.5a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v4.5zm6-4.5a1.5 1.5 0 01-3 0V9a1.5 1.5 0 013 0v4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a6 6 0 00-6-6h-1.5a6 6 0 100 12h1.5a6 6 0 006-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a6 6 0 016-6h1.5a6 6 0 110 12h-1.5a6 6 0 01-6-6z" />
    </svg>
);


const GeminiChatExample: React.FC = () => {
    const [history, setHistory] = useState<Content[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatRef.current = createChat({
            config: { systemInstruction: "You are a helpful and creative assistant with a slightly futuristic personality." }
        });
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || isLoading || !chatRef.current) return;

        setIsLoading(true);
        setInput('');

        // Add user message and an empty model placeholder to history
        const updatedHistory: Content[] = [...history, { role: 'user', parts: [{ text }] }];
        setHistory([...updatedHistory, { role: 'model', parts: [{ text: '' }] }]);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: text });
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                // Update the last message (the model's placeholder) with the streaming text
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: fullResponse }] };
                    return newHistory;
                });
            }
             // Update the official chat history after the stream is complete
            chatRef.current = createChat({ 
                history: [...updatedHistory, { role: 'model', parts: [{ text: fullResponse }] }],
                config: { systemInstruction: "You are a helpful and creative assistant with a slightly futuristic personality." }
            });

        } catch (error) {
            console.error(error);
            const errorMessage = "An error occurred. Please check the console.";
            setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: errorMessage }] };
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-base-200/40 backdrop-blur-sm rounded-lg border border-neon-teal/20 shadow-lg">
            <header className="p-4 border-b border-neon-teal/20">
                <h2 className="text-xl font-bold text-neon-teal">Gemini Chat</h2>
                <p className="text-text-secondary text-sm">Interactive chat with streaming responses.</p>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <ModelIcon />}
                        <div className={`max-w-xl p-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-neon-teal/20 text-text-primary rounded-br-none' : 'bg-base-300/50 text-text-primary rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.parts[0].text}
                                {(isLoading && index === history.length - 1) && <span className="inline-block w-2 h-4 bg-neon-teal animate-pulse ml-1" />}
                            </p>
                        </div>
                        {msg.role === 'user' && <UserIcon />}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-neon-teal/20">
                <form onSubmit={handleSend} className="flex items-center gap-4">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                        placeholder="Type your message..."
                        rows={1}
                        className="flex-1 bg-base-100/50 border border-base-300 rounded-lg p-2 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-neon-teal transition-all"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 rounded-full bg-neon-teal/20 hover:bg-neon-teal/30 text-neon-teal transition-all disabled:bg-base-300 disabled:text-text-secondary disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default GeminiChatExample;
