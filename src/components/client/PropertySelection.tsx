import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Building, MapPin, TrendingUp } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price_min: number;
  price_max: number;
  size_min: number;
  size_max: number;
  status: string;
  progress: string;
  images: string[];
}

const PropertySelection = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingProperty, setBookingProperty] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const bookProperty = async (property: Property, selectedPrice: number) => {
    if (!user) {
      toast.error('Please sign in to book a property');
      return;
    }

    setBookingProperty(property.id);
    try {
      // Create property booking
      const { data: booking, error: bookingError } = await supabase
        .from('property_bookings')
        .insert({
          user_id: user.id,
          property_id: property.id,
          total_price: selectedPrice
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create installment plan (12 months default)
      const monthlyAmount = Math.ceil(selectedPrice / 12);
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { error: installmentError } = await supabase
        .from('installment_plans')
        .insert({
          booking_id: booking.id,
          total_amount: selectedPrice,
          total_paid: 0,
          next_payment_date: nextPaymentDate.toISOString().split('T')[0],
          next_payment_amount: monthlyAmount,
          status: 'On Track'
        });

      if (installmentError) throw installmentError;

      toast.success('Property booked successfully! Check your dashboard for payment details.');
    } catch (error: any) {
      toast.error('Failed to book property: ' + error.message);
    } finally {
      setBookingProperty(null);
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-blue mb-2">Choose Your Property</h2>
        <p className="text-gray-600">Select from our available properties and start your installment plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-brand-blue/10 to-brand-gold/10">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building className="h-16 w-16 text-brand-blue/50" />
                </div>
              )}
              <Badge className="absolute top-3 right-3 bg-brand-gold text-brand-blue">
                {property.status}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-xl text-brand-blue">{property.title}</CardTitle>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm line-clamp-3">{property.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-brand-blue">Size:</span>
                  <p>{property.size_min} - {property.size_max} sqm</p>
                </div>
                <div>
                  <span className="font-medium text-brand-blue">Progress:</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                    <span className="text-green-600">{property.progress}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-brand-blue">Price Range:</span>
                  <span className="text-lg font-bold text-brand-gold">
                    ₦{property.price_min.toLocaleString()} - ₦{property.price_max.toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button
                    className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                    onClick={() => bookProperty(property, property.price_min)}
                    disabled={bookingProperty === property.id}
                  >
                    {bookingProperty === property.id ? 'Booking...' : `Book at ₦${property.price_min.toLocaleString()}`}
                  </Button>
                  
                  {property.price_max > property.price_min && (
                    <Button
                      variant="outline"
                      className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-blue"
                      onClick={() => bookProperty(property, property.price_max)}
                      disabled={bookingProperty === property.id}
                    >
                      Premium at ₦{property.price_max.toLocaleString()}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Properties Available</h3>
          <p className="text-gray-500">Check back later for new property listings.</p>
        </div>
      )}
    </div>
  );
};

export default PropertySelection;