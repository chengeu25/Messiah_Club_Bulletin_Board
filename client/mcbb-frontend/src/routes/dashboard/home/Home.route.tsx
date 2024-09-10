import Day, { DayProps } from '../../../components/dashboard/Day.component';

const demoDays: DayProps[] = [];

const Home = () => {
  return (
    <div className='flex flex-grow overflow-y-scroll p-4 sm:px-[15%] justify-center '>
      {
        // TODO: Add day list display!
      }
      {/* Code to render days goes here. You'll use a <Day /> component for each day,
       and you can use demoDays.map() to render the list. This article is helpful: 
       https://react.dev/learn/rendering-lists. The DayProps and EventProps types
       (follow the imports to get there) will help with determining what attributes
       ("props" in React) to give the components and how to structure the demoDays array. */}
    </div>
  );
};

export default Home;
