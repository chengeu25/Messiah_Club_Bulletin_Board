import Card from '../ui/Card';
import Event, { EventProps } from './Event.component';

export interface DayProps {
  events: EventProps[];
  date: Date;
}

const Day = ({ events, date }: DayProps) => {
  return (
    <Card color='slate-200'>
      <div className='text-xl font-bold'>{date.toLocaleDateString()}</div>
      {events?.length === 0 ? (
        <div className='font-italic text-gray-500'>
          No events on this day yet.
        </div>
      ) : (
        events.map((event) => <Event {...event} />)
      )}
    </Card>
  );
  // TODO: Add day display!
  /* Code to render a day goes here. You'll need to use each of the values defined in DayProps and render
  a visual represenation of the day, with styling (either using TailwindCSS utility classes like I have been or by
  creating a CSS file (make sure it emds with .module.css though!) and importing it with import styles from './your-file-name.module.css');
  if you are more familiar with CSS. Note that to render the events array, you can use events.map() and an <Event /> component inside that call. If you
  need help rendering a list, see https://react.dev/learn/rendering-lists. */
};

export default Day;
