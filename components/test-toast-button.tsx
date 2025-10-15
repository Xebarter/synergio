"use client";

import React from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function TestToastButton() {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Hello World!",
      description: "This is a test toast notification.",
    });
  };

  return (
    <Button onClick={showToast}>
      Show Toast
    </Button>
  );
}