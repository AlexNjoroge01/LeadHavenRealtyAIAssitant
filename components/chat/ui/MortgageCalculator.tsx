"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MortgageResult = {
  principal: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  currency: string;
};

type MortgageCalculatorProps = {
  result: MortgageResult;
  inputs?: {
    propertyPrice: number;
    downPaymentPercent: number;
    interestRate: number;
    loanTerm: number;
  };
};

const formatCurrency = (amount: number, currency: string = "KES") => {
  if (amount >= 100000000) {
    return `${currency} ${(amount / 100000000).toFixed(2)}B`;
  } else if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(0)}K`;
  }
  return `${currency} ${amount.toLocaleString()}`;
};

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ result, inputs }) => {
  const paymentBreakdown = [
    { label: "Principal & Interest", value: result.monthlyPayment, color: "bg-blue-500" },
  ];

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Mortgage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Input Summary */}
        {inputs && (
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-500">Property Price</p>
              <p className="font-semibold text-slate-800">{formatCurrency(inputs.propertyPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Down Payment</p>
              <p className="font-semibold text-slate-800">{inputs.downPaymentPercent}% ({formatCurrency(result.downPayment)})</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Interest Rate</p>
              <p className="font-semibold text-slate-800">{inputs.interestRate}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Loan Term</p>
              <p className="font-semibold text-slate-800">{inputs.loanTerm} years</p>
            </div>
          </div>
        )}

        {/* Monthly Payment Highlight */}
        <div className="text-center py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-4">
          <p className="text-sm text-blue-100 mb-1">Monthly Payment</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(result.monthlyPayment)}</p>
          <p className="text-xs text-blue-200 mt-1">for {result.loanTerm} years</p>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Loan Amount</span>
            <span className="font-semibold text-slate-800">{formatCurrency(result.loanAmount)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Total of {result.loanTerm * 12} Payments</span>
            <span className="font-semibold text-slate-800">{formatCurrency(result.totalPayment)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-sm text-slate-600">Total Interest Paid</span>
            <span className="font-semibold text-red-600">{formatCurrency(result.totalInterest)}</span>
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Payment Breakdown</p>
          <div className="h-4 rounded-full overflow-hidden bg-slate-100 flex">
            <div 
              className="bg-blue-500" 
              style={{ width: `${(result.loanAmount / result.totalPayment) * 100}%` }}
              title="Principal"
            />
            <div 
              className="bg-red-400" 
              style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }}
              title="Interest"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-600">Principal ({((result.loanAmount / result.totalPayment) * 100).toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span className="text-slate-600">Interest ({((result.totalInterest / result.totalPayment) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Kenya-specific Info */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>💡 Kenya Mortgage Tip:</strong> Most Kenyan banks require a minimum 10-20% down payment. 
            Current mortgage rates range from 12-18% p.a. Consider Sacco loans for potentially lower rates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageCalculator;
