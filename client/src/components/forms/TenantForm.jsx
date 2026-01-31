import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, Mail, Phone, DollarSign, Upload } from 'lucide-react';
import { api } from '@/api/apiClient';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const defaultTenant = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  property_id: '',
  unit_number: '',
  lease_start: format(new Date(), 'yyyy-MM-dd'),
  lease_end: '',
  monthly_rent: 0,
  security_deposit: 0,
  emergency_contact_name: '',
  emergency_contact_phone: '',
  status: 'active',
  notes: '',
  profile_image: ''
};

export default function TenantForm({ tenant, open, onClose, onSave }) {
  const [formData, setFormData] = useState(tenant || defaultTenant);
  const [properties, setProperties] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const loadProperties = async () => {
      const user = await api.auth.me();
      const props = await api.entities.Property.filter({ owner_id: user.email });
      setProperties(props);
    };
    loadProperties();
  }, []);

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
    } else {
      setFormData(defaultTenant);
    }
  }, [tenant, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, profile_image: file_url }));
    toast.success('Image uploaded');
    setUploadingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = await api.auth.me();
    const dataToSave = { ...formData, owner_id: user.email };
    
    if (tenant?.id) {
      await api.entities.Tenant.update(tenant.id, dataToSave);
      toast.success('Tenant updated');
    } else {
      await api.entities.Tenant.create(dataToSave);
      toast.success('Tenant added');
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
            <User className="w-5 h-5 text-violet-600" />
            {tenant?.id ? 'Edit Tenant' : 'Add New Tenant'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-violet-400" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {uploadingImage ? 'Uploading...' : 'Upload photo'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
              </label>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center">1</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">2</span>
              Property & Lease
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property</Label>
                <Select value={formData.property_id} onValueChange={v => setFormData(prev => ({ ...prev, property_id: v }))}>
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
                <Label>Unit Number</Label>
                <Input
                  value={formData.unit_number}
                  onChange={e => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                  placeholder="e.g., 101"
                />
              </div>
              <div>
                <Label>Lease Start</Label>
                <Input
                  type="date"
                  value={formData.lease_start}
                  onChange={e => setFormData(prev => ({ ...prev, lease_start: e.target.value }))}
                />
              </div>
              <div>
                <Label>Lease End</Label>
                <Input
                  type="date"
                  value={formData.lease_end}
                  onChange={e => setFormData(prev => ({ ...prev, lease_end: e.target.value }))}
                />
              </div>
              <div>
                <Label>Monthly Rent</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    min="0"
                    value={formData.monthly_rent || ''}
                    onChange={e => setFormData(prev => ({ ...prev, monthly_rent: parseFloat(e.target.value) || 0 }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Security Deposit</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    min="0"
                    value={formData.security_deposit || ''}
                    onChange={e => setFormData(prev => ({ ...prev, security_deposit: parseFloat(e.target.value) || 0 }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="past">Past Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center">3</span>
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.emergency_contact_name}
                  onChange={e => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.emergency_contact_phone}
                  onChange={e => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting ? 'Saving...' : tenant?.id ? 'Update Tenant' : 'Add Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}