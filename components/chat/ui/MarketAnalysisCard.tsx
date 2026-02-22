"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type MarketData = {
  location: string;
  period: string;
  averagePrice: number;
  priceChange: number; // percentage
  totalListings: number;
  listingsChange: number; // percentage
  averageDaysOnMarket: number;
  demandLevel: "low" | "medium" | "high" | "very high";
  supplyLevel: "low" | "medium" | "high" | "oversaturated";
  pricePerSqFt: number;
  rentalYield: number; // percentage
  propertyTypeBreakdown: {
    apartments: number;
    houses: number;
    villas: number;
    commercial: number;
    land: number;
  };
  topNeighborhoods: {
    name: string;
    avgPrice: number;
    trend: "up" | "down" | "stable";
  }[];
};

type MarketAnalysisProps = {
  data: MarketData;
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

const getDemandColor = (level: MarketData["demandLevel"]) => {
  switch (level) {
    case "very high":
      return "bg-green-100 text-green-800";
    case "high":
      return "bg-emerald-100 text-emerald-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-red-100 text-red-800";
  }
};

const getSupplyColor = (level: MarketData["supplyLevel"]) => {
  switch (level) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "oversaturated":
      return "bg-red-100 text-red-800";
  }
};

const MarketAnalysisCard: React.FC<MarketAnalysisProps> = ({ data }) => {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Market Analysis: {data.location}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {data.period}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Average Price</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(data.averagePrice)}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.priceChange >= 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{Math.abs(data.priceChange).toFixed(1)}% vs last period</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Price per Sq Ft</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(data.pricePerSqFt)}</p>
            <p className="text-xs text-slate-400 mt-1">Average across all types</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Total Listings</p>
            <p className="text-xl font-bold text-slate-800">{data.totalListings.toLocaleString()}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.listingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.listingsChange >= 0 ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{Math.abs(data.listingsChange).toFixed(1)}% change</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Days on Market</p>
            <p className="text-xl font-bold text-slate-800">{data.averageDaysOnMarket}</p>
            <p className="text-xs text-slate-400 mt-1">Average time to sell</p>
          </div>
        </div>

        {/* Demand & Supply Indicators */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 p-3 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 mb-2">Demand Level</p>
            <Badge className={getDemandColor(data.demandLevel)}>
              {data.demandLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="flex-1 p-3 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 mb-2">Supply Level</p>
            <Badge className={getSupplyColor(data.supplyLevel)}>
              {data.supplyLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="flex-1 p-3 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 mb-2">Rental Yield</p>
            <p className="text-lg font-bold text-green-600">{data.rentalYield}%</p>
          </div>
        </div>

        {/* Property Type Breakdown */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Property Type Distribution</p>
          <div className="h-6 rounded-full overflow-hidden bg-slate-100 flex">
            {Object.entries(data.propertyTypeBreakdown).map(([type, count]) => {
              const total = Object.values(data.propertyTypeBreakdown).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              const colors: Record<string, string> = {
                apartments: "bg-blue-500",
                houses: "bg-green-500",
                villas: "bg-purple-500",
                commercial: "bg-orange-500",
                land: "bg-yellow-500",
              };
              return (
                <div
                  key={type}
                  className={`${colors[type]} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${type}: ${count} (${percentage.toFixed(0)}%)`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {Object.entries(data.propertyTypeBreakdown).map(([type, count]) => {
              const colors: Record<string, string> = {
                apartments: "bg-blue-500",
                houses: "bg-green-500",
                villas: "bg-purple-500",
                commercial: "bg-orange-500",
                land: "bg-yellow-500",
              };
              return (
                <div key={type} className="flex items-center gap-1 text-xs">
                  <div className={`w-2 h-2 rounded ${colors[type]}`} />
                  <span className="text-slate-600 capitalize">{type}: {count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Neighborhoods */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Top Neighborhoods</p>
          <div className="space-y-2">
            {data.topNeighborhoods.map((neighborhood, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{neighborhood.name}</span>
                  {neighborhood.trend === "up" && (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {neighborhood.trend === "down" && (
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {neighborhood.trend === "stable" && (
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-800">{formatCurrency(neighborhood.avgPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketAnalysisCard;
