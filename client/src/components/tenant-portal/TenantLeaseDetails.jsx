import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { FileText, Calendar, DollarSign, MapPin, Home, Phone, Mail, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TenantLeaseDetails({ tenant, property }) {
  const leaseEndDays = tenant?.lease_end ? 
    differenceInDays(new Date(tenant.lease_end), new Date()) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Lease Details</h2>
        <p className="text-slate-500">View your current lease information</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lease Information */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Lease Information</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Lease Start</span>
              <span className="font-medium text-slate-900">
                {tenant?.lease_start ? format(new Date(tenant.lease_start), 'MMMM d, yyyy') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Lease End</span>
              <span className="font-medium text-slate-900">
                {tenant?.lease_end ? format(new Date(tenant.lease_end), 'MMMM d, yyyy') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Remaining Days</span>
              <Badge className={
                leaseEndDays === null ? 'bg-slate-100 text-slate-600' :
                leaseEndDays < 30 ? 'bg-rose-100 text-rose-700' :
                leaseEndDays < 90 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }>
                {leaseEndDays !== null ? (leaseEndDays > 0 ? `${leaseEndDays} days` : 'Expired') : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Monthly Rent</span>
              <span className="font-semibold text-slate-900 text-lg">
                ${tenant?.monthly_rent?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500">Security Deposit</span>
              <span className="font-medium text-slate-900">
                ${tenant?.security_deposit?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Property Information</h3>
          </div>

          {property?.images?.[0] && (
            <img 
              src={property.images[0]} 
              alt={property.name}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
          )}

          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">{property?.name || 'N/A'}</p>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {property?.address}, {property?.city}, {property?.state} {property?.zip_code}
              </p>
            </div>

            <div className="flex justify-between items-center py-3 border-t border-slate-100">
              <span className="text-slate-500">Unit Number</span>
              <span className="font-medium text-slate-900">{tenant?.unit_number || 'N/A'}</span>
            </div>

            {property?.bedrooms && (
              <div className="flex justify-between items-center py-3 border-t border-slate-100">
                <span className="text-slate-500">Bedrooms</span>
                <span className="font-medium text-slate-900">{property.bedrooms}</span>
              </div>
            )}

            {property?.bathrooms && (
              <div className="flex justify-between items-center py-3 border-t border-slate-100">
                <span className="text-slate-500">Bathrooms</span>
                <span className="font-medium text-slate-900">{property.bathrooms}</span>
              </div>
            )}

            {property?.square_feet && (
              <div className="flex justify-between items-center py-3 border-t border-slate-100">
                <span className="text-slate-500">Square Feet</span>
                <span className="font-medium text-slate-900">{property.square_feet.toLocaleString()} sq ft</span>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Emergency Contact</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Contact Name</span>
              <span className="font-medium text-slate-900">
                {tenant?.emergency_contact_name || 'Not provided'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500">Contact Phone</span>
              <span className="font-medium text-slate-900">
                {tenant?.emergency_contact_phone || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {property?.amenities?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Home className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Amenities</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}