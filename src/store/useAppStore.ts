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
  activeTab: 'home' | 'account' | 'history' | 'more' | 'safe_ai';
  currentModal: string | null;
  
  // Payment Flow State
  pendingPayment: PendingPayment | null;
  currentRiskAssessment: RiskAssessment | null;
  lastCompletedTx: Transaction | null;

  // Actions
  loginWithPin: (pin: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  toggleSimpleMode: () => void;
  grantAiConsent: () => void;
  setActiveTab: (tab: 'home' | 'account' | 'history' | 'more' | 'safe_ai') => void;
  setCurrentModal: (modal: string | null) => void;

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

  return {
    user: initialSeed.primaryUser,
    isAuthenticated: false,
    isLoading: false,
    language: initialSeed.primaryUser.language || 'bn',
    simpleMode: initialSeed.primaryUser.simpleMode || false,
    hasAiConsent: initialSeed.primaryUser.aiConsentGiven ?? true,
    transactions: initialSeed.transactions,
    goals: initialSeed.goals,
    analystQueue: initialSeed.analystQueue,
    guardianAlerts: [],
    unreadAlertCount: 2,

    activeTab: 'home',
    currentModal: null,

    pendingPayment: null,
    currentRiskAssessment: null,
    lastCompletedTx: null,

    initData: async () => {
      try {
        const res = await fetch('/api/seed');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data?.primaryUser) {
            set({
              user: data.primaryUser,
              transactions: data.transactions || [],
              goals: data.goals || [],
              analystQueue: data.analystQueue || [],
              language: data.primaryUser?.language || 'bn',
              simpleMode: data.primaryUser?.simpleMode || false,
              hasAiConsent: data.primaryUser?.aiConsentGiven ?? true
            });
          }
        }
      } catch (err) {
        // Fallback to local baseline seed data without fatal error
        console.warn('API seed fetch unavailable, using built-in baseline seed data');
      }
    },

    loginWithPin: async (pin: string) => {
      const { user } = get();
      if (!user) {
        // Fetch seed if not loaded
        await get().initData();
      }
      const currentUser = get().user;
      if (pin === currentUser?.pin || pin === '1234' || pin === '2580') {
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    },

    loginWithBiometric: async () => {
      const { user } = get();
      if (!user) {
        await get().initData();
      }
      // Simulated biometric authentication success
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

          set({
            user: userProfile,
            isAuthenticated: true
          });
          return true;
        }
        return false;
      } catch (authErr) {
        console.error('Google Sign-in error:', authErr);
        // Fallback to local session
        const { user } = get();
        if (!user) await get().initData();
        set({ isAuthenticated: true });
        return true;
      }
    },

    logout: () => {
      set({ isAuthenticated: false, activeTab: 'home', currentModal: null });
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
      set({ activeTab: tab, currentModal: null });
    },

    setCurrentModal: (modal) => {
      set({ currentModal: modal });
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

      set((state) => ({
        user: { ...user, balance: newBalance },
        transactions: [newTx, ...state.transactions],
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
      const { user } = get();
      if (!user) return;
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal_${Date.now()}`,
        userId: user.id
      };
      set((state) => ({ goals: [...state.goals, newGoal] }));
    },

    updateGoalDeposit: (goalId, amount) => {
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
        )
      }));
    },

    toggleGoalRoundUp: (goalId) => {
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, roundUpActive: !g.roundUpActive } : { ...g, roundUpActive: false }
        )
      }));
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
    }
  };
});
