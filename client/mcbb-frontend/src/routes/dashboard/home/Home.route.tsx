import Day, { DayProps } from '../../../components/dashboard/Day.component';

const demoDays: DayProps[] = [
  {
    events: [
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch',
        image: 'https://via.placeholder.com/150',
        description: 'Lunch with friends'
      }
    ],
    date: new Date('2022-01-01T00:00:00Z')
  }
];

const Home = () => {
  return (
    <div className='flex flex-grow overflow-y-scroll p-4 sm:px-[15%] justify-center '>
      {demoDays.map((day) => (
        <Day {...day} />
      ))}
    </div>
  );
};

export default Home;
