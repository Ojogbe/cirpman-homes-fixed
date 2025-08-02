import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Plus, X } from 'lucide-react';

interface PropertyUploadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertyUploadForm: React.FC<PropertyUploadFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    size_min: '',
    size_max: '',
    price_min: '',
    price_max: '',
    status: 'Available',
    progress: 'Planned',
    installment_available: false
  });

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, installment_available: checked }));
  };

  const handleFileUpload = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.size_min || !formData.price_min) {
        throw new Error('Please fill in all required fields');
      }

      // Upload featured image
      let featuredImageUrl = '';
      if (featuredImageFile) {
        featuredImageUrl = await handleFileUpload(featuredImageFile, 'real-estate-uploads', 'featured');
      }

      // Upload additional images
      const imageUrls = await Promise.all(
        images.map(img => handleFileUpload(img, 'real-estate-uploads', 'images'))
      );

      // Upload videos
      const videoUrls = await Promise.all(
        videos.map(video => handleFileUpload(video, 'real-estate-uploads', 'videos'))
      );

      // Create property record
      const propertyData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        size_min: parseInt(formData.size_min),
        size_max: parseInt(formData.size_max || formData.size_min),
        price_min: parseFloat(formData.price_min),
        price_max: parseFloat(formData.price_max || formData.price_min),
        status: formData.status as any,
        progress: formData.progress as any,
        installment_available: formData.installment_available,
        featured_image: featuredImageUrl,
        images: imageUrls,
        videos: videoUrls
      };

      const { error } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (error) throw error;

      toast.success('Property uploaded successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(`Failed to upload property: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addImageFile = (file: File) => {
    if (images.length < 10) {
      setImages(prev => [...prev, file]);
    } else {
      toast.error('Maximum 10 images allowed');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVideoFile = (file: File) => {
    if (videos.length < 5) {
      setVideos(prev => [...prev, file]);
    } else {
      toast.error('Maximum 5 videos allowed');
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Property</CardTitle>
        <CardDescription>Add a new property to the portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter property title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter property location"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter property description"
              rows={4}
            />
          </div>

          {/* Size Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="size_min">Minimum Size (sqm) *</Label>
              <Input
                id="size_min"
                name="size_min"
                type="number"
                value={formData.size_min}
                onChange={handleInputChange}
                placeholder="Enter minimum size"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size_max">Maximum Size (sqm)</Label>
              <Input
                id="size_max"
                name="size_max"
                type="number"
                value={formData.size_max}
                onChange={handleInputChange}
                placeholder="Enter maximum size (optional)"
              />
            </div>
          </div>

          {/* Price Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price_min">Minimum Price (NGN) *</Label>
              <Input
                id="price_min"
                name="price_min"
                type="number"
                value={formData.price_min}
                onChange={handleInputChange}
                placeholder="Enter minimum price"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_max">Maximum Price (NGN)</Label>
              <Input
                id="price_max"
                name="price_max"
                type="number"
                value={formData.price_max}
                onChange={handleInputChange}
                placeholder="Enter maximum price (optional)"
              />
            </div>
          </div>

          {/* Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Property Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Construction Progress</Label>
              <Select value={formData.progress} onValueChange={(value) => handleSelectChange('progress', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Foundation">Foundation</SelectItem>
                  <SelectItem value="Structure">Structure</SelectItem>
                  <SelectItem value="Finishing">Finishing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Installment Payment Option */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.installment_available}
              onCheckedChange={handleSwitchChange}
            />
            <Label>Installment payments available</Label>
          </div>

          {/* Featured Image Upload */}
          <div className="space-y-2">
            <Label>Featured Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setFeaturedImageFile(file);
                }}
                className="hidden"
                id="featured-image"
              />
              <label htmlFor="featured-image" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-900">
                      {featuredImageFile ? featuredImageFile.name : 'Upload featured image'}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Images Upload */}
          <div className="space-y-2">
            <Label>Additional Images (Max 10)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(addImageFile);
                }}
                className="hidden"
                id="additional-images"
              />
              <label htmlFor="additional-images" className="cursor-pointer">
                <div className="text-center">
                  <Plus className="mx-auto h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Add images</span>
                </div>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 rounded p-2 text-xs truncate">
                      {image.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos Upload */}
          <div className="space-y-2">
            <Label>Videos (Max 5)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(addVideoFile);
                }}
                className="hidden"
                id="videos"
              />
              <label htmlFor="videos" className="cursor-pointer">
                <div className="text-center">
                  <Plus className="mx-auto h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Add videos</span>
                </div>
              </label>
            </div>
            {videos.length > 0 && (
              <div className="space-y-2 mt-4">
                {videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 rounded p-2">
                    <span className="text-xs truncate">{video.name}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue"
            >
              {loading ? 'Uploading...' : 'Upload Property'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyUploadForm;