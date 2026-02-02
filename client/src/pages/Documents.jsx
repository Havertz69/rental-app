import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Plus, Search, Upload, Download, Trash2, 
  MoreVertical, Calendar, Building2, User, Eye, FolderOpen
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format, isPast, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

const documentTypes = [
  { value: 'lease', label: 'Lease Agreement', icon: '📄' },
  { value: 'invoice', label: 'Invoice', icon: '🧾' },
  { value: 'receipt', label: 'Receipt', icon: '🧾' },
  { value: 'inspection', label: 'Inspection Report', icon: '🔍' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'tax', label: 'Tax Document', icon: '📊' },
  { value: 'other', label: 'Other', icon: '📎' }
];

export default function Documents() {
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploadData, setUploadData] = useState({
    name: '',
    type: 'other',
    property_id: '',
    tenant_id: '',
    expiry_date: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await api.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Document ? api.entities.Document.filter({ owner_id: userData.email }) : [];
    },
    enabled: !!user
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Property.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const userData = await api.auth.me();
      return api.entities.Tenant.filter({ owner_id: userData.email });
    },
    enabled: !!user
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadData.name) {
        setUploadData(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.name) {
      toast.error('Please select a file and enter a name');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file: selectedFile });
      const user = await api.auth.me();
      
      if (api.entities.Document) await api.entities.Document.create({
        ...uploadData,
        file_url,
        owner_id: user.email
      });

      toast.success('Document uploaded');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadData({
        name: '',
        type: 'other',
        property_id: '',
        tenant_id: '',
        expiry_date: '',
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to upload document');
    }
    setIsUploading(false);
  };

  const handleDelete = async (doc) => {
    if (confirm('Delete this document?')) {
      await api.entities.Document.delete(doc.id);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    }
  };

  const getExpiryStatus = (doc) => {
    if (!doc.expiry_date) return null;
    const expiryDate = new Date(doc.expiry_date);
    if (isPast(expiryDate)) {
      return { label: 'Expired', color: 'bg-rose-100 text-rose-700' };
    }
    if (isPast(addDays(expiryDate, -30))) {
      return { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700' };
    }
    return null;
  };

  const getDocIcon = (type) => {
    return documentTypes.find(t => t.value === type)?.icon || '📄';
  };

  // Group documents by type
  const groupedDocs = filteredDocuments.reduce((acc, doc) => {
    const type = doc.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
            <p className="text-slate-500 mt-1">Store and manage important files</p>
          </div>
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-slate-800 hover:bg-slate-900 shadow-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Total Documents</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{documents.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Leases</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {documents.filter(d => d.type === 'lease').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Expiring Soon</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {documents.filter(d => {
                if (!d.expiry_date) return false;
                const exp = new Date(d.expiry_date);
                return !isPast(exp) && isPast(addDays(exp, -30));
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-sm text-slate-500">Expired</p>
            <p className="text-3xl font-bold text-rose-600 mt-1">
              {documents.filter(d => d.expiry_date && isPast(new Date(d.expiry_date))).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-500 mb-6">Upload your first document</p>
            <Button onClick={() => setShowUploadModal(true)} className="bg-slate-800 hover:bg-slate-900">
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredDocuments.map((doc, index) => {
                const expiryStatus = getExpiryStatus(doc);
                const property = properties.find(p => p.id === doc.property_id);
                const tenant = tenants.find(t => t.id === doc.tenant_id);
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getDocIcon(doc.type)}</div>
                        <div>
                          <h3 className="font-semibold text-slate-900 line-clamp-1">{doc.name}</h3>
                          <p className="text-sm text-slate-500 capitalize">
                            {doc.type?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={doc.file_url} download>
                              <Download className="w-4 h-4 mr-2" />Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(doc)} className="text-rose-600">
                            <Trash2 className="w-4 h-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Building2 className="w-3 h-3 mr-1" />
                          {property.name}
                        </Badge>
                      )}
                      {tenant && (
                        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                          <User className="w-3 h-3 mr-1" />
                          {tenant.first_name}
                        </Badge>
                      )}
                      {expiryStatus && (
                        <Badge variant="outline" className={expiryStatus.color}>
                          {expiryStatus.label}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-slate-400 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(doc.created_date), 'MMM d, yyyy')}
                      </span>
                      {doc.expiry_date && (
                        <span>Expires {format(new Date(doc.expiry_date), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-slate-600" />
              Upload Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label>File</Label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors mt-2">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <p className="text-sm text-slate-600">{selectedFile.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500">Click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOC, JPG up to 10MB</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>

            <div>
              <Label>Document Name *</Label>
              <Input
                value={uploadData.name}
                onChange={e => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={uploadData.type} onValueChange={v => setUploadData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={uploadData.expiry_date}
                  onChange={e => setUploadData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property</Label>
                <Select value={uploadData.property_id} onValueChange={v => setUploadData(prev => ({ ...prev, property_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tenant</Label>
                <Select value={uploadData.tenant_id} onValueChange={v => setUploadData(prev => ({ ...prev, tenant_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={isUploading} className="bg-slate-800 hover:bg-slate-900">
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}