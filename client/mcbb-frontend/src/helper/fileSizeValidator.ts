/**
 * Validates if a file's size is within the acceptable limit.
 * 
 * @param {File} file - The file to validate
 * @returns {boolean} True if the file size is less than 16MB, false otherwise
 * 
 * @description Checks if the file size is below 16 megabytes (16 * 1024 * 1024 bytes).
 * This is useful for enforcing file upload size restrictions.
 */
const validateFileSize = (file: File) => file.size < 16 * 1024 * 1024;

export default validateFileSize;
