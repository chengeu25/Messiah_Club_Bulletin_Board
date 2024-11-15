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
