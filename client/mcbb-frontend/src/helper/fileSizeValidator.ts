const validateFileSize = (file: File) => file.size < 16 * 1024 * 1024;

export default validateFileSize;
