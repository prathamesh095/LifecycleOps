import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  label?: string
  error?: string
}

export function DatePicker({ date, setDate, label, error }: DatePickerProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 rounded-xl border-neutral-200",
              !date && "text-neutral-500",
              error && "border-rose-500 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-rose-500 font-medium animate-in slide-in-from-top-1 fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  )
}
