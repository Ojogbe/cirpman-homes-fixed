
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import WhyInvest from '@/components/WhyInvest';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <WhyInvest />
    </div>
  );
};

export default Index;
