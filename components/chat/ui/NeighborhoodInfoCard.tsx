"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type NeighborhoodInfo = {
  name: string;
  area: string;
  description: string;
  population: number;
  demographics: {
    incomeLevel: "low" | "lower-middle" | "middle" | "upper-middle" | "high";
    ageGroup: string;
    familyType: string;
  };
  safety: {
    rating: number; // 1-10
    crimeLevel: "low" | "moderate" | "high";
    policeStations: number;
  };
  amenities: {
    schools: number;
    hospitals: number;
    shoppingMalls: number;
    restaurants: number;
    parks: number;
    gyms: number;
  };
  transport: {
    matatuRoutes: string[];
    busStops: number;
    distanceToCBD: number; // in km
    trafficLevel: "light" | "moderate" | "heavy";
  };
  utilities: {
    waterSupply: "excellent" | "good" | "fair" | "poor";
    electricity: "excellent" | "good" | "fair" | "poor";
    internet: "excellent" | "good" | "fair" | "poor";
  };
  propertyTrends: {
    avgPrice: number;
    priceChange: number;
    demandLevel: "low" | "medium" | "high";
  };
  nearbyLandmarks: string[];
  pros: string[];
  cons: string[];
};

type NeighborhoodInfoCardProps = {
  data: NeighborhoodInfo;
};

const getRatingStars = (rating: number) => {
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <span className="text-yellow-400">
      {"★".repeat(fullStars)}
      {halfStar && "½"}
      {"☆".repeat(emptyStars)}
    </span>
  );
};

const getUtilityColor = (level: string) => {
  switch (level) {
    case "excellent":
      return "bg-green-100 text-green-800";
    case "good":
      return "bg-emerald-100 text-emerald-800";
    case "fair":
      return "bg-yellow-100 text-yellow-800";
    case "poor":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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

const NeighborhoodInfoCard: React.FC<NeighborhoodInfoCardProps> = ({ data }) => {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {data.name}, {data.area}
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">{data.description}</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Population</p>
            <p className="font-semibold text-slate-800">{(data.population / 1000).toFixed(0)}K</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">To CBD</p>
            <p className="font-semibold text-slate-800">{data.transport.distanceToCBD} km</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Safety</p>
            <p className="font-semibold text-slate-800">{getRatingStars(data.safety.rating)}</p>
          </div>
        </div>

        {/* Demographics */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-semibold text-slate-600 mb-2">Demographics</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">{data.demographics.incomeLevel} Income</Badge>
            <Badge variant="outline">{data.demographics.ageGroup}</Badge>
            <Badge variant="outline">{data.demographics.familyType}</Badge>
            <Badge className={data.safety.crimeLevel === "low" ? "bg-green-100 text-green-800" : data.safety.crimeLevel === "moderate" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
              {data.safety.crimeLevel} crime
            </Badge>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Amenities Nearby</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-lg">🏫</span>
              <div>
                <p className="text-xs text-slate-500">Schools</p>
                <p className="font-semibold text-slate-800">{data.amenities.schools}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-lg">🏥</span>
              <div>
                <p className="text-xs text-slate-500">Hospitals</p>
                <p className="font-semibold text-slate-800">{data.amenities.hospitals}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-lg">🛒</span>
              <div>
                <p className="text-xs text-slate-500">Malls</p>
                <p className="font-semibold text-slate-800">{data.amenities.shoppingMalls}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-lg">🍽️</span>
              <div>
                <p className="text-xs text-slate-500">Restaurants</p>
                <p className="font-semibold text-slate-800">{data.amenities.restaurants}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-lg">🌳</span>
              <div>
                <p className="text-xs text-slate-500">Parks</p>
                <p className="font-semibold text-slate-800">{data.amenities.parks}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-lg">💪</span>
              <div>
                <p className="text-xs text-slate-500">Gyms</p>
                <p className="font-semibold text-slate-800">{data.amenities.gyms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transport */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-semibold text-slate-600 mb-2">Transport</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline">🚐 {data.transport.busStops} Bus Stops</Badge>
            <Badge className={data.transport.trafficLevel === "light" ? "bg-green-100 text-green-800" : data.transport.trafficLevel === "moderate" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
              {data.transport.trafficLevel} traffic
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.transport.matatuRoutes.map((route, idx) => (
              <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                Route {route}
              </span>
            ))}
          </div>
        </div>

        {/* Utilities */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Utilities</p>
          <div className="flex gap-2">
            <div className="flex-1 text-center p-2 border border-slate-200 rounded">
              <p className="text-xs text-slate-500">Water</p>
              <Badge className={getUtilityColor(data.utilities.waterSupply)}>
                {data.utilities.waterSupply}
              </Badge>
            </div>
            <div className="flex-1 text-center p-2 border border-slate-200 rounded">
              <p className="text-xs text-slate-500">Power</p>
              <Badge className={getUtilityColor(data.utilities.electricity)}>
                {data.utilities.electricity}
              </Badge>
            </div>
            <div className="flex-1 text-center p-2 border border-slate-200 rounded">
              <p className="text-xs text-slate-500">Internet</p>
              <Badge className={getUtilityColor(data.utilities.internet)}>
                {data.utilities.internet}
              </Badge>
            </div>
          </div>
        </div>

        {/* Property Trends */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 mb-2">Property Trends</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Avg. Price</p>
              <p className="font-bold text-slate-800">{formatCurrency(data.propertyTrends.avgPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Price Change</p>
              <p className={`font-bold ${data.propertyTrends.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.propertyTrends.priceChange >= 0 ? '+' : ''}{data.propertyTrends.priceChange}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Demand</p>
              <Badge className={data.propertyTrends.demandLevel === "high" ? "bg-green-100 text-green-800" : data.propertyTrends.demandLevel === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                {data.propertyTrends.demandLevel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Nearby Landmarks */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Nearby Landmarks</p>
          <div className="flex flex-wrap gap-1">
            {data.nearbyLandmarks.map((landmark, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {landmark}
              </span>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-green-700 mb-2">✅ Pros</p>
            <ul className="space-y-1">
              {data.pros.map((pro, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-green-500">•</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-700 mb-2">❌ Cons</p>
            <ul className="space-y-1">
              {data.cons.map((con, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-red-500">•</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeighborhoodInfoCard;
