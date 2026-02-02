import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Users, Building2, CreditCard, AlertCircle } from 'lucide-react';
import { api } from '@/api/apiClient';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const defaultPayment = {
  tenant_id: '',
  property_id: '',
  amount: 0,
  due_date: format(new Date(), 'yyyy-MM-dd'),
  paid_date: '',
  payment_method: 'bank_transfer',
  status: 'pending',
  payment_type: 'rent',
  notes: ''
};

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];

const paymentTypes = [
  { value: 'rent', label: 'Rent' },
  { value: 'deposit', label: 'Security Deposit' },
  { value: 'late_fee', label: 'Late Fee' },
  { value: 'utility', label: 'Utility' },
  { value: 'other', label: 'Other' }
];

export default function PaymentForm({ payment, open, onClose, onSave }) {
  const [formData, setFormData] = useState(payment || defaultPayment);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const user = await api.auth.me();
      const [loadedTenants, loadedProperties] = await Promise.all([
        api.entities.Tenant.filter({ owner_id: user.email, status: 'active' }),
        api.entities.Property.filter({ owner_id: user.email })
      ]);
      setTenants(loadedTenants);
      setProperties(loadedProperties);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    } else {
      setFormData(defaultPayment);
    }
  }, [payment, open]);

  const handleTenantChange = (tenantId) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    setFormData(prev => ({
      ...prev,
      tenant_id: tenantId,
      property_id: selectedTenant?.property ?? selectedTenant?.property_id ?? '',
      amount: selectedTenant?.monthly_rent || prev.amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = await api.auth.me();
    const dataToSave = {
      ...formData,
      owner_id: user.email,
      payment_date: formData.paid_date || formData.due_date,
      tenant: formData.tenant_id || formData.tenant,
      property: formData.property_id || formData.property
    };
    if (payment?.id) {
      await api.entities.Payment.update(payment.id, dataToSave);
      toast.success('Payment updated');
    } else {
      await api.entities.Payment.create(dataToSave);
      toast.success('Payment recorded');
    }
    onSave();
    onClose();
    setIsSubmitting(false);
  };

  const selectedTenant = tenants.find(t => t.id === formData.tenant_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            {payment?.id ? 'Edit Payment' : 'Record Payment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Tenant *</Label>
              <Select value={formData.tenant_id} onValueChange={handleTenantChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTenant && (
              <div className="p-3 bg-slate-50 rounded-xl text-sm">
                <p className="text-slate-500">Property: <span className="text-slate-900 font-medium">
                  {properties.find(p => p.id === (selectedTenant?.property ?? selectedTenant?.property_id))?.name || 'N/A'}
                </span></p>
                <p className="text-slate-500 mt-1">Monthly Rent: <span className="text-slate-900 font-medium">
                  KES {selectedTenant.monthly_rent?.toLocaleString()}
                </span></p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">KES</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Payment Type</Label>
                <Select value={formData.payment_type} onValueChange={v => setFormData(prev => ({ ...prev, payment_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Paid Date</Label>
                <Input
                  type="date"
                  value={formData.paid_date}
                  onChange={e => setFormData(prev => ({ ...prev, paid_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={v => setFormData(prev => ({ ...prev, payment_method: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? 'Saving...' : payment?.id ? 'Update Payment' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}