import ProgressTimelineManagementEnhanced from './ProgressTimelineManagementEnhanced';

const ProgressTimelineManagement = () => {
  return <ProgressTimelineManagementEnhanced />;
};

export default ProgressTimelineManagement;

// Legacy implementation below (kept for reference)
/* import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Clock, Upload } from 'lucide-react';
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

const ProgressTimelineManagement = () => {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    image_url: '',
    video_url: ''
  });

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

  const addProgressItem = async () => {
    if (!newItem.title || !newItem.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('progress_timeline')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      
      setProgressItems([data, ...progressItems]);
      setNewItem({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        image_url: '',
        video_url: ''
      });
      setShowAddForm(false);
      toast.success('Progress item added successfully');
    } catch (error: any) {
      toast.error('Failed to add progress item: ' + error.message);
    }
  };

  const deleteProgressItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('progress_timeline')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProgressItems(progressItems.filter(item => item.id !== id));
      toast.success('Progress item deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete progress item: ' + error.message);
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
                <Clock className="h-5 w-5" />
                <span>Progress Timeline Management</span>
              </CardTitle>
              <CardDescription>
                Manage project progress updates and milestones
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Progress Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Add New Progress Update</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter update title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <Input
                    type="date"
                    value={newItem.date}
                    onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    value={newItem.image_url}
                    onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Video URL</label>
                  <Input
                    value={newItem.video_url}
                    onChange={(e) => setNewItem({ ...newItem, video_url: e.target.value })}
                    placeholder="Enter video URL"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Enter progress description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={addProgressItem}>Add Update</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {progressItems.length > 0 ? (
            <div className="space-y-6">
              {progressItems.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-brand-gold">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 mb-4">{item.description}</p>
                        )}
                        
                        {(item.image_url || item.video_url) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {item.image_url && (
                              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {item.video_url && (
                              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                <video 
                                  src={item.video_url}
                                  controls
                                  className="w-full h-full"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteProgressItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Updates</h3>
              <p className="text-gray-500">Add your first progress update to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

*/ // End of legacy implementation