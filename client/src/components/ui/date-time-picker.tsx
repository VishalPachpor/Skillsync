import * as React from "react";
import { format, set, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined | string;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  // Convert string to Date if needed
  const parseDate = (value: Date | string | undefined): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;

    // Try to parse the ISO string
    const parsedDate = new Date(value);
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    parseDate(date)
  );

  // Update the parent's state when our local state changes
  React.useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate, setDate]);

  // Update our local state when the parent's state changes
  React.useEffect(() => {
    setSelectedDate(parseDate(date));
  }, [date]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Preserve the time from the currently selected date
      const newDateTime = selectedDate
        ? set(date, {
            hours: selectedDate.getHours(),
            minutes: selectedDate.getMinutes(),
          })
        : set(date, { hours: 0, minutes: 0 });
      setSelectedDate(newDateTime);
    } else {
      setSelectedDate(undefined);
    }
  };

  const handleTimeChange = (time: string, type: "hours" | "minutes") => {
    if (!selectedDate) {
      // If no date is selected, use today's date
      const today = new Date();
      setSelectedDate(
        set(today, {
          [type]: parseInt(time),
        })
      );
    } else {
      setSelectedDate(
        set(selectedDate, {
          [type]: parseInt(time),
        })
      );
    }
  };

  // Generate time options (hours and minutes)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP p") // Format date with time
          ) : (
            <span>Pick date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time:</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={
                  selectedDate?.getHours().toString().padStart(2, "0") || ""
                }
                onValueChange={(value) => handleTimeChange(value, "hours")}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>:</span>
              <Select
                value={
                  selectedDate?.getMinutes().toString().padStart(2, "0") || ""
                }
                onValueChange={(value) => handleTimeChange(value, "minutes")}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
