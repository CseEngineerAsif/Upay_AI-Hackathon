import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ChildProfile, ChildPendingRequest, ChildTransaction } from '../../types/childWallet';
import {
  getChildrenProfiles,
  getPendingRequests,
  getChildTransactions,
  updateChildControls,
  handleRequestAction,
  sendAllowanceToChild,
  saveChildrenProfiles
} from '../../utils/childWalletManager';
import { formatCurrency } from '../../utils/formatters';

export const ChildWalletScreen: React.FC = () => {
  const { language } = useAppStore();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [requests, setRequests] = useState<ChildPendingRequest[]>([]);
  const [transactions, setTransactions] = useState<ChildTransaction[]>([]);

  // Modals & form state
  const [isAllowanceModalOpen, setIsAllowanceModalOpen] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState<number>(300);
  const [allowanceNote, setAllowanceNote] = useState('');
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState<number>(10);
  const [newChildPhone, setNewChildPhone] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const list = getChildrenProfiles();
    setChildren(list);
    if (list.length > 0) {
      setSelectedChildId(list[0].id);
    }
    setRequests(getPendingRequests());
    setTransactions(getChildTransactions());
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];

  const totalChildBalance = children.reduce((acc, c) => acc + c.balance, 0);
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleLimitChange = (dailyLimit: number) => {
    if (!selectedChild) return;
    const updated = updateChildControls(selectedChild.id, { dailySpendingLimit: dailyLimit });
    setChildren(updated);
    showToast(`✓ ${selectedChild.name}-এর দৈনিক খরচ সীমা ৳${dailyLimit} সেট করা হয়েছে`);
  };

  const handlePerTxLimitChange = (perTxLimit: number) => {
    if (!selectedChild) return;
    const updated = updateChildControls(selectedChild.id, { perTxLimit });
    setChildren(updated);
    showToast(`✓ এককালীন লেনদেন সীমা ৳${perTxLimit} নির্ধারণ করা হয়েছে`);
  };

  const handleApprovalToggle = (requireApproval: boolean) => {
    if (!selectedChild) return;
    const updated = updateChildControls(selectedChild.id, { requireApproval });
    setChildren(updated);
    showToast(
      requireApproval
        ? `✓ ${selectedChild.name}-এর জন্য অভিভাবক অনুমোদন বাধ্যতামূলক করা হয়েছে`
        : `✓ অনুমোদন ব্যবস্থা শিথিল করা হয়েছে`
    );
  };

  const handleLockToggle = () => {
    if (!selectedChild) return;
    const isLocked = !selectedChild.isLocked;
    const updated = updateChildControls(selectedChild.id, { isLocked });
    setChildren(updated);
    showToast(
      isLocked
        ? `🔒 ${selectedChild.name}-এর ওয়ালেট সাময়িকভাবে লক করা হয়েছে`
        : `🔓 ওয়ালেট আনলক সম্পন্ন হয়েছে`
    );
  };

  const handleCategoryToggle = (categoryKey: keyof ChildProfile['allowedCategories']) => {
    if (!selectedChild) return;
    const newCategories = {
      ...selectedChild.allowedCategories,
      [categoryKey]: !selectedChild.allowedCategories[categoryKey]
    };
    const updated = updateChildControls(selectedChild.id, { allowedCategories: newCategories });
    setChildren(updated);
    showToast('✓ ক্যাটাগরি অনুমতি আপডেট করা হয়েছে');
  };

  const handleApproveOrReject = (requestId: string, action: 'approved' | 'rejected') => {
    const { updatedRequests, updatedChildren } = handleRequestAction(requestId, action);
    setRequests(updatedRequests);
    setChildren(updatedChildren);
    setTransactions(getChildTransactions());
    showToast(
      action === 'approved'
        ? '✓ কেনাকাটার অনুরোধ সফলভাবে অনুমোদন করা হয়েছে!'
        : '✕ অনুরোধটি বাতিল করা হয়েছে'
    );
  };

  const handleSendAllowanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || allowanceAmount <= 0) return;

    const { updatedChildren } = sendAllowanceToChild(
      selectedChild.id,
      allowanceAmount,
      allowanceNote.trim()
    );
    setChildren(updatedChildren);
    setTransactions(getChildTransactions());
    setIsAllowanceModalOpen(false);
    setAllowanceNote('');
    showToast(`🎉 ৳${allowanceAmount} সফলভাবে ${selectedChild.name}-এর ওয়ালেটে জমা হয়েছে!`);
  };

  const handleAddChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;

    const newChild: ChildProfile = {
      id: `child_${Date.now()}`,
      name: newChildName.trim(),
      age: newChildAge,
      avatar: newChildAge > 11 ? '👧' : '👦',
      phoneMasked: newChildPhone.trim() || '০১৭**-***৯৮২',
      balance: 500,
      dailySpendingLimit: 200,
      perTxLimit: 150,
      requireApproval: true,
      isLocked: false,
      allowedCategories: {
        books: true,
        canteen: true,
        transport: true,
        gaming: false
      }
    };

    const updated = [...children, newChild];
    saveChildrenProfiles(updated);
    setChildren(updated);
    setSelectedChildId(newChild.id);
    setIsAddChildModalOpen(false);
    setNewChildName('');
    showToast(`✓ নতুন শিশুর ওয়ালেট (${newChild.name}) সফলভাবে যুক্ত করা হয়েছে!`);
  };

  const selectedChildTxs = transactions.filter(
    (t) => !selectedChild || t.childId === selectedChild.id
  );

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 overflow-y-auto no-scrollbar pb-24 select-none">
      {/* Top Banner (Unclipped, Upay royal theme) */}
      <div className="w-full min-h-[96px] sm:min-h-[104px] h-auto shrink-0 bg-gradient-to-r from-[#0B4DA2] via-[#093A7C] to-[#0B4DA2] text-white px-4 py-5 shadow-md relative">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20 shrink-0">
                🧒
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h1 className="text-[19px] font-black tracking-tight text-white leading-tight">
                    {language === 'bn' ? 'শিশুদের ওয়ালেট কন্ট্রোল' : 'Child Wallet Controls'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-[#00D492] text-slate-950 text-[10px] font-black uppercase tracking-wide shrink-0">
                    Parental Shield
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium leading-snug mt-1">
                  {language === 'bn'
                    ? 'সন্তানের নিরাপদ পকেটমানি, খরচের সীমা ও অভিভাবক অনুমোদন'
                    : 'Safe pocket money, spending limits & real-time guardian approvals'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddChildModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FFD600] hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="text-sm font-bold">+</span>
              <span>{language === 'bn' ? 'নতুন শিশু' : 'Add Child'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[9.5px] text-blue-200 font-semibold block uppercase">
                {language === 'bn' ? 'মোট ব্যালেন্স' : 'Total Balance'}
              </span>
              <span className="text-sm font-black text-[#FFD600] block mt-0.5">
                ৳{totalChildBalance.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[9.5px] text-blue-200 font-semibold block uppercase">
                {language === 'bn' ? 'নিবন্ধিত সন্তান' : 'Children'}
              </span>
              <span className="text-sm font-black text-white block mt-0.5">
                {children.length} {language === 'bn' ? 'জন' : ''}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[9.5px] text-blue-200 font-semibold block uppercase">
                {language === 'bn' ? 'অনুরোধ' : 'Pending'}
              </span>
              <span className="text-sm font-black text-rose-300 block mt-0.5">
                {pendingRequests.length} {language === 'bn' ? 'টি' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 text-center font-bold animate-fade-in shadow-xs">
          {toastMsg}
        </div>
      )}

      {/* Main Container */}
      <div className="p-4 space-y-4 text-xs">
        {/* Children Profile Selector */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === 'bn' ? 'সন্তান নির্বাচন করুন:' : 'Select Child:'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildId(child.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-blue-50/90 border-[#0B4DA2] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                    {child.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-900 text-xs truncate">{child.name}</h4>
                    <span className="text-[10px] text-slate-500 block">
                      {child.age} বছর • {child.phoneMasked}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#0B4DA2] block mt-0.5">
                      ৳{child.balance.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedChild && (
          <>
            {/* Active Child Overview Card */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-2xl shadow-inner">
                    {selectedChild.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-slate-900 text-sm">{selectedChild.name}</h3>
                      {selectedChild.isLocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-bold">
                          লক করা
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                          সক্রিয় ওয়ালেট
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] text-slate-500">
                      ডিভাইস / অ্যাকাউন্ট: {selectedChild.phoneMasked}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    বর্তমান ব্যালেন্স
                  </span>
                  <span className="font-mono font-black text-xl text-[#0B4DA2]">
                    ৳{selectedChild.balance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAllowanceModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00D492] to-[#00B478] hover:opacity-95 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>💸</span>
                  <span>{language === 'bn' ? 'পকেটমানি রিচার্জ' : 'Add Allowance'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLockToggle}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                    selectedChild.isLocked
                      ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{selectedChild.isLocked ? '🔓' : '🔒'}</span>
                  <span>
                    {selectedChild.isLocked
                      ? language === 'bn' ? 'ওয়ালেট আনলক' : 'Unlock Wallet'
                      : language === 'bn' ? 'জরুরি লক' : 'Freeze / Lock'}
                  </span>
                </button>
              </div>
            </div>

            {/* Pending Approvals Card (If Any) */}
            {pendingRequests.length > 0 && (
              <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🔔</span>
                    <h4 className="font-black text-slate-900 text-xs">
                      {language === 'bn' ? 'অপেক্ষমান খরচের অনুরোধ' : 'Pending Purchase Approvals'}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                    {pendingRequests.length} টি অনুরোধ
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-2xl bg-white border border-amber-200/80 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{req.merchantName}</h5>
                          <p className="text-[10px] text-slate-600 mt-0.5">{req.note}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {req.requestedAt}
                          </span>
                        </div>
                        <span className="font-mono font-black text-base text-rose-600">
                          ৳{req.amount}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleApproveOrReject(req.id, 'rejected')}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          ✕ বাতিল
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveOrReject(req.id, 'approved')}
                          className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs cursor-pointer"
                        >
                          ✓ অনুমোদন দিন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parental Controls & Limits Settings */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <span className="text-base">🛡️</span>
                <h4 className="font-black text-slate-900 text-xs">
                  {language === 'bn' ? 'অভিভাবক নিয়ন্ত্রণ ও খরচের রুলস' : 'Parental Controls & Rules'}
                </h4>
              </div>

              {/* 1. Daily Limit Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-bold">
                    {language === 'bn' ? 'দৈনিক সর্বোচ্চ খরচ সীমা:' : 'Daily Limit:'}
                  </span>
                  <span className="font-mono font-black text-[#0B4DA2] text-sm">
                    ৳{selectedChild.dailySpendingLimit}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={selectedChild.dailySpendingLimit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="w-full accent-[#0B4DA2] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>৳৫০</span>
                  <span>৳৫০০</span>
                  <span>৳১,০০০</span>
                </div>
              </div>

              {/* 2. Single Tx Limit Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-bold">
                    {language === 'bn' ? 'এককালীন লেনদেন সীমা:' : 'Per-Transaction Limit:'}
                  </span>
                  <span className="font-mono font-black text-[#0B4DA2] text-sm">
                    ৳{selectedChild.perTxLimit}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={selectedChild.perTxLimit}
                  onChange={(e) => handlePerTxLimitChange(Number(e.target.value))}
                  className="w-full accent-[#0B4DA2] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>৳৫০</span>
                  <span>৳২৫০</span>
                  <span>৳৫০০</span>
                </div>
              </div>

              {/* 3. Require Parent Approval Toggle */}
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-indigo-950 block text-xs">
                    {language === 'bn' ? 'অভিভাবকের সম্মতি বাধ্যতামূলক' : 'Require Parent Approval'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {language === 'bn'
                      ? 'যেকোনো কেনাকাটার আগে অভিভাবকের কাছে পুশ নোটিফিকেশন যাবে'
                      : 'Child must request approval before merchant checkout'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedChild.requireApproval}
                  onChange={(e) => handleApprovalToggle(e.target.checked)}
                  className="w-5 h-5 accent-[#0B4DA2] cursor-pointer shrink-0"
                />
              </div>

              {/* 4. Merchant Category Restrictions */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-slate-700 block text-xs">
                  {language === 'bn' ? 'অনুমোদিত কেনাকাটা ক্যাটাগরি:' : 'Allowed Categories:'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle('books')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      selectedChild.allowedCategories.books
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span>📚 বই ও স্টেশনারি</span>
                    <span className="text-xs font-bold">
                      {selectedChild.allowedCategories.books ? '✓' : '✗'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryToggle('canteen')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      selectedChild.allowedCategories.canteen
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span>🥪 ক্যান্টিন ও খাবার</span>
                    <span className="text-xs font-bold">
                      {selectedChild.allowedCategories.canteen ? '✓' : '✗'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryToggle('transport')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      selectedChild.allowedCategories.transport
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span>🚌 যাতায়াত / বাস</span>
                    <span className="text-xs font-bold">
                      {selectedChild.allowedCategories.transport ? '✓' : '✗'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryToggle('gaming')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      selectedChild.allowedCategories.gaming
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <span>🎮 গেমিং ও আইএপি</span>
                    <span className="text-xs font-bold">
                      {selectedChild.allowedCategories.gaming ? '✓' : 'নিষেধ'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Child Activity & Transaction History */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'bn' ? `${selectedChild.name}-এর সাম্প্রতিক লেনদেন:` : 'Recent Activity:'}
              </span>

              {selectedChildTxs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 text-xs">
                  কোনো লেনদেনের তথ্য পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedChildTxs.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              isExpense
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isExpense ? '↑' : '↓'}
                          </span>
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-900 text-xs truncate">
                              {tx.merchantOrSender}
                            </h5>
                            <span className="text-[10px] text-slate-400 block">{tx.timestamp}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-mono font-black text-sm block ${
                              isExpense ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isExpense ? '-' : '+'}৳{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* TOP-UP / SEND ALLOWANCE MODAL */}
      {isAllowanceModalOpen && selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-[390px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💸</span>
                <h3 className="font-black text-sm text-white">
                  {selectedChild.name}-কে পকেটমানি পাঠান
                </h3>
              </div>
              <button
                onClick={() => setIsAllowanceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAllowanceSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">প্রাপক সন্তান:</span>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedChild.name}</h4>
                  <span className="text-[10.5px] text-slate-500">{selectedChild.phoneMasked}</span>
                </div>
                <span className="text-2xl">{selectedChild.avatar}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">টাকার পরিমাণ (৳):</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAllowanceAmount(amt)}
                      className={`py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                        allowanceAmount === amt
                          ? 'bg-[#0B4DA2] text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="10"
                  value={allowanceAmount}
                  onChange={(e) => setAllowanceAmount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">নোট বা শুভেচ্ছা বার্তা (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={allowanceNote}
                  onChange={(e) => setAllowanceNote(e.target.value)}
                  placeholder="যেমন: সাপ্তাহিক টিফিনের খরচ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00D492] to-[#00B478] hover:opacity-95 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <span>✓</span>
                <span>৳{allowanceAmount.toLocaleString()} পকেটমানি নিশ্চিত করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW CHILD MODAL */}
      {isAddChildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none">
          <div className="w-full max-w-[390px] bg-slate-50 text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            <div className="px-5 py-3.5 bg-[#0B4DA2] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧒</span>
                <h3 className="font-black text-sm text-white">নতুন শিশুর ওয়ালেট প্রোফাইল</h3>
              </div>
              <button
                onClick={() => setIsAddChildModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChildSubmit} className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">সন্তানের পুরো নাম:</label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="যেমন: রায়ান আহমেদ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">বয়স (বছর):</label>
                  <input
                    type="number"
                    min="5"
                    max="17"
                    required
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(Number(e.target.value) || 10)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">ডিভাইস / ফোন নম্বর:</label>
                  <input
                    type="text"
                    value={newChildPhone}
                    onChange={(e) => setNewChildPhone(e.target.value)}
                    placeholder="০১৭xxxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[10.5px] text-blue-900 space-y-1">
                <span className="font-bold block">💡 প্যারেন্টাল প্রোটেকশন ফিচার:</span>
                <p>
                  শিশু কেবল অনুমোদিত মার্চেন্ট বা ক্যান্টিনে পেমেন্ট করতে পারবে। কোনো অননুমোদিত ক্যাটাগরিতে পেমেন্ট স্বয়ংক্রিয়ভাবে ব্লক থাকবে।
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FFD600] hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <span>+</span>
                <span>শিশুর ওয়ালেট তৈরি সম্পন্ন করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
