import React, { useState, useMemo, useEffect } from 'react';
import { formatDate, timeAgo, isToday, addDays, isFuture, isLeapYear, addHours, startOfDay, endOfDay, formatDuration } from '../../modules/date/date-utils';

const FuturisticCard: React.FC<{ children: React.ReactNode, title: string, description: string }> = ({ children, title, description }) => (
    <div>
        <h3 className="text-xl font-semibold text-neon-teal mb-2">{title}</h3>
        <p className="text-text-secondary mb-4">{description}</p>
        <div className="bg-base-200/40 backdrop-blur-sm p-4 rounded-lg border border-neon-teal/20 shadow-lg">
            {children}
        </div>
    </div>
);

const FuturisticInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal focus:border-neon-teal transition-all" />
);

const OutputBox: React.FC<{ title: string, children: React.ReactNode, size?: 'normal' | 'large' }> = ({ title, children, size = 'normal' }) => (
    <div className="mt-4 p-4 bg-base-100/50 rounded-md border border-base-300/50">
        <p className="text-text-secondary">{title}</p>
        <p className={`text-text-primary font-mono ${size === 'large' ? 'text-xl' : ''}`}>{children}</p>
    </div>
);

const DateUtilsExample: React.FC = () => {
  const [formatString, setFormatString] = useState('YYYY-MM-DD hh:mm:ss A');
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [daysToAdd, setDaysToAdd] = useState(7);
  const [hoursToAdd, setHoursToAdd] = useState(3);
  const [yearToCheck, setYearToCheck] = useState(new Date().getFullYear());
  const [durationSeconds, setDurationSeconds] = useState(90061); // 25h 1m 1s

  const now = useMemo(() => new Date(), []);
  const fiveMinutesAgo = useMemo(() => new Date(now.getTime() - 5 * 60 * 1000), [now]);
  const twoHoursAgo = useMemo(() => new Date(now.getTime() - 2 * 60 * 60 * 1000), [now]);
  const threeDaysAgo = useMemo(() => new Date(now.getTime() - 3 * 86400 * 1000), [now]);
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const selectedDate = useMemo(() => {
      const date = new Date(selectedDateStr);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() + userTimezoneOffset);
  }, [selectedDateStr]);

  const futureDate = useMemo(() => addDays(selectedDate, daysToAdd), [selectedDate, daysToAdd]);
  const datePlusHours = useMemo(() => addHours(selectedDate, hoursToAdd), [selectedDate, hoursToAdd]);
  const isSelectedDateFuture = useMemo(() => isFuture(selectedDate), [selectedDate]);
  const isYearLeap = useMemo(() => isLeapYear(yearToCheck), [yearToCheck]);
  const dayStart = useMemo(() => startOfDay(selectedDate), [selectedDate]);
  const dayEnd = useMemo(() => endOfDay(selectedDate), [selectedDate]);


  return (
    <div className="space-y-8">
      <FuturisticCard title="formatDate(date, format)" description={`Formats a Date object. Current time: ${formatDate(currentTime, 'HH:mm:ss')}`}>
          <label className="block text-text-secondary mb-2">Format String:</label>
          <FuturisticInput
            type="text"
            value={formatString}
            onChange={(e) => setFormatString(e.target.value)}
            className="w-full bg-base-100/50 border border-base-300 rounded p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-teal font-mono"
            placeholder="e.g., YYYY/MM/DD"
          />
          <OutputBox title="Output:">{formatDate(new Date(), formatString)}</OutputBox>
           <p className="text-xs text-text-secondary/70 mt-2">Supported tokens: YYYY, MM, DD, HH, hh, mm, ss, a, A</p>
      </FuturisticCard>
      
      <FuturisticCard title="formatDuration(seconds)" description="Converts a total number of seconds into a HH:MM:SS format.">
        <div>
            <label className="block text-text-secondary mb-2">Seconds: {durationSeconds.toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="172800"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full accent-neon-teal"
            />
        </div>
        <OutputBox title="Formatted Duration:">
            {formatDuration(durationSeconds)}
        </OutputBox>
      </FuturisticCard>
      
       <FuturisticCard title="Date Arithmetic" description="Adds or subtracts days and hours from a date.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                    <label className="block text-text-secondary mb-2">Start Date:</label>
                    <FuturisticInput type="date" value={selectedDateStr} onChange={(e) => setSelectedDateStr(e.target.value)} />
                </div>
                 <div>
                    <label className="block text-text-secondary mb-2">Days to Add:</label>
                    <FuturisticInput type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(Number(e.target.value))} />
                </div>
                 <div>
                    <label className="block text-text-secondary mb-2">Hours to Add:</label>
                    <FuturisticInput type="number" value={hoursToAdd} onChange={(e) => setHoursToAdd(Number(e.target.value))} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OutputBox title="Date + Days:" size="large">
                    {formatDate(futureDate, 'YYYY-MM-DD')}
                </OutputBox>
                <OutputBox title="Date + Hours:" size="large">
                    {formatDate(datePlusHours, 'YYYY-MM-DD HH:mm')}
                </OutputBox>
            </div>
      </FuturisticCard>

      <FuturisticCard title="Day Boundaries" description="Get the exact start or end of a given day.">
        <div>
            <label className="block text-text-secondary mb-2">Selected Date:</label>
            <FuturisticInput type="date" value={selectedDateStr} onChange={(e) => setSelectedDateStr(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OutputBox title="startOfDay():">
                {formatDate(dayStart, 'YYYY-MM-DD HH:mm:ss')}
            </OutputBox>
            <OutputBox title="endOfDay():">
                {formatDate(dayEnd, 'YYYY-MM-DD HH:mm:ss')}
            </OutputBox>
        </div>
      </FuturisticCard>

      <FuturisticCard title="timeAgo(date)" description="Displays the relative time from now.">
          <ul className="space-y-2 text-text-primary">
            <li><span className="font-mono text-neon-teal w-32 inline-block">Just now:</span> {timeAgo(now)}</li>
            <li><span className="font-mono text-neon-teal w-32 inline-block">5 minutes ago:</span> {timeAgo(fiveMinutesAgo)}</li>
            <li><span className="font-mono text-neon-teal w-32 inline-block">2 hours ago:</span> {timeAgo(twoHoursAgo)}</li>
            <li><span className="font-mono text-neon-teal w-32 inline-block">3 days ago:</span> {timeAgo(threeDaysAgo)}</li>
          </ul>
      </FuturisticCard>

      <FuturisticCard title="Date Checks" description="Boolean checks for various date properties.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-text-secondary mb-2">Select a Date:</label>
                <FuturisticInput
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => setSelectedDateStr(e.target.value)}
                />
                <div className="mt-4 p-4 bg-base-100/50 rounded space-y-2">
                    <p className="text-text-secondary">Is this date today? 
                        <span className={`font-mono ml-2 ${isToday(selectedDate) ? 'text-neon-green' : 'text-neon-red'}`}>{isToday(selectedDate).toString()}</span>
                    </p>
                    <p className="text-text-secondary">Is this date in the future? 
                        <span className={`font-mono ml-2 ${isSelectedDateFuture ? 'text-neon-green' : 'text-neon-red'}`}>{isSelectedDateFuture.toString()}</span>
                    </p>
                </div>
            </div>
            <div>
                <label className="block text-text-secondary mb-2">Enter a year:</label>
                <FuturisticInput
                    type="number"
                    value={yearToCheck}
                    onChange={(e) => setYearToCheck(Number(e.target.value))}
                />
                <div className="mt-4 p-4 bg-base-100/50 rounded">
                    <p className="text-text-secondary">Is {yearToCheck} a leap year?
                        <span className={`font-mono ml-2 ${isYearLeap ? 'text-neon-green' : 'text-neon-red'}`}>
                            {isYearLeap.toString()}
                        </span>
                    </p>
                </div>
            </div>
        </div>
      </FuturisticCard>
    </div>
  );
};

export default DateUtilsExample;
