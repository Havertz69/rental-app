import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/api/apiClient';
import { 
  Wrench, Plus, Clock, CheckCircle2, AlertTriangle, 
  Calendar, Upload, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const categories = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'structural', label: 'Structural' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' }
];

const priorityConfig = {
  low: { color: 'bg-blue-100 text-blue-700', label: 'Low' },
  medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  emergency: { color: 'bg-rose-100 text-rose-700', label: 'Emergency' }
};

const statusConfig = {
  submitted: { icon: Clock, color: 'bg-slate-100 text-slate-700', label: 'Submitted' },
  in_progress: { icon: Wrench, color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
  scheduled: { icon: Calendar, color: 'bg-violet-100 text-violet-700', label: 'Scheduled' },
  completed: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  cancelled: { icon: X, color: 'bg-slate-100 text-slate-500', label: 'Cancelled' }
};

export default function TenantMaintenance({ tenant, property, requests }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const sortedRequests = [...requests].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const activeRequests = requests.filter(r => 
    r.status !== 'completed' && r.status !== 'cancelled'
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, images: [...prev.images, file_url] }));
    toast.success('Image uploaded');
    setUploadingImage(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await base44.entities.MaintenanceRequest.create({
      ...formData,
      tenant_id: tenant.id,
      property_id: property?.id,
      status: 'submitted',
      owner_id: property?.owner_id
    });

    toast.success('Maintenance request submitted!');
    queryClient.invalidateQueries({ queryKey: ['tenant-maintenance'] });
    setShowForm(false);
    setFormData({ title: '', description: '', category: 'other', priority: 'medium', images: [] });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Maintenance Requests</h2>
          <p className="text-slate-500">Submit and track maintenance issues</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
          <p className="text-sm text-slate-500">Total Requests</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-amber-600">{activeRequests.length}</p>
          <p className="text-sm text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-emerald-600">
            {requests.filter(r => r.status === 'completed').length}
          </p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-rose-600">
            {requests.filter(r => r.priority === 'emergency').length}
          </p>
          <p className="text-sm text-slate-500">Emergency</p>
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No maintenance requests yet</p>
            <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
              Submit Your First Request
            </Button>
          </div>
        ) : (
          sortedRequests.map((request, index) => {
            const status = statusConfig[request.status] || statusConfig.submitted;
            const priority = priorityConfig[request.priority] || priorityConfig.medium;
            const StatusIcon = status.icon;
            const isExpanded = expandedRequest === request.id;

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${status.color.split(' ')[0]} flex items-center justify-center`}>
                    <StatusIcon className={`w-6 h-6 ${status.color.split(' ')[1]}`} />
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-slate-900 truncate">{request.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={status.color}>{status.label}</Badge>
                      <Badge className={priority.color}>{priority.label}</Badge>
                      <span className="text-sm text-slate-500">
                        {format(new Date(request.created_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                          <p className="text-slate-700">{request.description || 'No description provided'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Category</p>
                            <p className="text-slate-700 capitalize">{request.category?.replace('_', ' ')}</p>
                          </div>
                          {request.scheduled_date && (
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Scheduled Date</p>
                              <p className="text-slate-700">
                                {format(new Date(request.scheduled_date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          )}
                        </div>

                        {request.vendor_name && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Assigned Vendor</p>
                            <p className="text-slate-700">
                              {request.vendor_name}
                              {request.vendor_phone && ` • ${request.vendor_phone}`}
                            </p>
                          </div>
                        )}

                        {request.resolution_notes && (
                          <div className="bg-emerald-50 rounded-xl p-4">
                            <p className="text-sm font-medium text-emerald-700 mb-1">Resolution Notes</p>
                            <p className="text-emerald-800">{request.resolution_notes}</p>
                          </div>
                        )}

                        {request.images?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-2">Photos</p>
                            <div className="flex gap-2 overflow-x-auto">
                              {request.images.map((img, i) => (
                                <img 
                                  key={i} 
                                  src={img} 
                                  alt="" 
                                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* New Request Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Submit Maintenance Request
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Issue Title *</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">
                      <span className="flex items-center gap-1 text-rose-600">
                        <AlertTriangle className="w-4 h-4" />
                        Emergency
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Please describe the issue in detail..."
              />
            </div>

            <div>
              <Label>Photos (optional)</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-violet-400 cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-400">{uploadingImage ? 'Uploading...' : 'Add'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}