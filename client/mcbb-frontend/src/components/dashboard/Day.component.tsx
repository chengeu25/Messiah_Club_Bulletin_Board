import Card from '../ui/Card';
import Event, { EventProps } from './Event.component';

export interface DayProps {
  events: EventProps[];
  date: Date;
}

const Day = ({ events, date }: DayProps) => {
  return (
    <Card
      color='slate-200'
      className='flex flex-col gap-4 border-2 border-blue-900'
    >
      <div className='text-xl font-bold'>{date.toLocaleDateString()}</div>
      {events?.length === 0 ? (
        <div className='font-italic text-gray-500'>
          No events on this day yet.
        </div>
      ) : (
        events
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .map((event) => <Event {...event} />)
      )}
    </Card>
  );
};

export default Day;
