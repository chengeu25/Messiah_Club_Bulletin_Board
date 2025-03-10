import { UserType } from '../types/databaseTypes';

/**
 * AuthSync provides a thread-safe, singleton-based mechanism for managing user authentication sessions.
 *
 * @class AuthSync
 * @description
 * - Ensures only one authentication operation can occur at a time
 * - Prevents race conditions in session management
 * - Provides centralized methods for checking and managing user sessions
 *
 * @workflow
 * 1. Get singleton instance via getInstance()
 * 2. Use checkSession() to validate current session
 * 3. Use performLogout() to terminate session
 *
 * @example
 * const authSync = AuthSync.getInstance();
 * const user = await authSync.checkSession();
 * await authSync.performLogout();
 */
export class AuthSync {
  private static _instance: AuthSync;
  private _currentOperation: Promise<any> | null = null;

  /**
   * Private constructor to enforce singleton pattern
   * @private
   */
  private constructor() {}

  /**
   * Retrieve the singleton instance of AuthSync
   *
   * @returns {AuthSync} The singleton AuthSync instance
   * @static
   */
  static getInstance(): AuthSync {
    if (!this._instance) {
      this._instance = new AuthSync();
    }
    return this._instance;
  }

  /**
   * Execute an operation exclusively, preventing concurrent authentication requests
   *
   * @template T The return type of the operation
   * @param {() => Promise<T>} operation The authentication operation to run
   * @returns {Promise<T>} The result of the operation
   * @private
   */
  private async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    // Wait for any ongoing operation to complete
    while (this._currentOperation) {
      await this._currentOperation;
    }

    // Create a new operation promise
    this._currentOperation = (async () => {
      try {
        return await operation();
      } finally {
        // Always reset the current operation
        this._currentOperation = null;
      }
    })();

    return this._currentOperation;
  }

  /**
   * Check the current user session status
   *
   * @returns {Promise<UserType | false>}
   * - User object if session is valid
   * - false if session is invalid or expired
   *
   * @description
   * - Sends a request to the backend to validate the current session
   * - Handles network errors and invalid session states
   */
  async checkSession(): Promise<UserType | false> {
    return this.runExclusive(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/check-user`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          return false;
        }

        const json = await response.json();

        // If no user_id, consider it logged out
        if (!json.user_id) {
          return false;
        }

        return {
          name: json.name,
          email: json.user_id,
          emailVerified: json.emailVerified === 1 ? true : false,
          isFaculty: json.isFaculty === 1 ? true : false,
          canDeleteFaculty: json.canDeleteFaculty === 1 ? true : false,
          clubAdmins: json.clubAdmins,
          tags: json.tags,
          gender: json.gender
        };
      } catch {
        return false;
      }
    });
  }

  /**
   * Perform user logout
   *
   * @returns {Promise<void>}
   * @description
   * - Sends a logout request to the backend
   * - Terminates the current user session
   */
  async performLogout(): Promise<void> {
    return this.runExclusive(async () => {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  }
}

/**
 * Check user authentication status with optional role-based access control
 *
 * @param {Object} [options] Optional configuration for access control
 * @param {boolean} [options.requireFaculty] Require user to be faculty
 * @param {boolean} [options.requireDeleteFaculty] Require user to have delete faculty permissions
 *
 * @returns {Promise<UserType | false>}
 * - User object if authenticated and meets role requirements
 * - false if not authenticated or role requirements not met
 *
 * @example
 * // Check basic authentication
 * const user = await checkUser();
 *
 * // Check faculty authentication
 * const facultyUser = await checkUser({ requireFaculty: true });
 */
const checkUser = async (
  options: {
    requireFaculty?: boolean;
    requireDeleteFaculty?: boolean;
  } = {}
): Promise<UserType | false> => {
  const authSync = AuthSync.getInstance();
  const user = await authSync.checkSession();

  if (!user) {
    return false;
  }

  // Check role-based access
  if (options.requireFaculty && !user.isFaculty) {
    return false;
  }

  if (options.requireDeleteFaculty && !user.canDeleteFaculty) {
    return false;
  }

  return user;
};

export default checkUser;
