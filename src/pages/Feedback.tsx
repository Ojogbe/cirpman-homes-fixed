import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { getRecaptchaToken } from '@/lib/recaptcha';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Property {
  id: string;
  title: string;
  location: string;
}

const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 0,
    property_id: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location')
        .eq('status', 'Available');

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({
      ...formData,
      rating
    });
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => interactive && handleRatingChange(i + 1)}
        className={`h-6 w-6 transition-colors ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 hover:text-yellow-300'
        } ${interactive ? 'cursor-pointer' : ''}`}
        disabled={!interactive}
      >
        <Star className="h-full w-full" />
      </button>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const feedbackData = {
        ...formData,
        property_id: formData.property_id ? formData.property_id : null,
        user_id: user?.id || null,
        status: 'unread'
      };

      const recaptchaToken = await getRecaptchaToken('feedback_submit');
      const { data, error } = await supabase.functions.invoke('verify_captcha_and_submit', {
        body: {
          action: 'feedback',
          payload: feedbackData,
          recaptchaToken
        }
      });

      if (error) throw error;

      toast.success('Feedback submitted successfully! We will review and respond soon.');
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        rating: 0,
        property_id: ''
      });
    } catch (error: any) {
      toast.error('Failed to submit feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      rating: 0,
      property_id: ''
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navigation />
        
        <div className="pt-20 bg-gradient-to-br from-brand-blue to-brand-blue/90 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Feedback Portal
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Share your thoughts and help us improve our services
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You for Your Feedback!
              </h2>
              <p className="text-gray-600 mb-6">
                We have received your feedback and will review it carefully. Our team will get back to you soon if a response is needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={resetForm}>
                  Submit Another Feedback
                </Button>
                <Button variant="outline">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-20 bg-gradient-to-br from-brand-blue to-brand-blue/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Feedback Portal
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Share your thoughts and help us improve our services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Share Your Feedback</span>
            </CardTitle>
            <CardDescription>
              We value your opinion! Please share your experience with us to help us improve our services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label>Overall Rating</Label>
                <div className="flex items-center space-x-2">
                  {renderStars(formData.rating, true)}
                  <span className="ml-2 text-sm text-gray-500">
                    {formData.rating > 0 ? `${formData.rating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your feedback"
                />
              </div>

              {/* Property Selection */}
              <div className="space-y-2">
                <Label htmlFor="property_id">Related Property (Optional)</Label>
                <Select value={formData.property_id || 'none'} onValueChange={(value) => handleSelectChange('property_id', value === 'none' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific property</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please share your detailed feedback, suggestions, or concerns..."
                  rows={6}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-blue"
                disabled={loading}
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-8">
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We review all feedback within 24-48 hours</li>
                <li>• Our team will respond if additional information is needed</li>
                <li>• Your feedback helps us improve our services and properties</li>
                <li>• We may reach out for more details or to discuss your suggestions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Feedback;
