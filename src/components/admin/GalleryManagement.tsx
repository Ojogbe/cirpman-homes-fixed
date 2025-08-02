import GalleryManagementEnhanced from './GalleryManagementEnhanced';

const GalleryManagement = () => {
  return <GalleryManagementEnhanced />;
};

export default GalleryManagement;

// Legacy implementation below (kept for reference)
/* import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Images, Upload } from 'lucide-react';
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string;
  created_at: string;
}

const GalleryManagement = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'construction' as 'drone_shots' | 'allocation_events' | 'construction' | 'other_events',
    image_url: '',
    video_url: ''
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch gallery items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addGalleryItem = async () => {
    if (!newItem.title || !newItem.category) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gallery')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      
      setGalleryItems([data, ...galleryItems]);
      setNewItem({ title: '', description: '', category: 'construction' as 'drone_shots' | 'allocation_events' | 'construction' | 'other_events', image_url: '', video_url: '' });
      setShowAddForm(false);
      toast.success('Gallery item added successfully');
    } catch (error: any) {
      toast.error('Failed to add gallery item: ' + error.message);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setGalleryItems(galleryItems.filter(item => item.id !== id));
      toast.success('Gallery item deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete gallery item: ' + error.message);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'drone_shots':
        return 'bg-blue-100 text-blue-800';
      case 'allocation_events':
        return 'bg-green-100 text-green-800';
      case 'construction':
        return 'bg-orange-100 text-orange-800';
      case 'other_events':
        return 'bg-purple-100 text-purple-800';
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
                <Images className="h-5 w-5" />
                <span>Gallery Management</span>
              </CardTitle>
              <CardDescription>
                Manage gallery images and videos
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Gallery Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Add New Gallery Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value: 'drone_shots' | 'allocation_events' | 'construction' | 'other_events') => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drone_shots">Drone Shots</SelectItem>
                      <SelectItem value="allocation_events">Allocation Events</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="other_events">Other Events</SelectItem>
                    </SelectContent>
                  </Select>
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
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={addGalleryItem}>Add Item</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteGalleryItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Images className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Gallery Items</h3>
              <p className="text-gray-500">Add your first gallery item to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

*/ // End of legacy implementation