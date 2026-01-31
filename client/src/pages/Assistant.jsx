import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bot, Send, Plus, MessageSquare, Trash2, Sparkles, 
  Loader2, Building2, Users, DollarSign, Wrench
} from 'lucide-react';
import MessageBubble from '@/components/chat/MessageBubble.jsx';
import { toast } from 'react-hot-toast';

const suggestionCards = [
  {
    icon: Building2,
    title: "Property Overview",
    prompt: "Give me an overview of all my properties including occupancy status and rent amounts",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Users,
    title: "Tenant Summary",
    prompt: "List all my active tenants with their lease end dates and monthly rent",
    color: "from-violet-500 to-violet-600"
  },
  {
    icon: DollarSign,
    title: "Payment Status",
    prompt: "What payments are pending or overdue this month?",
    color: "from-emerald-500 to-emerald-600"
  },
  {
    icon: Wrench,
    title: "Maintenance Report",
    prompt: "Show me all open maintenance requests sorted by priority",
    color: "from-amber-500 to-amber-600"
  }
];

export default function Assistant() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentConversation) return;
    
    const unsubscribe = base44.agents.subscribeToConversation(currentConversation.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [currentConversation?.id]);

  const loadConversations = async () => {
    setIsLoading(true);
    const convs = await base44.agents.listConversations({ agent_name: 'rental_assistant' });
    setConversations(convs || []);
    setIsLoading(false);
  };

  const createNewConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'rental_assistant',
      metadata: {
        name: `Chat ${new Date().toLocaleDateString()}`
      }
    });
    setConversations(prev => [conv, ...prev]);
    setCurrentConversation(conv);
    setMessages([]);
  };

  const selectConversation = async (conv) => {
    const fullConv = await base44.agents.getConversation(conv.id);
    setCurrentConversation(fullConv);
    setMessages(fullConv.messages || []);
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      // Note: If delete API exists, use it
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConversation?.id === convId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    
    if (!currentConversation) {
      await createNewConversation();
    }

    setIsSending(true);
    setInputValue('');

    const conv = currentConversation || (await api.agents.createConversation?.({
      agent_name: 'rental_assistant',
      metadata: { name: `Chat ${new Date().toLocaleDateString()}` }
    }));

    if (!currentConversation) {
      setCurrentConversation(conv);
      setConversations(prev => [conv, ...prev]);
    }

    await api.agents.addMessage?.(conv, {
      role: 'user',
      content: text
    });

    setIsSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <Button 
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Conversation
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No conversations yet</p>
              <p className="text-slate-400 text-xs mt-1">Start a new chat!</p>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((conv, index) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-3 rounded-xl text-left transition-all group ${
                    currentConversation?.id === conv.id 
                      ? 'bg-violet-50 border-violet-200 border' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        currentConversation?.id === conv.id 
                          ? 'bg-violet-100' 
                          : 'bg-slate-100'
                      }`}>
                        <MessageSquare className={`w-4 h-4 ${
                          currentConversation?.id === conv.id 
                            ? 'text-violet-600' 
                            : 'text-slate-500'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate text-sm">
                          {conv.metadata?.name || 'Untitled'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {new Date(conv.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">RentWise AI</h1>
              <p className="text-sm text-slate-500">Your intelligent property management assistant</p>
            </div>
          </div>
        </div>

        {/* Messages or Welcome Screen */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentConversation || messages.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              {/* Welcome Message */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 mb-6">
                  <Sparkles className="w-12 h-12 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-slate-500">
                  I can help you manage properties, track payments, handle maintenance requests, and more.
                </p>
              </motion.div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestionCards.map((card, index) => (
                  <motion.button
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => sendMessage(card.prompt)}
                    className="p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all text-left group"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${card.color} mb-3 group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-slate-500">{card.prompt}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MessageBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-5 py-3 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your properties..."
                className="flex-1 h-12 px-5 rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-400"
                disabled={isSending}
              />
              <Button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isSending}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg shadow-violet-500/20"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">
              RentWise AI can access your property data to provide personalized assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}