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
  // TODO: Add event display!
  /* Code to render an event goes here. You'll need to use each of the values defined in EventProps and render
  a visual represenation of the event, with styling (either using TailwindCSS utility classes like I have been or by
  creating a CSS file (make sure it emds with .module.css though!) and importing it with 
  import styles from './your-file-name.module.css'); */
};

export default Event;
