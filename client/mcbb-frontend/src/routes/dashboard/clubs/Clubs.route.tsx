import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit
} from 'react-router-dom';
import Club from '../../../components/dashboard/Club.component';
import { ClubType, UserType } from '../../../types/databaseTypes';
import Button from '../../../components/formElements/Button.component';

interface LoaderData {
  clubs: ClubType[];
  inactiveClubs: ClubType[];
  user: UserType;
}

const Clubs = () => {
  const data: LoaderData = useLoaderData() as LoaderData;
  const submit = useSubmit();
  const [params] = useSearchParams();

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

  /**
   * Checks if the club passes the search query
   * Passes if the name includes the search query or if any of the words in the search query
   * include a tag of the club
   * @param club The club to check
   * @returns True if the club passes the search query
   */
  const passesSearch = (club: ClubType) =>
    club.name
      .toLowerCase()
      .includes(params.get('search')?.toLowerCase() ?? '') ||
    params
      .get('search')
      ?.toLowerCase()
      .split(' ')
      .some((tag) =>
        club.tags?.some((clubTag) => tag.includes(clubTag.toLowerCase()))
      );

  const passesFilter = (club: ClubType) =>
    params.get('filter') === 'Suggested'
      ? club.tags.some((tag) => data.user.tags.includes(tag))
      : true;

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
      {data.clubs
        .filter((club) => passesSearch(club) && passesFilter(club))
        .map((club) => (
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
          {data.inactiveClubs
            .filter((club) => passesSearch(club) && passesFilter(club))
            .map((club) => (
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
