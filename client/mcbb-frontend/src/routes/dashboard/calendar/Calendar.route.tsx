import Day from '../../../components/dashboard/Day.component';
import { getMostRecentSunday } from '../../../helper/dateUtils';

const dummyDays = new Array(Math.min(Math.round(window.innerWidth / 240), 7))
  .fill(0)
  .map((_, i) => {
    return {
      date: new Date(
        new Date().setDate(getMostRecentSunday(new Date()).getDate() + i)
      ),
      events: [
        {
          startTime: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            12,
            0,
            0
          ),
          endTime: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            13,
            0,
            0
          ),
          title: 'Event 1',
          image: '../../../../assets/logo.png',
          description: 'This is an event where all this stuff happens...',
          host: 'Club 1'
        }
      ]
    };
  });

const Calendar = () => {
  return (
    <div className='flex flex-row w-full gap-2 m-2'>
      {dummyDays.map((day) => (
        <Day key={day.date.getTime()} small={true} {...day} />
      ))}
    </div>
  );
};

export default Calendar;
