import { EventType } from '../../types/databaseTypes';
import Card from '../ui/Card';
import Event from './Event.component';

export interface DayProps {
  events: EventType[];
  date: Date;
  small?: boolean;
  handleRSVPClick: (eventId: number) => void;
  handleDetailsClick: (eventId: number) => void;
}

const Day = ({
  events,
  date,
  small = false,
  handleRSVPClick,
  handleDetailsClick
}: DayProps) => {
  return (
    <Card
      color='slate-200'
      className='flex flex-col w-full gap-4 border-2 border-blue-900'
    >
      <div className='text-xl font-bold'>{date.toLocaleDateString()}</div>
      {events?.length === 0 ? (
        <div className='font-italic text-gray-500'>
          No events on this day yet.
        </div>
      ) : (
        events
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .map((event, i) => (
            <Event
              key={i}
              event={event}
              small={small}
              handleDetailsClick={() => handleDetailsClick(event.id)}
              handleRSVPClick={() => handleRSVPClick(event.id)}
            />
          ))
      )}
    </Card>
  );
};

export default Day;
