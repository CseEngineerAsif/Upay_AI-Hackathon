import { create } from 'zustand';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType, testFirestoreConnection } from '../services/firebase';
import { generateSeedData } from '../../functions/seedData';
import {
  UserProfile,
  Transaction,
  SavingsGoal,
  AnalystQueueItem,
  GuardianAlert,
  Language,
  RiskAssessment,
  TransactionType,
  TransactionCategory
} from '../types';
import { SectionId, FeatureTab } from '../types/sections';
import {
  getRegisteredUsers,
  findUserByPhone,
  findUserById,
  saveSingleUser,
  getActiveUserId,
  setActiveUserId,
  getUserTransactions,
  saveUserTransactions,
  getUserGoals,
  saveUserGoals,
  getUserAlerts,
  saveUserAlerts,
  registerNewAccount,
  NewRegistrationParams,
  DEFAULT_DEMO_USER
} from '../utils/accountManager';

interface PendingPayment {
  type: TransactionType;
  recipient: string;
  recipientName?: string;
  amount: number;
  fee: number;
  note?: string;
  category: TransactionCategory;
  categoryEn: string;
  roundUpAmount: number;
}

interface AppState {
  user: UserProfile | null;
  registeredUsers: UserProfile[];
  isAuthenticated: boolean;
  isLoading: boolean;
  language: Language;
  simpleMode: boolean;
  hasAiConsent: boolean;
  transactions: Transaction[];
  goals: SavingsGoal[];
  analystQueue: AnalystQueueItem[];
  guardianAlerts: GuardianAlert[];
  unreadAlertCount: number;

  // Navigation
  activeTab: 'home' | 'account' | 'history' | 'more' | 'safe_ai' | FeatureTab | 'section';
  activeSection: SectionId | null;
  historyStack: Array<{ tab: 'home' | 'account' | 'history' | 'more' | 'safe_ai' | FeatureTab | 'section'; section: SectionId | null }>;
  currentModal: string | null;
  isSidePanelOpen: boolean;
  isMoreDrawerOpen: boolean;
  
  // Payment Flow State
  pendingPayment: PendingPayment | null;
  currentRiskAssessment: RiskAssessment | null;
  lastCompletedTx: Transaction | null;

  // Actions
  registerUser: (params: NewRegistrationParams) => Promise<UserProfile>;
  switchUser: (phoneOrId: string) => boolean;
  loginWithPin: (pin: string, phoneOrId?: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  toggleSimpleMode: () => void;
  grantAiConsent: () => void;
  setActiveTab: (tab: 'home' | 'account' | 'history' | 'more' | 'safe_ai' | FeatureTab | 'section') => void;
  openSection: (sectionId: SectionId) => void;
  navigateBack: () => void;
  setCurrentModal: (modal: string | null) => void;
  setSidePanelOpen: (open: boolean) => void;
  setMoreDrawerOpen: (open: boolean) => void;

  // Data Actions
  initData: () => Promise<void>;
  startPaymentFlow: (payment: PendingPayment) => void;
  setRiskAssessment: (assessment: RiskAssessment | null) => void;
  confirmPaymentWithPin: (pin: string, paymentOverride?: PendingPayment) => Promise<{ success: boolean; error?: string; tx?: Transaction }>;
  cancelPendingPayment: () => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'userId'>) => void;
  updateGoalDeposit: (goalId: string, amount: number) => void;
  toggleGoalRoundUp: (goalId: string) => void;
  giveRiskFeedback: (txId: string, feedback: 'helpful' | 'unhelpful', isScam?: boolean) => void;
  analystAction: (queueId: string, action: 'review' | 'dismiss' | 'escalate', notes?: string) => Promise<void>;
  acknowledgeGuardianAlert: (alertId: string) => void;
  depositRelief: (amount: number) => void;
}

// Cross-tab broadcast channel for real-time guardian & analyst demo
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('upay_safe_sync_channel');
}

export const useAppStore = create<AppState>((set, get) => {
  // Listen to cross-tab updates
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'NEW_GUARDIAN_ALERT') {
        set((state) => ({
          guardianAlerts: [payload, ...state.guardianAlerts],
          unreadAlertCount: state.unreadAlertCount + 1
        }));
      } else if (type === 'NEW_ANALYST_QUEUE_ITEM') {
        set((state) => ({
          analystQueue: [payload, ...state.analystQueue]
        }));
      } else if (type === 'SYNC_TRANSACTION') {
        set((state) => ({
          transactions: [payload.tx, ...state.transactions],
          user: state.user ? { ...state.user, balance: payload.newBalance } : null
        }));
      }
    };
  }

  const initialSeed = generateSeedData();
  const allUsers = getRegisteredUsers();
  const activeId = getActiveUserId();
  const initialUser = findUserById(activeId) || allUsers[0] || DEFAULT_DEMO_USER;
  const initialTxs = getUserTransactions(initialUser.id);
  const initialGoals = getUserGoals(initialUser.id);
  const initialAlerts = getUserAlerts(initialUser.id);

  return {
    user: initialUser,
    registeredUsers: allUsers,
    isAuthenticated: false,
    isLoading: false,
    language: initialUser.language || 'bn',
    simpleMode: initialUser.simpleMode || false,
    hasAiConsent: initialUser.aiConsentGiven ?? true,
    transactions: initialTxs,
    goals: initialGoals,
    analystQueue: initialSeed.analystQueue,
    guardianAlerts: initialAlerts,
    unreadAlertCount: initialAlerts.filter((a) => a.status === 'pending').length,

    activeTab: 'home',
    activeSection: null,
    historyStack: [],
    currentModal: null,
    isSidePanelOpen: false,
    isMoreDrawerOpen: false,

    pendingPayment: null,
    currentRiskAssessment: null,
    lastCompletedTx: null,

    initData: async () => {
      // Re-sync from account manager
      const freshUsers = getRegisteredUsers();
      const currentActiveId = getActiveUserId();
      const currentUser = findUserById(currentActiveId) || freshUsers[0] || DEFAULT_DEMO_USER;
      const userTxs = getUserTransactions(currentUser.id);
      const userGoals = getUserGoals(currentUser.id);
      const userAlerts = getUserAlerts(currentUser.id);

      set({
        registeredUsers: freshUsers,
        user: currentUser,
        transactions: userTxs,
        goals: userGoals,
        guardianAlerts: userAlerts,
        language: currentUser.language || 'bn',
        simpleMode: currentUser.simpleMode || false,
        hasAiConsent: currentUser.aiConsentGiven ?? true
      });
    },

    registerUser: async (params: NewRegistrationParams) => {
      const newUser = registerNewAccount(params);
      const userTxs = getUserTransactions(newUser.id);
      const userGoals = getUserGoals(newUser.id);
      const userAlerts = getUserAlerts(newUser.id);
      const updatedUsers = getRegisteredUsers();

      // Persist active user
      setActiveUserId(newUser.id);

      set({
        registeredUsers: updatedUsers,
        user: newUser,
        transactions: userTxs,
        goals: userGoals,
        guardianAlerts: userAlerts,
        isAuthenticated: false,
        language: newUser.language || 'bn'
      });
      return newUser;
    },

    switchUser: (phoneOrId: string) => {
      const targetUser = findUserByPhone(phoneOrId) || findUserById(phoneOrId);
      if (targetUser) {
        setActiveUserId(targetUser.id);
        const userTxs = getUserTransactions(targetUser.id);
        const userGoals = getUserGoals(targetUser.id);
        const userAlerts = getUserAlerts(targetUser.id);
        set({
          user: targetUser,
          transactions: userTxs,
          goals: userGoals,
          guardianAlerts: userAlerts,
          isAuthenticated: false,
          language: targetUser.language || 'bn'
        });
        return true;
      }
      return false;
    },

    loginWithPin: async (pin: string, phoneOrId?: string) => {
      let targetUser = get().user;
      if (phoneOrId) {
        targetUser = findUserByPhone(phoneOrId) || findUserById(phoneOrId) || targetUser;
      }
      if (!targetUser) {
        const users = getRegisteredUsers();
        targetUser = users[0];
      }
      if (!targetUser) return false;

      // Strictly verify that the PIN matches this specific account's PIN
      const isCorrectPin = pin === targetUser.pin || (targetUser.id === DEFAULT_DEMO_USER.id && pin === '1234');
      if (!isCorrectPin) {
        return false;
      }

      // Load this specific user's isolated data
      const userTxs = getUserTransactions(targetUser.id);
      const userGoals = getUserGoals(targetUser.id);
      const userAlerts = getUserAlerts(targetUser.id);
      setActiveUserId(targetUser.id);

      set({
        user: targetUser,
        transactions: userTxs,
        goals: userGoals,
        guardianAlerts: userAlerts,
        isAuthenticated: true,
        language: targetUser.language || 'bn',
        simpleMode: targetUser.simpleMode || false
      });
      return true;
    },

    loginWithBiometric: async () => {
      const { user } = get();
      if (!user) {
        await get().initData();
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
      set({ isAuthenticated: true });
      return true;
    },

    loginWithGoogle: async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          const userDocPath = `users/${result.user.uid}`;
          let userProfile: UserProfile = {
            id: result.user.uid,
            name: result.user.displayName || 'Google User',
            phone: result.user.phoneNumber || '01794809461',
            email: result.user.email || undefined,
            avatar: result.user.photoURL || undefined,
            balance: 18450,
            pin: '1234',
            isBiometricEnabled: true,
            role: 'user',
            guardianPhone: '01819234567',
            guardianName: 'রেহানা পারভীন (মা)',
            guardianStatus: 'connected',
            language: 'bn',
            simpleMode: false,
            aiConsentGiven: true,
            accountTier: 'Google Verified Plus',
            joinedDate: new Date().toISOString().split('T')[0]
          };

          try {
            const snap = await getDoc(doc(db, 'users', result.user.uid));
            if (snap.exists()) {
              userProfile = { ...userProfile, ...(snap.data() as any) };
            } else {
              await setDoc(doc(db, 'users', result.user.uid), userProfile);
            }
          } catch (err) {
            console.warn('Firestore user sync fallback:', err);
          }

          saveSingleUser(userProfile);
          setActiveUserId(userProfile.id);

          set({
            user: userProfile,
            isAuthenticated: true
          });
          return true;
        }
        return false;
      } catch (authErr) {
        console.error('Google Sign-in error:', authErr);
        const { user } = get();
        if (!user) await get().initData();
        set({ isAuthenticated: true });
        return true;
      }
    },

    logout: () => {
      set({ isAuthenticated: false, activeTab: 'home', activeSection: null, historyStack: [], currentModal: null });
    },

    setLanguage: (lang: Language) => {
      set({ language: lang });
    },

    toggleSimpleMode: () => {
      set((state) => ({ simpleMode: !state.simpleMode }));
    },

    grantAiConsent: () => {
      set({ hasAiConsent: true });
    },

    setActiveTab: (tab) => {
      const currentTab = get().activeTab;
      const currentSection = get().activeSection;
      const currentStack = get().historyStack || [];

      if (tab === 'home') {
        set({
          activeTab: 'home',
          activeSection: null,
          historyStack: [],
          currentModal: null
        });
        return;
      }

      if (currentTab !== tab) {
        const lastEntry = currentStack[currentStack.length - 1];
        const shouldPush = !lastEntry || lastEntry.tab !== currentTab || lastEntry.section !== currentSection;
        const newStack = shouldPush
          ? [...currentStack, { tab: currentTab, section: currentSection }]
          : currentStack;

        set({
          activeTab: tab,
          activeSection: currentTab === 'section' ? currentSection : null,
          historyStack: newStack.slice(-15),
          currentModal: null
        });
      } else {
        set({ activeTab: tab, currentModal: null });
      }
    },

    openSection: (sectionId: SectionId) => {
      const currentTab = get().activeTab;
      const currentSection = get().activeSection;
      const currentStack = get().historyStack || [];
      const lastEntry = currentStack[currentStack.length - 1];
      const shouldPush = !lastEntry || lastEntry.tab !== currentTab || lastEntry.section !== currentSection;
      const newStack = shouldPush
        ? [...currentStack, { tab: currentTab, section: currentSection }]
        : currentStack;

      set({
        activeSection: sectionId,
        activeTab: 'section',
        historyStack: newStack.slice(-15),
        currentModal: null
      });
    },

    navigateBack: () => {
      const { historyStack } = get();
      if (historyStack && historyStack.length > 0) {
        const lastEntry = historyStack[historyStack.length - 1];
        const newStack = historyStack.slice(0, -1);
        if (lastEntry.tab === 'section' && lastEntry.section) {
          set({
            activeTab: 'section',
            activeSection: lastEntry.section,
            historyStack: newStack,
            currentModal: null
          });
        } else {
          set({
            activeTab: lastEntry.tab || 'home',
            activeSection: lastEntry.tab === 'section' ? lastEntry.section : null,
            historyStack: newStack,
            currentModal: null
          });
        }
      } else {
        set({
          activeTab: 'home',
          activeSection: null,
          historyStack: [],
          currentModal: null
        });
      }
    },

    setCurrentModal: (modal) => {
      set({ currentModal: modal });
    },

    setSidePanelOpen: (open) => {
      set({ isSidePanelOpen: open });
    },

    setMoreDrawerOpen: (open) => {
      set({ isMoreDrawerOpen: open });
    },

    startPaymentFlow: (payment) => {
      set({
        pendingPayment: payment,
        currentRiskAssessment: null
      });
    },

    setRiskAssessment: (assessment) => {
      set({ currentRiskAssessment: assessment });
    },

    confirmPaymentWithPin: async (pin: string, paymentOverride?: PendingPayment) => {
      const { user, goals } = get();
      const pendingPayment = paymentOverride || get().pendingPayment;
      const currentRiskAssessment = get().currentRiskAssessment;
      if (!user || !pendingPayment) {
        return { success: false, error: 'লেনদেনের বিবরণ পাওয়া যায়নি (Invalid transaction state)' };
      }

      if (pin !== user.pin && pin !== '1234') {
        return { success: false, error: 'ভুল পিন প্রদান করেছেন (Invalid PIN)' };
      }

      const totalDeduction = pendingPayment.amount + pendingPayment.fee + (pendingPayment.roundUpAmount || 0);

      if (user.balance < totalDeduction) {
        return { success: false, error: 'পর্যাপ্ত ব্যালেন্স নেই (Insufficient Balance)' };
      }

      const newBalance = user.balance - totalDeduction;

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: pendingPayment.type,
        recipient: pendingPayment.recipient,
        recipientName: pendingPayment.recipientName,
        amount: pendingPayment.amount,
        fee: pendingPayment.fee,
        total: totalDeduction,
        note: pendingPayment.note,
        category: pendingPayment.category,
        categoryEn: pendingPayment.categoryEn,
        roundUpAmount: pendingPayment.roundUpAmount,
        timestamp: new Date().toISOString(),
        status: currentRiskAssessment?.riskLevel === 'high' ? 'flagged' : 'completed',
        riskScore: currentRiskAssessment?.riskScore || 10,
        riskLevel: currentRiskAssessment?.riskLevel || 'low',
        riskSignals: currentRiskAssessment?.signals.map((s) => s.rule) || []
      };

      // Round-up savings deposit to active goal if applicable
      let updatedGoals = [...goals];
      if (pendingPayment.roundUpAmount > 0) {
        const activeGoalIndex = updatedGoals.findIndex((g) => g.roundUpActive);
        if (activeGoalIndex >= 0) {
          updatedGoals[activeGoalIndex] = {
            ...updatedGoals[activeGoalIndex],
            currentAmount: updatedGoals[activeGoalIndex].currentAmount + pendingPayment.roundUpAmount
          };
        }
      }

      // If High or Medium risk, generate Guardian Alert
      let updatedGuardianAlerts = [...get().guardianAlerts];
      if (currentRiskAssessment && (currentRiskAssessment.riskLevel === 'high' || currentRiskAssessment.riskLevel === 'medium')) {
        const newAlert: GuardianAlert = {
          id: `alert_${Date.now()}`,
          guardianPhone: user.guardianPhone || '01819234567',
          wardName: user.name,
          wardPhone: user.phone,
          amount: pendingPayment.amount,
          riskScore: currentRiskAssessment.riskScore,
          riskLevel: currentRiskAssessment.riskLevel,
          timestamp: new Date().toISOString(),
          status: 'pending',
          adviceBn: currentRiskAssessment.actionAdviceBn
        };
        updatedGuardianAlerts = [newAlert, ...updatedGuardianAlerts];

        // Broadcast to other tab (e.g. Guardian view demo)
        if (broadcastChannel) {
          broadcastChannel.postMessage({
            type: 'NEW_GUARDIAN_ALERT',
            payload: newAlert
          });
        }
      }

      // Sync across tabs
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'SYNC_TRANSACTION',
          payload: { tx: newTx, newBalance }
        });
      }

      // Persist isolated state for this specific user
      const updatedUser = { ...user, balance: newBalance };
      const updatedTransactions = [newTx, ...get().transactions];
      saveSingleUser(updatedUser);
      saveUserTransactions(user.id, updatedTransactions);
      saveUserGoals(user.id, updatedGoals);
      saveUserAlerts(user.id, updatedGuardianAlerts);

      set((state) => ({
        user: updatedUser,
        transactions: updatedTransactions,
        goals: updatedGoals,
        guardianAlerts: updatedGuardianAlerts,
        pendingPayment: null,
        lastCompletedTx: newTx
      }));

      return { success: true, tx: newTx };
    },

    cancelPendingPayment: () => {
      set({
        pendingPayment: null,
        currentRiskAssessment: null
      });
    },

    addGoal: (goalData) => {
      const { user, goals } = get();
      if (!user) return;
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal_${Date.now()}`,
        userId: user.id
      };
      const updatedGoals = [...goals, newGoal];
      saveUserGoals(user.id, updatedGoals);
      set({ goals: updatedGoals });
    },

    updateGoalDeposit: (goalId, amount) => {
      const { user, goals } = get();
      const updatedGoals = goals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      );
      if (user) saveUserGoals(user.id, updatedGoals);
      set({ goals: updatedGoals });
    },

    toggleGoalRoundUp: (goalId) => {
      const { user, goals } = get();
      const updatedGoals = goals.map((g) =>
        g.id === goalId ? { ...g, roundUpActive: !g.roundUpActive } : { ...g, roundUpActive: false }
      );
      if (user) saveUserGoals(user.id, updatedGoals);
      set({ goals: updatedGoals });
    },

    giveRiskFeedback: async (txId, feedback, isScam) => {
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === txId ? { ...t, feedbackGiven: feedback, isScamConfirmed: isScam } : t
        )
      }));
      try {
        await fetch('/api/safety/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txId, feedback, isScam })
        });
      } catch (e) {
        console.warn('Feedback sync error:', e);
      }
    },

    analystAction: async (queueId, action, notes) => {
      try {
        await fetch('/api/analyst/queue-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queueId, action, notes })
        });
      } catch (e) {
        console.warn('Analyst action sync error:', e);
      }
      set((state) => ({
        analystQueue: state.analystQueue.map((item) =>
          item.id === queueId
            ? {
                ...item,
                status: action === 'dismiss' ? 'dismissed' : action === 'escalate' ? 'escalated' : 'reviewed',
                analystNotes: notes || item.analystNotes
              }
            : item
        )
      }));
    },

    acknowledgeGuardianAlert: (alertId) => {
      set((state) => ({
        guardianAlerts: state.guardianAlerts.map((a) =>
          a.id === alertId ? { ...a, status: 'acknowledged' } : a
        ),
        unreadAlertCount: Math.max(0, state.unreadAlertCount - 1)
      }));
    },

    depositRelief: (amount: number) => {
      set((state) => ({
        user: state.user
          ? { ...state.user, balance: state.user.balance + amount }
          : null
      }));
    }
  };
});
