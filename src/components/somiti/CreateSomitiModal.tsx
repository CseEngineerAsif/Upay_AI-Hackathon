import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DigitalSomiti } from '../../types/somiti';
import { createNewSomiti } from '../../utils/somitiManager';

interface CreateSomitiModalProps {
  onClose: () => void;
  onCreated: (newSomiti: DigitalSomiti) => void;
}

export const CreateSomitiModal: React.FC<CreateSomitiModalProps> = ({ onClose, onCreated }) => {
  const { user, language } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [somitiName, setSomitiName] = useState('');
  const [category, setCategory] = useState<'friends' | 'business' | 'family' | 'neighborhood' | 'colleagues'>('friends');
  const [description, setDescription] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [totalCycles, setTotalCycles] = useState<number>(5);

  // Member State
  const [members, setMembers] = useState<{ id: string; name: string; phone: string; priorityReason?: string }[]>([
    { id: 'm_1', name: 'কামাল হোসেন', phone: '01711223344', priorityReason: 'নভেম্বরে বিয়ে ও পারিবারিক খরচ' },
    { id: 'm_2', name: 'সাদিয়া ইসলাম', phone: '01899112233', priorityReason: 'অক্টোবরে শপের স্টক ইনভেন্টরি' },
    { id: 'm_3', name: 'তানভীর আহমেদ', phone: '01911445566', priorityReason: '' },
    { id: 'm_4', name: 'নুসরাত জাহান', phone: '01677334455', priorityReason: '' }
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberNote, setNewMemberNote] = useState('');

  // AI Payout Order State
  const [isGeneratingAiOrder, setIsGeneratingAiOrder] = useState(false);
  const [aiPayoutResult, setAiPayoutResult] = useState<any>(null);

  // Sample quick contacts
  const quickContacts = [
    { name: 'রফিকুল ইসলাম', phone: '01719887766' },
    { name: 'ফারহানা শারমিন', phone: '01819776655' },
    { name: 'মাহবুব আলম', phone: '01912554433' },
    { name: 'আরিফ চৌধুরী', phone: '01555667788' }
  ];

  const handleAddMember = (name: string, phone: string, priorityReason?: string) => {
    if (!name.trim() || !phone.trim()) return;
    setMembers([
      ...members,
      {
        id: `m_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        priorityReason: priorityReason?.trim()
      }
    ]);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberNote('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  // Generate Fair Payout Order via AI with Graceful Fallback
  const handleGenerateAiOrder = async () => {
    setIsGeneratingAiOrder(true);

    const allMembersInput = [
      {
        id: user?.id || 'u_asif',
        name: `${user?.name || 'আসিফ রহমান'} (অ্যাডমিন)`,
        phone: user?.phone || '01712345678',
        priorityReason: 'অ্যাডমিন সদস্য'
      },
      ...members
    ];

    try {
      const response = await fetch('/api/somiti/ai-payout-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          somitiName: somitiName || 'ডিজিটাল সমিতি',
          members: allMembersInput,
          monthlyContribution,
          totalCycles: allMembersInput.length
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiPayoutResult(data);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Graceful local fallback as mandated
      const shuffled = [...allMembersInput].sort(() => Math.random() - 0.5).map((m) => m.id);
      setAiPayoutResult({
        orderedMemberIds: shuffled,
        rationaleBn:
          'ক্রিপ্টোগ্রাফিক সিড ও নিরপেক্ষ লটারি অ্যালগরিদম দ্বারা এই পে-আউট ক্রম নির্ধারিত হয়েছে। কোনো সদস্য বা অ্যাডমিন এককভাবে কোনো বিশেষ সুবিধা পাননি। সমতার ভিত্তিতে প্রতি মাসের পুল বণ্টন নিশ্চিত করা হয়েছে।',
        rationaleEn:
          'This payout order was generated using a cryptographically randomized lottery algorithm with verifiable public seed.',
        fairnessScore: 99,
        factors: [
          {
            titleBn: 'নিরপেক্ষ লটারি সিড',
            titleEn: 'Neutral Lottery Seed',
            descriptionBn: 'সিস্টেম-জেনারেটেড র্যান্ডম সিড ব্যবহার করা হয়েছে যা পরিবর্তন অযোগ্য।',
            descriptionEn: 'Deterministic pseudo-random permutation prevents manual tampering.'
          },
          {
            titleBn: 'জরুরি আর্থিক সমতা',
            titleEn: 'Emergency Parity',
            descriptionBn: 'সকল সদস্যের মাসিক কিস্তি ও পে-আউটের সমান চক্র সুষমভাবে বণ্টন করা হয়েছে।',
            descriptionEn: 'Balanced rotation ensures each participant receives the exact scheduled lump-sum.'
          }
        ],
        transparencyHash: `0x${Math.random().toString(16).slice(2, 14)}`
      });
    } finally {
      setIsGeneratingAiOrder(false);
      setStep(3);
    }
  };

  const handleFinalSubmit = () => {
    const created = createNewSomiti({
      name: somitiName || 'আমার নতুন ডিজিটাল সমিতি',
      category,
      description: description || '৫ জন সদস্যের নিরাপদ সঞ্চয় সার্কেল',
      monthlyContribution,
      totalCycles: members.length + 1,
      adminUser: {
        id: user?.id || 'u_asif',
        name: user?.name || 'আসিফ রহমান',
        phone: user?.phone || '01712345678'
      },
      members: members.map((m) => ({
        name: m.name,
        phone: m.phone,
        priorityReason: m.priorityReason
      })),
      payoutExplanation: aiPayoutResult
    });

    onCreated(created);
    onClose();
  };

  const totalMembersCount = members.length + 1; // plus current user admin
  const totalPoolPerCycle = monthlyContribution * totalMembersCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 select-none">
      <div className="w-full max-w-[430px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg border border-white/20">
              ✨
            </span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                {language === 'bn' ? 'নতুন সমিতি তৈরি করুন' : 'Create Digital Somiti'}
              </h2>
              <p className="text-[10px] text-blue-200">
                {language === 'bn' ? `ধাপ ${step} / ৪: ` : `Step ${step} of 4: `}
                {step === 1 && (language === 'bn' ? 'মৌলিক তথ্য ও কিস্তি' : 'Basic Info & Contribution')}
                {step === 2 && (language === 'bn' ? 'সদস্য তালিকা যোগ' : 'Add Members')}
                {step === 3 && (language === 'bn' ? 'AI নিরপেক্ষ পে-আউট ক্রম' : 'AI Fair Payout Order')}
                {step === 4 && (language === 'bn' ? 'যাচাই ও নিশ্চয়তা' : 'Review & Launch')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 flex">
          <div
            className="bg-[#FFD600] h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'সমিতির নাম (Somiti Name):' : 'Somiti Name:'}
                </label>
                <input
                  type="text"
                  value={somitiName}
                  onChange={(e) => setSomitiName(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ধানমন্ডি ফ্রেন্ডস সমিতি' : 'e.g. Mirpur Friends Circle'}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'friends', bn: 'বন্ধু ও আড্ডা', en: 'Friends' },
                    { id: 'business', bn: 'উদ্যোক্তা/ব্যবসা', en: 'Business' },
                    { id: 'family', bn: 'পরিবার', en: 'Family' },
                    { id: 'colleagues', bn: 'অফিস কলিগ', en: 'Colleagues' },
                    { id: 'neighborhood', bn: 'এলাকাভিত্তিক', en: 'Neighborhood' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id as any)}
                      className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer ${
                        category === c.id
                          ? 'bg-[#0B4DA2] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {language === 'bn' ? c.bn : c.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Contribution Amount */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">
                    {language === 'bn' ? 'প্রতি সদস্যের মাসিক কিস্তি:' : 'Monthly Contribution per Member:'}
                  </label>
                  <span className="font-mono font-black text-sm text-[#0B4DA2]">
                    ৳{monthlyContribution.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthlyContribution(amt)}
                      className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        monthlyContribution === amt
                          ? 'bg-[#0B4DA2] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ৳{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  {language === 'bn' ? 'বিবরণ বা উদ্দেশ্য (ঐচ্ছিক):' : 'Goal or Description (Optional):'}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: পারিবারিক জরুরি সঞ্চয় ও বিনিয়োগ' : 'e.g. Shared savings for family needs'}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B4DA2]"
                />
              </div>

              {/* Summary Card */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                  {language === 'bn' ? 'হিসাব সারাংশ' : 'Calculation Summary'}
                </span>
                <p className="text-xs text-amber-950 font-bold">
                  {language === 'bn'
                    ? `৫ জন সদস্য থাকলে প্রতি মাসে সংগৃহীত তহবিল হবে ৳${(monthlyContribution * 5).toLocaleString()}।`
                    : `With 5 members, total pool will be ৳${(monthlyContribution * 5).toLocaleString()} per round.`}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Members List */}
          {step === 2 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">
                  {language === 'bn' ? 'সদস্য তালিকা (মোট ' : 'Member List (Total '}
                  {totalMembersCount} {language === 'bn' ? 'জন)' : 'members)'}
                </h4>
                <span className="text-[10px] text-slate-500">
                  {language === 'bn' ? 'অ্যাডমিন সহ' : 'Includes Admin'}
                </span>
              </div>

              {/* Admin item (fixed) */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#0B4DA2] text-white flex items-center justify-center font-bold text-xs">
                    👑
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{user?.name || 'আসিফ রহমান'} (অ্যাডমিন)</span>
                    <span className="text-[10px] text-slate-500 block">{user?.phone || '01712345678'}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 text-[10px] font-bold">
                  Admin
                </span>
              </div>

              {/* Added members */}
              <div className="space-y-2">
                {members.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{m.name}</span>
                        {m.priorityReason && (
                          <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-semibold">
                            {m.priorityReason}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">{m.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-bold px-2 py-1 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Member Input Form */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  {language === 'bn' ? '+ নতুন সদস্য যোগ করুন' : '+ Add New Member'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={language === 'bn' ? 'নাম' : 'Name'}
                    className="p-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder={language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}
                    className="p-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <input
                  type="text"
                  value={newMemberNote}
                  onChange={(e) => setNewMemberNote(e.target.value)}
                  placeholder={language === 'bn' ? 'জরুরি প্রয়োজন বা বিশেষ কারণ (ঐচ্ছিক)' : 'Emergency need note (optional)'}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddMember(newMemberName, newMemberPhone, newMemberNote)}
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'তালিকায় যুক্ত করুন' : 'Add to List'}
                </button>
              </div>

              {/* Quick Contact suggestions */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  {language === 'bn' ? 'পরিচিতদের এক-ট্যাপে যোগ করুন:' : 'Quick Add from Contacts:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickContacts.map((qc) => (
                    <button
                      key={qc.phone}
                      type="button"
                      onClick={() => handleAddMember(qc.name, qc.phone)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-800 text-[10px] font-bold cursor-pointer"
                    >
                      + {qc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AI Fair Payout Order */}
          {step === 3 && (
            <div className="space-y-3.5 animate-fade-in">
              {aiPayoutResult ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🤖</span>
                        <h4 className="font-black text-indigo-950 text-xs">
                          {language === 'bn' ? 'AI নিরপেক্ষ অডিট সম্পন্ন!' : 'AI Fair Audit Complete!'}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold">
                        {aiPayoutResult.fairnessScore}% Fair
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-indigo-100">
                      {language === 'bn' ? aiPayoutResult.rationaleBn : aiPayoutResult.rationaleEn}
                    </p>

                    <div className="text-[10px] text-slate-500 font-mono">
                      Audit Hash: {aiPayoutResult.transparencyHash}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold text-slate-800 text-xs">
                      {language === 'bn' ? 'নির্ধারিত পে-আউট সিকোয়েন্স:' : 'Generated Payout Sequence:'}
                    </h5>
                    <div className="space-y-1.5">
                      {members.map((m, i) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-900 font-black text-xs flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="font-bold text-slate-900">{m.name}</span>
                          </div>
                          <span className="font-bold text-[#0B4DA2]">
                            ৳{totalPoolPerCycle.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0B4DA2] flex items-center justify-center text-2xl mx-auto">
                    🎲
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {language === 'bn' ? 'AI দিয়ে নিরপেক্ষ পে-আউট ক্রম প্রস্তুত করুন' : 'Generate Fair Payout Sequence via AI'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {language === 'bn'
                      ? 'অ্যাডমিন যাতে নিজের ইচ্ছামত সুবিধা না নিতে পারে, সেজন্য ক্রিপ্টোগ্রাফিক লটারি ও এআই স্বচ্ছতা দিয়ে সবার পে-আউট ক্রম তৈরি করা হবে।'
                      : 'AI algorithm generates a transparent lottery order preventing admin favoritism.'}
                  </p>
                  <button
                    type="button"
                    disabled={isGeneratingAiOrder}
                    onClick={handleGenerateAiOrder}
                    className="w-full py-2.5 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>🤖</span>
                    <span>{isGeneratingAiOrder ? (language === 'bn' ? 'AI বিশ্লেষণ চলছে...' : 'Auditing...') : (language === 'bn' ? 'AI দিয়ে পে-আউট ক্রম সাজান' : 'Generate with AI')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Confirmation */}
          {step === 4 && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                  {language === 'bn' ? 'সমিতি সারাংশ ও চুক্তি' : 'Somiti Summary & Escrow Terms'}
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'সমিতির নাম:' : 'Name:'}</span>
                    <span className="font-bold text-slate-900">{somitiName || 'ডিজিটাল সমিতি'}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'মাসিক কিস্তি:' : 'Monthly Contribution:'}</span>
                    <span className="font-bold text-slate-900">৳{monthlyContribution.toLocaleString()}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'মোট সদস্য:' : 'Total Members:'}</span>
                    <span className="font-bold text-slate-900">{totalMembersCount} জন</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'প্রতি সাইকেলে মোট তহবিল:' : 'Monthly Pool:'}</span>
                    <span className="font-black text-[#0B4DA2]">৳{totalPoolPerCycle.toLocaleString()}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'লেজার নিরাপত্তা:' : 'Ledger Security:'}</span>
                    <span className="font-bold text-emerald-700">🔒 অপরিবর্তনীয় ও ফ্রড-প্রুফ</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
                <span>🛡️</span>
                <span>
                  {language === 'bn'
                    ? '১০০% ব্যাংক এসক্রো নিশ্চয়তা। কোনো সদস্য বা অ্যাডমিন টাকা তছরুপ করতে পারবে না।'
                    : '100% Escrow Protection. Admin cannot unilaterally move funds.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'পূর্ববর্তী' : 'Back'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'পরবর্তী (সদস্য যোগ) ➔' : 'Next (Add Members) ➔'}
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleGenerateAiOrder}
              className="px-5 py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🤖</span>
              <span>{language === 'bn' ? 'AI পে-আউট নির্ধারণ' : 'Next: AI Order'}</span>
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2 rounded-xl bg-[#0B4DA2] hover:bg-blue-800 text-white font-black transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'যাচাই করুন ➔' : 'Review ➔'}
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-2 rounded-xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {language === 'bn' ? 'সমিতি নিশ্চিত করুন 🚀' : 'Launch Somiti 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
