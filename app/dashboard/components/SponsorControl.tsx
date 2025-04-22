'use client';

import { format } from 'date-fns';
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner'; // Using sonner for toast notifications

import { updateEventSponsorship } from '@/app/dashboard/events/actions';
import { updatePartnerSponsorship } from '@/app/dashboard/partners/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SponsorControlProps {
  itemId: string;
  itemType: 'event' | 'partner';
  initialIsSponsored: boolean;
  initialSponsorEndDate: string | null;
}

export function SponsorControl({ 
  itemId, 
  itemType, 
  initialIsSponsored, 
  initialSponsorEndDate 
}: SponsorControlProps) {
  const [isSponsored, setIsSponsored] = useState(initialIsSponsored);
  const [sponsorEndDate, setSponsorEndDate] = useState<Date | null>(
    initialSponsorEndDate ? new Date(initialSponsorEndDate) : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(sponsorEndDate ?? undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[SponsorControl] Mounted for itemId: ${itemId}, isSponsored: ${isSponsored}`);
    return () => {
      console.log(`[SponsorControl] Unmounting for itemId: ${itemId}`);
    };
  }, [itemId, isSponsored]);

  const action = itemType === 'event' ? updateEventSponsorship : updatePartnerSponsorship;

  const handleSponsorshipChange = async (checked: boolean) => {
    console.log('[SponsorControl] handleSponsorshipChange called. Checked:', checked);
    setError(null);
    // Don't set loading immediately if opening popover
    if (checked) {
      // User wants to sponsor - ensure popover opens
      console.log('[SponsorControl] Setting isPopoverOpen to true');
      setIsPopoverOpen(true);
      // Pre-select tomorrow if no date is set
      if (!selectedDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
      }
      // Don't set isLoading = true here, wait for confirm
      return; 
    } else {
      // User wants to unsponsor
      setIsLoading(true); // Set loading now
      try {
        const result = await action(itemId, false, null);
        if (result.success) {
          setIsSponsored(false);
          setSponsorEndDate(null);
          setSelectedDate(undefined);
          console.log('[SponsorControl] Setting isPopoverOpen to false (after unsponsor success)');
          setIsPopoverOpen(false); // Close popover if it was somehow open
          toast.success(`${itemType === 'event' ? 'Event' : 'Partner'} sponsorship removed.`);
        } else {
          throw new Error(result.error || 'Failed to remove sponsorship.');
        }
      } catch (err: any) {
        console.error("Error unsponsoring:", err);
        toast.error(err.message || `Failed to update ${itemType} sponsorship.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSponsorConfirm = async () => {
    if (!selectedDate) {
      setError('Please select an end date.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const endDateISO = selectedDate.toISOString();
      const result = await action(itemId, true, endDateISO);

      if (result.success) {
        setIsSponsored(true);
        setSponsorEndDate(selectedDate);
        console.log('[SponsorControl] Setting isPopoverOpen to false (after sponsor confirm)');
        setIsPopoverOpen(false);
        toast.success(`${itemType === 'event' ? 'Event' : 'Partner'} sponsored until ${format(selectedDate, 'PPP')}.`);
      } else {
        throw new Error(result.error || 'Failed to set sponsorship.');
      }
    } catch (err: any) {
      console.error("Error sponsoring:", err);
      setError(err.message || `Failed to update ${itemType} sponsorship.`);
      toast.error(err.message || `Failed to update ${itemType} sponsorship.`);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(`[SponsorControl] Rendering itemId: ${itemId}, isLoading: ${isLoading}`);

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="cursor-pointer" onClick={() => console.log(`[SponsorControl] Checkbox clicked for itemId: ${itemId}`)}>
              <Checkbox
                checked={isSponsored}
                onCheckedChange={handleSponsorshipChange}
                aria-label="Sponsor status"
                disabled={isLoading}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="p-4 space-y-2">
              <h4 className="font-medium leading-none">Set Sponsorship End Date</h4>
              <p className="text-sm text-muted-foreground">
                Select the date when the sponsorship should expire.
              </p>
            </div>
            {error && (
              <div className="px-4 pb-2">
                <Alert variant="destructive" className="py-2 px-3">
                  <AlertCircle className="size-4" />
                  <AlertTitle className="text-xs font-medium">Error</AlertTitle>
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
            />
            <div className="p-4 border-t border-border flex justify-end">
              <Button onClick={handleSponsorConfirm} disabled={isLoading || !selectedDate} size="sm">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirm Sponsorship
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      {/* Display the end date if sponsored */} 
      {isSponsored && sponsorEndDate && (
        <span className="text-xs text-muted-foreground">
          until {format(sponsorEndDate, 'PP')}
        </span>
      )}
    </div>
  );
} 