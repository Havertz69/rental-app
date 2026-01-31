import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/api/apiClient';
import { MessageSquare, Send, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function TenantMessages({ tenant, property }) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['tenant-messages', tenant?.id],
    queryFn: () => api.entities.Message ? api.entities.Message.filter({ tenant_id: tenant.id }) : [],
    enabled: !!tenant?.id,
    refetchInterval: 10000
  });

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(m => m.sender_role === 'landlord' && !m.read);
      for (const msg of unreadMessages) {
        if (api.entities.Message) await api.entities.Message.update(msg.id, { read: true });
      }
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['tenant-unread-messages'] });
      }
    };
    markAsRead();
  }, [messages, queryClient]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    if (api.entities.Message) await api.entities.Message.create({
      tenant_id: tenant.id,
      property_id: property?.id,
      sender_email: tenant.email,
      sender_name: `${tenant.first_name} ${tenant.last_name}`,
      sender_role: 'tenant',
      content: newMessage.trim(),
      owner_id: property?.owner_id
    });

    setNewMessage('');
    queryClient.invalidateQueries({ queryKey: ['tenant-messages'] });
    toast.success('Message sent!');
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Messages</h2>
        <p className="text-slate-500">Communicate with your property manager</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Property Manager</p>
            <p className="text-sm text-slate-500">{property?.name}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-2">No messages yet</p>
              <p className="text-sm text-slate-400">Start a conversation with your property manager</p>
            </div>
          ) : (
            sortedMessages.map((message, index) => {
              const isTenant = message.sender_role === 'tenant';
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex gap-3 ${isTenant ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isTenant 
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                      : 'bg-gradient-to-br from-violet-500 to-blue-500'
                  }`}>
                    {isTenant ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Building2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[70%] ${isTenant ? 'items-end' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isTenant 
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className={`text-xs text-slate-400 mt-1 ${isTenant ? 'text-right' : ''}`}>
                      {format(new Date(message.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100">
          <div className="flex gap-3">
            <Textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              className="resize-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              className="bg-violet-600 hover:bg-violet-700 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}