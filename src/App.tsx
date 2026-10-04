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
import { MoreDrawer } from './components/more/MoreDrawer';
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
import { UpayCardModal } from './components/modals/UpayCardModal';
import { UpayOffersModal } from './components/modals/UpayOffersModal';
import { UiDesignShowcaseModal } from './components/modals/UiDesignShowcaseModal';
import { SomitiListScreen } from './components/somiti/SomitiListScreen';
import { SomitiDetailModal } from './components/somiti/SomitiDetailModal';
import { CreateSomitiModal } from './components/somiti/CreateSomitiModal';
import { DigitalSomiti } from './types/somiti';
import { TrustPayScreen } from './components/trustpay/TrustPayScreen';
import { CreateTrustPayOrderModal } from './components/trustpay/CreateTrustPayOrderModal';
import { TrustPayOrderDetailModal } from './components/trustpay/TrustPayOrderDetailModal';
import { TrustPayOrder } from './types/trustPay';
import { LiquidityNetworkScreen } from './components/liquidity/LiquidityNetworkScreen';
import { CrossWalletRiskScreen } from './components/crosswallet/CrossWalletRiskScreen';
import { ClimateShieldScreen } from './components/climate/ClimateShieldScreen';
import { IncomePassportScreen } from './components/passport/IncomePassportScreen';
import { FeeAuditorScreen } from './components/feeauditor/FeeAuditorScreen';
import { BundleOptimizerScreen } from './components/bundle/BundleOptimizerScreen';
import { ZakatGivingScreen } from './components/zakat/ZakatGivingScreen';
import { ChildWalletScreen } from './components/childwallet/ChildWalletScreen';
import { DialectVoiceScreen } from './components/voice/DialectVoiceScreen';
import { MandateWalletScreen } from './components/mandate/MandateWalletScreen';
import { PayslipWageScreen } from './components/payslip/PayslipWageScreen';
import { SectionHubScreen } from './components/section/SectionHubScreen';
import { SmartServicesDrawer } from './components/layout/SmartServicesDrawer';
import { SECTIONS_DATA, FEATURE_TO_SECTION_MAP, FeatureTab } from './types/sections';

export default function App() {
  const {
    isAuthenticated,
    activeTab,
    activeSection,
    openSection,
    setActiveTab,
    navigateBack,
    historyStack,
    language,
    currentModal,
    setCurrentModal,
    isSidePanelOpen,
    setSidePanelOpen,
    isMoreDrawerOpen,
    setMoreDrawerOpen,
    simpleMode,
    initData
  } = useAppStore();

  const [showSplash, setShowSplash] = useState(true);
  const [authView, setAuthView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [selectedSomiti, setSelectedSomiti] = useState<DigitalSomiti | null>(null);
  const [isCreateSomitiOpen, setIsCreateSomitiOpen] = useState(false);
  const [selectedTrustPayOrder, setSelectedTrustPayOrder] = useState<TrustPayOrder | null>(null);
  const [isCreateTrustPayOpen, setIsCreateTrustPayOpen] = useState(false);

  const isFeatureScreen = Boolean(FEATURE_TO_SECTION_MAP[activeTab as FeatureTab]);

  // If activeTab is 'more', open the drawer and reset to home
  useEffect(() => {
    if (activeTab === 'more') {
      setMoreDrawerOpen(true);
      setActiveTab('home');
    }
  }, [activeTab, setMoreDrawerOpen, setActiveTab]);

  // Load initial synthetic seed data and verify Firestore connection on mount
  useEffect(() => {
    initData();
    testFirestoreConnection();
  }, [initData]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-0 sm:p-4 font-sans select-none antialiased">
      {/* Mobile Device Frame (max-w-[430px] phone viewport container) */}
      <div
        className={`relative w-full max-w-[430px] h-[100dvh] sm:h-[890px] sm:max-h-[92vh] bg-white sm:rounded-[42px] shadow-2xl flex flex-col overflow-hidden sm:ring-8 sm:ring-slate-800/80 sm:ring-offset-2 ${
          simpleMode ? 'text-base font-medium' : 'text-sm'
        }`}
      >
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
              {/* Modern Mint header fixed on top for all 12 feature screens */}
              {isFeatureScreen && (
                <div className="w-full bg-gradient-to-r from-[#00D492] to-[#00B478] px-4 py-2.5 flex items-center justify-between border-b border-emerald-400 shadow-xs z-20 shrink-0 sticky top-0 select-none">
                  <button
                    type="button"
                    onClick={navigateBack}
                    className="flex items-center gap-1.5 text-xs font-black text-slate-950 hover:bg-slate-900/10 active:scale-95 transition-all cursor-pointer py-1 px-2.5 rounded-full bg-slate-900/5 border border-slate-950/10 shadow-2xs"
                    aria-label={language === 'bn' ? 'পূর্ববর্তী পেজে ফিরে যান' : 'Back to Previous'}
                    title={language === 'bn' ? 'পূর্ববর্তী পেজে ফিরে যান' : 'Back to Previous'}
                  >
                    <svg
                      className="w-4 h-4 text-slate-950"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="px-2.5 py-1 rounded-full bg-slate-900/10 hover:bg-slate-900/15 text-slate-950 font-bold text-xs shrink-0 cursor-pointer active:scale-95 transition-all flex items-center gap-1 border border-slate-950/10"
                    title={language === 'bn' ? 'হোম স্ক্রিনে ফিরে যান' : 'Go to Home'}
                  >
                    <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </button>
                </div>
              )}

              {activeTab === 'home' && <HomeScreen />}
              {activeTab === 'account' && <AccountScreen />}
              {activeTab === 'history' && <HistoryScreen />}
              {activeTab === 'more' && <MoreScreen />}
              {activeTab === 'section' && activeSection && (
                <SectionHubScreen
                  sectionId={activeSection}
                  onBack={navigateBack}
                  onSelectFeature={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'somiti' && (
                <SomitiListScreen
                  onOpenCreate={() => setIsCreateSomitiOpen(true)}
                  onSelectSomiti={(somiti) => setSelectedSomiti(somiti)}
                />
              )}
              {activeTab === 'trustpay' && (
                <TrustPayScreen
                  onOpenCreate={() => setIsCreateTrustPayOpen(true)}
                  onSelectOrder={(order) => setSelectedTrustPayOrder(order)}
                />
              )}
              {activeTab === 'liquidity' && <LiquidityNetworkScreen />}
              {activeTab === 'crosswallet' && <CrossWalletRiskScreen />}
              {activeTab === 'climateshield' && <ClimateShieldScreen />}
              {activeTab === 'income_passport' && <IncomePassportScreen />}
              {activeTab === 'fee_auditor' && <FeeAuditorScreen />}
              {activeTab === 'bundle_optimizer' && <BundleOptimizerScreen />}
              {(activeTab === 'zakat_giving' || activeTab === 'zakat_calculator') && (
                <ZakatGivingScreen initialTab="calculator" />
              )}
              {activeTab === 'zakat_charities' && (
                <ZakatGivingScreen initialTab="charities" />
              )}
              {activeTab === 'eid_envelope' && (
                <ZakatGivingScreen initialTab="eid_envelope" />
              )}
              {activeTab === 'child_wallet' && <ChildWalletScreen />}
              {activeTab === 'dialect_voice' && <DialectVoiceScreen />}
              {activeTab === 'mandate_wallet' && <MandateWalletScreen />}
              {activeTab === 'payslip_orchestrator' && <PayslipWageScreen />}

              {/* Bottom Nav Bar */}
              <BottomNav />
            </div>
          )}
        </div>

        {/* Slide-In Smart Services Side Panel (above bottom nav and header) */}
        <SmartServicesDrawer
          isOpen={isSidePanelOpen}
          onClose={() => setSidePanelOpen(false)}
        />

        {/* Slide-In More Side Panel */}
        <MoreDrawer
          isOpen={isMoreDrawerOpen}
          onClose={() => setMoreDrawerOpen(false)}
        />

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
        {(currentModal === 'card_demo' || currentModal === 'upay_card') && (
          <UpayCardModal onClose={() => setCurrentModal(null)} />
        )}
        {(currentModal === 'offers_demo' || currentModal === 'upay_offers') && (
          <UpayOffersModal onClose={() => setCurrentModal(null)} />
        )}
        {(currentModal === 'ui_showcase' || currentModal === 'ui_designs') && (
          <UiDesignShowcaseModal onClose={() => setCurrentModal(null)} />
        )}
        {selectedSomiti && (
          <SomitiDetailModal
            somiti={selectedSomiti}
            onClose={() => setSelectedSomiti(null)}
            onUpdated={(updated) => setSelectedSomiti(updated)}
          />
        )}
        {isCreateSomitiOpen && (
          <CreateSomitiModal
            onClose={() => setIsCreateSomitiOpen(false)}
            onCreated={(newSomiti) => {
              setIsCreateSomitiOpen(false);
              setSelectedSomiti(newSomiti);
            }}
          />
        )}
        {selectedTrustPayOrder && (
          <TrustPayOrderDetailModal
            order={selectedTrustPayOrder}
            onClose={() => setSelectedTrustPayOrder(null)}
            onUpdated={(updated) => setSelectedTrustPayOrder(updated)}
          />
        )}
        {isCreateTrustPayOpen && (
          <CreateTrustPayOrderModal
            onClose={() => setIsCreateTrustPayOpen(false)}
            onCreated={(newOrder) => {
              setIsCreateTrustPayOpen(false);
              setSelectedTrustPayOrder(newOrder);
            }}
          />
        )}
      </div>
    </div>
  );
}
