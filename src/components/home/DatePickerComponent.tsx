'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'use-intl';

interface DatePickerComponentProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export function DatePickerComponent({ selectedDate, onSelectDate }: DatePickerComponentProps) {
  const t = useTranslations('home');
  const format = useFormatter();

  return (
    <div className="mb-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format.dateTime(selectedDate) : <span>{t('pickADate')}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
          // initialFocus removed
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
