export interface UserType {
  name: string;
  email: string;
  emailVerified: boolean;
  isFaculty: boolean;
  canDeleteFaculty: boolean;
  clubAdmins: number[];
}

export interface ClubType {
  name: string;
  description: string;
  id: number;
  image: string;
}

export interface ClubAdminType {
  id: number;
  user: string;
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
}
