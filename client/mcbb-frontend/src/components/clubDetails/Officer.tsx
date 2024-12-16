import { ClubAdminType } from '../../types/databaseTypes';
import Card from '../ui/Card';

/**
 * Renders an officer card with their name and user information
 *
 * @component
 * @param {ClubAdminType} props - The props for the Officer component
 * @param {string} props.name - The name of the officer
 * @param {string} props.user - The user identifier or additional information for the officer
 * @returns {JSX.Element} A card displaying the officer's details
 */
const Officer = ({ name, user }: ClubAdminType) => (
  <Card color='gray-200' className='flex flex-col md:flex-row gap-4 w-full'>
    <div className='flex flex-col'>
      <h1 className='text-xl font-bold'>{name}</h1>
      <p>{user}</p>
    </div>
  </Card>
);

export default Officer;
