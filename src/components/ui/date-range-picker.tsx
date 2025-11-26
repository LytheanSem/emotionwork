"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: string[];
  onChange: (dates: string[]) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  label = "Event Dates",
  required = false,
}: DateRangePickerProps) {
  const [ranges, setRanges] = useState<DateRange[]>([]);
  const [currentRange, setCurrentRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  // Convert date array to ranges on mount
  useEffect(() => {
    if (value && value.length > 0) {
      const sortedDates = [...value].sort();
      const newRanges: DateRange[] = [];
      let currentStart = sortedDates[0];
      let currentEnd = sortedDates[0];

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(currentEnd);
        const currentDate = new Date(sortedDates[i]);
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          // Consecutive date, extend current range
          currentEnd = sortedDates[i];
        } else {
          // Non-consecutive date, save current range and start new one
          newRanges.push({ startDate: currentStart, endDate: currentEnd });
          currentStart = sortedDates[i];
          currentEnd = sortedDates[i];
        }
      }
      newRanges.push({ startDate: currentStart, endDate: currentEnd });
      setRanges(newRanges);
    }
  }, [value]);

  // DST-safe helper function for adding days
  const addDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  // Convert ranges back to date array
  const rangesToDates = (ranges: DateRange[]): string[] => {
    const dates: string[] = [];
    ranges.forEach((range) => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);

      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }
    });
    return [...new Set(dates)].sort();
  };

  const addRange = () => {
    if (!currentRange.startDate || !currentRange.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const start = new Date(currentRange.startDate);
    const end = new Date(currentRange.endDate);

    if (start > end) {
      toast.error("Start date cannot be after end date");
      return;
    }

    if (minDate && currentRange.startDate < minDate) {
      toast.error(`Start date cannot be before ${minDate}`);
      return;
    }

    if (maxDate && currentRange.endDate > maxDate) {
      toast.error(`End date cannot be after ${maxDate}`);
      return;
    }

    const newRanges = [...ranges, currentRange];
    setRanges(newRanges);
    onChange(rangesToDates(newRanges));
    setCurrentRange({ startDate: "", endDate: "" });
    toast.success("Date range added successfully");
  };

  const removeRange = (index: number) => {
    const newRanges = ranges.filter((_, i) => i !== index);
    setRanges(newRanges);
    onChange(rangesToDates(newRanges));
    toast.success("Date range removed");
  };

  const formatDateRange = (range: DateRange): string => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);

    if (range.startDate === range.endDate) {
      return start.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const getTotalDays = (): number => {
    return ranges.reduce((total, range) => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return total + diffDays;
    }, 0);
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="dateRangePicker">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Add new range */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Add Date Range
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-xs text-gray-600">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={currentRange.startDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setCurrentRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-xs text-gray-600">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={currentRange.endDate}
                  min={currentRange.startDate || minDate}
                  max={maxDate}
                  onChange={(e) => setCurrentRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={addRange}
                  disabled={!currentRange.startDate || !currentRange.endDate}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Range
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display selected ranges */}
      {ranges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Selected Date Ranges ({getTotalDays()} days total)
            </Label>
          </div>

          <div className="space-y-2">
            {ranges.map((range, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{formatDateRange(range)}</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {(() => {
                      const start = new Date(range.startDate);
                      const end = new Date(range.endDate);
                      const diffTime = end.getTime() - start.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
                    })()}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRange(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick add single date */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Plus className="h-4 w-4" />
          Quick Add Single Date
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            min={minDate}
            max={maxDate}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value && !value.includes(input.value)) {
                  const newDates = [...value, input.value].sort();
                  onChange(newDates);
                  input.value = "";
                  toast.success("Date added successfully");
                }
              }
            }}
            placeholder="Select a single date"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
