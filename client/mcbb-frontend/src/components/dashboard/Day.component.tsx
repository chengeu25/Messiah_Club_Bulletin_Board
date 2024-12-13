import { getDayName } from '../../helper/dateUtils';
import { EventType } from '../../types/databaseTypes';
import Event from './Event.component';

/**
 * Represents the properties for the Day component
 *
 * @interface DayProps
 * @property {EventType[]} events - List of events for the day
 * @property {Date} date - The date for which events are being displayed
 * @property {boolean} [small=false] - Flag to render events in a compact view
 * @property {(eventId: number, type: string) => void} handleRSVPClick - Callback for RSVP actions
 * @property {(eventId: number) => void} handleDetailsClick - Callback for viewing event details
 */
export interface DayProps {
  events: EventType[];
  date: Date;
  small?: boolean;
  handleRSVPClick: (eventId: number, type: string) => void;
  handleDetailsClick: (eventId: number) => void;
}

/**
 * Renders a day component with its events, sorted chronologically
 *
 * @component
 * @param {DayProps} props - The properties for the Day component
 * @returns {JSX.Element} A component displaying the day's date and associated events
 *
 * @example
 * <Day
 *   events={[event1, event2]}
 *   date={new Date()}
 *   handleRSVPClick={(id, type) => handleRSVP(id, type)}
 *   handleDetailsClick={(id) => showEventDetails(id)}
 * />
 */
const Day = ({
  events,
  date,
  small = false,
  handleRSVPClick,
  handleDetailsClick
}: DayProps) => (
  <>
    <div className='text-xl font-bold flex flex-col'>
      {getDayName(date)}, {date.toLocaleDateString()}
    </div>
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

export default Day;
