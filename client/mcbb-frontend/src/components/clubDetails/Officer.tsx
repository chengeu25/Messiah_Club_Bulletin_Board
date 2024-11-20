import { ClubAdminType } from '../../types/databaseTypes';
import Card from '../ui/Card';

const Officer = ({ name, user }: ClubAdminType) => {
  return (
    <Card
      color='slate-200'
      className='flex flex-col md:flex-row gap-4 border-2 border-blue-900 w-full'
    >
      <div className='flex flex-col'>
        <h1 className='text-xl font-bold'>{name}</h1>
        <p>{user}</p>
      </div>
    </Card>
  );
};

export default Officer;
