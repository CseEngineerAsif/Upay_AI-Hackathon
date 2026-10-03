import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { RiskAssessment } from '../../types';
import { formatCurrency, toBanglaNumber, formatDate } from '../../utils/formatters';
import { CustomKeypad } from '../brand/UpayIcons';
import { evaluateTransactionRisk } from '../../../functions/riskEngine';
import { getFallbackExplanation } from '../../../functions/llmExplain';
import { AIVerificationLoading } from './AIVerificationLoading';

export type UpayPaymentSubType =
  | 'traffic_fine'
  | 'toll_payment'
  | 'govt_payment'
  | 'education'
  | 'ngo'
  | 'insurance'
  | 'donation'
  | 'zakat';

interface UpayPaymentFlowModalProps {
  subType: UpayPaymentSubType;
  onClose: () => void;
}

export const UpayPaymentFlowModal: React.FC<UpayPaymentFlowModalProps> = ({ subType, onClose }) => {
  const { user, language, confirmPaymentWithPin, startPaymentFlow, giveRiskFeedback, transactions } = useAppStore();

  const [step, setStep] = useState<'input' | 'review' | 'risk_check' | 'pin_entry' | 'success'>('input');
  const [isRiskCheckDone, setIsRiskCheckDone] = useState(false);

  // Traffic Fine State
  const [challanNo, setChallanNo] = useState('DMP-2026-889021');
  const [trafficVehicleRegNo, setTrafficVehicleRegNo] = useState('ঢাকা মেট্রো-গ ১২-৩৪৫৬');
  const [violationName, setViolationName] = useState('গতিসীমা লঙ্ঘন (Over-speeding)');

  // Toll Payment State
  const [tollVehicleRegNo, setTollVehicleRegNo] = useState('ঢাকা মেট্রো-ঘ ১১-২২৩৩');
  const [tollPlaza, setTollPlaza] = useState('পদ্মা বহুমুখী সেতু');
  const [vehicleType, setVehicleType] = useState('কার / জিপ / মাইক্রোবাস');

  // Govt Payment State
  const [govtService, setGovtService] = useState('ই-পাসপোর্ট ফি (e-Passport Fee)');
  const [govtRefNo, setGovtRefNo] = useState('EP-88710294-BD');
  const [applicantName, setApplicantName] = useState('মোহাম্মদ মাইনুল ইসলাম');

  // Education State
  const [institution, setInstitution] = useState('নটর ডেম কলেজ, ঢাকা');
  const [studentId, setStudentId] = useState('STD-2026-4401');
  const [feeType, setFeeType] = useState('টিউশন ফি (Tuition Fee)');

  // NGO State
  const [ngoOrg, setNgoOrg] = useState('ব্র্যাক (BRAC Microfinance)');
  const [memberId, setMemberId] = useState('MEM-89021-BR');
  const [ngoPaymentType, setNgoPaymentType] = useState('ঋণের কিস্তি (Loan Installment)');

  // Insurance State
  const [insurer, setInsurer] = useState('মেটলাইফ বাংলাদেশ (MetLife)');
  const [policyNo, setPolicyNo] = useState('POL-992104-ML');
  const [premiumType, setPremiumType] = useState('মাসিক প্রিমিয়াম (Monthly)');

  // Donation State
  const [donationCause, setDonationCause] = useState('শিক্ষা তহবিল - বিদ্যানন্দ ফাউন্ডেশন');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Zakat State
  const [zakatSavingsInput, setZakatSavingsInput] = useState<number | ''>(100000);
  const [zakatCategory, setZakatCategory] = useState('অসহায় ও দরিদ্র (Fakir & Miskin)');

  // Common amount & note
  const [amount, setAmount] = useState<number | ''>(() => {
    switch (subType) {
      case 'traffic_fine': return 1500;
      case 'toll_payment': return 750;
      case 'govt_payment': return 4025;
      case 'education': return 3500;
      case 'ngo': return 1200;
      case 'insurance': return 2500;
      case 'donation': return 500;
      case 'zakat': return 2500;
      default: return 1000;
    }
  });
  const [note, setNote] = useState('');

  // Risk Check State
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [coolingTimer, setCoolingTimer] = useState(0);

  // PIN & Receipt State
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [completedTx, setCompletedTx] = useState<any | null>(null);
  const [feedbackState, setFeedbackState] = useState<'none' | 'helpful' | 'unhelpful'>('none');
  const [markedAsScam, setMarkedAsScam] = useState(false);

  // Cooling timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (coolingTimer > 0) {
      timer = setInterval(() => {
        setCoolingTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [coolingTimer]);

  // Update toll fee dynamically when vehicle type or toll plaza changes
  useEffect(() => {
    if (subType === 'toll_payment') {
      let tollCost = 750;
      if (vehicleType.includes('মোটরসাইকেল')) tollCost = 100;
      else if (vehicleType.includes('পিকআপ')) tollCost = 1200;
      else if (vehicleType.includes('বাস')) tollCost = 2000;
      else if (vehicleType.includes('ট্রাক')) tollCost = 2800;
      else tollCost = 750;

      if (tollPlaza.includes('এক্সপ্রেসওয়ে')) tollCost = 160;
      else if (tollPlaza.includes('টানেল')) tollCost = 200;
      setAmount(tollCost);
    }
  }, [subType, vehicleType, tollPlaza]);

  // Update govt fee dynamically when service changes
  useEffect(() => {
    if (subType === 'govt_payment') {
      if (govtService.includes('পাসপোর্ট')) setAmount(4025);
      else if (govtService.includes('ভূমি')) setAmount(550);
      else if (govtService.includes('আয়কর')) setAmount(1000);
      else if (govtService.includes('লাইসেন্স নবায়ন')) setAmount(2500);
      else setAmount(3300);
    }
  }, [subType, govtService]);

  // Update Zakat amount based on 2.5% calculation helper
  useEffect(() => {
    if (subType === 'zakat' && typeof zakatSavingsInput === 'number' && zakatSavingsInput > 0) {
      const calculatedZakat = Math.round(zakatSavingsInput * 0.025);
      setAmount(calculatedZakat);
    }
  }, [subType, zakatSavingsInput]);

  const getServiceTitle = () => {
    switch (subType) {
      case 'traffic_fine': return language === 'bn' ? 'ট্রাফিক ফাইন' : 'Traffic Fine';
      case 'toll_payment': return language === 'bn' ? 'টোল পেমেন্ট' : 'Toll Payment';
      case 'govt_payment': return language === 'bn' ? 'সরকারি পেমেন্ট' : 'Govt Payment';
      case 'education': return language === 'bn' ? 'এডুকেশন ফি' : 'Education Fee';
      case 'ngo': return language === 'bn' ? 'এন জি ও পেমেন্ট' : 'NGO Payment';
      case 'insurance': return language === 'bn' ? 'বীমা প্রিমিয়াম' : 'Insurance Premium';
      case 'donation': return language === 'bn' ? 'ডোনেশন' : 'Donation';
      case 'zakat': return language === 'bn' ? 'যাকাত পেমেন্ট' : 'Zakat Payment';
      default: return 'পেমেন্ট';
    }
  };

  const getRecipientInfo = () => {
    switch (subType) {
      case 'traffic_fine':
        return { name: 'ডিএমপি ট্রাফিক প্রসিকিউশন', phone: challanNo, sub: `গাড়ি: ${trafficVehicleRegNo}` };
      case 'toll_payment':
        return { name: tollPlaza, phone: tollVehicleRegNo, sub: `বাহন: ${vehicleType}` };
      case 'govt_payment':
        return { name: govtService, phone: govtRefNo, sub: `আবেদনকারী: ${applicantName}` };
      case 'education':
        return { name: institution, phone: studentId, sub: `ফি: ${feeType}` };
      case 'ngo':
        return { name: ngoOrg, phone: memberId, sub: `ধরন: ${ngoPaymentType}` };
      case 'insurance':
        return { name: insurer, phone: policyNo, sub: `প্রিমিয়াম: ${premiumType}` };
      case 'donation':
        return { name: donationCause, phone: isAnonymous ? 'গোপন দান' : (user?.name || 'মাইনুল ইসলাম'), sub: 'মানবসেবা ও ত্রাণ' };
      case 'zakat':
        return { name: `যাকাত তহবিল (${zakatCategory})`, phone: 'যাকাত আদায় ২০২৬', sub: '২.৫% শরীয়াহ যাকাত' };
      default:
        return { name: 'উপায় পেমেন্ট', phone: '01711223344', sub: 'সার্ভিস চার্জ ফ্রি' };
    }
  };

  const getCurrentPaymentPayload = () => {
    const info = getRecipientInfo();
    return {
      type: 'pay_bill' as const,
      recipient: info.phone,
      recipientName: info.name,
      amount: Number(amount) || 0,
      fee: 0,
      note: note || info.sub,
      category: 'বিল' as const,
      categoryEn: 'Bill',
      roundUpAmount: 0
    };
  };

  // Trigger Safe AI Pre-Transaction Risk Check
  const triggerRiskEvaluation = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsEvaluatingRisk(true);
    setIsRiskCheckDone(false);
    setStep('risk_check');

    const numAmount = Number(amount);
    const info = getRecipientInfo();
    let assessment: RiskAssessment | null = null;

    try {
      const res = await fetch('/api/safety/risk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'user_main_maynul',
          amount: numAmount,
          recipientPhone: info.phone,
          recipientName: info.name,
          note: info.sub,
          userBaselineAvgAmount: 1200,
          recentTransactions: transactions
        })
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && typeof data.riskScore === 'number') {
          assessment = data as RiskAssessment;
        }
      }
    } catch (err) {
      console.warn('Backend risk check endpoint fallback to client risk engine', err);
    }

    if (!assessment) {
      const evalResult = evaluateTransactionRisk({
        transactionId: `tx_${Date.now()}`,
        userId: user?.id || 'user_main_maynul',
        amount: numAmount,
        recipientPhone: info.phone,
        recipientName: info.name,
        note: info.sub,
        userBaselineAvgAmount: 1200,
        userRecentTransactions: transactions
      });

      const explanation = getFallbackExplanation(evalResult.level, evalResult.signals, numAmount);

      assessment = {
        transactionId: `tx_${Date.now()}`,
        riskScore: evalResult.score,
        riskLevel: evalResult.level,
        signals: evalResult.signals,
        explanationBn: explanation.explanationBn,
        explanationEn: explanation.explanationEn,
        actionAdviceBn: explanation.actionAdviceBn,
        actionAdviceEn: explanation.actionAdviceEn,
        coolingPeriodSeconds: evalResult.coolingPeriodSeconds,
        suggestSmallTest: evalResult.suggestSmallTest,
        baselineDiffPct: evalResult.baselineDiffPct,
        recipientTrustScore: evalResult.recipientTrustScore
      };
    }

    setRiskAssessment(assessment);
    if (assessment.coolingPeriodSeconds > 0) {
      setCoolingTimer(assessment.coolingPeriodSeconds);
    }
    setIsRiskCheckDone(true);
  };

  const handleVerificationComplete = () => {
    setIsEvaluatingRisk(false);
    setStep('review');
  };

  const handleProceedToPin = () => {
    startPaymentFlow(getCurrentPaymentPayload());
    setStep('pin_entry');
  };

  const handleKeypadPress = (val: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + val);
      setPinError('');
    }
  };

  const handleKeypadBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const handlePinSubmit = async () => {
    if (enteredPin.length < 4) return;

    const payload = getCurrentPaymentPayload();
    startPaymentFlow(payload);

    const result = await confirmPaymentWithPin(enteredPin, payload);

    if (result.success && result.tx) {
      setCompletedTx(result.tx);
      setStep('success');
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } else {
      setPinError(result.error || 'ভুল পিন নম্বর (সঠিক ডেমো পিন: 1234)');
      setEnteredPin('');
    }
  };

  const handleSendFeedback = (helpful: boolean) => {
    if (!completedTx) return;
    const val = helpful ? 'helpful' : 'unhelpful';
    setFeedbackState(val);
    giveRiskFeedback(completedTx.id, val, markedAsScam);
  };

  const handleToggleScamReport = () => {
    const nextVal = !markedAsScam;
    setMarkedAsScam(nextVal);
    if (completedTx) {
      giveRiskFeedback(completedTx.id, feedbackState === 'none' ? 'helpful' : feedbackState, nextVal);
    }
  };

  const handleHeaderBack = () => {
    if (step === 'success') {
      onClose();
    } else if (step === 'pin_entry') {
      setStep('review');
    } else if (step === 'risk_check') {
      setStep('input');
      setIsEvaluatingRisk(false);
      setIsRiskCheckDone(false);
    } else if (step === 'review') {
      setStep('input');
    } else {
      onClose();
    }
  };

  const recipientInfo = getRecipientInfo();

  return (
    <div className="fixed sm:absolute inset-0 z-50 flex flex-col bg-white overflow-hidden animate-scale-up font-sans">
      {/* 1. UPAY YELLOW HEADER BAR */}
      <div className="w-full bg-[#FFD21F] px-4 py-3 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-900 hover:bg-black/10 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {getServiceTitle()}
          </h2>
        </div>

        {/* Balance Badge in Header */}
        <div className="text-right text-[11px] text-slate-900 font-semibold bg-black/5 px-2.5 py-1 rounded-full">
          <span>৳{user?.balance?.toLocaleString() || '18,450'}</span>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC]">
        {/* ============================================================ */}
        {/* STEP 1: INPUT SCREEN                                         */}
        {/* ============================================================ */}
        {step === 'input' && (
          <div className="p-4 space-y-4 animate-fade-in">
            {/* Top Saved Account Pill (matching Pay Bill layout) */}
            <div className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F9] text-center text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors shadow-2xs">
              {language === 'bn' ? 'অনুমোদিত প্রতিষ্ঠান ও ভেরিফাইড পেমেন্ট' : 'Verified Payment Gateway'}
            </div>

            {/* A. TRAFFIC FINE (ট্রাফিক ফাইন) */}
            {subType === 'traffic_fine' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'ট্রাফিক প্রসিকিউশন চালান নম্বর:' : 'Challan Number:'}
                  </label>
                  <input
                    type="text"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    placeholder="DMP-2026-889021"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'গাড়ির রেজিস্ট্রেশন নম্বর:' : 'Vehicle Registration No:'}
                  </label>
                  <input
                    type="text"
                    value={trafficVehicleRegNo}
                    onChange={(e) => setTrafficVehicleRegNo(e.target.value)}
                    placeholder="ঢাকা মেট্রো-গ ১২-৩৪৫৬"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>

                {/* Auto-shown fine summary card */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-amber-950">
                    <span className="font-semibold">{language === 'bn' ? 'অভিযোগ:' : 'Violation:'}</span>
                    <span className="font-bold">{violationName}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-950">
                    <span className="font-semibold">{language === 'bn' ? 'স্থান:' : 'Location:'}</span>
                    <span>বিজয় সরণি, ঢাকা</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-900 border-t border-amber-200/60 pt-1">
                    <span className="font-bold">{language === 'bn' ? 'নির্ধারিত জরিমানা (৳):' : 'Fine Amount:'}</span>
                    <span className="text-base font-extrabold text-[#1F4FB5]">৳{amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* B. TOLL PAYMENT (টোল পেমেন্ট) */}
            {subType === 'toll_payment' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'সেতু / এক্সপ্রেসওয়ে নির্বাচন করুন:' : 'Select Toll Plaza / Bridge:'}
                  </label>
                  <select
                    value={tollPlaza}
                    onChange={(e) => setTollPlaza(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="পদ্মা বহুমুখী সেতু">পদ্মা বহুমুখী সেতু (Padma Bridge)</option>
                    <option value="বঙ্গবন্ধু সেতু (যমুনা)">বঙ্গবন্ধু সেতু (যমুনা)</option>
                    <option value="মেঘনা-গোমতী সেতু">মেঘনা-গোমতী সেতু (ঢাকা-চট্টগ্রাম)</option>
                    <option value="ঢাকা এলিভেটেড এক্সপ্রেসওয়ে">ঢাকা এলিভেটেড এক্সপ্রেসওয়ে</option>
                    <option value="কর্ণফুলী টানেল (বঙ্গবন্ধু টানেল)">কর্ণফুলী টানেল (বঙ্গবন্ধু টানেল)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'গাড়ির ধরন / শ্রেণি:' : 'Vehicle Type:'}
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="কার / জিপ / মাইক্রোবাস">কার / জিপ / মাইক্রোবাস (৳৭৫০)</option>
                    <option value="পিকআপ / ছোট ট্রাক">পিকআপ / ছোট ট্রাক (৳১,২০০)</option>
                    <option value="মাঝারি বাস / মিনিবাস">মাঝারি বাস / মিনিবাস (৳২,০০০)</option>
                    <option value="ভারী ট্রাক">ভারী ট্রাক (৳২,৮০০)</option>
                    <option value="মোটরসাইকেল">মোটরসাইকেল (৳১০০)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'গাড়ির নম্বর প্লেট:' : 'Vehicle License Plate:'}
                  </label>
                  <input
                    type="text"
                    value={tollVehicleRegNo}
                    onChange={(e) => setTollVehicleRegNo(e.target.value)}
                    placeholder="ঢাকা মেট্রো-ঘ ১১-২২৩৩"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>

                {/* Fixed Toll display */}
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-sky-950">{language === 'bn' ? 'নির্ধারিত টোল ফি:' : 'Fixed Toll Fee:'}</span>
                  <span className="text-base font-extrabold text-[#1F4FB5]">৳{amount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* C. GOVT PAYMENT (সরকারি পেমেন্ট) */}
            {subType === 'govt_payment' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'সরকারি সেবার ধরন নির্বাচন করুন:' : 'Service Type:'}
                  </label>
                  <select
                    value={govtService}
                    onChange={(e) => setGovtService(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="ই-পাসপোর্ট ফি (e-Passport Fee)">ই-পাসপোর্ট ফি (e-Passport Fee)</option>
                    <option value="ভূমি উন্নয়ন কর (Land Development Tax / e-Namzari)">ভূমি উন্নয়ন কর ও ই-নামজারি</option>
                    <option value="আয়কর ও ট্যাক্স চালান (NBR Tax Return)">আয়কর ও ট্যাক্স চালান (NBR)</option>
                    <option value="সিটি কর্পোরেশন ট্রেড লাইসেন্স ফি">সিটি কর্পোরেশন ট্রেড লাইসেন্স ফি</option>
                    <option value="ড্রাইভিং লাইসেন্স ও বিআরটিএ ফি">ড্রাইভিং লাইসেন্স ও বিআরটিএ ফি</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'আবেদন / ট্র্যাকিং নম্বর:' : 'Application / Tracking No:'}
                  </label>
                  <input
                    type="text"
                    value={govtRefNo}
                    onChange={(e) => setGovtRefNo(e.target.value)}
                    placeholder="EP-88710294-BD"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'আবেদনকারীর নাম:' : 'Applicant Name:'}
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="মোহাম্মদ মাইনুল ইসলাম"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'ফি-এর পরিমাণ (৳):' : 'Fee Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>
              </div>
            )}

            {/* D. EDUCATION (এডুকেশন) */}
            {subType === 'education' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'শিক্ষাপ্রতিষ্ঠান নির্বাচন করুন:' : 'Institution Name:'}
                  </label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="নটর ডেম কলেজ, ঢাকা">নটর ডেম কলেজ, ঢাকা</option>
                    <option value="ঢাকা রেসিডেনসিয়াল মডেল কলেজ">ঢাকা রেসিডেনসিয়াল মডেল কলেজ</option>
                    <option value="ভিকারুননিসা নূন স্কুল ও কলেজ">ভিকারুননিসা নূন স্কুল ও কলেজ</option>
                    <option value="রাজউক উত্তরা মডেল কলেজ">রাজউক উত্তরা মডেল কলেজ</option>
                    <option value="আইডিয়াল স্কুল অ্যান্ড কলেজ">আইডিয়াল স্কুল অ্যান্ড কলেজ</option>
                    <option value="ব্র্যাক বিশ্ববিদ্যালয় (BRAC University)">ব্র্যাক বিশ্ববিদ্যালয় (BRAC University)</option>
                    <option value="নর্থ সাউথ বিশ্ববিদ্যালয় (NSU)">নর্থ সাউথ বিশ্ববিদ্যালয় (NSU)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'শিক্ষার্থীর রোল / আইডি নম্বর:' : 'Student ID / Roll:'}
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="STD-2026-4401"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'ফি-এর ধরন:' : 'Fee Type:'}
                  </label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="টিউশন ফি (Tuition Fee)">টিউশন ফি (Tuition Fee)</option>
                    <option value="ভর্তি ফি (Admission Fee)">ভর্তি ফি (Admission Fee)</option>
                    <option value="সেমিস্টার / সেশন চার্জ">সেমিস্টার / সেশন চার্জ</option>
                    <option value="পরীক্ষা ফি (Exam Fee)">পরীক্ষা ফি (Exam Fee)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'টাকার পরিমাণ (৳):' : 'Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>
              </div>
            )}

            {/* E. NGO (এন জি ও) */}
            {subType === 'ngo' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'এনজিও / মাইক্রোফাইন্যান্স সংস্থা:' : 'NGO / Organization:'}
                  </label>
                  <select
                    value={ngoOrg}
                    onChange={(e) => setNgoOrg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="ব্র্যাক (BRAC Microfinance)">ব্র্যাক (BRAC Microfinance)</option>
                    <option value="আশা (ASA)">আশা (ASA Microfinance)</option>
                    <option value="টিএমএসএস (TMSS)">টিএমএসএস (TMSS)</option>
                    <option value="শক্তি ফাউন্ডেশন (Shakti Foundation)">শক্তি ফাউন্ডেশন</option>
                    <option value="ব্যুরো বাংলাদেশ (BURO Bangladesh)">ব্যুরো বাংলাদেশ</option>
                    <option value="সাজিদা ফাউন্ডেশন (Sajida Foundation)">সাজিদা ফাউন্ডেশন</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'সদস্য আইডি / ঋণ অ্যাকাউন্ট নম্বর:' : 'Member / Loan ID:'}
                  </label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="MEM-89021-BR"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'পেমেন্ট ধরন:' : 'Payment Type:'}
                  </label>
                  <select
                    value={ngoPaymentType}
                    onChange={(e) => setNgoPaymentType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none"
                  >
                    <option value="ঋণের কিস্তি (Loan Installment)">ঋণের কিস্তি (Loan Installment)</option>
                    <option value="মাসিক সঞ্চয় জমা (Savings Deposit)">মাসিক সঞ্চয় জমা (Savings Deposit)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'কিস্তির পরিমাণ (৳):' : 'Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>
              </div>
            )}

            {/* F. INSURANCE (বীমা) */}
            {subType === 'insurance' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'বীমা প্রতিষ্ঠান নির্বাচন করুন:' : 'Insurer Name:'}
                  </label>
                  <select
                    value={insurer}
                    onChange={(e) => setInsurer(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="মেটলাইফ বাংলাদেশ (MetLife)">মেটলাইফ বাংলাদেশ (MetLife)</option>
                    <option value="ডেল্টা লাইফ ইন্স্যুরেন্স">ডেল্টা লাইফ ইন্স্যুরেন্স</option>
                    <option value="ন্যাশনাল লাইফ ইন্স্যুরেন্স">ন্যাশনাল লাইফ ইন্স্যুরেন্স</option>
                    <option value="পপুলার লাইফ ইন্স্যুরেন্স">পপুলার লাইফ ইন্স্যুরেন্স</option>
                    <option value="গ্রীন ডেল্টা ইন্স্যুরেন্স">গ্রীন ডেল্টা ইন্স্যুরেন্স</option>
                    <option value="প্রগতি লাইফ ইন্স্যুরেন্স">প্রগতি লাইফ ইন্স্যুরেন্স</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'পলিসি নম্বর:' : 'Policy Number:'}
                  </label>
                  <input
                    type="text"
                    value={policyNo}
                    onChange={(e) => setPolicyNo(e.target.value)}
                    placeholder="POL-992104-ML"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'প্রিমিয়াম ধরন:' : 'Premium Frequency:'}
                  </label>
                  <select
                    value={premiumType}
                    onChange={(e) => setPremiumType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none"
                  >
                    <option value="মাসিক প্রিমিয়াম (Monthly)">মাসিক প্রিমিয়াম (Monthly)</option>
                    <option value="ত্রৈমাসিক প্রিমিয়াম (Quarterly)">ত্রৈমাসিক প্রিমিয়াম (Quarterly)</option>
                    <option value="বার্ষিক প্রিমিয়াম (Yearly)">বার্ষিক প্রিমিয়াম (Yearly)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'প্রিমিয়াম পরিমাণ (৳):' : 'Premium Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>
              </div>
            )}

            {/* G. DONATION (ডোনেশন) */}
            {subType === 'donation' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    {language === 'bn' ? 'তহবিল বা দাতব্য সংস্থা বেছে নিন:' : 'Select Cause / Organization:'}
                  </span>
                  <div className="space-y-2">
                    {[
                      { id: '1', title: 'শিক্ষা তহবিল - বিদ্যানন্দ ফাউন্ডেশন', icon: '🏫', desc: 'দরিদ্র শিশুদের শিক্ষার আলো' },
                      { id: '2', title: 'স্বাস্থ্য ও চিকিৎসা সেবা - আস-সুন্নাহ', icon: '🏥', desc: 'বিনা মূল্যে চিকিৎসা ও ওষুধ' },
                      { id: '3', title: 'বন্যা ও দুর্যোগ ত্রাণ - রেড ক্রিসেন্ট', icon: '🌊', desc: 'জরুরি পুনর্বাসন ও খাদ্য' },
                      { id: '4', title: 'মসজিদ ও মাদ্রাসা উন্নয়ন তহবিল', icon: '🕌', desc: 'বায়তুল মোকাররম জাতীয় মসজিদ ফান্ড' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setDonationCause(item.title)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          donationCause === item.title
                            ? 'bg-[#FFF9DE] border-[#FFD21F] shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                            <span className="text-[11px] text-slate-500">{item.desc}</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={donationCause === item.title}
                          onChange={() => setDonationCause(item.title)}
                          className="accent-[#1F4FB5]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'অনুদানের পরিমাণ (৳):' : 'Donation Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                  {/* Quick Chips */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[100, 200, 300, 500].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                          amount === val
                            ? 'bg-[#1F4FB5] text-white border-[#1F4FB5] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95'
                        }`}
                      >
                        ৳{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {language === 'bn' ? 'নাম গোপন রাখুন (Anonymous)' : 'Anonymous Donation'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'bn' ? 'রসিদে নাম প্রকাশ করা হবে না' : 'Name will not appear on receipt'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isAnonymous ? 'bg-[#1F4FB5]' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* H. ZAKAT (যাকাত) */}
            {subType === 'zakat' && (
              <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                {/* Zakat Helper Card */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                    <span>🌙</span>
                    <span>{language === 'bn' ? 'সহজ যাকাত ক্যালকুলেটর (২.৫% শরীয়াহ)' : 'Zakat Calculator (2.5%)'}</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-900 block mb-1">
                      {language === 'bn' ? 'আপনার মোট সঞ্চয় ও স্বর্ণের মূল্য (৳):' : 'Total Savings & Gold Value (৳):'}
                    </label>
                    <input
                      type="number"
                      value={zakatSavingsInput}
                      onChange={(e) => setZakatSavingsInput(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 rounded-lg bg-white border border-emerald-300 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center text-emerald-950 pt-1 border-t border-emerald-200/60 font-semibold">
                    <span>{language === 'bn' ? 'প্রস্তাবিত প্রদেয় যাকাত (২.৫%):' : 'Calculated Zakat (2.5%):'}</span>
                    <span className="text-sm font-extrabold text-emerald-800">
                      ৳{typeof zakatSavingsInput === 'number' ? Math.round(zakatSavingsInput * 0.025).toLocaleString() : '০'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'যাকাত প্রাপ্তির খাত / প্রাপক:' : 'Zakat Recipient Category:'}
                  </label>
                  <select
                    value={zakatCategory}
                    onChange={(e) => setZakatCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  >
                    <option value="অসহায় ও দরিদ্র (Fakir & Miskin)">অসহায় ও দরিদ্র (Fakir & Miskin)</option>
                    <option value="এতিম ও শিশু পুনর্বাসন তহবিল">এতিম ও শিশু পুনর্বাসন তহবিল</option>
                    <option value="দ্বীনি শিক্ষা ও মাদ্রাসা তহবিল">দ্বীনি শিক্ষা ও মাদ্রাসা তহবিল</option>
                    <option value="ঋণগ্রস্তদের মুক্তি তহবিল">ঋণগ্রস্তদের মুক্তি তহবিল</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'bn' ? 'যাকাতের পরিমাণ (৳):' : 'Payable Zakat Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD21F]"
                  />
                </div>
              </div>
            )}

            {/* Bottom Next Button */}
            <button
              type="button"
              disabled={!amount || Number(amount) <= 0}
              onClick={triggerRiskEvaluation}
              className="w-full py-3.5 rounded-2xl bg-[#1F4FB5] text-white font-extrabold text-sm shadow-md disabled:opacity-40 hover:bg-blue-800 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Next: Review'}</span>
              <span>➔</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP: SAFE AI VERIFICATION LOADING ANIMATION                  */}
        {/* ============================================================ */}
        {step === 'risk_check' && (
          <AIVerificationLoading
            isRiskCheckComplete={isRiskCheckDone}
            onFinish={handleVerificationComplete}
            language={language}
          />
        )}

        {/* ============================================================ */}
        {/* STEP 2: REVIEW (WITH INTEGRATED SAFE AI RISK ASSESSMENT)      */}
        {/* ============================================================ */}
        {step === 'review' && (
          <div className="p-4 space-y-4 animate-fade-in">
            {isEvaluatingRisk ? (
              <AIVerificationLoading
                isRiskCheckComplete={isRiskCheckDone}
                onFinish={handleVerificationComplete}
                language={language}
              />
            ) : (
              <>
                {/* Transaction Summary Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'সেবা' : 'Service'}</span>
                    <span className="font-bold text-slate-900">{getServiceTitle()}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'প্রাপক প্রতিষ্ঠান' : 'Recipient'}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{recipientInfo.name}</span>
                      <span className="font-mono text-slate-600">{recipientInfo.phone}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'বিবরণ / রেফারেন্স' : 'Details'}</span>
                    <span className="font-semibold text-slate-800">{recipientInfo.sub}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'মূল পরিমাণ' : 'Amount'}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(Number(amount) || 0, language)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'চার্জ / ফি' : 'Fee'}</span>
                    <span className="font-bold text-emerald-600">
                      {language === 'bn' ? '৳০.০০ (ফ্রি)' : '৳0.00 (Free)'}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Payable'}</span>
                    <span className="font-black text-[#1F4FB5] text-lg">
                      {formatCurrency(Number(amount) || 0, language)}
                    </span>
                  </div>
                </div>

                {/* Embedded Safe AI Pre-Transaction Risk Badge */}
                {riskAssessment && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${
                      riskAssessment.riskLevel === 'high'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : riskAssessment.riskLevel === 'medium'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>{language === 'bn' ? 'সেফ এআই রিক্স অ্যাসেসমেন্ট' : 'Safe AI Risk Assessment'}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          riskAssessment.riskLevel === 'high'
                            ? 'bg-rose-600 text-white'
                            : riskAssessment.riskLevel === 'medium'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {riskAssessment.riskLevel === 'high'
                          ? (language === 'bn' ? 'উচ্চ ঝুঁকি' : 'High Risk')
                          : riskAssessment.riskLevel === 'medium'
                          ? (language === 'bn' ? 'মাঝারি ঝুঁকি' : 'Medium')
                          : (language === 'bn' ? 'ভেরিফাইড ও নিরাপদ' : 'Verified & Safe')}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed bg-white/80 p-2.5 rounded-xl text-slate-800">
                      {language === 'bn' ? riskAssessment.explanationBn : riskAssessment.explanationEn}
                    </p>

                    <p className="text-[11px] font-bold text-[#1F4FB5] flex items-center gap-1">
                      <span>💡</span>
                      <span>{language === 'bn' ? riskAssessment.actionAdviceBn : riskAssessment.actionAdviceEn}</span>
                    </p>

                    {/* "কেন?" (Why) button */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowWhyPanel(!showWhyPanel)}
                        className="text-[11px] font-bold text-[#1F4FB5] hover:underline flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-2xs border border-blue-100"
                      >
                        <span>{showWhyPanel ? 'সংক্ষিপ্ত করুন ▲' : 'কেন ঝুঁকি? বিস্তারিত জানুন (কেন?) ▼'}</span>
                      </button>
                      <span className="text-[10px] font-mono text-slate-500">
                        স্কোর: {toBanglaNumber(riskAssessment.riskScore)}/১০০
                      </span>
                    </div>

                    {showWhyPanel && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-[11px] text-slate-800 animate-fade-in shadow-2xs">
                        <span className="font-bold text-slate-900 block">চিহ্নিত প্যারামিটারসমূহ:</span>
                        {riskAssessment.signals && riskAssessment.signals.length > 0 ? (
                          riskAssessment.signals.map((sig, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>
                                <strong>{sig.labelBn}:</strong> {sig.detailsBn}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500">কোনো অনিয়ম পাওয়া যায়নি। প্রতিষ্ঠানটি ভেরিফাইড।</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    {language === 'bn' ? 'পরিবর্তন করুন' : 'Edit Details'}
                  </button>
                  <button
                    type="button"
                    disabled={coolingTimer > 0}
                    onClick={handleProceedToPin}
                    className="flex-2 py-3 rounded-xl bg-[#1F4FB5] text-white font-bold text-sm shadow-md hover:bg-blue-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {coolingTimer > 0
                        ? (language === 'bn' ? `কুলিং পিরিয়ড (${toBanglaNumber(coolingTimer)} সে)` : `Cooling (${coolingTimer}s)`)
                        : (language === 'bn' ? 'পিন প্রদান করুন' : 'Proceed to Enter PIN')}
                    </span>
                    <span>➔</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: PIN ENTRY SCREEN                                     */}
        {/* ============================================================ */}
        {step === 'pin_entry' && (
          <div className="p-4 flex flex-col items-center animate-fade-in">
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">
              {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন প্রদান করুন' : 'Enter 4-Digit PIN to Confirm'}
            </h3>
            <p className="text-xs text-slate-500 mb-1.5">
              {language === 'bn' ? 'সর্বমোট প্রদেয়: ' : 'Total Amount: '}
              <span className="font-bold text-[#1F4FB5]">
                {formatCurrency(Number(amount) || 0, language)}
              </span>
            </p>

            {/* Demo PIN indicator badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-3 shadow-2xs">
              <span>🔑 {language === 'bn' ? 'ডেমো পিন: 1234' : 'Demo PIN: 1234'}</span>
            </div>

            {/* PIN Dots */}
            <div className="w-48 h-12 rounded-full bg-[#E5E9F2] flex items-center justify-evenly px-4 shadow-inner mb-3">
              {[0, 1, 2, 3].map((index) => {
                const filled = enteredPin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      filled ? 'bg-[#1F4FB5] scale-110' : 'bg-[#98A8C6]'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-rose-600 mb-2">
                {pinError}
              </p>
            )}

            {/* Custom Numeric Keypad */}
            <div className="w-full max-w-[340px] mt-2">
              <CustomKeypad
                onKeyPress={handleKeypadPress}
                onBackspace={handleKeypadBackspace}
                onSubmit={handlePinSubmit}
                submitDisabled={enteredPin.length < 4}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS RECEIPT SCREEN                               */}
        {/* ============================================================ */}
        {step === 'success' && completedTx && (
          <div className="p-4 flex flex-col items-center space-y-4 animate-scale-up">
            {/* Celebratory Checkmark Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl shadow-sm mt-2">
              ✓
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {language === 'bn' ? 'পেমেন্ট সফল হয়েছে!' : 'Payment Successful!'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(completedTx.amount, language)}
              </h3>
              <span className="text-xs text-slate-500">
                {language === 'bn' ? 'প্রতিষ্ঠান: ' : 'Paid to: '}
                <span className="font-semibold text-slate-800">{completedTx.recipientName || completedTx.recipient}</span>
              </span>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'bn' ? 'লেনদেন আইডি' : 'Transaction ID'}</span>
                <span className="font-mono font-bold text-slate-800">{completedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'bn' ? 'রেফারেন্স / হিসাব' : 'Reference'}</span>
                <span className="font-semibold text-slate-800">{completedTx.note || completedTx.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'bn' ? 'সময়' : 'Time'}</span>
                <span className="text-slate-700">{formatDate(completedTx.timestamp, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'bn' ? 'নতুন ব্যালেন্স' : 'New Balance'}</span>
                <span className="font-bold text-[#1F4FB5]">{formatCurrency(user?.balance || 18450, language)}</span>
              </div>
            </div>

            {/* Safe AI Feedback Card */}
            <div className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>{language === 'bn' ? 'সেফ এআই নিরাপত্তা ফিডব্যাক' : 'Safe AI Feedback'}</span>
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSendFeedback(true)}
                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] transition-all ${
                      feedbackState === 'helpful'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    👍 সহায়ক
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendFeedback(false)}
                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] transition-all ${
                      feedbackState === 'unhelpful'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    👎
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleScamReport}
                className={`text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 ${
                  markedAsScam ? 'font-bold text-rose-700' : ''
                }`}
              >
                <span>🚩</span>
                <span>{markedAsScam ? 'স্ক্যাম হিসেবে রিপোর্ট করা হয়েছে' : 'সন্দেহজনক মনে হলে স্ক্যাম রিপোর্ট করুন'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-[#1F4FB5] text-white font-extrabold text-xs shadow-md hover:bg-blue-800 transition-all"
              >
                {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(`Upay Payment: ${completedTx.id}, Service: ${getServiceTitle()}, Amount: ${completedTx.amount}`);
                  }
                }}
                className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🧾</span>
                <span>{language === 'bn' ? 'রসিদ ডাউনলোড / শেয়ার' : 'Receipt / Share'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
