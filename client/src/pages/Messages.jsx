import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MessageSquare, Send, User, Building2, Search, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants', user?.email],
    queryFn: () => base44.entities.Tenant.filter({ owner_id: user.email, status: 'active' }),
    enabled: !!user?.email
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', user?.email],
    queryFn: () => base44.entities.Property.filter({ owner_id: user.email }),
    enabled: !!user?.email
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ owner_id: user.email }),
    enabled: !!user?.email,
    refetchInterval: 10000
  });

  const { data: conversationMessages = [] } = useQuery({
    queryKey: ['conversation-messages', selectedTenant?.id],
    queryFn: () => base44.entities.Message.filter({ tenant_id: selectedTenant.id }),
    enabled: !!selectedTenant?.id,
    refetchInterval: 5000
  });

  const sortedConversationMessages = [...conversationMessages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedConversationMessages]);

  useEffect(() => {
    const markAsRead = async () => {
      if (!selectedTenant) return;
      const unreadMessages = conversationMessages.filter(m => m.sender_role === 'tenant' && !m.read);
      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { read: true });
      }
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      }
    };
    markAsRead();
  }, [conversationMessages, selectedTenant, queryClient]);

  const getUnreadCount = (tenantId) => {
    return allMessages.filter(m => m.tenant_id === tenantId && m.sender_role === 'tenant' && !m.read).length;
  };

  const getLastMessage = (tenantId) => {
    const tenantMessages = allMessages.filter(m => m.tenant_id === tenantId);
    if (tenantMessages.length === 0) return null;
    return tenantMessages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  };

  const filteredTenants = tenants.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTenant) return;

    setIsSending(true);
    await base44.entities.Message.create({
      tenant_id: selectedTenant.id,
      property_id: selectedTenant.property_id,
      sender_email: user.email,
      sender_name: user.full_name || 'Property Manager',
      sender_role: 'landlord',
      content: newMessage.trim(),
      owner_id: user.email
    });

    setNewMessage('');
    queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    toast.success('Message sent!');
    setIsSending(false);
  };

  return (
    <div className="p-4 lg:p-8 h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto h-full">
        <div className="bg-white rounded-2xl border border-slate-100 flex h-full overflow-hidden">
          {/* Tenant List */}
          <div className="w-80 border-r border-slate-100 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredTenants.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No tenants found
                </div>
              ) : (
                filteredTenants.map(tenant => {
                  const unreadCount = getUnreadCount(tenant.id);
                  const lastMessage = getLastMessage(tenant.id);
                  const property = properties.find(p => p.id === tenant.property_id);

                  return (
                    <button
                      key={tenant.id}
                      onClick={() => setSelectedTenant(tenant)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                        selectedTenant?.id === tenant.id ? 'bg-violet-50' : ''
                      }`}
                    >
                      {tenant.profile_image ? (
                        <img src={tenant.profile_image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-violet-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 truncate">
                            {tenant.first_name} {tenant.last_name}
                          </p>
                          {unreadCount > 0 && (
                            <Badge className="bg-violet-500 text-white ml-2">{unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{property?.name}</p>
                        {lastMessage && (
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedTenant ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                  {selectedTenant.profile_image ? (
                    <img src={selectedTenant.profile_image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedTenant.first_name} {selectedTenant.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{selectedTenant.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {sortedConversationMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500">No messages yet</p>
                      <p className="text-sm text-slate-400">Start a conversation</p>
                    </div>
                  ) : (
                    sortedConversationMessages.map((message, index) => {
                      const isLandlord = message.sender_role === 'landlord';
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`flex gap-3 ${isLandlord ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isLandlord 
                              ? 'bg-gradient-to-br from-violet-500 to-blue-500' 
                              : 'bg-gradient-to-br from-slate-600 to-slate-700'
                          }`}>
                            {isLandlord ? (
                              <Building2 className="w-4 h-4 text-white" />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className={`max-w-[70%] ${isLandlord ? 'items-end' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 ${
                              isLandlord 
                                ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white' 
                                : 'bg-slate-100 text-slate-900'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            <p className={`text-xs text-slate-400 mt-1 ${isLandlord ? 'text-right' : ''}`}>
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-2">Select a conversation</p>
                <p className="text-sm text-slate-400">Choose a tenant to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
