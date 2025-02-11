import { useLoaderData, useParams, useSubmit } from 'react-router-dom';
import { ClubDetailType, EventDetailType } from '../../../types/databaseTypes';
import { useMemo } from 'react';

/**
 * Renders the image page for a specific image.
 * @returns {JSX.Element} The image page
 */
const Image = () => {
  const { imageId } = useParams();
  const data = useLoaderData() as
    | { club: ClubDetailType }
    | { event: EventDetailType };
  const submit = useSubmit();

  const images = useMemo(() => {
    if ('club' in data) {
      return data.club.images;
    }
    if ('event' in data) {
      return data.event.images;
    }
    return [];
  }, [data]);

  if (!images.find((image) => image.id === parseInt(imageId ?? ''))) {
    return <div>Image not found</div>;
  }

  return (
    <div
      className='w-full h-full flex justify-center items-center'
      onClick={() => submit(null, { method: 'post' })}
      tabIndex={0}
    >
      <img
        src={
          'club' in data
            ? images.find((image) => image.id === parseInt(imageId ?? ''))
                ?.image
            : (() => {
                const image = images.find(
                  (image) => image.id === parseInt(imageId ?? '')
                );
                const [prefix, base64Image] = image?.image.split(',') ?? [
                  '',
                  ''
                ];
                return `data:image/${prefix};base64,${base64Image}`;
              })()
        }
        className='w-full h-full sm:w-5/6 sm:h-5/6 object-contain'
        alt={images
          .find((image) => image.id === parseInt(imageId ?? ''))
          ?.id.toString()}
      />
    </div>
  );
};

export default Image;
