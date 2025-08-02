import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Building, Calendar, CreditCard } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import PropertySelection from './PropertySelection';

interface Booking {
  id: string;
  total_price: number;
  created_at: string;
  properties: {
    title: string;
    location: string;
    status: string;
  };
  installment_plans: {
    total_amount: number;
    total_paid: number;
    status: string;
    next_payment_date: string;
    next_payment_amount: number;
  }[];
}

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPropertySelection, setShowPropertySelection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_bookings')
        .select(`
          *,
          properties (title, location, status),
          installment_plans (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch bookings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (showPropertySelection) {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowPropertySelection(false)}
            className="mb-4"
          >
            ← Back to My Bookings
          </Button>
        </div>
        <PropertySelection />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue">My Property Bookings</h2>
          <p className="text-gray-600">Track your property investments and payment progress</p>
        </div>
        <Button
          onClick={() => setShowPropertySelection(true)}
          className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue"
        >
          Book New Property
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Property Bookings</h3>
            <p className="text-gray-500 mb-4">Start your real estate investment journey today</p>
            <Button
              onClick={() => setShowPropertySelection(true)}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const installmentPlan = booking.installment_plans[0];
            const progress = installmentPlan 
              ? (installmentPlan.total_paid / installmentPlan.total_amount) * 100 
              : 0;

            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-brand-blue flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        {booking.properties.title}
                      </CardTitle>
                      <p className="text-gray-600">{booking.properties.location}</p>
                    </div>
                    <Badge variant={booking.properties.status === 'Available' ? 'default' : 'secondary'}>
                      {booking.properties.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CreditCard className="h-4 w-4 mr-2 text-brand-blue" />
                        <span className="font-medium">Total Investment</span>
                      </div>
                      <p className="text-2xl font-bold text-brand-gold">
                        ₦{booking.total_price.toLocaleString()}
                      </p>
                    </div>

                    {installmentPlan && (
                      <>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
                            <span className="font-medium">Payment Progress</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {progress.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">
                            ₦{installmentPlan.total_paid.toLocaleString()} of ₦{installmentPlan.total_amount.toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <CreditCard className="h-4 w-4 mr-2 text-brand-blue" />
                            <span className="font-medium">Next Payment</span>
                          </div>
                          <p className="text-2xl font-bold text-brand-blue">
                            ₦{installmentPlan.next_payment_amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Due: {new Date(installmentPlan.next_payment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {installmentPlan && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Status:</span>
                        <Badge variant={installmentPlan.status === 'On Track' ? 'default' : 'destructive'}>
                          {installmentPlan.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-gold h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Booked on: {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;