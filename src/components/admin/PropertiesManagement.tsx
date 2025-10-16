
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { toast } from "sonner";
import { useRealtime } from "@/hooks/useRealtime";
import PropertyUploadForm from "./PropertyUploadForm";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string | null;
  size_min: number;
  size_max: number;
  price_min: number;
  price_max: number;
  status: string;
  progress: string;
  images: string[];
  videos: string[];
  featured_image: string | null;
  installment_available: boolean;
  created_at: string;
}

const PropertiesManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  // Real-time updates
  useRealtime({
    table: 'properties',
    onInsert: (payload) => {
      const newProperty = payload.new as Property;
      setProperties(prev => [newProperty, ...prev]);
      toast.success('New property added!');
    },
    onUpdate: (payload) => {
      const updatedProperty = payload.new as Property;
      setProperties(prev => prev.map(p => 
        p.id === updatedProperty.id ? updatedProperty : p
      ));
      toast.success('Property updated!');
    },
    onDelete: (payload) => {
      const deletedId = payload.old.id;
      setProperties(prev => prev.filter(p => p.id !== deletedId));
      toast.success('Property deleted!');
    }
  });

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Property deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete property: ' + error.message);
    }
  };

  const formatPrice = (min: number, max: number) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    
    if (min === max) {
      return formatter.format(min);
    }
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Properties Management</span>
              </CardTitle>
              <CardDescription>
                Manage your property listings
              </CardDescription>
            </div>
            <Dialog open={showUploadForm || !!editingProperty} onOpenChange={(open) => {
              setShowUploadForm(open);
              if (!open) setEditingProperty(null);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <PropertyUploadForm
                  property={editingProperty}
                  onSuccess={() => {
                    setShowUploadForm(false);
                    setEditingProperty(null);
                    fetchProperties();
                  }}
                  onCancel={() => {
                    setShowUploadForm(false);
                    setEditingProperty(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Size</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Progress</th>
                    <th className="text-left py-3 px-4 font-medium">Installments</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{property.title}</td>
                      <td className="py-3 px-4">{property.location}</td>
                      <td className="py-3 px-4">
                        {property.size_min === property.size_max 
                          ? `${property.size_min} sqm` 
                          : `${property.size_min}-${property.size_max} sqm`
                        }
                      </td>
                      <td className="py-3 px-4">{formatPrice(property.price_min, property.price_max)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {property.progress}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          property.installment_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.installment_available ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingProperty(property)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteProperty(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties</h3>
              <p className="text-gray-500">Add your first property to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertiesManagement;
