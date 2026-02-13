
export enum SeniorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended'
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export type Gender = 'Male' | 'Female' | 'Other';
export type UserRole = 'Admin' | 'Staff' | 'QR Checker Staff';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: number;
}

export interface SeniorCitizen {
  id: string;
  seniorId: string; // Control #
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dob: string;
  gender: Gender;
  address: string;
  contactNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  photoUrl: string;
  signatureUrl: string;
  status: SeniorStatus;
  createdAt: number;
}

export interface RegistrationApplication extends Omit<SeniorCitizen, 'id' | 'seniorId' | 'status'> {
  id: string;
  applicationId: string;
  appStatus: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: number;
}

export interface SiteSettings {
  title: string;
  logoUrl: string;
  primaryColor: string;
  isDarkMode: boolean;
}

export interface AppState {
  seniors: SeniorCitizen[];
}
