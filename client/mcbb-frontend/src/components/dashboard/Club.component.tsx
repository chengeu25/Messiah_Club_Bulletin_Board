import Card from '../ui/Card';

interface ClubProps {
  name: string;
  description: string;
  image: string;
}

const Club = ({ name, description, image }: ClubProps) => {
  return (
    <Card
      color='slate-200'
      className='flex flex-col md:flex-row gap-4 border-2 border-blue-900 w-full'
    >
      <img src={image} alt={name} className='h-16 bg-gray-800 rounded-lg' />
      <div className='flex flex-col'>
        <h1 className='text-xl font-bold'>{name}</h1>
        <p>{description}</p>
      </div>
    </Card>
  );
};

export default Club;
