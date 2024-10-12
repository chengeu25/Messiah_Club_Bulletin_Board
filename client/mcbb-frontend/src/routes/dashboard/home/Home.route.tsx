import Day, { DayProps } from '../../../components/dashboard/Day.component';

const demoDays: DayProps[] = [
  {
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
        description: 'This is an event where all this stuff happens...'
      },
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
        title: 'Event 2',
        image: './../../../assets/logo.png',
        description: 'This is an event where all this stuff happens...'
      }
    ],
    date: new Date('2025-01-01T00:00:00Z')
  },
  {
    events: [],
    date: new Date('2025-01-02T00:00:00Z')
  },
  {
    events: [
      {
        startTime: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          14,
          0,
          0
        ),
        endTime: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          15,
          0,
          0
        ),
        title: 'Event 1',
        image: '../../../../assets/logo.png',
        description: 'This is an event where all this stuff happens...'
      },
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
        title: 'Event 2',
        image: './../../../assets/logo.png',
        description: 'This is an event where all this stuff happens...'
      }
    ],
    date: new Date('2025-01-05T00:00:00Z')
  }
];

const Home = () => {
  return (
    <div className='flex flex-grow flex-col gap-4 overflow-y-scroll p-4 sm:px-[15%] items-center '>
      {demoDays
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((day) => (
          <Day {...day} />
        ))}
    </div>
  );
};

export default Home;
