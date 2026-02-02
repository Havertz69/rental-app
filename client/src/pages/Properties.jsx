import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, Plus, Search, MapPin, Bed, Bath, Square, 
  DollarSign, MoreVertical, Edit, Trash2, Eye, Grid, List 
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import PropertyForm from '@/components/forms/PropertyForm.jsx';
import { toast } from 'react-hot-toast';

export default function Properties() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add') {
      setShowForm(true);
    }
  }, []);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Property.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const filteredProperties = properties.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (property) => {
    if (confirm('Are you sure you want to delete this property?')) {
      if (api.entities.Property) await api.entities.Property.delete(property.id);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted');
    }
  };

  const handleFormSave = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    setEditingProperty(null);
  };

  const statusColors = {
    available: 'bg-blue-100 text-blue-700 border-blue-200',
    occupied: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
    off_market: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
            <p className="text-slate-500 mt-1">Manage your rental properties</p>
          </div>
          <Button 
            onClick={() => { setEditingProperty(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
            >
              <Grid className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
            >
              <List className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl mb-4" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-500 mb-6">Get started by adding your first property</p>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Property
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-violet-100">
                    {property.images?.[0] ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`absolute top-3 right-3 ${statusColors[property.status]} border`}
                    >
                      {property.status?.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{property.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.address}
                          {property.city && `, ${property.city}`}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingProperty(property); setShowForm(true); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(property)} className="text-rose-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                      {property.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          {property.bathrooms}
                        </span>
                      )}
                      {property.square_feet > 0 && (
                        <span className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          {property.square_feet.toLocaleString()} sqft
                        </span>
                      )}
                    </div>

                    {/* Rent */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-2xl font-bold text-slate-900">
                        KES {property.monthly_rent?.toLocaleString() || 0}
                        <span className="text-sm font-normal text-slate-500">/mo</span>
                      </span>
                      <span className="text-xs text-slate-400 uppercase">{property.property_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 overflow-hidden flex-shrink-0">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{property.name}</h3>
                    <p className="text-sm text-slate-500">{property.address}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                      {property.bedrooms > 0 && <span>{property.bedrooms} bed</span>}
                      {property.bathrooms > 0 && <span>{property.bathrooms} bath</span>}
                      {property.square_feet > 0 && <span>{property.square_feet.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">KES {property.monthly_rent?.toLocaleString()}/mo</p>
                    <Badge variant="outline" className={`mt-1 ${statusColors[property.status]} border`}>
                      {property.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingProperty(property); setShowForm(true); }}>
                        <Edit className="w-4 h-4 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(property)} className="text-rose-600">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PropertyForm
        property={editingProperty}
        open={showForm}
        onClose={() => { setShowForm(false); setEditingProperty(null); }}
        onSave={handleFormSave}
      />
    </div>
  );
}