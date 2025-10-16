import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onAnyChange?: (payload: any) => void;
}

export const useRealtime = ({
  table,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onAnyChange
}: UseRealtimeOptions) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const newChannel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event: event,
          schema: 'public',
          table: table
        } as any,
        (payload: any) => {
          console.log(`Realtime change detected for ${table}:`, payload);
          
          // Call specific event handlers
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
          
          // Call general change handler
          onAnyChange?.(payload);
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [table, event, onInsert, onUpdate, onDelete, onAnyChange]);

  return { channel };
};