
import SiteVisitsManagementEnhanced from './SiteVisitsManagementEnhanced';

const SiteVisitsManagement = () => {
  return <SiteVisitsManagementEnhanced />;
};

export default SiteVisitsManagement;

// Legacy implementation below (kept for reference)
/* import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Phone, Mail, Clock } from 'lucide-react';
import { toast } from "sonner";

interface SiteVisit {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  follow_up_status: string;
  created_at: string;
}

const SiteVisitsManagement = () => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('site_visit_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch site visits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('site_visit_bookings')
        .update({ follow_up_status: status })
        .eq('id', id);

      if (error) throw error;
      
      setVisits(visits.map(visit => 
        visit.id === id ? { ...visit, follow_up_status: status } : visit
      ));
      toast.success('Status updated successfully');
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Site Visits Management</span>
          </CardTitle>
          <CardDescription>
            Manage and track all site visit requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 font-medium">Preferred Date</th>
                    <th className="text-left py-3 px-4 font-medium">Time</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{visit.name}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {visit.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {visit.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(visit.preferred_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{visit.preferred_time}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(visit.follow_up_status)}`}>
                          {visit.follow_up_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(visit.id, 'Contacted')}
                          >
                            Mark Contacted
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(visit.id, 'Scheduled')}
                          >
                            Mark Scheduled
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
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Site Visits</h3>
              <p className="text-gray-500">Site visit requests will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

*/ // End of legacy implementation
