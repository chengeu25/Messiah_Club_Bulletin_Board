import Card from '../ui/Card';

interface OfficerProps {
  name: string;
  image: string;
  email: string;
}

const Officer = ({ name, image, email }: OfficerProps) => {
  return (
    <Card
      color='slate-200'
      className='flex flex-col md:flex-row gap-4 border-2 border-blue-900 w-full'
    >
      <img src={image} alt={name} className='h-16 bg-gray-800 rounded-lg' />
      <div className='flex flex-col'>
        <h1 className='text-xl font-bold'>{name}</h1>
        <p>{email}</p>
      </div>
    </Card>
  );
};

export default Officer;
