import { Form, useLoaderData, useSubmit } from 'react-router-dom';
import Club from '../../../components/dashboard/Club.component';
import { ClubType, UserType } from '../../../types/databaseTypes';
import Button from '../../../components/formElements/Button.component';

interface LoaderData {
  clubs: ClubType[];
  user: UserType;
}

const Clubs = () => {
  const data: LoaderData = useLoaderData() as LoaderData;
  const submit = useSubmit();

  /**
   * Handles the form submission
   * @param event The form event
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
    <div className='w-full flex flex-col gap-4 flex-grow overflow-y-scroll p-4 md:px-[15%] items-center'>
      {data.user.isFaculty && (
        <Form onSubmit={handleSubmit}>
          <Button
            color='blue'
            text='Create New Club'
            filled
            name='create'
            type='submit'
          />
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
    </div>
  );
};

export default Clubs;
