import { UserProfile, Transaction, SavingsGoal, GuardianAlert } from '../types';
import { generateSeedData } from '../../functions/seedData';

const STORAGE_KEY_USERS = 'upay_registered_accounts_v2';
const STORAGE_KEY_ACTIVE_USER_ID = 'upay_active_account_id_v2';
const STORAGE_PREFIX_TX = 'upay_txs_user_';
const STORAGE_PREFIX_GOALS = 'upay_goals_user_';
const STORAGE_PREFIX_ALERTS = 'upay_alerts_user_';

// Initial baseline demo account
const seed = generateSeedData();
export const DEFAULT_DEMO_USER: UserProfile = {
  ...seed.primaryUser,
  id: 'user_01794809461',
  phone: '01794809461',
  name: 'MD. AL-MAYNUL HASAN',
  pin: '1234',
  balance: 18450
};

// Safe localStorage access
const getLocalStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

// 1. Get all registered accounts
export function getRegisteredUsers(): UserProfile[] {
  const storage = getLocalStorage();
  if (!storage) return [DEFAULT_DEMO_USER];

  try {
    const raw = storage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      // Initialize with default demo account
      const initialUsers = [DEFAULT_DEMO_USER];
      storage.setItem(STORAGE_KEY_USERS, JSON.stringify(initialUsers));
      // Save initial demo transactions
      saveUserTransactions(DEFAULT_DEMO_USER.id, seed.transactions);
      saveUserGoals(DEFAULT_DEMO_USER.id, seed.goals);
      return initialUsers;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_DEMO_USER];
  } catch (e) {
    console.warn('Failed to parse registered users, resetting to default', e);
    return [DEFAULT_DEMO_USER];
  }
}

// 2. Save users list
export function saveRegisteredUsers(users: UserProfile[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving registered users to localStorage', e);
  }
}

// 3. Find user by phone
export function findUserByPhone(phone: string): UserProfile | undefined {
  const users = getRegisteredUsers();
  const cleaned = phone.replace(/\D/g, '');
  return users.find((u) => u.phone.replace(/\D/g, '') === cleaned);
}

// 4. Find user by ID
export function findUserById(id: string): UserProfile | undefined {
  const users = getRegisteredUsers();
  return users.find((u) => u.id === id);
}

// 5. Update or save single user profile
export function saveSingleUser(user: UserProfile): void {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.unshift(user);
  }
  saveRegisteredUsers(users);
}

// 6. Active user ID
export function getActiveUserId(): string {
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_DEMO_USER.id;
  return storage.getItem(STORAGE_KEY_ACTIVE_USER_ID) || DEFAULT_DEMO_USER.id;
}

export function setActiveUserId(userId: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY_ACTIVE_USER_ID, userId);
}

// 7. User-isolated transactions
export function getUserTransactions(userId: string): Transaction[] {
  const storage = getLocalStorage();
  if (!storage) return userId === DEFAULT_DEMO_USER.id ? seed.transactions : [];

  try {
    const raw = storage.getItem(`${STORAGE_PREFIX_TX}${userId}`);
    if (!raw) {
      if (userId === DEFAULT_DEMO_USER.id) {
        saveUserTransactions(userId, seed.transactions);
        return seed.transactions;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveUserTransactions(userId: string, txs: Transaction[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(`${STORAGE_PREFIX_TX}${userId}`, JSON.stringify(txs));
  } catch (e) {
    console.error('Error saving user transactions', e);
  }
}

// 8. User-isolated goals
export function getUserGoals(userId: string): SavingsGoal[] {
  const storage = getLocalStorage();
  if (!storage) return userId === DEFAULT_DEMO_USER.id ? seed.goals : [];

  try {
    const raw = storage.getItem(`${STORAGE_PREFIX_GOALS}${userId}`);
    if (!raw) {
      if (userId === DEFAULT_DEMO_USER.id) {
        saveUserGoals(userId, seed.goals);
        return seed.goals;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveUserGoals(userId: string, goals: SavingsGoal[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(`${STORAGE_PREFIX_GOALS}${userId}`, JSON.stringify(goals));
  } catch (e) {
    console.error('Error saving user goals', e);
  }
}

// 9. User-isolated alerts
export function getUserAlerts(userId: string): GuardianAlert[] {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(`${STORAGE_PREFIX_ALERTS}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserAlerts(userId: string, alerts: GuardianAlert[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(`${STORAGE_PREFIX_ALERTS}${userId}`, JSON.stringify(alerts));
  } catch (e) {
    console.error('Error saving user alerts', e);
  }
}

// 10. Register a brand-new user account with welcome bonus & clean isolated state
export interface NewRegistrationParams {
  name: string;
  phone: string;
  pin: string;
  operator?: string;
  profession?: string;
  gender?: string;
  email?: string;
}

export function registerNewAccount(params: NewRegistrationParams): UserProfile {
  const cleanedPhone = params.phone.replace(/\D/g, '') || `017${Math.floor(10000000 + Math.random() * 90000000)}`;
  const userId = `user_${cleanedPhone}`;

  // Welcome bonus of ৳200 as advertised in the registration welcome carousel
  const welcomeBonus = 200;

  const newUser: UserProfile = {
    id: userId,
    name: params.name.trim() || `গ্রাহক ${cleanedPhone.slice(-4)}`,
    phone: cleanedPhone,
    email: params.email?.trim() || undefined,
    balance: welcomeBonus,
    pin: params.pin || '1234',
    isBiometricEnabled: true,
    role: 'user',
    language: 'bn',
    simpleMode: false,
    aiConsentGiven: true,
    accountTier: 'Upay Basic (Verified)',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  // Create isolated welcome bonus transaction for this new user
  const welcomeTx: Transaction = {
    id: `tx_welcome_${Date.now()}`,
    userId: newUser.id,
    type: 'add_money',
    recipient: newUser.phone,
    recipientName: 'উপায় বোনাস (Upay Bonus)',
    amount: welcomeBonus,
    fee: 0,
    total: welcomeBonus,
    note: 'নতুন অ্যাকাউন্ট খোলার ওয়েলকাম বোনাস',
    category: 'অন্যান্য',
    categoryEn: 'Welcome Bonus',
    timestamp: new Date().toISOString(),
    status: 'completed',
    riskScore: 0,
    riskLevel: 'low',
    riskSignals: []
  };

  // Save new user in registry
  saveSingleUser(newUser);

  // Initialize fresh, isolated state for this specific user
  saveUserTransactions(newUser.id, [welcomeTx]);
  saveUserGoals(newUser.id, []);
  saveUserAlerts(newUser.id, []);

  // Set as active user
  setActiveUserId(newUser.id);

  return newUser;
}
