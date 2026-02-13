
import { SeniorCitizen, SeniorStatus, UserAccount, SiteSettings, RegistrationApplication, ApplicationStatus } from './types';

const DB_KEY = 'senior_citizen_db';
const USERS_KEY = 'senior_system_users';
const SESSION_KEY = 'senior_system_session';
const SETTINGS_KEY = 'senior_system_settings';
const APPS_KEY = 'senior_system_applications';

export const db = {
  // --- Senior Management ---
  getSeniors: (): SeniorCitizen[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  getSeniorById: (id: string): SeniorCitizen | undefined => {
    const seniors = db.getSeniors();
    return seniors.find(s => s.id === id || s.seniorId === id);
  },

  saveSenior: (senior: SeniorCitizen) => {
    const seniors = db.getSeniors();
    const index = seniors.findIndex(s => s.id === senior.id);
    if (index > -1) {
      seniors[index] = senior;
    } else {
      seniors.push(senior);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(seniors));
  },

  deleteSenior: (id: string) => {
    const seniors = db.getSeniors();
    const filtered = seniors.filter(s => s.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  },

  generateSeniorId: (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `PLN-${year}-${random}`;
  },

  // --- Public Applications ---
  getApplications: (): RegistrationApplication[] => {
    const data = localStorage.getItem(APPS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveApplication: (app: RegistrationApplication) => {
    const apps = db.getApplications();
    apps.push(app);
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  },

  updateApplication: (app: RegistrationApplication) => {
    const apps = db.getApplications();
    const index = apps.findIndex(a => a.id === app.id);
    if (index > -1) {
      apps[index] = app;
      localStorage.setItem(APPS_KEY, JSON.stringify(apps));
    }
  },

  deleteApplication: (id: string) => {
    const apps = db.getApplications();
    const filtered = apps.filter(a => a.id !== id);
    localStorage.setItem(APPS_KEY, JSON.stringify(filtered));
  },

  generateAppId: (): string => {
    const random = Math.floor(100000 + Math.random() * 899999);
    return `APP-${random}`;
  },

  approveApplication: (id: string, adminId: string) => {
    const apps = db.getApplications();
    const appIndex = apps.findIndex(a => a.id === id);
    if (appIndex > -1) {
      const app = apps[appIndex];
      app.appStatus = ApplicationStatus.APPROVED;
      app.reviewedBy = adminId;
      app.reviewedAt = Date.now();
      
      const newSenior: SeniorCitizen = {
        id: app.id,
        seniorId: db.generateSeniorId(),
        firstName: app.firstName,
        middleName: app.middleName,
        lastName: app.lastName,
        suffix: app.suffix,
        dob: app.dob,
        gender: app.gender,
        address: app.address,
        contactNumber: app.contactNumber,
        emergencyContact: app.emergencyContact,
        emergencyPhone: app.emergencyPhone,
        photoUrl: app.photoUrl,
        signatureUrl: app.signatureUrl,
        status: SeniorStatus.ACTIVE,
        createdAt: Date.now()
      };
      
      db.saveSenior(newSenior);
      db.updateApplication(app);
    }
  },

  // --- Site Settings ---
  getSettings: (): SiteSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        title: 'Paluan SeniorID',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Paluan_Seal.png',
        primaryColor: '#065f46', // emerald-800
        isDarkMode: false
      };
    }
    return JSON.parse(data);
  },

  saveSettings: (settings: SiteSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // --- User Management ---
  getUsers: (): UserAccount[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      const defaultAdmin: UserAccount = {
        id: '1',
        username: 'admin',
        password: 'password123',
        role: 'Admin',
        createdAt: Date.now()
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    return JSON.parse(data);
  },

  saveUser: (user: UserAccount) => {
    const users = db.getUsers();
    // Normalize username to lowercase for robust lookup
    const normalizedUser = { ...user, username: user.username.toLowerCase() };
    const index = users.findIndex(u => u.id === normalizedUser.id);
    if (index > -1) {
      users[index] = normalizedUser;
    } else {
      users.push(normalizedUser);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  deleteUser: (id: string) => {
    const users = db.getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  },

  // --- Session Management ---
  getCurrentUser: (): UserAccount | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  login: (username: string, password: string): UserAccount | null => {
    const users = db.getUsers();
    const normalizedInputUsername = username.toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === normalizedInputUsername && u.password === password);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};
