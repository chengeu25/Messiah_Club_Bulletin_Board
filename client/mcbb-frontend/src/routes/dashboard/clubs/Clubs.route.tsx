import Club from '../../../components/dashboard/Club.component';

const dummyClubs = [
  {
    name: 'Club 1',
    description: 'Description 1',
    image: '../../../../assets/logo.png'
  },
  {
    name: 'Club 2',
    description: 'Description 2',
    image: '../../../../assets/logo.png'
  },
  {
    name: 'Club 3',
    description: 'Description 3',
    image: '../../../../assets/logo.png'
  }
];

const Clubs = () => {
  return (
    <div className='w-full flex flex-col gap-4 flex-grow overflow-y-scroll p-4 sm:px-[15%] items-center'>
      {dummyClubs.map((club) => (
        <Club key={club.name} {...club} />
      ))}
    </div>
  );
};

export default Clubs;
