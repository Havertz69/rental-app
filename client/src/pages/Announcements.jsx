import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Megaphone, Plus, Search, AlertTriangle, Info, Trash2, Edit2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Announcements() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    property_id: '',
    priority: 'normal',
    expires_at: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements', user?.email],
    queryFn: () => api.entities.Announcement ? api.entities.Announcement.filter({ owner_id: user.email }) : [],
    enabled: !!user?.email
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', user?.email],
    queryFn: () => api.entities.Property.filter({ owner_id: user.email }),
    enabled: !!user?.email
  });

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      property_id: announcement.property_id || '',
      priority: announcement.priority || 'normal',
      expires_at: announcement.expires_at || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    if (api.entities.Announcement) await api.entities.Announcement.delete(id);
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    toast.success('Announcement deleted');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSave = {
      ...formData,
      owner_id: user.email
    };

    if (editingAnnouncement) {
      if (api.entities.Announcement) await api.entities.Announcement.update(editingAnnouncement.id, dataToSave);
      toast.success('Announcement updated');
    } else {
      if (api.entities.Announcement) await api.entities.Announcement.create(dataToSave);
      toast.success('Announcement created');
    }

    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    setShowForm(false);
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', property_id: '', priority: 'normal', expires_at: '' });
    setIsSubmitting(false);
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent':
        return { icon: AlertTriangle, color: 'bg-rose-100 text-rose-700' };
      case 'important':
        return { icon: Megaphone, color: 'bg-amber-100 text-amber-700' };
      default:
        return { icon: Info, color: 'bg-blue-100 text-blue-700' };
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
            <p className="text-slate-500">Post announcements for your tenants</p>
          </div>
          <Button onClick={() => { setEditingAnnouncement(null); setFormData({ title: '', content: '', property_id: '', priority: 'normal', expires_at: '' }); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 mb-4">No announcements yet</p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              Create Your First Announcement
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement, index) => {
              const config = getPriorityConfig(announcement.priority);
              const Icon = config.icon;
              const targetProperty = properties.find(p => p.id === announcement.property_id);

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${config.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${config.color.split(' ')[1]}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                        <Badge className={config.color}>{announcement.priority}</Badge>
                        {targetProperty ? (
                          <Badge variant="outline">{targetProperty.name}</Badge>
                        ) : (
                          <Badge variant="outline">All Properties</Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-600 mb-3">{announcement.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Created: {format(new Date(announcement.created_date), 'MMM d, yyyy')}</span>
                        {announcement.expires_at && (
                          <span>Expires: {format(new Date(announcement.expires_at), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-violet-600" />
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div>
                <Label>Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  placeholder="Write your announcement..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property</Label>
                  <Select value={formData.property_id} onValueChange={v => setFormData(prev => ({ ...prev, property_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>All Properties</SelectItem>
                      {properties.map(prop => (
                        <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Expires On (optional)</Label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={e => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
                  {isSubmitting ? 'Saving...' : editingAnnouncement ? 'Update' : 'Post Announcement'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}