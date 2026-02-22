"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Property = {
  id: string;
  title: string;
  location: string;
  area: string; // e.g., "Kilimani", "Westlands", "Karen"
  price: number;
  priceType: "sale" | "rent";
  propertyType: "apartment" | "house" | "villa" | "land" | "commercial" | "townhouse";
  bedrooms?: number;
  bathrooms?: number;
  size: number; // in sq ft
  amenities: string[];
  status: "available" | "sold" | "rented" | "pending";
  listedDate: string;
  description?: string;
  images?: string[];
  agentName?: string;
  agentPhone?: string;
};

type PropertyCardProps = {
  properties?: Property[];
  property?: Property;
  searchQuery?: {
    location?: string;
    propertyType?: string;
    priceRange?: string;
  };
};

const formatPrice = (price: number, priceType: "sale" | "rent") => {
  if (price >= 100000000) {
    return `KES ${(price / 100000000).toFixed(1)}B`;
  } else if (price >= 1000000) {
    return `KES ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `KES ${(price / 1000).toFixed(0)}K`;
  }
  return `KES ${price}`;
};

const getStatusColor = (status: Property["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 border-green-200";
    case "sold":
      return "bg-red-100 text-red-800 border-red-200";
    case "rented":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPropertyTypeIcon = (type: Property["propertyType"]) => {
  switch (type) {
    case "apartment":
      return "🏢";
    case "house":
      return "🏠";
    case "villa":
      return "🏡";
    case "land":
      return "🌍";
    case "commercial":
      return "🏬";
    case "townhouse":
      return "🏘️";
    default:
      return "🏠";
  }
};

const PropertyListItem: React.FC<{ property: Property }> = ({ property }) => (
  <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{getPropertyTypeIcon(property.propertyType)}</span>
          <h4 className="font-semibold text-slate-800">{property.title}</h4>
        </div>
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.location}, {property.area}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-blue-600">
          {formatPrice(property.price, property.priceType)}
        </p>
        <p className="text-xs text-slate-400">
          {property.priceType === "rent" ? "/month" : "for sale"}
        </p>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 mb-3">
      <Badge variant="outline" className="text-xs">
        {property.propertyType}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {property.size.toLocaleString()} sq ft
      </Badge>
      {property.bedrooms && (
        <Badge variant="outline" className="text-xs">
          🛏️ {property.bedrooms} beds
        </Badge>
      )}
      {property.bathrooms && (
        <Badge variant="outline" className="text-xs">
          🚿 {property.bathrooms} baths
        </Badge>
      )}
      <Badge className={`text-xs ${getStatusColor(property.status)}`}>
        {property.status}
      </Badge>
    </div>

    {property.amenities.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-3">
        {property.amenities.slice(0, 4).map((amenity, idx) => (
          <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
            {amenity}
          </span>
        ))}
        {property.amenities.length > 4 && (
          <span className="text-xs text-slate-400">+{property.amenities.length - 4} more</span>
        )}
      </div>
    )}

    {property.agentName && (
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {property.agentName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700">{property.agentName}</p>
            <p className="text-xs text-slate-400">{property.agentPhone}</p>
          </div>
        </div>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    )}
  </div>
);

const PropertyCard: React.FC<PropertyCardProps> = ({ properties, property, searchQuery }) => {
  const displayProperties = property ? [property] : properties || [];

  if (displayProperties.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6 text-center">
          <p className="text-slate-500">No properties found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Property Listings
            </CardTitle>
            {searchQuery && (
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery.location && `📍 ${searchQuery.location}`}
                {searchQuery.propertyType && ` • 🏠 ${searchQuery.propertyType}`}
                {searchQuery.priceRange && ` • 💰 ${searchQuery.priceRange}`}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {displayProperties.length} found
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {displayProperties.map((prop) => (
          <PropertyListItem key={prop.id} property={prop} />
        ))}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
