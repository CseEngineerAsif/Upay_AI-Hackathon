import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { SplashScreen } from './components/auth/SplashScreen';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { RegistrationFlow } from './components/auth/RegistrationFlow';
import { LoginScreen } from './components/auth/LoginScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { AccountScreen } from './components/account/AccountScreen';
import { MoreScreen } from './components/more/MoreScreen';
import { BottomNav } from './components/layout/BottomNav';
import { PaymentFlowModal } from './components/mfs/PaymentFlowModal';
import { UpayPaymentFlowModal, UpayPaymentSubType } from './components/mfs/UpayPaymentFlowModal';
import { ScamCheckerModal } from './components/safety/ScamCheckerModal';
import { FinancialDashboardModal } from './components/safety/FinancialDashboardModal';
import { GoalPlannerModal } from './components/safety/GoalPlannerModal';
import { ScamCallSimulatorModal } from './components/safety/ScamCallSimulatorModal';
import { AiChatAssistantModal } from './components/safety/AiChatAssistantModal';
import { GuardianInviteModal } from './components/safety/GuardianInviteModal';
import { AnalystDashboardModal } from './components/admin/AnalystDashboardModal';
import { AdminMonitoringModal } from './components/admin/AdminMonitoringModal';
import { SafeAiHubModal } from './components/safety/SafeAiHubModal';
import { VoiceConversationModal } from './components/safety/VoiceConversationModal';
import { SearchGroundingModal } from './components/safety/SearchGroundingModal';
import { MapsGroundingModal } from './components/safety/MapsGroundingModal';
import { AudioTranscribeModal } from './components/safety/AudioTranscribeModal';
import { GeminiChatbotModal } from './components/safety/GeminiChatbotModal';
import { testFirestoreConnection } from './services/firebase';
import {
  BanglaQrScanModal,
  ChangePinModal,
  PermissionsModal,
  NotificationsModal
} from './components/modals/AuxiliaryModals';

export default function App() {
  const {
    isAuthenticated,
    activeTab,
    currentModal,
    setCurrentModal,
    simpleMode,
    initData
  } = useAppStore();

  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [currentTime, setCurrentTime] = useState('12:06');

  // Load initial synthetic seed data and verify Firestore connection on mount
  useEffect(() => {
    initData();
    testFirestoreConnection();
  }, [initData]);

  // Keep phone status bar time updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-0 sm:p-4 font-sans select-none antialiased">
      {/* Mobile Device Frame (max-w-[430px] phone viewport container) */}
      <div
        className={`relative w-full max-w-[430px] h-[100dvh] sm:h-[890px] sm:max-h-[92vh] bg-white sm:rounded-[42px] shadow-2xl flex flex-col overflow-hidden sm:ring-8 sm:ring-slate-800/80 sm:ring-offset-2 ${
          simpleMode ? 'text-base font-medium' : 'text-sm'
        }`}
      >
        {/* Native Mobile Status Bar (from screenshot 2.jpeg: 12:06, Wi-Fi, battery 37%) */}
        <div className="w-full bg-[#FFD600] px-5 pt-2 pb-1 flex items-center justify-between text-slate-900 font-semibold text-[11px] select-none shrink-0 z-40">
          <div className="flex items-center gap-1.5 font-mono">
            <span>{currentTime}</span>
            <span className="text-[10px]">M</span>
            <span>💬</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wi-Fi Icon */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4zm0 4c3.48 0 6.64 1.35 9 3.55L12 19.5 3 11.55A12.78 12.78 0 0112 8z" />
            </svg>
            {/* Signal Bars */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M2 22h20V2L2 22zm18-2H6.83L20 6.83V20z" />
            </svg>
            {/* Battery */}
            <span className="text-[10px] font-mono">37%</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-900 p-0.5 flex items-center">
              <div className="w-2.5 h-full bg-slate-900 rounded-xs" />
            </div>
          </div>
        </div>

        {/* View Routing / Screen Container */}
        <div className="relative flex-1 w-full flex flex-col overflow-hidden bg-white">
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : !isAuthenticated ? (
            authView === 'register' ? (
              <RegistrationFlow
                onBackToWelcome={() => setAuthView('welcome')}
                onCompleteRegistration={() => setAuthView('login')}
              />
            ) : authView === 'login' ? (
              <LoginScreen onBack={() => setAuthView('welcome')} />
            ) : (
              <WelcomeScreen
                onRegister={() => setAuthView('register')}
                onLogin={() => setAuthView('login')}
              />
            )
          ) : (
            <div className="flex-1 w-full flex flex-col overflow-hidden">
              {activeTab === 'home' && <HomeScreen />}
              {activeTab === 'account' && <AccountScreen />}
              {activeTab === 'history' && <HistoryScreen />}
              {activeTab === 'more' && <MoreScreen />}

              {/* Bottom Nav Bar */}
              <BottomNav />
            </div>
          )}
        </div>

        {/* Home Indicator bar on modern mobile */}
        <div className="w-full bg-white pb-1.5 pt-0.5 flex justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* MODAL REGISTRY */}
        {currentModal === 'send_money' && (
          <PaymentFlowModal
            initialType="send_money"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'cash_out' && (
          <PaymentFlowModal
            initialType="cash_out"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'mobile_recharge' && (
          <PaymentFlowModal
            initialType="mobile_recharge"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'pay_bill' && (
          <PaymentFlowModal
            initialType="pay_bill"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'make_payment' && (
          <PaymentFlowModal
            initialType="make_payment"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'add_money' && (
          <PaymentFlowModal
            initialType="add_money"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'fund_transfer' && (
          <PaymentFlowModal
            initialType="fund_transfer"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'request_money' && (
          <PaymentFlowModal
            initialType="request_money"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'npsb' && (
          <PaymentFlowModal
            initialType="npsb"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'savings' && (
          <PaymentFlowModal
            initialType="savings"
            onClose={() => setCurrentModal(null)}
          />
        )}
        {['traffic_fine', 'toll_payment', 'govt_payment', 'education', 'ngo', 'insurance', 'donation', 'zakat'].includes(currentModal || '') && (
          <UpayPaymentFlowModal
            subType={currentModal as UpayPaymentSubType}
            onClose={() => setCurrentModal(null)}
          />
        )}
        {currentModal === 'scam_checker' && (
          <ScamCheckerModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'cash_flow' && (
          <FinancialDashboardModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'goal_planner' && (
          <GoalPlannerModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'scam_call' && (
          <ScamCallSimulatorModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'ai_chat' && (
          <AiChatAssistantModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'guardian_invite' && (
          <GuardianInviteModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'analyst_dashboard' && (
          <AnalystDashboardModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'admin_monitoring' && (
          <AdminMonitoringModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'safe_ai_hub' && (
          <SafeAiHubModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'voice_conversation' && (
          <VoiceConversationModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'search_grounding' && (
          <SearchGroundingModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'maps_grounding' && (
          <MapsGroundingModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'audio_transcribe' && (
          <AudioTranscribeModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'gemini_chatbot' && (
          <GeminiChatbotModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'bangla_qr_scan' && (
          <BanglaQrScanModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'change_pin' && (
          <ChangePinModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'permissions_modal' && (
          <PermissionsModal onClose={() => setCurrentModal(null)} />
        )}
        {currentModal === 'notifications' && (
          <NotificationsModal onClose={() => setCurrentModal(null)} />
        )}
      </div>
    </div>
  );
}
