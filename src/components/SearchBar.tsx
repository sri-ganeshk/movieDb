import React from 'react';

const SearchBar = ({ searchMovies, setSearchMovies, onSearch }) => {
  const handleInputChange = (e) => {
    setSearchMovies(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <input
        type="text"
        value={searchMovies}
        onChange={handleInputChange}
        placeholder="Search for movies..."
        className="w-full py-2 px-4 bg-gray-800 text-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
      />
    </form>
  );
};
export default SearchBar;
