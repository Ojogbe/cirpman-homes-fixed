
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from "sonner";

interface ProgressItem {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  video_url: string;
  created_at: string;
}

const Progress = () => {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressItems();
  }, []);

  const fetchProgressItems = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_timeline')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setProgressItems(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch progress items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-20 bg-gradient-to-br from-brand-blue to-brand-blue/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Project Progress
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Track the development of our real estate projects
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
          </div>
        ) : progressItems.length > 0 ? (
          <div className="space-y-8">
            {progressItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Progress Updates</h3>
            <p className="text-gray-500">Progress updates will appear here as they become available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
