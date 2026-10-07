import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { TransactionType, RiskAssessment } from '../../types';
import { formatCurrency, toBanglaNumber, formatDate } from '../../utils/formatters';
import { CustomKeypad } from '../brand/UpayIcons';
import { evaluateTransactionRisk, evaluateWithMl } from '../../../functions/riskEngine';
import { getFallbackExplanation } from '../../../functions/llmExplain';
import { categorizeTransaction } from '../../../functions/categorizer';
import { AIVerificationLoading } from './AIVerificationLoading';
import { OperatorLogo, OperatorSelectionGrid, OPERATORS } from '../brand/OperatorConfig';

interface PaymentFlowModalProps {
  initialType: TransactionType;
  onClose: () => void;
}

export const PaymentFlowModal: React.FC<PaymentFlowModalProps> = ({ initialType, onClose }) => {
  const {
    user,
    language,
    confirmPaymentWithPin,
    startPaymentFlow,
    giveRiskFeedback,
    transactions,
    goals
  } = useAppStore();

  const [step, setStep] = useState<'input' | 'review' | 'risk_check' | 'pin_entry' | 'success'>('input');
  const [isRiskCheckDone, setIsRiskCheckDone] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [detectedCategory, setDetectedCategory] = useState({ category: 'অন্যান্য', categoryEn: 'Others' });
  const [roundUpSpare, setRoundUpSpare] = useState(0);

  // Cash Out charge toggle (Image 1)
  const [addCashOutCharge, setAddCashOutCharge] = useState(false);

  // Mobile Recharge Operator State (Images 2, 4, 5)
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [showOperatorSheet, setShowOperatorSheet] = useState(false);

  // Pay Bill State (Image 7)
  const [selectedBillType, setSelectedBillType] = useState<string | null>(null);
  const [billAccountNo, setBillAccountNo] = useState('');

  // Add Money / Fund Transfer / NPSB Bank state
  const [selectedBank, setSelectedBank] = useState<string>('ইউসিবি ব্যাংক (UCB)');
  const [addMoneyMethod, setAddMoneyMethod] = useState<'bank' | 'card'>('bank');
  const [transferChannel, setTransferChannel] = useState<'bank' | 'mfs'>('bank');
  const [savingsDuration, setSavingsDuration] = useState(6);
  const [savingsPlanTitle, setSavingsPlanTitle] = useState('৬ মাসের ডিপিএস সেভিংস');
  const [npsbBeneficiaryName, setNpsbBeneficiaryName] = useState('মোহাম্মদ মাইনুল ইসলাম');

  // Risk Check State
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [showAiAssessmentDetails, setShowAiAssessmentDetails] = useState(false);
  const [showWhyPanel, setShowWhyPanel] = useState(false);
  const [coolingTimer, setCoolingTimer] = useState(0);
  const [checklist, setChecklist] = useState({ recipientOk: false, amountOk: false, purposeOk: false });
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // PIN & Receipt State
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [completedTx, setCompletedTx] = useState<any | null>(null);
  const [feedbackState, setFeedbackState] = useState<'none' | 'helpful' | 'unhelpful'>('none');
  const [markedAsScam, setMarkedAsScam] = useState(false);

  // Auto categorization
  useEffect(() => {
    let isMounted = true;
    const fetchCategory = async () => {
      try {
        const res = await fetch('/api/safety/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note, recipientName, type: initialType })
        });
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const cat = await res.json();
          if (isMounted) setDetectedCategory(cat);
          return;
        }
      } catch (e) {
        // fallback
      }
      const fallbackCat = categorizeTransaction(note, recipientName, initialType);
      if (isMounted) setDetectedCategory(fallbackCat);
    };
    fetchCategory();
    return () => { isMounted = false; };
  }, [note, recipientName, initialType]);

  // Calculate spare change round-up
  useEffect(() => {
    if (typeof amount === 'number' && amount > 0) {
      const activeGoal = goals.find(g => g.roundUpActive);
      if (activeGoal) {
        const remainder = amount % 10;
        const spare = remainder === 0 ? 0 : 10 - remainder;
        setRoundUpSpare(spare);
      } else {
        setRoundUpSpare(0);
      }
    } else {
      setRoundUpSpare(0);
    }
  }, [amount, goals]);

  // Cooling period countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (coolingTimer > 0) {
      timer = setInterval(() => {
        setCoolingTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [coolingTimer]);

  const getServiceTitle = () => {
    switch (initialType) {
      case 'send_money':
        return language === 'bn' ? 'সেন্ড মানি' : 'Send Money';
      case 'cash_out':
        return language === 'bn' ? 'ক্যাশ আউট' : 'Cash Out';
      case 'mobile_recharge':
        return language === 'bn' ? 'মোবাইল রিচার্জ' : 'Mobile Recharge';
      case 'pay_bill':
        return language === 'bn' ? 'পে বিল' : 'Pay Bill';
      case 'make_payment':
        return language === 'bn' ? 'মেক পেমেন্ট' : 'Make Payment';
      case 'add_money':
        return language === 'bn' ? 'অ্যাড মানি' : 'Add Money';
      case 'savings':
        return language === 'bn' ? 'সঞ্চয়' : 'Savings';
      case 'fund_transfer':
        return language === 'bn' ? 'ফান্ড ট্রান্সফার' : 'Fund Transfer';
      case 'request_money':
        return language === 'bn' ? 'রিকোয়েস্ট মানি' : 'Request Money';
      case 'npsb':
        return language === 'bn' ? 'এনপিএসবি' : 'NPSB';
      default:
        return 'পেমেন্ট';
    }
  };

  const calculatedFee = () => {
    if (initialType === 'cash_out') {
      return Math.round((Number(amount) || 0) * 0.015);
    }
    return 0;
  };

  const getCurrentPaymentPayload = () => ({
    type: initialType,
    recipient: recipient || (selectedBillType ? `${selectedBillType}_${billAccountNo}` : '01711223344'),
    recipientName: recipientName || (language === 'bn' ? 'প্রাপক' : 'Recipient'),
    amount: Number(amount) || 0,
    fee: calculatedFee(),
    note,
    category: (detectedCategory.category as any) || 'অন্যান্য',
    categoryEn: detectedCategory.categoryEn || 'Others',
    roundUpAmount: roundUpSpare
  });

  // Run Pre-Transaction Safety Check
  const triggerRiskEvaluation = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsEvaluatingRisk(true);
    setIsRiskCheckDone(false);
    setStep('risk_check');

    const numAmount = Number(amount);
    const targetRecipient = recipient || (selectedBillType ? `${selectedBillType}_${billAccountNo}` : '01711223344');
    let assessment: RiskAssessment | null = null;

    try {
      const res = await fetch('/api/safety/risk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          recipientPhone: targetRecipient,
          recipientName,
          note
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
      console.warn('Backend risk check endpoint unreachable, using client risk engine', err);
    }

    if (!assessment) {
      const evalResult = evaluateWithMl({
        transactionId: `tx_${Date.now()}`,
        userId: user?.id || 'user_main_maynul',
        amount: numAmount,
        recipientPhone: targetRecipient,
        recipientName,
        note,
        userBaselineAvgAmount: 1200,
        userRecentTransactions: transactions,
        userBalance: user?.balance ?? 18450
      });

      const explanation = getFallbackExplanation(evalResult.level, evalResult.signals, numAmount);

      assessment = {
        transactionId: `tx_${Date.now()}`,
        riskScore: evalResult.score,
        riskLevel: evalResult.level,
        probability: evalResult.probability,
        modelType: evalResult.modelType,
        topFactors: evalResult.topFactors,
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
    // Signal completion to AIVerificationLoading
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

  const handleDirectConfirm = async (customPayload?: any) => {
    const payload = customPayload || getCurrentPaymentPayload();
    if (!payload.amount && payload.amount !== 0) return;
    setIsSubmittingPin(true);
    startPaymentFlow(payload);
    const result = await confirmPaymentWithPin('1234', payload);
    setIsSubmittingPin(false);
    if (result.success && result.tx) {
      setCompletedTx(result.tx);
      setStep('success');
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } else {
      const fallbackTx = {
        id: `tx_${Date.now()}`,
        userId: user?.id || 'user_main_maynul',
        type: payload.type,
        recipient: payload.recipient,
        recipientName: payload.recipientName,
        amount: payload.amount,
        fee: payload.fee || 0,
        total: payload.amount,
        note: payload.note || '',
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      setCompletedTx(fallbackTx);
      setStep('success');
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleTestPayment = () => {
    setAmount(10);
    setNote('১০ টাকা টেস্ট পেমেন্ট যাচাই');
    const payment = {
      type: initialType,
      recipient: recipient || '01711223344',
      recipientName: recipientName || (language === 'bn' ? 'প্রাপক' : 'Recipient'),
      amount: 10,
      fee: 0,
      note: '১০ টাকা টেস্ট পেমেন্ট যাচাই',
      category: (detectedCategory.category as any) || 'অন্যান্য',
      categoryEn: detectedCategory.categoryEn || 'Others',
      roundUpAmount: 0
    };
    startPaymentFlow(payment);
    setStep('review');
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
    setIsSubmittingPin(true);

    const paymentPayload = getCurrentPaymentPayload();
    startPaymentFlow(paymentPayload);

    const result = await confirmPaymentWithPin(enteredPin, paymentPayload);
    setIsSubmittingPin(false);

    if (result.success && result.tx) {
      setCompletedTx(result.tx);
      setStep('success');
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setPinError(result.error || 'ভুল পিন নম্বর (সঠিক পিন: 1234)');
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

  // Contacts list used across screens (Images 2, 3)
  const phonebookContacts = [
    { name: '01740-367244', phone: '01740367244' },
    { name: '01740-367244', phone: '01740367244' },
    { name: 'Agami', phone: '01521747229' },
    { name: 'Agomoni Ticket', phone: '01719002987' },
    { name: 'তানভীর আহমেদ (বন্ধু)', phone: '01711223344' },
    { name: 'রেহানা পারভীন (মা)', phone: '01819234567' },
    { name: 'সন্দেহজনক নম্বর (স্ক্যাম টেস্ট)', phone: '01700000000' }
  ];

  // Bill categories (Image 7)
  const billCategories = [
    { id: 'electricity', label: 'বিদ্যুৎ', sub: 'DESCO, DPDC, Palli Bidyut', icon: '⚡', color: 'text-sky-600 bg-sky-50' },
    { id: 'water', label: 'পানি', sub: 'Dhaka WASA, Chattogram WASA', icon: '💧', color: 'text-blue-600 bg-blue-50' },
    { id: 'gas', label: 'গ্যাস', sub: 'Titas Gas, Karnaphuli Gas', icon: '🔥', color: 'text-amber-500 bg-amber-50' },
    { id: 'internet', label: 'ইন্টারনেট', sub: 'Link3, AmberIT, Carnival', icon: '🌐', color: 'text-emerald-600 bg-emerald-50' },
    { id: 'tv', label: 'ক্যাবল টিভি', sub: 'Akash DTH, Cable TV', icon: '📡', color: 'text-rose-500 bg-rose-50' },
    { id: 'card', label: 'ক্রেডিট কার্ড', sub: 'UCB, City Bank, SCB', icon: '💳', color: 'text-yellow-600 bg-yellow-50' },
    { id: 'bank', label: 'ব্যাংক/আর্থিক প্রতিষ্ঠান', sub: 'Bank Deposit & Transfer', icon: '🏛️', color: 'text-indigo-600 bg-indigo-50' },
    { id: 'emi', label: 'EMI পেমেন্ট', sub: 'Monthly Loan / EMI', icon: '📅', color: 'text-teal-600 bg-teal-50' },
    { id: 'car', label: 'গাড়ি', sub: 'Toll & Vehicle Tax', icon: '🚗', color: 'text-blue-500 bg-blue-50' }
  ];

  // Operators (from shared config)
  const operators = OPERATORS;

  // Handle header back button
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
    } else if (step === 'input' && recipient) {
      setRecipient('');
      setSelectedOperator(null);
      setSelectedBillType(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed sm:absolute inset-0 z-50 flex flex-col bg-white overflow-hidden animate-scale-up font-sans">
      {/* 1. MODERN ELECTRIC MINT HEADER BAR */}
      <div className="w-full bg-gradient-to-r from-[#00D492] to-[#00B478] px-4 py-3 flex items-center justify-between shrink-0 shadow-xs z-10 text-slate-950">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-slate-950 hover:bg-black/10 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-black text-slate-950 tracking-tight">
            {getServiceTitle()}
          </h2>
        </div>

        {/* Balance Badge indicator in header */}
        <div className="text-right text-[11px] text-slate-950 font-bold bg-black/10 px-2.5 py-1 rounded-full">
          <span>৳{user?.balance?.toLocaleString() || '18,450'}</span>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTENT BODY */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        {/* ============================================================ */}
        {/* STEP 1: INPUT VIEW (MATCHING IMAGES 1, 2, 3, 5, 6, 7, 8) */}
        {/* ============================================================ */}
        {step === 'input' && (
          <div>
            {/* ---------------------------------------------------------- */}
            {/* A. SEND MONEY (IMAGE 3: Recipient search / Image 1: Amount) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'send_money' && (
              !recipient ? (
                /* IMAGE 3: Recipient Selection */
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-900 block mb-2">
                      {language === 'bn' ? 'প্রাপক' : 'Recipient'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder={language === 'bn' ? 'নাম অথবা মোবাইল নম্বর টাইপ করুন' : 'Type name or mobile number'}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#F2F4F7] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00D492]"
                      />
                    </div>
                  </div>

                  {/* Scan QR Code button */}
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRecipient('01777889900');
                        setRecipientName('স্বপ্ন সুপারশপ');
                      }}
                      className="inline-flex items-center gap-2 px-7 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-extrabold shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
                      </svg>
                      <span>{language === 'bn' ? 'স্ক্যান QR কোড' : 'Scan QR Code'}</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-200/80 my-2" />

                  {/* Phonebook List (Image 3) */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-2">
                      {language === 'bn' ? 'ফোনবুক' : 'Phonebook'}
                    </span>
                    <div className="divide-y divide-slate-100">
                      {phonebookContacts.map((contact, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setRecipient(contact.phone);
                            setRecipientName(contact.name);
                          }}
                          className="py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">{contact.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{contact.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* IMAGE 1: Amount & Reference */
                <div className="p-4 space-y-4 animate-fade-in">
                  {/* Recipient Box */}
                  <div>
                    <span className="text-xs font-bold text-slate-900 block mb-2">
                      {language === 'bn' ? 'প্রাপক' : 'Recipient'}
                    </span>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{recipientName || 'Agami'}</span>
                          <span className="text-xs text-slate-500 font-mono">{recipient}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRecipient('')}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Amount Section (Image 1) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'bn' ? 'অ্যামাউন্ট' : 'Amount'}
                    </span>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder={language === 'bn' ? 'এখানে অ্যামাউন্ট টাইপ করুন' : 'Type amount here'}
                        className="w-full text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!amount || Number(amount) <= 0}
                        onClick={triggerRiskEvaluation}
                        className="w-8 h-8 rounded-full bg-[#1F4FB5] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-blue-800 transition-all shadow-xs"
                      >
                        ➔
                      </button>
                    </div>

                    {/* Cash out charge add toggle (Image 1) */}
                    <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                      <span>{language === 'bn' ? 'ক্যাশ আউট চার্জ অ্যাড করুন: ৳০.০০' : 'Add Cash Out Charge: ৳0.00'}</span>
                      <button
                        type="button"
                        onClick={() => setAddCashOutCharge(!addCashOutCharge)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${addCashOutCharge ? 'bg-[#1F4FB5]' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${addCashOutCharge ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Available balance indicator & Quick Preset Amounts */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span>
                          {language === 'bn' ? 'বর্তমান ব্যালেন্স: ' : 'Current Balance: '}
                          <span className="font-semibold text-slate-900">৳{user?.balance?.toLocaleString() || '18,450.00'}</span>
                        </span>
                      </div>

                      {/* Quick amount chips: 100, 200, 300, 500 */}
                      <div className="grid grid-cols-4 gap-2">
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
                  </div>

                  {/* Reference Section (Image 1) */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'bn' ? 'রেফারেন্স' : 'Reference'}
                    </span>
                    <div className="w-full p-3.5 rounded-2xl bg-[#F1F3F7] relative">
                      <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={language === 'bn' ? 'এখানে টাইপ করুন' : 'Type reference note here'}
                        className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 resize-none focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {/* ---------------------------------------------------------- */}
            {/* B. MOBILE RECHARGE (IMAGES 2, 4, 5) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'mobile_recharge' && (
              !recipient ? (
                /* IMAGE 2: Number Search */
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-900 block mb-2">
                      {language === 'bn' ? 'নাম বা মোবাইল নম্বর' : 'Name or Mobile Number'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder={language === 'bn' ? 'নাম অথবা মোবাইল নম্বর টাইপ করুন' : 'Type name or mobile number'}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#F2F4F7] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 my-1" />

                  {/* Latest Transactions: My Number (Image 2) */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-2.5">
                      {language === 'bn' ? 'সর্বশেষ লেনদেন' : 'Recent Transactions'}
                    </span>
                    <div
                      onClick={() => {
                        setRecipient(user?.phone || '01794809461');
                        setRecipientName('আমার নম্বর');
                        setShowOperatorSheet(true);
                      }}
                      className="flex flex-col items-center w-20 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs group-hover:border-[#FFD21F]">
                        <img
                          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 mt-1 text-center">
                        {language === 'bn' ? 'আমার নম্বর' : 'My Number'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 my-1" />

                  {/* Phonebook List (Image 2) */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-2">
                      {language === 'bn' ? 'ফোনবুক' : 'Phonebook'}
                    </span>
                    <div className="divide-y divide-slate-100">
                      {phonebookContacts.map((contact, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setRecipient(contact.phone);
                            setRecipientName(contact.name);
                            setShowOperatorSheet(true);
                          }}
                          className="py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">{contact.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{contact.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* IMAGE 5: Amount + Offer Pack Empty Illustration */
                <div className="p-4 space-y-4 animate-fade-in">
                  {/* Recipient box */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</span>
                        <span className="text-sm font-bold text-slate-900 block">{recipientName || 'Agami'}</span>
                        <span className="text-xs text-slate-500 font-mono">{recipient}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecipient('')}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Selected Operator Card (Image 5) */}
                  <div
                    onClick={() => setShowOperatorSheet(true)}
                    className="flex items-center justify-between py-2 border-b border-slate-100 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs text-slate-400 block">{language === 'bn' ? 'বেছে নেওয়া অপারেটর' : 'Chosen Operator'}</span>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2 mt-1">
                        <OperatorLogo operator={selectedOperator || recipient || 'teletalk'} size={24} />
                        <span>{selectedOperator ? `${selectedOperator} ${connectionType === 'prepaid' ? 'প্রিপেইড' : 'পোস্টপেইড'}` : 'টেলিটক প্রিপেইড'}</span>
                      </span>
                    </div>
                    <span className="text-slate-400 font-bold">›</span>
                  </div>

                  {/* Amount Section (Image 5) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'bn' ? 'অ্যামাউন্ট ⓘ' : 'Amount ⓘ'}
                    </span>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder={language === 'bn' ? 'এখানে অ্যামাউন্ট টাইপ করুন' : 'Type amount here'}
                        className="w-full text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={!amount || Number(amount) <= 0}
                        onClick={triggerRiskEvaluation}
                        className="w-8 h-8 rounded-full bg-[#1F4FB5] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-blue-800 shadow-xs"
                      >
                        ➔
                      </button>
                    </div>

                    {/* Available balance indicator & Quick Preset Amounts */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-700">
                        <span>
                          {language === 'bn' ? 'বর্তমান ব্যালেন্স: ' : 'Current Balance: '}
                          <span className="font-semibold text-slate-900">৳{user?.balance?.toLocaleString() || '18,450.00'}</span>
                        </span>
                      </div>

                      {/* Quick amount chips: 100, 200, 300, 500 */}
                      <div className="grid grid-cols-4 gap-2">
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
                  </div>

                  {/* Sad Phone Empty State Illustration (Image 5) */}
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-36 relative mb-3">
                      {/* Phone frame with sad face */}
                      <svg viewBox="0 0 120 140" className="w-full h-full">
                        <rect x="25" y="10" width="70" height="120" rx="12" fill="white" stroke="#334155" strokeWidth="3" />
                        <line x1="45" y1="18" x2="75" y2="18" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Eyes */}
                        <circle cx="48" cy="58" r="2.5" fill="#334155" />
                        <circle cx="72" cy="58" r="2.5" fill="#334155" />
                        {/* Sad mouth */}
                        <path d="M48 76 Q60 66 72 76" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Floating message icon */}
                        <rect x="55" y="0" width="30" height="18" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
                        <text x="70" y="13" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">sms</text>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1F4FB5]">
                      {language === 'bn' ? 'দুঃখিত!' : 'Sorry!'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      {language === 'bn' ? 'এই মুহূর্তে কোনো অফার প্যাক নেই' : 'No offer pack available right now'}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* ---------------------------------------------------------- */}
            {/* C. CASH OUT (IMAGE 6) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'cash_out' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-900 block mb-2">
                    {language === 'bn' ? 'এজেন্ট মোবাইল নম্বর' : 'Agent Mobile Number'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={language === 'bn' ? 'নাম অথবা মোবাইল নম্বর টাইপ করুন' : 'Type name or mobile number'}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F2F4F7] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Two quick pills: ATM and Scan QR Code (Image 6) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipient('01811002233');
                      setRecipientName('ইউসিবি এটিএম বুথ');
                    }}
                    className="py-2.5 rounded-full bg-[#E8EDF5] text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-200 transition-colors"
                  >
                    {language === 'bn' ? 'এটিএম' : 'ATM'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecipient('01811002233');
                      setRecipientName('ফার্মগেট রিকার্শন এজেন্ট');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-extrabold shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span>🔳</span>
                    <span>{language === 'bn' ? 'স্ক্যান QR কোড' : 'Scan QR Code'}</span>
                  </button>
                </div>

                {/* If agent is selected, show amount input */}
                {recipient ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{language === 'bn' ? 'নির্বাচিত এজেন্ট:' : 'Selected Agent:'}</span>
                      <span className="font-bold text-slate-900">{recipientName || recipient}</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        {language === 'bn' ? 'উত্তোলন পরিমাণ (৳):' : 'Withdraw Amount (৳):'}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder="0"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-base font-bold bg-white focus:outline-none"
                      />
                      {/* Quick amount chips: 100, 200, 300, 500 */}
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[100, 200, 300, 500].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                              amount === val
                                ? 'bg-[#1F4FB5] text-white border-[#1F4FB5] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95'
                            }`}
                          >
                            ৳{val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!amount || Number(amount) <= 0}
                      onClick={triggerRiskEvaluation}
                      className="w-full py-3 rounded-xl bg-[#1F4FB5] text-white font-bold text-xs shadow-md disabled:opacity-40 hover:bg-blue-800"
                    >
                      {language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Next: Review'}
                    </button>
                  </div>
                ) : (
                  /* Empty state text and suggested agents matching Image 6 */
                  <div className="py-4 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      {language === 'bn' ? 'আপনার কোনো পূর্ববর্তী ক্যাশ আউট নেই' : 'No previous cash out records'}
                    </p>
                    <span className="text-xs text-slate-400 mt-0.5 mb-3">
                      {language === 'bn' ? 'উপরে নম্বর টাইপ করুন বা নিকটবর্তী এজেন্ট বেছে নিন' : 'Enter agent phone above or pick below'}
                    </span>

                    <div className="w-full space-y-2 text-left">
                      <span className="text-xs font-bold text-slate-700 block">
                        {language === 'bn' ? 'নিকটবর্তী অনুমোদিত এজেন্ট:' : 'Nearby Authorized Agents:'}
                      </span>
                      {[
                        { name: 'ফার্মগেট রিকার্শন এজেন্ট', phone: '01811002233', area: 'ফার্মগেট মোড়' },
                        { name: 'ধানমন্ডি সেন্ট্রাল এজেন্ট', phone: '01822334455', area: 'ধানমন্ডি ২৭' },
                        { name: 'ইউসিবি এটিএম বুথ', phone: '01811002233', area: 'কাওরান বাজার' }
                      ].map((agent, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setRecipient(agent.phone);
                            setRecipientName(agent.name);
                          }}
                          className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                              🏪
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{agent.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">{agent.phone} • {agent.area}</span>
                            </div>
                          </div>
                          <span className="text-xs text-[#1F4FB5] font-bold">সিলেক্ট ›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* D. PAY BILL (IMAGE 7) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'pay_bill' && (
              <div className="p-4 space-y-4">
                {/* Top card: সংরক্ষিত অ্যাকাউন্ট (Image 7) */}
                <div className="w-full py-2.5 px-4 rounded-xl bg-[#F1F3F9] text-center text-xs font-bold text-slate-800 cursor-pointer hover:bg-slate-200 transition-colors">
                  {language === 'bn' ? 'সংরক্ষিত অ্যাকাউন্ট' : 'Saved Accounts'}
                </div>

                {!selectedBillType ? (
                  <div>
                    <span className="text-sm font-bold text-slate-900 block mb-3">
                      {language === 'bn' ? 'বিলের প্রকার নির্বাচন করুন' : 'Select Bill Type'}
                    </span>

                    {/* Bill Category List Card matching Image 7 */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                      {billCategories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedBillType(cat.label);
                            setRecipientName(cat.label);
                            if (!billAccountNo) {
                              setBillAccountNo('1002030405');
                              setRecipient('1002030405');
                            }
                            if (!amount) {
                              setAmount(850);
                            }
                          }}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{cat.icon}</span>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block">{cat.label}</span>
                              <span className="text-[11px] text-slate-400">{cat.sub}</span>
                            </div>
                          </div>
                          <span className="text-slate-400 text-sm font-bold">›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Bill Account & Amount form */
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-[#1F4FB5]">
                        {selectedBillType} {language === 'bn' ? 'বিল' : 'Bill'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedBillType(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕ পরিবর্তন
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'bn' ? 'গ্রাহক / মিটার / হিসাব নং:' : 'Customer / Meter No:'}
                      </label>
                      <input
                        type="text"
                        value={billAccountNo}
                        onChange={(e) => {
                          setBillAccountNo(e.target.value);
                          setRecipient(e.target.value);
                        }}
                        placeholder="1002030405"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'bn' ? 'বিলের পরিমাণ (৳):' : 'Bill Amount (৳):'}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder="850"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none"
                      />
                      {/* Quick amount chips: 100, 200, 300, 500 */}
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[100, 200, 300, 500].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                              amount === val
                                ? 'bg-[#1F4FB5] text-white border-[#1F4FB5] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95'
                            }`}
                          >
                            ৳{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!billAccountNo || !amount || Number(amount) <= 0}
                      onClick={triggerRiskEvaluation}
                      className="w-full py-3 rounded-xl bg-[#1F4FB5] text-white font-bold text-xs shadow-md disabled:opacity-40 hover:bg-blue-800"
                    >
                      {language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Next: Review'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* E. MAKE PAYMENT (IMAGE 8) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'make_payment' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-900 block mb-2">
                    {language === 'bn' ? 'মার্চেন্ট মোবাইল নম্বর' : 'Merchant Mobile Number'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={language === 'bn' ? 'এখানে মার্চেন্ট মোবাইল নম্বর টাইপ করুন' : 'Type merchant number here'}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F2F4F7] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* QR Code Pill button (Image 8) */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipient('01777889900');
                      setRecipientName('স্বপ্ন সুপারশপ');
                    }}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-extrabold shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span>🔳</span>
                    <span>{language === 'bn' ? 'স্ক্যান QR কোড' : 'Scan QR Code'}</span>
                  </button>
                </div>

                <div className="border-t border-slate-200/80 my-2" />

                {/* Favorite Merchant (Image 8) */}
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-3">
                    {language === 'bn' ? 'ফেভারিট মার্চেন্ট' : 'Favorite Merchants'}
                  </span>
                  <div className="flex gap-4">
                    <div
                      onClick={() => {
                        setRecipient('01777889900');
                        setRecipientName('AI DEV F...');
                      }}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-500 flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-[#00D492]">
                        <svg className="w-7 h-7 fill-current text-slate-500" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 mt-1.5 text-center">AI DEV F...</span>
                    </div>

                    <div
                      onClick={() => {
                        setRecipient('01888990011');
                        setRecipientName('আগোরা সুপারমার্কেট');
                      }}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-[#00D492]">
                        🛒
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 mt-1.5 text-center">আগোরা</span>
                    </div>
                  </div>
                </div>

                {recipient && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{language === 'bn' ? 'মার্চেন্ট:' : 'Merchant:'}</span>
                      <span className="font-bold text-slate-900">{recipientName || recipient}</span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        {language === 'bn' ? 'পেমেন্ট পরিমাণ (৳):' : 'Payment Amount (৳):'}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder="0"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-base font-bold bg-white focus:outline-none"
                      />
                      {/* Quick amount chips: 100, 200, 300, 500 */}
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[100, 200, 300, 500].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all text-center ${
                              amount === val
                                ? 'bg-[#1F4FB5] text-white border-[#1F4FB5] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95'
                            }`}
                          >
                            ৳{val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!amount || Number(amount) <= 0}
                      onClick={triggerRiskEvaluation}
                      className="w-full py-3 rounded-xl bg-[#1F4FB5] text-white font-bold text-xs shadow-md disabled:opacity-40 hover:bg-blue-800"
                    >
                      {language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Next: Review'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* F. ADD MONEY (IMAGE 5) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'add_money' && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* Method selector tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setAddMoneyMethod('bank')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      addMoneyMethod === 'bank'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏦 {language === 'bn' ? 'ব্যাংক টু রিকার্শন পে' : 'Bank to Recursion Pay'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMoneyMethod('card')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      addMoneyMethod === 'card'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💳 {language === 'bn' ? 'কার্ড টু রিকার্শন পে' : 'Card to Recursion Pay'}
                  </button>
                </div>

                {/* Bank / Card Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {addMoneyMethod === 'bank'
                      ? (language === 'bn' ? 'ব্যাংক নির্বাচন করুন' : 'Select Bank')
                      : (language === 'bn' ? 'কার্ড টাইপ নির্বাচন করুন' : 'Select Card Type')}
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D492]"
                  >
                    {addMoneyMethod === 'bank' ? (
                      <>
                        <option value="ইউসিবি ব্যাংক (UCB)">ইউসিবি ব্যাংক (United Commercial Bank)</option>
                        <option value="সিটি ব্যাংক (City Bank)">সিটি ব্যাংক (Citytouch)</option>
                        <option value="ব্র্যাক ব্যাংক (BRAC Bank)">ব্র্যাক ব্যাংক (BRAC Bank Astha)</option>
                        <option value="ইসলামী ব্যাংক (IBBL)">ইসলামী ব্যাংক (CellFin)</option>
                        <option value="সোনালী ব্যাংক (Sonali Bank)">সোনালী ব্যাংক (Sonali e-Sheba)</option>
                        <option value="মিউচুয়াল ট্রাস্ট ব্যাংক (MTB)">মিউচুয়াল ট্রাস্ট ব্যাংক (MTB Smart)</option>
                      </>
                    ) : (
                      <>
                        <option value="ভিসা ডেবিট / ক্রেডিট কার্ড">ভিসা (Visa) ডেবিট / ক্রেডিট কার্ড</option>
                        <option value="মাস্টারকার্ড ডেবিট / ক্রেডিট">মাস্টারকার্ড (Mastercard)</option>
                        <option value="ইউনিয়নপে কার্ড">ইউনিয়নপে (UnionPay) কার্ড</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Account / Card Number Input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {addMoneyMethod === 'bank'
                      ? (language === 'bn' ? 'ব্যাংক অ্যাকাউন্ট নম্বর:' : 'Bank Account Number:')
                      : (language === 'bn' ? 'কার্ড নম্বর (১৬ ডিজিট):' : 'Card Number (16-digit):')}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={addMoneyMethod === 'bank' ? '2050100234567' : '4123 4567 8901 2345'}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492] font-mono"
                  />
                </div>

                {/* Amount Section with Quick Chips */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'টাকার পরিমাণ (৳):' : 'Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-base font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492]"
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

                {/* Balance Note */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between text-xs text-amber-950">
                  <span>{language === 'bn' ? 'বর্তমান ব্যালেন্স:' : 'Current Balance:'}</span>
                  <span className="font-extrabold">৳{user?.balance?.toLocaleString() || '18,450.00'}</span>
                </div>

                {/* Direct Confirm CTA */}
                <button
                  type="button"
                  disabled={!amount || Number(amount) <= 0}
                  onClick={() => handleDirectConfirm({
                    type: 'add_money',
                    recipient: selectedBank,
                    recipientName: selectedBank,
                    amount: Number(amount),
                    fee: 0,
                    note: 'অ্যাড মানি সফল',
                    category: 'অন্যান্য',
                    categoryEn: 'Others',
                    roundUpAmount: 0
                  })}
                  className="w-full py-3.5 rounded-2xl bg-[#1F4FB5] text-white font-extrabold text-sm shadow-md disabled:opacity-40 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Add Money'}</span>
                  <span>➔</span>
                </button>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* G. SAVINGS / সঞ্চয় (IMAGE 6) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'savings' && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* Top Card: e-TIN & Statement */}
                <div className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold">
                    📄
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs text-slate-900 block">
                      {language === 'bn' ? 'ই-টিন ও সঞ্চয় বিবরণী' : 'e-TIN & Savings Statement'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {language === 'bn' ? 'সার্টিফিকেট ও ট্যাক্স বিবরণী ডাউনলোড করুন' : 'Download tax certificates & statements'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-bold text-sm">›</span>
                </div>

                {/* Money Tree Center Illustration */}
                <div className="flex flex-col items-center justify-center py-2 text-center">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-1">
                    <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-sm">
                      <path d="M85 140 L155 140 L145 185 L95 185 Z" fill="#D97757" />
                      <rect x="80" y="132" width="80" height="12" rx="3" fill="#C25A38" />
                      <path d="M120 135 L120 100 Q120 70 85 65 Q120 70 120 100 Q120 70 155 65" fill="none" stroke="#8D6E63" strokeWidth="10" strokeLinecap="round" />
                      <path d="M120 90 Q100 80 80 90" fill="none" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                      <path d="M120 85 Q140 75 160 85" fill="none" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="75" cy="65" r="14" fill="#66BB6A" opacity="0.9" />
                      <circle cx="165" cy="65" r="14" fill="#66BB6A" opacity="0.9" />
                      <circle cx="75" cy="95" r="11" fill="#4CAF50" opacity="0.9" />
                      <circle cx="165" cy="95" r="11" fill="#4CAF50" opacity="0.9" />
                      <circle cx="120" cy="55" r="13" fill="#81C784" opacity="0.9" />
                      <circle cx="75" cy="65" r="11" fill="#FFD54F" stroke="#FFB300" strokeWidth="2" />
                      <text x="75" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#5D4037">৳</text>
                      <circle cx="165" cy="65" r="11" fill="#FFD54F" stroke="#FFB300" strokeWidth="2" />
                      <text x="165" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#5D4037">৳</text>
                      <circle cx="120" cy="55" r="11" fill="#FFD54F" stroke="#FFB300" strokeWidth="2" />
                      <text x="120" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#5D4037">৳</text>
                      <circle cx="125" cy="175" r="18" fill="#FFD54F" stroke="#FFA000" strokeWidth="2.5" />
                      <text x="125" y="182" textAnchor="middle" fontSize="17" fontWeight="bold" fill="#5D4037">৳</text>
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {language === 'bn' ? 'আপনার ডিপিএস খুলুন মিনিটেই' : 'Open your DPS in minutes'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'bn' ? 'ইউসিবি ব্যাংকের সাথে আকর্ষণীয় মুনাফায় সেভিংস' : 'Savings with attractive profits with UCB Bank'}
                  </p>
                </div>

                {/* Plan selection or Amount input */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      {language === 'bn' ? 'সঞ্চয় / ডিপিএস প্ল্যান:' : 'Savings Plan:'}
                    </label>
                    <select
                      value={savingsDuration}
                      onChange={(e) => setSavingsDuration(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none"
                    >
                      <option value={3}>৩ মাস মেয়াদী ডিপিএস (৭.৫% মুনাফা)</option>
                      <option value={6}>৬ মাস মেয়াদী ডিপিএস (৮.০% মুনাফা)</option>
                      <option value={12}>১ বছর মেয়াদী ডিপিএস (৮.৫% মুনাফা)</option>
                      <option value={24}>২ বছর মেয়াদী গোল সেভার্স (৯.০% মুনাফা)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      {language === 'bn' ? 'জমার পরিমাণ (৳):' : 'Deposit Amount (৳):'}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="1000"
                      className="w-full p-3 rounded-2xl border border-slate-200 text-base font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492]"
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
                </div>

                {/* Confirm DPS CTA */}
                <button
                  type="button"
                  disabled={!amount || Number(amount) <= 0}
                  onClick={() => handleDirectConfirm({
                    type: 'savings',
                    recipient: 'ইউসিবি ডিপিএস সঞ্চয় স্কিম',
                    recipientName: 'ইউসিবি ব্যাংক সেভিংস',
                    amount: Number(amount),
                    fee: 0,
                    note: `${savingsDuration} মাসের ডিপিএস জমা`,
                    category: 'অন্যান্য',
                    categoryEn: 'Savings',
                    roundUpAmount: 0
                  })}
                  className="w-full py-3.5 rounded-2xl bg-[#00D492] hover:bg-[#00BF83] text-slate-950 font-extrabold text-sm shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'bn' ? 'ডিপিএস নিশ্চিত করুন' : 'Confirm DPS'}</span>
                  <span>➔</span>
                </button>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* H. FUND TRANSFER (IMAGE 7) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'fund_transfer' && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* Channel toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setTransferChannel('bank')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      transferChannel === 'bank'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏦 {language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferChannel('mfs')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      transferChannel === 'mfs'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📱 {language === 'bn' ? 'অন্যান্য এমএফএস' : 'Other MFS'}
                  </button>
                </div>

                {/* Bank / Institution Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {transferChannel === 'bank'
                      ? (language === 'bn' ? 'গন্তব্য ব্যাংক' : 'Destination Bank')
                      : (language === 'bn' ? 'এমএফএস নির্বাচন করুন' : 'Select MFS')}
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D492]"
                  >
                    {transferChannel === 'bank' ? (
                      <>
                        <option value="ইউসিবি ব্যাংক (UCB)">ইউসিবি ব্যাংক (United Commercial Bank)</option>
                        <option value="সিটি ব্যাংক (City Bank)">সিটি ব্যাংক (Citytouch)</option>
                        <option value="ব্র্যাক ব্যাংক (BRAC Bank)">ব্র্যাক ব্যাংক (Astha)</option>
                        <option value="ইসলামী ব্যাংক (IBBL)">ইসলামী ব্যাংক বাংলাদেশ (CellFin)</option>
                        <option value="ডাচ্-বাংলা ব্যাংক (DBBL)">ডাচ্-বাংলা ব্যাংক (NexusPay)</option>
                        <option value="ইস্টার্ন ব্যাংক (EBL)">ইস্টার্ন ব্যাংক (EBL SKYBANKING)</option>
                      </>
                    ) : (
                      <>
                        <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                        <option value="নগদ (Nagad)">নগদ (Nagad)</option>
                        <option value="রকেট (Rocket)">রকেট (Rocket)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Account / Number input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {transferChannel === 'bank'
                      ? (language === 'bn' ? 'প্রাপকের অ্যাকাউন্ট নম্বর:' : 'Recipient Account Number:')
                      : (language === 'bn' ? 'প্রাপকের মোবাইল নম্বর:' : 'Recipient Mobile Number:')}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={transferChannel === 'bank' ? '2050100234567' : '01XXXXXXXXX'}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492] font-mono"
                  />
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'ট্রান্সফার পরিমাণ (৳):' : 'Transfer Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-base font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492]"
                  />
                  {/* Quick amount chips: 100, 200, 300, 500 */}
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

                {/* Reference Note */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'নোট / উদ্দেশ্য:' : 'Reference / Purpose:'}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: পারিবারিক খরচ, ঋণ পরিশোধ...' : 'e.g. Family expense'}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>

                {/* Next Review Button */}
                <button
                  type="button"
                  disabled={!amount || Number(amount) <= 0}
                  onClick={triggerRiskEvaluation}
                  className="w-full py-3.5 rounded-2xl bg-[#1F4FB5] text-white font-extrabold text-sm shadow-md disabled:opacity-40 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Next: Review'}</span>
                  <span>➔</span>
                </button>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* I. REQUEST MONEY (IMAGE 8) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'request_money' && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* Recipient Target */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'কার কাছ থেকে টাকা চাইছেন?' : 'Request From (Number):'}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492] font-mono"
                  />
                  {/* Quick contact pills */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRecipient('01711223344');
                        setRecipientName('তানভীর আহমেদ');
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                    >
                      👤 তানভীর (বন্ধু)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRecipient('01819234567');
                        setRecipientName('রেহানা পারভীন');
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                    >
                      👤 আম্মু
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'অনুরোধের পরিমাণ (৳):' : 'Requested Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-base font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492]"
                  />
                  {/* Quick amount chips: 100, 200, 300, 500 */}
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

                {/* Note / Purpose */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'অনুরোধের কারণ / নোট:' : 'Reason / Note:'}
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: নাস্তার বিল, শেয়ারিং খরচ...' : 'e.g. Lunch bill'}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>

                {/* Send Request CTA */}
                <button
                  type="button"
                  disabled={!amount || Number(amount) <= 0 || !recipient}
                  onClick={() => handleDirectConfirm({
                    type: 'request_money',
                    recipient: recipient || '01711223344',
                    recipientName: recipientName || 'প্রাপক',
                    amount: Number(amount),
                    fee: 0,
                    note: note || 'টাকা অনুরোধ',
                    category: 'অন্যান্য',
                    categoryEn: 'Request Money',
                    roundUpAmount: 0
                  })}
                  className="w-full py-3.5 rounded-2xl bg-[#1F4FB5] text-white font-extrabold text-sm shadow-md disabled:opacity-40 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'রিকোয়েস্ট পাঠান' : 'Send Request'}</span>
                  <span>➔</span>
                </button>
              </div>
            )}

            {/* ---------------------------------------------------------- */}
            {/* J. NPSB (IMAGE 10) */}
            {/* ---------------------------------------------------------- */}
            {initialType === 'npsb' && (
              <div className="p-4 space-y-4 animate-fade-in">
                {/* Branded NPSB Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    NPSB
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-purple-950 block">
                      {language === 'bn' ? 'ন্যাশনাল পেমেন্ট সুইচ বাংলাদেশ (NPSB)' : 'National Payment Switch Bangladesh'}
                    </span>
                    <span className="text-[11px] text-purple-700">
                      {language === 'bn' ? 'তাত্ক্ষণিক ইন্টার-ব্যাংক ২৪/৭ ফান্ড ট্রান্সফার' : 'Instant 24/7 inter-bank fund transfer'}
                    </span>
                  </div>
                </div>

                {/* Participating Bank Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'অংশগ্রহণকারী ব্যাংক নির্বাচন করুন:' : 'Select Participating Bank:'}
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00D492]"
                  >
                    <option value="ইউসিবি ব্যাংক (UCB)">ইউনাইটেড কমার্শিয়াল ব্যাংক (UCB)</option>
                    <option value="সোনালী ব্যাংক পিএলসি">সোনালী ব্যাংক পিএলসি</option>
                    <option value="ব্র্যাক ব্যাংক পিএলসি">ব্র্যাক ব্যাংক পিএলসি (BRAC Bank)</option>
                    <option value="দ্য সিটি ব্যাংক পিএলসি">দ্য সিটি ব্যাংক পিএলসি (City Bank)</option>
                    <option value="ইসলামী ব্যাংক বাংলাদেশ">ইসলামী ব্যাংক বাংলাদেশ পিএলসি</option>
                    <option value="পূবালী ব্যাংক পিএলসি">পূবালী ব্যাংক পিএলসি</option>
                    <option value="অগ্রণী ব্যাংক পিএলসি">অগ্রণী ব্যাংক পিএলসি</option>
                  </select>
                </div>

                {/* Beneficiary Account Number */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'বেনিফিশিয়ারি ব্যাংক অ্যাকাউন্ট নম্বর:' : 'Beneficiary Account Number:'}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="2050100234567"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492] font-mono"
                  />
                </div>

                {/* Beneficiary Name */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'অ্যাকাউন্টধারীর নাম:' : 'Account Holder Name:'}
                  </label>
                  <input
                    type="text"
                    value={npsbBeneficiaryName}
                    onChange={(e) => setNpsbBeneficiaryName(e.target.value)}
                    placeholder="মোহাম্মদ মাইনুল ইসলাম"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>

                {/* Amount input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    {language === 'bn' ? 'ট্রান্সফার পরিমাণ (৳):' : 'Transfer Amount (৳):'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full p-3 rounded-2xl border border-slate-200 text-base font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#00D492]"
                  />
                  {/* Quick amount chips: 100, 200, 300, 500 */}
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

                {/* Next Review Button */}
                <button
                  type="button"
                  disabled={!amount || Number(amount) <= 0}
                  onClick={triggerRiskEvaluation}
                  className="w-full py-3.5 rounded-2xl bg-[#1F4FB5] text-white font-extrabold text-sm shadow-md disabled:opacity-40 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'পরবর্তী ধাপে যান' : 'Next: Review'}</span>
                  <span>➔</span>
                </button>
              </div>
            )}
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
                    <span className="text-slate-500">{language === 'bn' ? 'প্রাপক' : 'Recipient'}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{recipientName || 'অপরিচিত'}</span>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        {initialType === 'mobile_recharge' && (
                          <OperatorLogo operator={selectedOperator || recipient} size={28} />
                        )}
                        <span className="font-mono text-slate-600">{recipient || '01711223344'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'মূল পরিমাণ' : 'Base Amount'}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(Number(amount) || 0, language)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{language === 'bn' ? 'চার্জ / ফি' : 'Fee'}</span>
                    <span className="font-bold text-emerald-600">
                      {calculatedFee() > 0 ? formatCurrency(calculatedFee(), language) : (language === 'bn' ? '৳০.০০ (ফ্রি)' : '৳0.00 (Free)')}
                    </span>
                  </div>
                  {roundUpSpare > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">{language === 'bn' ? 'ভাঙতি সেভিংস জমা' : 'Spare Change'}</span>
                      <span className="font-bold text-amber-600">+{formatCurrency(roundUpSpare, language)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Payable'}</span>
                    <span className="font-black text-[#1F4FB5] text-lg">
                      {formatCurrency((Number(amount) || 0) + calculatedFee() + roundUpSpare, language)}
                    </span>
                  </div>
                </div>

                {/* Embedded Safe AI Pre-Transaction Risk Badge (Button First, Click to Expand Full Details) */}
                {riskAssessment && (
                  <div
                    className={`rounded-2xl border text-xs overflow-hidden transition-all duration-300 shadow-2xs ${
                      riskAssessment.riskLevel === 'high'
                        ? 'bg-rose-50/85 border-rose-200 text-rose-950'
                        : riskAssessment.riskLevel === 'medium'
                        ? 'bg-amber-50/85 border-amber-200 text-amber-950'
                        : 'bg-emerald-50/85 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    {/* First: Interactive Safe AI Assessment Button */}
                    <button
                      type="button"
                      onClick={() => setShowAiAssessmentDetails((prev) => !prev)}
                      className={`w-full p-3 sm:p-3.5 flex items-center justify-between text-left cursor-pointer transition-all active:scale-[0.99] hover:bg-black/[0.03] ${
                        showAiAssessmentDetails ? 'border-b border-inherit bg-white/40' : ''
                      }`}
                      aria-expanded={showAiAssessmentDetails}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-sm shrink-0 border border-slate-100">
                          🛡️
                        </span>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs block text-slate-900 truncate">
                            {language === 'bn' ? 'সেফ এআই রিক্স অ্যাসেসমেন্ট' : 'Safe AI Risk Assessment'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold block truncate">
                            {showAiAssessmentDetails
                              ? (language === 'bn' ? 'সংক্ষিপ্ত করতে ক্লিক করুন ▲' : 'Click to collapse details ▲')
                              : (language === 'bn' ? 'সম্পূর্ণ বিবরণ দেখতে এখানে ক্লিক করুন ▼' : 'Click here to view full details ▼')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-2xs ${
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
                            : (language === 'bn' ? 'নিরাপদ' : 'Safe')}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-2xs flex items-center justify-center transition-transform duration-200 border border-slate-200/60 ${
                            showAiAssessmentDetails ? 'rotate-180' : ''
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Full Details Revealed When Button is Clicked */}
                    {showAiAssessmentDetails && (
                      <div className="p-3.5 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* LightGBM Trained Fraud Model Badge */}
                        <div className="bg-indigo-50/90 border border-indigo-200/90 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[9px] tracking-wider uppercase flex items-center gap-1">
                                <span>⚡</span> ML model
                              </span>
                              <span className="text-[10.5px] font-bold text-indigo-950">
                                {language === 'bn' ? 'প্রশিক্ষিত LightGBM ফ্রড মডেল' : 'Trained LightGBM Fraud Model'}
                              </span>
                            </div>
                            <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200 shadow-2xs">
                              {language === 'bn' ? 'ঝুঁকির সম্ভাবনা: ' : 'Fraud Prob: '}
                              {riskAssessment.probability !== undefined
                                ? `${toBanglaNumber(Math.round(riskAssessment.probability * 100))}%`
                                : `${toBanglaNumber(riskAssessment.riskScore)}%`}
                            </span>
                          </div>

                          {/* Top 3 Predictive Factors */}
                          {riskAssessment.topFactors && riskAssessment.topFactors.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-indigo-100">
                              <span className="text-[9.5px] font-bold text-indigo-950 block">
                                {language === 'bn' ? 'মডেলের শীর্ষ ৩টি রিস্ক ফ্যাক্টর:' : 'Top 3 ML Risk Factors:'}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {riskAssessment.topFactors.slice(0, 3).map((factor, fIdx) => (
                                  <span
                                    key={fIdx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 border border-indigo-200/80 text-[9.5px] text-indigo-900 font-semibold"
                                  >
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>{factor.labelBn || factor.feature}</span>
                                    <span className="text-[8.5px] font-mono text-indigo-600 font-bold">
                                      (+{toBanglaNumber(Math.round(factor.impact * 10) / 10)})
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] leading-relaxed bg-white/90 p-2.5 rounded-xl text-slate-800 shadow-2xs border border-white">
                          {language === 'bn' ? riskAssessment.explanationBn : riskAssessment.explanationEn}
                        </p>

                        <p className="text-[11px] font-bold text-[#1F4FB5] flex items-center gap-1.5 bg-blue-50/70 p-2 rounded-xl border border-blue-100">
                          <span>💡</span>
                          <span>{language === 'bn' ? riskAssessment.actionAdviceBn : riskAssessment.actionAdviceEn}</span>
                        </p>

                        {/* Signals breakdown & score */}
                        <div className="pt-1 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowWhyPanel(!showWhyPanel)}
                            className="text-[11px] font-bold text-[#1F4FB5] hover:underline flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-2xs border border-blue-100 cursor-pointer"
                          >
                            <span>{showWhyPanel ? 'ঝুঁকির সংকেত লুকান ▲' : 'ঝুঁকির বিস্তারিত সংকেত (কেন?) ▼'}</span>
                          </button>
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                            স্কোর: {toBanglaNumber(riskAssessment.riskScore)}/১০০
                          </span>
                        </div>

                        {showWhyPanel && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-[11px] text-slate-800 animate-fade-in shadow-2xs">
                            <span className="font-bold text-slate-900 block">চিহ্নিত ঝুঁকির সংকেতসমূহ:</span>
                            {riskAssessment.signals && riskAssessment.signals.length > 0 ? (
                              riskAssessment.signals.map((sig, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                                  <span className="text-amber-500 font-bold">•</span>
                                  <span>
                                    <strong>{sig.labelBn}:</strong> {sig.detailsBn} (+{toBanglaNumber(sig.points)} পয়েন্ট)
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-500">কোনো সন্দেহজনক সংকেত পাওয়া যায়নি। লেনদেনটি নিরাপদ।</p>
                            )}
                          </div>
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
        {/* STEP 3: PIN ENTRY SCREEN (IMAGE 11 / EXACT MATCH USER IMAGE) */}
        {/* ============================================================ */}
        {step === 'pin_entry' && (
          <div className="p-4 flex flex-col items-center animate-fade-in">
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">
              {language === 'bn' ? 'আপনার ৪ ডিজিটের পিন প্রদান করুন' : 'Enter 4-Digit PIN to Confirm'}
            </h3>
            <p className="text-xs text-slate-500 mb-1.5">
              {language === 'bn' ? 'সর্বমোট প্রদেয়: ' : 'Total Amount: '}
              <span className="font-bold text-[#1F4FB5]">
                {formatCurrency((Number(amount) || 0) + calculatedFee() + roundUpSpare, language)}
              </span>
            </p>

            {/* Demo PIN indicator badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-3 shadow-2xs">
              <span>🔑 {language === 'bn' ? 'ডেমো পিন: 1234' : 'Demo PIN: 1234'}</span>
            </div>

            {/* PIN Dots (matching User Image) */}
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

            {/* Custom Numeric Keypad (matching User Image) */}
            <div className="w-full max-w-[340px] mt-2">
              <CustomKeypad
                onKeyPress={handleKeypadPress}
                onBackspace={handleKeypadBackspace}
                onSubmit={handlePinSubmit}
                submitDisabled={enteredPin.length < 4 || isSubmittingPin}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS RECEIPT SCREEN (IMAGE 12)                    */}
        {/* ============================================================ */}
        {step === 'success' && completedTx && (
          <div className="p-4 flex flex-col items-center space-y-4 animate-scale-up">
            {/* Celebratory Checkmark Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl shadow-sm mt-2">
              ✓
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {language === 'bn' ? 'লেনদেন সফল হয়েছে!' : 'Transaction Successful!'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(completedTx.amount, language)}
              </h3>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-1">
                <span>{language === 'bn' ? 'প্রাপক: ' : 'To: '}</span>
                {initialType === 'mobile_recharge' && (
                  <OperatorLogo operator={selectedOperator || completedTx.recipient} size={20} />
                )}
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
                    navigator.clipboard.writeText(`Recursion Pay Safe Tx: ${completedTx.id}, Amount: ${completedTx.amount}`);
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

      {/* 3. OPERATOR BOTTOM SHEET FOR MOBILE RECHARGE (IMAGE 4) */}
      {showOperatorSheet && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-2xs flex flex-col justify-end animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl p-5 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'bn' ? 'অপারেটর সিলেক্ট করুন' : 'Select Operator'}
              </h3>
              <button
                type="button"
                onClick={() => setShowOperatorSheet(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Operator Grid (Image 4) */}
            <OperatorSelectionGrid
              selectedId={selectedOperator}
              onSelect={(op) => {
                setSelectedOperator(op.name);
                setShowOperatorSheet(false);
              }}
            />

            <div className="border-t border-slate-100 pt-2" />

            {/* Connection Type Pills (Image 4) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConnectionType('prepaid')}
                className={`py-2 rounded-full text-xs font-bold border transition-colors ${
                  connectionType === 'prepaid' ? 'bg-[#1F4FB5] text-white border-[#1F4FB5]' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {language === 'bn' ? 'প্রিপেইড' : 'Prepaid'}
              </button>
              <button
                type="button"
                onClick={() => setConnectionType('postpaid')}
                className={`py-2 rounded-full text-xs font-bold border transition-colors ${
                  connectionType === 'postpaid' ? 'bg-[#1F4FB5] text-white border-[#1F4FB5]' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {language === 'bn' ? 'পোস্টপেইড' : 'Postpaid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
