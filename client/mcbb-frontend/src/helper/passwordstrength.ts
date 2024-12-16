/**
 * Checks if a password meets the minimum strength requirements.
 *
 * @param {string} password - The password to validate
 * @returns {boolean} True if the password is strong, false otherwise
 *
 * @description Validates password strength based on the following criteria:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * - Contains at least one special character from !@#$%^&*
 */
function passwordStrongOrNah(password: string) {
  if (password.length < 8) {
    return false;
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return false;
  }
  if (!/\d/.test(password)) {
    return false;
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return false;
  }
  return true;
}
export default passwordStrongOrNah;
