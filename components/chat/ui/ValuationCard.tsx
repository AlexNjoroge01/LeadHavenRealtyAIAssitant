"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type PropertyValuation = {
  propertyAddress: string;
  valuationType: "sale" | "rental";
  estimatedValue: number;
  valueRange: {
    low: number;
    high: number;
  };
  confidence: "high" | "medium" | "low";
  lastUpdated: string;
  factors: {
    factor: string;
    impact: "positive" | "negative" | "neutral";
    description: string;
  }[];
  comparables: {
    address: string;
    price: number;
    size: number;
    pricePerSqFt: number;
    soldDate: string;
  }[];
  priceHistory?: {
    date: string;
    price: number;
    event: string;
  }[];
  recommendations: string[];
};

type ValuationCardProps = {
  data: PropertyValuation;
};

const formatCurrency = (amount: number) => {
  if (amount >= 100000000) {
    return `KES ${(amount / 100000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `KES ${(amount / 1000).toFixed(0)}K`;
  }
  return `KES ${amount.toLocaleString()}`;
};

const getConfidenceColor = (confidence: PropertyValuation["confidence"]) => {
  switch (confidence) {
    case "high":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-red-100 text-red-800";
  }
};

const getImpactIcon = (impact: "positive" | "negative" | "neutral") => {
  switch (impact) {
    case "positive":
      return <span className="text-green-500">↑</span>;
    case "negative":
      return <span className="text-red-500">↓</span>;
    case "neutral":
      return <span className="text-slate-400">→</span>;
  }
};

const ValuationCard: React.FC<ValuationCardProps> = ({ data }) => {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Property Valuation
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{data.valuationType}</Badge>
            <Badge className={getConfidenceColor(data.confidence)}>
              {data.confidence} confidence
            </Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1">{data.propertyAddress}</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Estimated Value */}
        <div className="text-center py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-4">
          <p className="text-sm text-blue-100 mb-1">Estimated {data.valuationType === "sale" ? "Market Value" : "Monthly Rent"}</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(data.estimatedValue)}</p>
          <p className="text-xs text-blue-200 mt-1">
            Range: {formatCurrency(data.valueRange.low)} - {formatCurrency(data.valueRange.high)}
          </p>
        </div>

        {/* Value Factors */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Value Factors</p>
          <div className="space-y-2">
            {data.factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <div className="mt-0.5">{getImpactIcon(factor.impact)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{factor.factor}</p>
                  <p className="text-xs text-slate-500">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparable Properties */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Comparable Properties</p>
          <div className="space-y-2">
            {data.comparables.map((comp, idx) => (
              <div key={idx} className="p-2 border border-slate-200 rounded">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-slate-700">{comp.address}</p>
                  <p className="text-sm font-semibold text-blue-600">{formatCurrency(comp.price)}</p>
                </div>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span>{comp.size.toLocaleString()} sq ft</span>
                  <span>•</span>
                  <span>{formatCurrency(comp.pricePerSqFt)}/sq ft</span>
                  <span>•</span>
                  <span>{comp.soldDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price History */}
        {data.priceHistory && data.priceHistory.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">Price History</p>
            <div className="space-y-1">
              {data.priceHistory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded text-sm">
                  <div>
                    <span className="text-slate-600">{item.date}</span>
                    <span className="text-slate-400 ml-2">({item.event})</span>
                  </div>
                  <span className="font-semibold text-slate-800">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-800 mb-2">💡 Recommendations</p>
          <ul className="space-y-1">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-amber-700 flex items-start gap-2">
                <span>•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">
          Last updated: {data.lastUpdated}
        </p>
      </CardContent>
    </Card>
  );
};

export default ValuationCard;
