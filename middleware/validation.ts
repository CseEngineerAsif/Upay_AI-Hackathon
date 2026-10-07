import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Higher-order middleware to strictly validate request bodies against a Zod schema.
 * Rejects unknown or malformed fields with 400 and safe sanitized error messages.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request payload',
        details: (result.error.issues || []).map((err: any) => ({
          field: err.path?.length ? err.path.join('.') : (err.keys ? err.keys.join(', ') : 'body'),
          message: err.message
        }))
      });
    }
    req.body = result.data;
    next();
  };
}

// 1. Pre-Transaction Risk Check Schema (Strictly ignores and disallows client baseline, recentTransactions, and balance)
export const RiskCheckBodySchema = z
  .object({
    transactionId: z.string().max(64).optional(),
    amount: z.number().positive('Amount must be positive').max(1000000, 'Amount exceeds maximum limit of 1,000,000'),
    recipientPhone: z.string().min(5, 'Recipient phone too short').max(20, 'Recipient phone too long'),
    recipientName: z.string().max(100).optional(),
    note: z.string().max(300, 'Note cannot exceed 300 characters').optional(),
    isNewDevice: z.boolean().optional(),
    isNewLocation: z.boolean().optional()
  })
  .strict(); // Rejects unknown fields like userBaselineAvgAmount, recentTransactions, userBalance

// 2. Scam Message Check Schema
export const ScamCheckBodySchema = z
  .object({
    message: z.string().min(1, 'Message text is required').max(2000, 'Message cannot exceed 2000 characters')
  })
  .strict();

// 3. Audio Transcribe Schema
export const TranscribeBodySchema = z
  .object({
    audioBase64: z.string().min(10, 'Audio base64 data required').max(1000000, 'Audio payload exceeds limit'),
    mimeType: z.string().max(50).optional(),
    prompt: z.string().max(300).optional()
  })
  .strict();

// 4. Search Grounding Schema
export const SearchGroundingBodySchema = z
  .object({
    query: z.string().min(1, 'Query is required').max(500, 'Query cannot exceed 500 characters')
  })
  .strict();

// 5. Maps Grounding Schema
export const MapsGroundingBodySchema = z
  .object({
    locationQuery: z.string().min(1, 'Location query is required').max(500, 'Location query cannot exceed 500 characters')
  })
  .strict();

// 6. Bundle Optimizer Schema
export const BundleOptimizeBodySchema = z
  .object({
    monthlyDataGb: z.number().nonnegative().max(1000).optional(),
    monthlyTalkMinutes: z.number().nonnegative().max(10000).optional(),
    primaryUse: z.string().max(100).optional(),
    preferredOperator: z.string().max(50).optional()
  })
  .strict();

// 7. Dialect Normalize Schema
export const DialectNormalizeBodySchema = z
  .object({
    spokenText: z.string().min(1, 'Spoken text is required').max(500, 'Text cannot exceed 500 characters')
  })
  .strict();

// 8. Mandate Parser Schema
export const MandateParseBodySchema = z
  .object({
    instruction: z.string().min(1, 'Instruction is required').max(500, 'Instruction cannot exceed 500 characters')
  })
  .strict();

// 9. Payslip Audit Schema
export const PayslipAuditBodySchema = z
  .object({
    payslip: z
      .object({
        workerName: z.string().max(100).optional(),
        basicSalary: z.number().nonnegative().max(500000),
        overtimeHours: z.number().nonnegative().max(500).optional(),
        houseRent: z.number().nonnegative().max(100000).optional(),
        medicalAllowance: z.number().nonnegative().max(50000).optional(),
        transportAllowance: z.number().nonnegative().max(50000).optional(),
        grossSalary: z.number().nonnegative().max(1000000).optional(),
        deductions: z.number().nonnegative().max(500000).optional(),
        netSalary: z.number().nonnegative().max(1000000).optional(),
        factoryType: z.string().max(100).optional()
      })
      .strict()
  })
  .strict();

// 10. Multi-Turn Chat Schema
export const MultiTurnChatBodySchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(['user', 'model', 'assistant']),
            text: z.string().min(1).max(2000)
          })
          .strict()
      )
      .min(1, 'At least one message is required')
      .max(50, 'Max 50 messages allowed'),
    model: z.string().max(50).optional(),
    systemInstruction: z.string().max(1000).optional()
  })
  .strict();

// 11. Simple Chat Schema
export const SimpleChatBodySchema = z
  .object({
    question: z.string().min(1, 'Question is required').max(500),
    userContext: z
      .object({
        balance: z.number().optional()
      })
      .strict()
      .optional()
  })
  .strict();

// 12. Categorize Schema
export const CategorizeBodySchema = z
  .object({
    note: z.string().max(300).optional(),
    recipientName: z.string().max(100).optional(),
    type: z.string().max(50).optional()
  })
  .strict();

// 13. Analyst Queue Action Schema
export const AnalystQueueActionBodySchema = z
  .object({
    queueId: z.string().min(1).max(64),
    action: z.enum(['dismiss', 'escalate', 'review']),
    notes: z.string().max(500).optional()
  })
  .strict();

// 14. Safety Feedback Schema
export const SafetyFeedbackBodySchema = z
  .object({
    transactionId: z.string().min(1).max(64),
    feedback: z.enum(['helpful', 'unhelpful']).optional(),
    isScam: z.boolean().optional()
  })
  .strict();

// 15. Somiti AI Payout Order Schema
export const SomitiPayoutOrderBodySchema = z
  .object({
    somitiName: z.string().max(100).optional(),
    members: z
      .array(
        z
          .object({
            id: z.string().max(64),
            name: z.string().max(100),
            missedPayments: z.number().optional(),
            emergencyScore: z.number().optional(),
            joinedDate: z.string().optional()
          })
          .strict()
      )
      .min(1)
      .max(100),
    monthlyContribution: z.number().positive().max(100000).optional(),
    totalCycles: z.number().positive().max(100).optional()
  })
  .strict();

// 16. Somiti Early Warning Schema
export const SomitiEarlyWarningBodySchema = z
  .object({
    memberName: z.string().max(100).optional(),
    somitiName: z.string().max(100).optional(),
    dueAmount: z.number().nonnegative().max(100000).optional(),
    daysRemaining: z.number().max(365).optional(),
    walletBalance: z.number().nonnegative().max(1000000).optional()
  })
  .strict();

// 17. TrustPay Seller Trust Schema
export const TrustPaySellerTrustBodySchema = z
  .object({
    sellerName: z.string().max(100).optional(),
    sellerPhone: z.string().max(20).optional(),
    fCommercePage: z.string().max(200).optional(),
    totalOrders: z.number().nonnegative().max(100000).optional(),
    successfulDeliveries: z.number().nonnegative().max(100000).optional(),
    disputeCount: z.number().nonnegative().max(1000).optional(),
    averageDeliveryDays: z.number().nonnegative().max(60).optional(),
    customerRating: z.number().nonnegative().max(5).optional(),
    accountAgeMonths: z.number().nonnegative().max(120).optional()
  })
  .strict();

// 18. Liquidity Forecast Schema
export const LiquidityForecastBodySchema = z
  .object({
    agentName: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    eFloatBalance: z.number().nonnegative().max(10000000).optional(),
    cashInHand: z.number().nonnegative().max(10000000).optional(),
    timeOfDay: z.string().max(50).optional(),
    dayOfWeek: z.string().max(50).optional(),
    recentCashOutVolume: z.number().nonnegative().max(10000000).optional(),
    recentCashInVolume: z.number().nonnegative().max(10000000).optional()
  })
  .strict();

// 19. Seed Reset Schema
export const SeedResetBodySchema = z.object({}).strict();

// 20. Server-Side PIN Verification Schema
export const VerifyPinBodySchema = z
  .object({
    pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 numeric digits'),
    phone: z.string().min(5).max(20).optional(),
    userId: z.string().max(128).optional()
  })
  .strict();

// 21. Server-Side PIN Setup / Change Schema
export const SetPinBodySchema = z
  .object({
    newPin: z.string().regex(/^\d{4,6}$/, 'New PIN must be 4 to 6 numeric digits'),
    currentPin: z.string().regex(/^\d{4,6}$/, 'Current PIN must be 4 to 6 numeric digits').optional(),
    phone: z.string().min(5).max(20).optional(),
    userId: z.string().max(128).optional()
  })
  .strict();

// 22. Admin Fraud Blocklist Addition Schema (SHA-256 governed blocklist)
export const BlocklistAddBodySchema = z
  .object({
    phone: z.string().min(5).max(20).optional(),
    phoneHash: z.string().regex(/^[a-fA-F0-9]{64}$/, 'phoneHash must be a valid 64-character SHA-256 hex digest').optional(),
    source: z.enum(['bangladesh_bank_alert', 'analyst_escalation', 'community_verified', 'mfs_federated_feed']),
    reason: z.string().max(300).optional()
  })
  .strict()
  .refine(data => Boolean(data.phone || data.phoneHash), {
    message: 'Either phone or phoneHash must be provided'
  });

