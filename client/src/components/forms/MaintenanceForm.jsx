import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Wrench, Upload, X, AlertTriangle } from 'lucide-react';
import { api } from '@/api/apiClient';
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

const defaultRequest = {
  property_id: '',
  tenant_id: '',
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  status: 'submitted',
  images: [],
  scheduled_date: '',
  completed_date: '',
  cost: 0,
  vendor_name: '',
  vendor_phone: '',
  resolution_notes: ''
};

export default function MaintenanceForm({ request, open, onClose, onSave }) {
  const [formData, setFormData] = useState(request || defaultRequest);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const user = await api.auth.me();
      const [loadedProperties, loadedTenants] = await Promise.all([
        api.entities.Property.filter({ owner_id: user.email }),
        api.entities.Tenant.filter({ owner_id: user.email, status: 'active' })
      ]);
      setProperties(loadedProperties);
      setTenants(loadedTenants);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (request) {
      setFormData(request);
    } else {
      setFormData(defaultRequest);
    }
  }, [request, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), file_url] }));
    toast.success('Image uploaded');
    setUploadingImage(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredTenants = (formData.property_id ?? formData.property)
    ? tenants.filter(t => (t.property ?? t.property_id) === (formData.property_id ?? formData.property))
    : tenants;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = await api.auth.me();
    const payload = {
      ...formData,
      owner_id: user.email,
      property: formData.property_id || formData.property,
      tenant: formData.tenant_id || formData.tenant,
      issue_description: formData.title || formData.issue_description || formData.description || ''
    };
    if (request?.id) {
      await api.entities.MaintenanceRequest.update(request.id, payload);
      toast.success('Request updated');
    } else {
      await api.entities.MaintenanceRequest.create(payload);
      toast.success('Request created');
    }
    onSave();
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            {request?.id ? 'Edit Maintenance Request' : 'New Maintenance Request'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property *</Label>
                <Select value={formData.property_id} onValueChange={v => setFormData(prev => ({ ...prev, property_id: v, tenant_id: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tenant</Label>
                <Select value={formData.tenant_id} onValueChange={v => setFormData(prev => ({ ...prev, tenant_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                placeholder="Detailed description of the issue..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-4 gap-3">
              {formData.images?.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-400">{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
              </label>
            </div>
          </div>

          {request?.id && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-slate-900">Status & Resolution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={e => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Vendor Name</Label>
                  <Input
                    value={formData.vendor_name}
                    onChange={e => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Vendor Phone</Label>
                  <Input
                    value={formData.vendor_phone}
                    onChange={e => setFormData(prev => ({ ...prev, vendor_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost || ''}
                    onChange={e => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label>Resolution Notes</Label>
                <Textarea
                  value={formData.resolution_notes}
                  onChange={e => setFormData(prev => ({ ...prev, resolution_notes: e.target.value }))}
                  rows={2}
                  placeholder="Notes about the resolution..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700">
              {isSubmitting ? 'Saving...' : request?.id ? 'Update Request' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}