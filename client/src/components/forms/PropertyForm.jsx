import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { X, Upload, Home, MapPin } from 'lucide-react';
import { api } from '@/api/apiClient';
import { toast } from 'react-hot-toast';

const propertyTypes = [
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'flat', label: 'Flat' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' }
];

const defaultProperty = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  property_type: 'bungalow',
  units_count: 1,
  bedrooms: 0,
  bathrooms: 0,
  square_feet: 0,
  year_built: new Date().getFullYear(),
  monthly_rent: 0,
  description: '',
  amenities: [],
  images: [],
  status: 'available'
};

export default function PropertyForm({ property, open, onClose, onSave }) {
  const [formData, setFormData] = useState(property || defaultProperty);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (property) {
      setFormData(property);
    } else {
      setFormData(defaultProperty);
    }
  }, [property, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    
    setUploadingImage(true);
    try {
      console.log('Starting upload for:', file.name);
      
      // Try server upload first
      try {
        const response = await api.integrations.Core.UploadFile({ file });
        console.log('Upload response:', response);
        
        if (response && response.file_url) {
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), response.file_url] }));
          toast.success('Image uploaded successfully');
        } else {
          throw new Error('No file_url in response');
        }
      } catch (serverError) {
        console.warn('Server upload failed, using fallback:', serverError);
        
        // Fallback: Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target.result;
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), base64String] }));
          toast.success('Image uploaded (local preview)');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Only send fields that the backend Property model/serializer understands
    const dataToSave = {
      name: formData.name,
      property_type: formData.property_type,
      location: formData.address ?? formData.location,
      price: formData.monthly_rent ?? formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      square_feet: formData.square_feet,
      available:
        formData.status != null
          ? formData.status === 'available'
          : formData.available ?? true,
    };
    if (property?.id) {
      await api.entities.Property.update(property.id, dataToSave);
      toast.success('Property updated');
    } else {
      await api.entities.Property.create(dataToSave);
      toast.success('Property created');
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
            <Home className="w-5 h-5 text-blue-600" />
            {property?.id ? 'Edit Property' : 'Add New Property'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">1</span>
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Property Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Kilimani Heights Apartments"
                  required
                />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select value={formData.property_type} onValueChange={v => setFormData(prev => ({ ...prev, property_type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="off_market">Off Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center">2</span>
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Street Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g., Ngong Road, Kilimani"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label>City/Town</Label>
                <Input value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} placeholder="e.g., Nairobi" />
              </div>
              <div>
                <Label>County</Label>
                <Input value={formData.state} onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))} placeholder="e.g., Nairobi County" />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={formData.zip_code} onChange={e => setFormData(prev => ({ ...prev, zip_code: e.target.value }))} placeholder="e.g., 00100" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center">3</span>
              Property Details
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input type="number" min="0" value={formData.bedrooms || ''} onChange={e => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input type="number" min="0" step="0.5" value={formData.bathrooms || ''} onChange={e => setFormData(prev => ({ ...prev, bathrooms: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Units</Label>
                <Input type="number" min="1" value={formData.units_count || ''} onChange={e => setFormData(prev => ({ ...prev, units_count: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <Label>Square Feet</Label>
                <Input type="number" min="0" value={formData.square_feet || ''} onChange={e => setFormData(prev => ({ ...prev, square_feet: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Year Built</Label>
                <Input type="number" value={formData.year_built || ''} onChange={e => setFormData(prev => ({ ...prev, year_built: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Monthly Rent (KES)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">KES</span>
                  <Input type="number" min="0" value={formData.monthly_rent || ''} onChange={e => setFormData(prev => ({ ...prev, monthly_rent: parseFloat(e.target.value) || 0 }))} className="pl-12" placeholder="e.g., 45000" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe the property features, location benefits, nearby amenities..."
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
                placeholder="Add amenity..."
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" variant="outline" onClick={addAmenity}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities?.map((amenity, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm">
                  {amenity}
                  <button type="button" onClick={() => removeAmenity(index)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
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
              <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-400">{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Saving...' : property?.id ? 'Update Property' : 'Add Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}