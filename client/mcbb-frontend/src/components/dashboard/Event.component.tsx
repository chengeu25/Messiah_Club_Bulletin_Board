export interface EventProps {
  startTime: string;
  endTime: string;
  title: string;
  image: string;
  description: string;
}

const Event = ({
  startTime,
  endTime,
  title,
  image,
  description
}: EventProps) => {
  return <div>Event</div>;
};

export default Event;
