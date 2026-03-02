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
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-medium h-11 rounded-2xl border-neutral-200 bg-neutral-50/50 hover:bg-white transition-all",
              !date && "text-neutral-400",
              error && "border-rose-500 focus-visible:ring-rose-500/20 focus-visible:border-rose-500",
              "data-[state=open]:ring-2 data-[state=open]:ring-neutral-900/5 data-[state=open]:border-neutral-300 data-[state=open]:bg-white"
            )}
          >
            <CalendarIcon className={cn("mr-2 h-4 w-4", date ? "text-blue-500" : "text-neutral-400")} />
            {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden bg-white/90 backdrop-blur-xl" 
          align="start"
          sideOffset={8}
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="p-0"
            />
          </div>
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

