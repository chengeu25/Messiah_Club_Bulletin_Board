import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import Club from '../../../components/dashboard/Club.component';
import { ClubType, UserType } from '../../../types/databaseTypes';
import Button from '../../../components/formElements/Button.component';

/**
 * Interface defining the structure of data loaded for the Clubs page.
 *
 * @interface LoaderData
 * @description Provides clubs data, including active and inactive clubs, and user information
 */
interface LoaderData {
  /** List of active clubs */
  clubs: ClubType[];
  /** List of inactive clubs */
  inactiveClubs: ClubType[];
  /** Current user's information */
  user: UserType;
}

/**
 * Clubs dashboard component for displaying and managing clubs.
 *
 * @component
 * @description Renders a list of clubs with:
 * - Filtering and searching capabilities
 * - Create new club button for faculty
 * - Separate sections for active and inactive clubs
 *
 * @returns {React.ReactElement} Rendered clubs dashboard
 */
const Clubs = () => {
  const data: LoaderData = useLoaderData() as LoaderData;
  const submit = useSubmit();

  /**
   * Handles form submission for club-related actions.
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @param {number} [id] - Optional club ID for specific actions
   *
   * @description Processes form submissions for:
   * - Creating new clubs
   * - Performing actions on existing clubs
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    id?: number
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    formData.append('action', action);
    if (id) {
      formData.append('id', id.toString());
    }
    submit(formData, { method: 'post' });
  };

  return (
    <div className='w-full flex flex-col gap-4 flex-grow overflow-y-auto p-4 md:px-[15%] items-center'>
      {data.user.isFaculty && (
        <Form onSubmit={handleSubmit}>
          <Button text='Create New Club' filled name='create' type='submit' />
        </Form>
      )}
      {data.clubs.map((club) => (
        <Club
          key={club.name}
          {...club}
          editable={
            data.user.isFaculty || data.user.clubAdmins?.includes(club.id)
          }
          deletable={data.user.isFaculty}
          onSubmit={(e) => handleSubmit(e, club.id)}
        />
      ))}
      {data.user.isFaculty && data.inactiveClubs.length > 0 && (
        <>
          <h2 className='text-2xl font-bold'>Inactive Clubs</h2>
          {data.inactiveClubs.map((club) => (
            <Club
              key={club.name + '-' + club.id}
              {...club}
              editable={false}
              deletable={false}
              inactive
              onSubmit={(e) => handleSubmit(e, club.id)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Clubs;
