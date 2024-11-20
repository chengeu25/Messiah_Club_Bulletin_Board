const toTitleCase = (str: string) =>
  str
    .toLowerCase() // Convert the entire string to lowercase
    .split(' ') // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string

export default toTitleCase;
