import { OptionType } from '../components/formElements/Select.styles';

export interface UserType {
  name: string;
  email: string;
  emailVerified: boolean;
  isFaculty: boolean;
  canDeleteFaculty: boolean;
  clubAdmins: number[];
  tags: string[];
}

export interface ClubType {
  name: string;
  description: string;
  id: number;
  image: string;
  tags: string[];
}

export interface ClubAdminType {
  id: number;
  user: string;
  name: string;
}

export interface ImageType {
  id: number;
  image: string;
}

export interface ClubDetailType {
  id: number;
  name: string;
  description: string;
  image: string;
  admins: ClubAdminType[];
  images: ImageType[];
  tags?: OptionType[];
}

export interface EventType {
  id: number;
  title: string;
  description: string;
  image: string;
  startTime: Date;
  endTime: Date;
  location: string;
  host: EventHostType[];
  tags: string[];
  images: ImageType[];
  rsvp: string;
}

export interface EventHostType {
  id: number;
  name: string;
}

export interface EventDetailType {
  id: number;
  title: string;
  description: string;
  image: string;
  startTime: Date;
  endTime: Date;
  location: string;
  host: EventHostType[];
  tags: string[];
  images: ImageType[];
  cost: number;
  rsvp: string;
}
