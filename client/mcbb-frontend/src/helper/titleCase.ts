/**
 * Converts a string to title case (first letter of each word capitalized).
 * 
 * @param {string} str - The input string to convert
 * @returns {string} The input string converted to title case
 * 
 * @description Transforms a string by:
 * - Converting the entire string to lowercase
 * - Capitalizing the first letter of each word
 * 
 * @example
 * toTitleCase('hello world')     // Returns 'Hello World'
 * toTitleCase('JAVASCRIPT IS AWESOME')  // Returns 'Javascript Is Awesome'
 */
const toTitleCase = (str: string) =>
  str
    .toLowerCase() // Convert the entire string to lowercase
    .split(' ') // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string

export default toTitleCase;
