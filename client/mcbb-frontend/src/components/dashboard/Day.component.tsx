import Event, { EventProps } from './Event.component';

export interface DayProps {
  events: EventProps[];
  date: Date;
}

const Day = ({ events, date }: DayProps) => {
  return <div>Day</div>;
};

export default Day;
