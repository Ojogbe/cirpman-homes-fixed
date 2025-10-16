
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, Mail } from 'lucide-react';
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
}

const ProfileSettings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || ''
      });
    } catch (error: any) {
      toast.error('Failed to fetch profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            <User className="h-5 w-5" />
            <span>Profile Settings</span>
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                value={profile?.id || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed from this page
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Account Type
              </label>
              <Input
                value={profile?.role || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Member Since
              </label>
              <Input
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <Button 
              type="submit" 
              className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue"
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
