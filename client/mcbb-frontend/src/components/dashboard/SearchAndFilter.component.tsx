import { useState } from 'react';
import Input from '../../components/formElements/Input.component';
import CSelect, { GroupBase, StylesConfig } from 'react-select';
import { Location } from 'react-router';
import { OptionType } from '../formElements/Select.styles';
import { CiFilter, CiSearch } from 'react-icons/ci';

/**
 * Represents the properties for the SearchAndFilter component
 *
 * @interface SearchAndFilterProps
 * @property {string} currentPage - The name of the current page being searched/filtered
 * @property {string} selectedFilter - The currently selected filter option
 * @property {(filter: string) => void} setSelectedFilter - Callback to update the selected filter
 * @property {string} searchQuery - The current search query string
 * @property {(query: string) => void} setSearchQuery - Callback to update the search query
 * @property {StylesConfig<OptionType, false, GroupBase<OptionType>>} selectStyles - Custom styles for the select component
 * @property {Location} location - The current router location object
 */
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
 * A component that renders a search bar and a filter dropdown with responsive design
 *
 * @component
 * @param {SearchAndFilterProps} props - The component properties
 * @returns {JSX.Element} A search and filter component with mobile and desktop views
 *
 * @example
 * <SearchAndFilter
 *   currentPage="Events"
 *   selectedFilter="All Events"
 *   setSelectedFilter={handleFilterChange}
 *   searchQuery=""
 *   setSearchQuery={handleSearchChange}
 *   selectStyles={customSelectStyles}
 *   location={location}
 * />
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

  /**
   * Toggles the visibility of the search component and hides the select component
   */
  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible);
    setSelectVisible(false);
  };

  /**
   * Toggles the visibility of the select component and hides the search component
   */
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
          className='md:hidden w-screen h-[100dvh] bg-black bg-opacity-50 fixed top-0 left-0 z-[999] p-5'
          onClick={toggleSearch}
        >
          <span onClick={(e) => e.stopPropagation()}>
            <Input
              placeholder={`Search for ${currentPage}...`}
              name='search'
              type='text'
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
          className='md:hidden w-screen h-[100dvh] bg-black bg-opacity-50 fixed top-0 left-0 z-[999] p-5'
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
