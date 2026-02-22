"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type LegalInfo = {
  topic: string;
  category: "buying" | "selling" | "renting" | "land" | "taxes" | "mortgage" | "title";
  summary: string;
  details: string[];
  requirements: string[];
  fees: {
    name: string;
    amount: string;
    description?: string;
  }[];
  timeline: string;
  warnings: string[];
  helpfulLinks?: {
    title: string;
    url: string;
  }[];
};

type LegalInfoCardProps = {
  data: LegalInfo;
};

const getCategoryIcon = (category: LegalInfo["category"]) => {
  switch (category) {
    case "buying":
      return "🏠";
    case "selling":
      return "💰";
    case "renting":
      return "🔑";
    case "land":
      return "🌍";
    case "taxes":
      return "📊";
    case "mortgage":
      return "🏦";
    case "title":
      return "📜";
    default:
      return "📋";
  }
};

const getCategoryColor = (category: LegalInfo["category"]) => {
  switch (category) {
    case "buying":
      return "bg-blue-100 text-blue-800";
    case "selling":
      return "bg-green-100 text-green-800";
    case "renting":
      return "bg-purple-100 text-purple-800";
    case "land":
      return "bg-yellow-100 text-yellow-800";
    case "taxes":
      return "bg-red-100 text-red-800";
    case "mortgage":
      return "bg-indigo-100 text-indigo-800";
    case "title":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const LegalInfoCard: React.FC<LegalInfoCardProps> = ({ data }) => {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-xl">{getCategoryIcon(data.category)}</span>
            {data.topic}
          </CardTitle>
          <Badge className={getCategoryColor(data.category)}>
            {data.category.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2">{data.summary}</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Details */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Key Information</p>
          <ul className="space-y-2">
            {data.details.map((detail, idx) => (
              <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        {data.requirements.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-800 mb-2">📋 Requirements</p>
            <ul className="space-y-1">
              {data.requirements.map((req, idx) => (
                <li key={idx} className="text-xs text-blue-700 flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fees */}
        {data.fees.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">💰 Associated Fees</p>
            <div className="space-y-2">
              {data.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{fee.name}</p>
                    {fee.description && (
                      <p className="text-xs text-slate-500">{fee.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{fee.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-800 mb-1">⏱️ Timeline</p>
          <p className="text-sm text-green-700">{data.timeline}</p>
        </div>

        {/* Warnings */}
        {data.warnings.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-800 mb-2">⚠️ Important Warnings</p>
            <ul className="space-y-1">
              {data.warnings.map((warning, idx) => (
                <li key={idx} className="text-xs text-red-700 flex items-start gap-2">
                  <span>!</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Helpful Links */}
        {data.helpfulLinks && data.helpfulLinks.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">🔗 Helpful Resources</p>
            <div className="flex flex-wrap gap-2">
              {data.helpfulLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                >
                  {link.title} →
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LegalInfoCard;
