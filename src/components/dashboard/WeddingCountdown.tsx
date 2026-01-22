import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Edit2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WeddingCountdownProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl md:text-4xl font-serif font-medium text-zinc-900 leading-none tabular-nums">
      {value.toString().padStart(2, "0")}
    </span>
    <span className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2 font-medium">
      {label}
    </span>
  </div>
);

const WeddingCountdown = ({ date, onDateChange }: WeddingCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!date) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = date.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-zinc-100 p-2 flex flex-col md:flex-row items-center gap-2">
        {/* Date Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "group relative flex items-center gap-4 px-8 py-6 w-full md:w-auto rounded-[1.5rem] transition-all duration-300 outline-none",
                "bg-zinc-50 hover:bg-zinc-900 hover:text-white text-zinc-900 border border-transparent hover:border-zinc-900",
              )}
            >
              <div className="flex flex-col items-start text-left min-w-[140px]">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mb-1 group-hover:text-zinc-400 group-hover:opacity-100 transition-all">
                  Big Day
                </span>
                <span className="font-serif text-2xl font-medium tracking-tight">
                  {date ? format(date, "MMM d, yyyy") : "Pick Date"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white group-hover:bg-zinc-800 flex items-center justify-center shadow-sm ml-auto md:ml-0 transition-colors border border-zinc-100 group-hover:border-zinc-700">
                <Edit2 className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-white" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-none shadow-2xl rounded-xl"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              className="p-3 bg-white rounded-xl"
            />
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="hidden md:block w-px h-16 bg-zinc-100 mx-4"></div>
        <div className="block md:hidden w-full h-px bg-zinc-100 my-2"></div>

        {/* Countdown Display */}
        <div className="flex-1 w-full grid grid-cols-4 gap-4 px-4 py-4 md:py-0">
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Mins" />
          <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    </div>
  );
};

export default WeddingCountdown;
