import { OptionType } from '../components/formElements/Select.styles';

/**
 * Represents a user in the system with their profile and permissions.
 *
 * @interface
 * @description Defines the structure of a user account, including personal details
 * and system-level permissions.
 */
export interface UserType {
  /** The full name of the user */
  name: string;
  /** The user's email address, used as a unique identifier */
  email: string;
  /** Indicates whether the user's email has been verified */
  emailVerified: boolean;
  /** Indicates if the user has faculty status */
  isFaculty: boolean;
  /** Indicates if the user has permission to delete faculty accounts */
  canDeleteFaculty: boolean;
  /** List of club IDs where the user has admin privileges */
  clubAdmins: number[];
  /** List of tags associated with the user's interests or affiliations */
  tags: string[];
}

/**
 * Represents a club in the system with its basic information.
 *
 * @interface
 * @description Defines the core details of a club, including its identification,
 * description, and metadata.
 */
export interface ClubType {
  /** The name of the club */
  name: string;
  /** A description of the club's purpose or activities */
  description: string;
  /** Unique identifier for the club */
  id: number;
  /** URL or path to the club's representative image */
  image: string;
  /** List of tags associated with the club */
  tags: string[];
  /** Indicates whether the current user is subscribed to this club */
  subscribed: boolean;
}

/**
 * Represents an admin of a specific club.
 *
 * @interface
 * @description Provides details about a user who has administrative
 * privileges for a particular club.
 */
export interface ClubAdminType {
  /** Unique identifier for the club admin */
  id: number;
  /** The user's email or unique identifier */
  user: string;
  /** The full name of the club admin */
  name: string;
}

/**
 * Represents an image associated with a club or event.
 *
 * @interface
 * @description Provides a way to reference and store images with a unique identifier.
 */
export interface ImageType {
  url: string | undefined;
  /** Unique identifier for the image */
  id: number;
  /** URL or path to the image */
  image: string;
}

/**
 * Provides comprehensive details about a specific club.
 *
 * @interface
 * @description Extends basic club information with additional details
 * such as administrators and associated images.
 */
export interface ClubDetailType {
  /** Unique identifier for the club */
  id: number;
  /** The name of the club */
  name: string;
  /** A description of the club's purpose or activities */
  description: string;
  /** URL or path to the club's representative image */
  image: string;
  /** List of administrators for this club */
  admins: ClubAdminType[];
  /** List of images associated with the club */
  images: ImageType[];
  /** Optional list of tags associated with the club */
  tags?: OptionType[];
  /** Boolean indicating whether the user is subscribed to the club */
  isSubscribed?: boolean;
  /** Boolean indicating whether the user has blocked the club */
  isBlocked?: boolean;
}

/**
 * Represents an event with comprehensive details.
 *
 * @interface
 * @description Defines the full structure of an event, including
 * timing, location, hosting, and additional metadata.
 */
export interface EventType {
  genderRestriction: string;
  coHosts: any;
  cost: any;
  /** Unique identifier for the event */
  id: number;
  /** The title or name of the event */
  title: string;
  /** A description of the event */
  description: string;
  /** URL or path to the event's representative image */
  image: ImageType;
  /** The start time of the event */
  startTime: Date;
  /** The end time of the event */
  endTime: Date;
  /** The location where the event will take place */
  location: string;
  /** List of hosts for the event */
  host: EventHostType[];
  /** List of tags associated with the event */
  tags: string[];
  /** RSVP status for the event (e.g., 'rsvp', 'block') */
  rsvp: string;
  /** Indicates whether the event is from a subscribed club */
  subscribed: boolean;
  /** Indicates whether the event is from a blocked club */
  blocked: boolean;
}

/**
 * Represents a host of an event.
 *
 * @interface
 * @description Provides basic information about an entity hosting an event.
 */
export interface EventHostType {
  /** Unique identifier for the event host */
  id: number;
  /** The name of the event host */
  name: string;
}

/**
 * Provides detailed information about a specific event.
 *
 * @interface
 * @description Extends the basic event information with additional details
 * such as cost and RSVP status.
 */
export interface EventDetailType {
  isOrganizer: any;
  /** Unique identifier for the event */
  id: number;
  /** The title or name of the event */
  title: string;
  /** A description of the event */
  description: string;
  /** URL or path to the event's representative image */
  image: string;
  /** The start time of the event */
  startTime: Date;
  /** The end time of the event */
  endTime: Date;
  /** The location where the event will take place */
  location: string;
  /** List of hosts for the event */
  host: EventHostType[];
  /** List of tags associated with the event */
  tags: string[];
  /** List of images associated with the event */
  images: ImageType[];
  /** The cost to attend the event */
  cost: number;
  /** RSVP status for the event */
  rsvp: string;
}

/**
 * Provides information about a school
 *
 * @interface
 * @description Represents a school with its email domain, name, logo, and preferred color
 */
export interface SchoolType {
  /** Unique identifier for the school */
  id: number;
  /** Email domain for the school */
  emailDomain: string;
  /** The name of the school */
  name: string;
  /** URL or path to the school's logo */
  logo: string;
  /** The preferred color for the school */
  color: string;
}
