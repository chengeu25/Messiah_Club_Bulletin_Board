import React, { useEffect, useState } from 'react';
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit
} from 'react-router-dom';
import Club from '../../../components/dashboard/Club.component';
import { ClubType, ImageType, UserType } from '../../../types/databaseTypes';
import Button from '../../../components/formElements/Button.component';
import { clubPassesSearch } from '../../../helper/eventHelpers';
import useLoading from '../../../hooks/useLoading';

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
  /** List of active clubs' logos */
  clubLogos: Promise<ImageType[]>;
  /** List of inactive clubs' logos */
  inactiveClubLogos: Promise<ImageType[]>;
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
  const [searchParams] = useSearchParams();
  const { loading } = useLoading();

  // State to store resolved club logos
  const [clubLogos, setClubLogos] = useState<ImageType[] | null>(null);
  const [inactiveClubLogos, setInactiveClubLogos] = useState<
    ImageType[] | null
  >(null);

  // Effect to resolve the clubLogos promise
  useEffect(() => {
    let isMounted = true; // To prevent state updates if the component unmounts
    data.clubLogos
      .then((logos) => {
        if (isMounted) {
          setClubLogos(logos);
        }
      })
      .catch(() => {
        if (isMounted) {
          setClubLogos(null); // Handle errors gracefully
        }
      });
    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [data.clubLogos]);

  // Effect to resolve the inactiveClubLogos promise
  useEffect(() => {
    let isMounted = true; // To prevent state updates if the component unmounts
    try {
      data?.inactiveClubLogos
        ?.then((logos) => {
          if (isMounted) {
            setInactiveClubLogos(logos);
          }
        })
        ?.catch(() => {
          if (isMounted) {
            setInactiveClubLogos(null); // Handle errors gracefully
          }
        });
    } catch (error) {
      if (isMounted) {
        setInactiveClubLogos(null); // Handle errors gracefully
      }
    }

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [data?.inactiveClubLogos]);

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
      {loading ? (
        <div>Loading clubs...</div>
      ) : data.clubs.filter((club) =>
          clubPassesSearch(club, searchParams.get('search') ?? '')
        ).length === 0 ? (
        <div className='text-2xl font-bold text-center'>
          No clubs found with the specified search criteria.
        </div>
      ) : (
        data.clubs
          .filter((club) =>
            clubPassesSearch(club, searchParams.get('search') ?? '')
          )
          .map((club) => (
            <Club
              key={club.name}
              {...club}
              image={
                clubLogos
                  ? clubLogos.find((logo) => logo.id === club.id)?.image ?? ''
                  : ''
              }
              editable={
                data.user.isFaculty || data.user.clubAdmins?.includes(club.id)
              }
              deletable={data.user.isFaculty}
              onSubmit={(e) => handleSubmit(e, club.id)}
            />
          ))
      )}
      {data.user.isFaculty && data.inactiveClubs.length > 0 && !loading && (
        <>
          <h2 className='text-2xl font-bold'>Inactive Clubs</h2>
          {data.inactiveClubs
            .filter((club) =>
              clubPassesSearch(club, searchParams.get('search') ?? '')
            )
            .map((club) => (
              <Club
                key={club.name + '-' + club.id}
                {...club}
                image={
                  inactiveClubLogos
                    ? inactiveClubLogos.find((logo) => logo.id === club.id)
                        ?.image ?? ''
                    : ''
                }
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
