import { useState } from 'react';
import Input from '../../components/formElements/Input.component'; // Assuming Input is your custom input component
import CSelect, { GroupBase, StylesConfig } from 'react-select'; // Assuming CSelect is your react-select component
import { Location } from 'react-router';
import { OptionType } from '../formElements/Select.styles';
import { CiFilter, CiSearch } from 'react-icons/ci';

interface SearchAndFilterProps {
  currentPage: string;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectStyles: StylesConfig<OptionType, false, GroupBase<OptionType>>;
  location: Location;
}

/**
 * A component that renders a search bar and a filter dropdown.
 * @param {Object} props - The component props
 * @param {string} props.currentPage - The current page name
 * @param {string} props.selectedFilter - The currently selected filter
 * @param {Function} props.setSelectedFilter - Function to update the selected filter
 * @param {string} props.searchQuery - The current search query
 * @param {Function} props.setSearchQuery - Function to update the search query
 * @param {StylesConfig<OptionType, false, GroupBase<OptionType>>} props.selectStyles - Styles for the select component
 * @param {Location} props.location - The current location object
 * @returns {JSX.Element} The rendered SearchAndFilter component
 */
const SearchAndFilter = ({
  currentPage,
  selectedFilter,
  setSelectedFilter,
  searchQuery,
  setSearchQuery,
  selectStyles,
  location
}: SearchAndFilterProps) => {
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [isSelectVisible, setSelectVisible] = useState(false);

  /** Toggles the visibility of the search component */
  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible);
    setSelectVisible(false);
  };

  /** Toggles the visibility of the select component */
  const toggleSelect = () => {
    setSelectVisible(!isSelectVisible);
    setSearchVisible(false);
  };

  return (
    <div className='flex flex-col md:flex-row items-center flex-grow'>
      {/* Buttons for small screens */}
      <div className='md:hidden flex space-x-2'>
        <button onClick={toggleSearch}>
          <CiSearch size={30} />
        </button>
        <button onClick={toggleSelect}>
          <CiFilter size={30} />
        </button>
      </div>

      {/* Input and CSelect for larger screens */}
      <div className='hidden md:flex space-x-2 flex-grow'>
        <Input
          placeholder={`Search for ${currentPage}...`}
          name='search'
          type='text'
          color='blue'
          label=''
          filled={false}
          value={searchQuery}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
        />
        <CSelect
          options={[
            `All ${currentPage}`,
            'Suggested',
            location.pathname.includes('/clubs')
              ? 'Subscribed'
              : 'Hosted by Subscribed Clubs',
            ...(location.pathname.includes('/calendar') ||
            location.pathname.includes('/home')
              ? ['Attending']
              : [])
          ].map((item) => ({ label: item, value: item }))}
          styles={selectStyles}
          value={{ value: selectedFilter, label: selectedFilter }}
          onChange={(value) => setSelectedFilter(value?.value as string)}
        />
      </div>

      {/* Conditional rendering for mobile view */}
      {isSearchVisible && (
        <div
          className='md:hidden w-screen h-screen bg-black bg-opacity-50 fixed top-0 left-0 z-[999] p-5'
          onClick={toggleSearch}
        >
          <span onClick={(e) => e.stopPropagation()}>
            <Input
              placeholder={`Search for ${currentPage}...`}
              name='search'
              type='text'
              color='blue'
              label=''
              filled={false}
              value={searchQuery}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </span>
        </div>
      )}
      {isSelectVisible && (
        <div
          className='md:hidden w-screen h-screen bg-black bg-opacity-50 fixed top-0 left-0 z-[999] p-5'
          onClick={toggleSelect}
        >
          <span onClick={(e) => e.stopPropagation()}>
            <CSelect
              options={[
                `All ${currentPage}`,
                'Suggested',
                location.pathname.includes('/clubs')
                  ? 'Subscribed'
                  : 'Hosted by Subscribed Clubs',
                ...(location.pathname.includes('/calendar')
                  ? ['Attending']
                  : [])
              ].map((item) => ({ label: item, value: item }))}
              styles={selectStyles}
              value={{ value: selectedFilter, label: selectedFilter }}
              onChange={(value) => setSelectedFilter(value?.value as string)}
            />
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
