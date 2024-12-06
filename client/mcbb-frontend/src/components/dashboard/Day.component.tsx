import { EventType } from '../../types/databaseTypes';
import Card from '../ui/Card';
import Event from './Event.component';

export interface DayProps {
  events: EventType[];
  date: Date;
  small?: boolean;
  handleRSVPClick: (eventId: number, type: string) => void;
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
    <>
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
              handleRSVPClick={(type) => handleRSVPClick(event.id, type)}
            />
          ))
      )}
    </>
  );
};

export default Day;
