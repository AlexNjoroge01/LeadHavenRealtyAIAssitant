import { useAui, Tools, type Toolkit } from "@assistant-ui/react";
import { z } from "zod";
import WeatherCard from "../ui/WeatherCard";
import LeadCard from "../ui/LeadCard";
import PropertyCard, { type Property } from "../ui/PropertyCard";
import MortgageCalculator from "../ui/MortgageCalculator";
import MarketAnalysisCard, { type MarketData } from "../ui/MarketAnalysisCard";
import NeighborhoodInfoCard, { type NeighborhoodInfo } from "../ui/NeighborhoodInfoCard";
import LegalInfoCard, { type LegalInfo } from "../ui/LegalInfoCard";
import ValuationCard, { type PropertyValuation } from "../ui/ValuationCard";

// Define lead type
type Lead = {
  name: string;
  email: string;
  phone: string;
  leadType: "buyer" | "seller" | "investor";
  budget: string;
  urgency: "high" | "medium" | "low";
  notes: string;
};

// Define your toolkit
export const myToolkit: Toolkit = {
  // ==================== EXISTING TOOLS ====================
  
  getWeather: {
    description: "Get current weather for a location in Kenya",
    parameters: z.object({
      location: z.string().describe("City name in Kenya (e.g., Nairobi, Mombasa, Kisumu)"),
      unit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
    }),
    execute: async ({ location, unit }) => {
      const weather = await fetchWeatherAPI(location, unit);
      return weather;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching weather for {args.location}...</div>;
      return (
        <div className="weather-card">
          <h3>{args.location}</h3>
          <p>{result.temperature}° {args.unit}</p>
          <p>{result.conditions}</p>
          <WeatherCard location={result.location} temperature={result.temperature} unit={result.unit} conditions={result.conditions} /> 
        </div>
      );
    },
  },
  
  getLeads: {
    description: "Get qualified real estate leads for LeadHaven Realty in Kenya",
    parameters: z.object({
      location: z.string().describe("City or neighborhood name in Kenya"),
      leadType: z.enum(["buyer", "seller", "investor"]).default("buyer"),
      displayMode: z.enum(["table", "cards"]).default("table").describe("Display leads as table or individual cards"),
    }),
    execute: async ({ location, leadType }) => {
      const leads = await fetchLeadsAPI(location, leadType);
      return leads;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching leads for {args.location}...</div>;
      
      if (args.displayMode === "cards") {
        return (
          <div className="leads-container">
            {result.leads.map((lead: Lead, index: number) => (
              <LeadCard key={index} {...lead} />
            ))}
          </div>
        );
      }

      return (
        <LeadCard 
          leads={result.leads} 
          location={args.location} 
          leadType={args.leadType} 
        />
      );
    },
  },

  // ==================== PROPERTY SEARCH TOOLS ====================

  searchProperties: {
    description: "Search for properties for sale or rent in Kenya. Filter by location, type, price range, and other criteria.",
    parameters: z.object({
      location: z.string().describe("City, neighborhood, or area in Kenya (e.g., Kilimani, Westlands, Karen, Mombasa Road)"),
      propertyType: z.enum(["apartment", "house", "villa", "land", "commercial", "townhouse", "any"]).default("any"),
      priceRange: z.object({
        min: z.number().optional().describe("Minimum price in KES"),
        max: z.number().optional().describe("Maximum price in KES"),
      }).optional(),
      listingType: z.enum(["sale", "rent", "any"]).default("any"),
      bedrooms: z.number().min(0).max(10).optional().describe("Number of bedrooms"),
      bathrooms: z.number().min(0).max(10).optional().describe("Number of bathrooms"),
      minSize: z.number().optional().describe("Minimum size in square feet"),
      amenities: z.array(z.string()).optional().describe("Required amenities (e.g., pool, gym, parking, security)"),
      status: z.enum(["available", "pending", "any"]).default("available"),
      limit: z.number().min(1).max(20).default(5),
    }),
    execute: async ({ location, propertyType, priceRange, listingType, bedrooms, bathrooms, minSize, amenities, status, limit }) => {
      const properties = await fetchPropertiesAPI(location, propertyType, priceRange, listingType, bedrooms, bathrooms, minSize, amenities, status, limit);
      return properties;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Searching properties in {args.location}...</div>;
      return (
        <PropertyCard 
          properties={result.properties} 
          searchQuery={{
            location: args.location,
            propertyType: args.propertyType,
            priceRange: args.priceRange ? `KES ${args.priceRange.min?.toLocaleString() || '0'} - ${args.priceRange.max?.toLocaleString() || '∞'}` : undefined,
          }}
        />
      );
    },
  },

  getPropertyDetails: {
    description: "Get detailed information about a specific property by its ID",
    parameters: z.object({
      propertyId: z.string().describe("The unique identifier of the property"),
    }),
    execute: async ({ propertyId }) => {
      const property = await fetchPropertyDetailsAPI(propertyId);
      return property;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching property details...</div>;
      return <PropertyCard property={result} />;
    },
  },

  // ==================== MORTGAGE & FINANCIAL TOOLS ====================

  calculateMortgage: {
    description: "Calculate mortgage payments for a property in Kenya. Includes principal, interest, and total payment breakdown.",
    parameters: z.object({
      propertyPrice: z.number().describe("Total property price in KES"),
      downPaymentPercent: z.number().min(0).max(100).default(20).describe("Down payment as percentage (typically 10-20% in Kenya)"),
      interestRate: z.number().default(14).describe("Annual interest rate percentage (Kenya rates typically 12-18%)"),
      loanTerm: z.number().min(1).max(30).default(20).describe("Loan term in years"),
    }),
    execute: async ({ propertyPrice, downPaymentPercent, interestRate, loanTerm }) => {
      const result = calculateMortgageAPI(propertyPrice, downPaymentPercent, interestRate, loanTerm);
      return result;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Calculating mortgage...</div>;
      return (
        <MortgageCalculator 
          result={result} 
          inputs={{
            propertyPrice: args.propertyPrice,
            downPaymentPercent: args.downPaymentPercent,
            interestRate: args.interestRate,
            loanTerm: args.loanTerm,
          }}
        />
      );
    },
  },

  calculateAffordability: {
    description: "Calculate how much property a buyer can afford based on their income and financial situation",
    parameters: z.object({
      monthlyIncome: z.number().describe("Gross monthly income in KES"),
      monthlyDebts: z.number().default(0).describe("Monthly debt payments in KES"),
      downPayment: z.number().describe("Available down payment in KES"),
      interestRate: z.number().default(14).describe("Expected annual interest rate"),
      loanTerm: z.number().default(20).describe("Desired loan term in years"),
    }),
    execute: async ({ monthlyIncome, monthlyDebts, downPayment, interestRate, loanTerm }) => {
      const result = calculateAffordabilityAPI(monthlyIncome, monthlyDebts, downPayment, interestRate, loanTerm);
      return result;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Calculating affordability...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span> Affordability Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-slate-500">Maximum Property Price</p>
              <p className="text-xl font-bold text-green-600">KES {(result.maxPropertyPrice / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-500">Maximum Monthly Payment</p>
              <p className="text-xl font-bold text-blue-600">KES {result.maxMonthlyPayment.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Debt-to-Income Ratio</span>
              <span className="font-semibold">{result.debtToIncomeRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Loan Amount</span>
              <span className="font-semibold">KES {result.loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Down Payment</span>
              <span className="font-semibold">KES {args.downPayment.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Note:</strong> Kenyan banks typically require debt-to-income ratio below 40% and minimum 10-20% down payment.
          </div>
        </div>
      );
    },
  },

  // ==================== MARKET ANALYSIS TOOLS ====================

  getMarketAnalysis: {
    description: "Get real estate market analysis and trends for a specific area in Kenya",
    parameters: z.object({
      location: z.string().describe("City or neighborhood in Kenya"),
      period: z.enum(["last_month", "last_quarter", "last_year", "all_time"]).default("last_quarter"),
      propertyType: z.enum(["apartment", "house", "villa", "commercial", "land", "all"]).default("all"),
    }),
    execute: async ({ location, period, propertyType }) => {
      const analysis = await fetchMarketAnalysisAPI(location, period, propertyType);
      return analysis;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Analyzing market for {args.location}...</div>;
      return <MarketAnalysisCard data={result} />;
    },
  },

  getPriceTrends: {
    description: "Get historical price trends for properties in a specific area",
    parameters: z.object({
      location: z.string().describe("City or neighborhood in Kenya"),
      years: z.number().min(1).max(10).default(5).describe("Number of years to analyze"),
    }),
    execute: async ({ location, years }) => {
      const trends = await fetchPriceTrendsAPI(location, years);
      return trends;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching price trends for {args.location}...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span> Price Trends: {result.location}
          </h3>
          <div className="space-y-3">
            {result.trends.map((trend: { year: string; avgPrice: number; change: number }, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">{trend.year}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">KES {(trend.avgPrice / 1000000).toFixed(1)}M</span>
                  <span className={`text-sm ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.change >= 0 ? '+' : ''}{trend.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Average Annual Appreciation:</strong> {result.avgAppreciation}%
            </p>
          </div>
        </div>
      );
    },
  },

  // ==================== NEIGHBORHOOD TOOLS ====================

  getNeighborhoodInfo: {
    description: "Get detailed information about a neighborhood in Kenya including amenities, safety, transport, and property trends",
    parameters: z.object({
      neighborhood: z.string().describe("Neighborhood name (e.g., Kilimani, Westlands, Karen, Kileleshwa)"),
      area: z.string().optional().describe("Broader area or city (e.g., Nairobi, Mombasa)"),
    }),
    execute: async ({ neighborhood, area }) => {
      const info = await fetchNeighborhoodInfoAPI(neighborhood, area);
      return info;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching neighborhood information...</div>;
      return <NeighborhoodInfoCard data={result} />;
    },
  },

  compareNeighborhoods: {
    description: "Compare multiple neighborhoods in Kenya side by side",
    parameters: z.object({
      neighborhoods: z.array(z.string()).min(2).max(4).describe("List of 2-4 neighborhoods to compare"),
    }),
    execute: async ({ neighborhoods }) => {
      const comparison = await fetchNeighborhoodComparisonAPI(neighborhoods);
      return comparison;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Comparing neighborhoods...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">⚖️</span> Neighborhood Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-2">Metric</th>
                  {args.neighborhoods.map((n: string, idx: number) => (
                    <th key={idx} className="text-center p-2">{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((metric: { name: string; values: (string | number)[] }, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="p-2 font-medium text-slate-700">{metric.name}</td>
                    {metric.values.map((value, vidx) => (
                      <td key={vidx} className="text-center p-2">{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
  },

  // ==================== LEGAL & DOCUMENT TOOLS ====================

  getLegalInfo: {
    description: "Get legal information related to real estate in Kenya including buying process, taxes, title deeds, and regulations",
    parameters: z.object({
      topic: z.enum([
        "buying_process",
        "selling_process", 
        "renting_laws",
        "land_purchase",
        "property_taxes",
        "mortgage_laws",
        "title_deed_transfer",
        "stamp_duty",
        "capital_gains_tax",
        "land_rates",
        "rent_control"
      ]).describe("The legal topic to get information about"),
    }),
    execute: async ({ topic }) => {
      const info = await fetchLegalInfoAPI(topic);
      return info;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching legal information...</div>;
      return <LegalInfoCard data={result} />;
    },
  },

  getDocumentChecklist: {
    description: "Get a checklist of required documents for a real estate transaction in Kenya",
    parameters: z.object({
      transactionType: z.enum(["buying_property", "selling_property", "renting_property", "land_purchase", "mortgage_application"]),
      isForeignBuyer: z.boolean().default(false).describe("Whether the buyer is a foreign national"),
    }),
    execute: async ({ transactionType, isForeignBuyer }) => {
      const checklist = await fetchDocumentChecklistAPI(transactionType, isForeignBuyer);
      return checklist;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching document checklist...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span> Document Checklist: {result.transactionType}
          </h3>
          <div className="space-y-2">
            {result.documents.map((doc: { name: string; required: boolean; notes?: string }, idx: number) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  {doc.notes && <p className="text-xs text-slate-500">{doc.notes}</p>}
                </div>
              </div>
            ))}
          </div>
          {args.isForeignBuyer && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Foreign Buyer Note:</strong> Additional requirements may apply including consent from the Lands Commission.
            </div>
          )}
        </div>
      );
    },
  },

  // ==================== VALUATION TOOLS ====================

  getPropertyValuation: {
    description: "Get an estimated property valuation based on location, size, and features",
    parameters: z.object({
      address: z.string().describe("Property address or location"),
      propertyType: z.enum(["apartment", "house", "villa", "townhouse", "land", "commercial"]),
      size: z.number().describe("Size in square feet"),
      bedrooms: z.number().optional().describe("Number of bedrooms"),
      bathrooms: z.number().optional().describe("Number of bathrooms"),
      age: z.number().optional().describe("Age of property in years"),
      features: z.array(z.string()).optional().describe("Special features (e.g., pool, garden, parking, security)"),
      condition: z.enum(["excellent", "good", "fair", "poor"]).default("good"),
    }),
    execute: async ({ address, propertyType, size, bedrooms, bathrooms, age, features, condition }) => {
      const valuation = await fetchPropertyValuationAPI(address, propertyType, size, bedrooms, bathrooms, age, features, condition);
      return valuation;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Calculating property valuation...</div>;
      return <ValuationCard data={result} />;
    },
  },

  // ==================== INVESTMENT TOOLS ====================

  analyzeInvestment: {
    description: "Analyze a property as an investment opportunity including ROI, rental yield, and cash flow projections",
    parameters: z.object({
      purchasePrice: z.number().describe("Purchase price in KES"),
      expectedRent: z.number().describe("Expected monthly rent in KES"),
      expenses: z.object({
        managementFee: z.number().default(0).describe("Monthly property management fee"),
        maintenance: z.number().default(0).describe("Monthly maintenance costs"),
        insurance: z.number().default(0).describe("Monthly insurance cost"),
        propertyTax: z.number().default(0).describe("Annual property tax"),
      }).optional(),
      downPaymentPercent: z.number().default(20),
      interestRate: z.number().default(14),
      loanTerm: z.number().default(20),
      appreciationRate: z.number().default(5).describe("Expected annual appreciation percentage"),
      holdingPeriod: z.number().default(5).describe("Investment holding period in years"),
    }),
    execute: async ({ purchasePrice, expectedRent, expenses, downPaymentPercent, interestRate, loanTerm, appreciationRate, holdingPeriod }) => {
      const analysis = analyzeInvestmentAPI(purchasePrice, expectedRent, expenses, downPaymentPercent, interestRate, loanTerm, appreciationRate, holdingPeriod);
      return analysis;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Analyzing investment...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span> Investment Analysis
          </h3>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-xs text-slate-500">Gross Rental Yield</p>
              <p className="text-2xl font-bold text-green-600">{result.grossYield}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-slate-500">Net Rental Yield</p>
              <p className="text-2xl font-bold text-blue-600">{result.netYield}%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-xs text-slate-500">Cash on Cash Return</p>
              <p className="text-2xl font-bold text-purple-600">{result.cashOnCashReturn}%</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <p className="text-xs text-slate-500">5-Year ROI</p>
              <p className="text-2xl font-bold text-orange-600">{result.fiveYearROI}%</p>
            </div>
          </div>

          {/* Monthly Cash Flow */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 mb-2">Monthly Cash Flow</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Net Monthly Income</span>
              <span className={`text-lg font-bold ${result.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                KES {result.monthlyCashFlow.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 5-Year Projection */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">5-Year Projection</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Property Value</span>
                <span className="font-semibold">KES {(result.projectedValue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Equity Built</span>
                <span className="font-semibold">KES {(result.equityBuilt / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Rental Income</span>
                <span className="font-semibold">KES {(result.totalRentalIncome / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* Investment Rating */}
          <div className={`p-3 rounded-lg ${result.rating === 'excellent' ? 'bg-green-100' : result.rating === 'good' ? 'bg-blue-100' : result.rating === 'fair' ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <p className="text-sm font-semibold text-center">
              Investment Rating: <span className="uppercase">{result.rating}</span>
            </p>
          </div>
        </div>
      );
    },
  },

  // ==================== AGENT & CONTACT TOOLS ====================

  findAgents: {
    description: "Find real estate agents in a specific area in Kenya",
    parameters: z.object({
      location: z.string().describe("City or neighborhood"),
      specialization: z.enum(["residential", "commercial", "land", "rentals", "any"]).default("any"),
      rating: z.number().min(1).max(5).optional().describe("Minimum rating required"),
    }),
    execute: async ({ location, specialization, rating }) => {
      const agents = await fetchAgentsAPI(location, specialization, rating);
      return agents;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Finding agents in {args.location}...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">👤</span> Real Estate Agents in {args.location}
          </h3>
          <div className="space-y-3">
            {result.agents.map((agent: { name: string; company: string; specialization: string; rating: number; phone: string; email: string; listings: number }, idx: number) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-slate-800">{agent.name}</p>
                    <p className="text-xs text-slate-500">{agent.company}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span>★</span>
                    <span className="text-sm text-slate-700">{agent.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{agent.specialization}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{agent.listings} listings</span>
                </div>
                <div className="text-xs text-slate-600">
                  <p>📞 {agent.phone}</p>
                  <p>✉️ {agent.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },

  // ==================== KENYA-SPECIFIC TOOLS ====================

  getLandRates: {
    description: "Get current land rates for a specific county in Kenya",
    parameters: z.object({
      county: z.string().describe("County name (e.g., Nairobi, Mombasa, Kiambu, Nakuru)"),
    }),
    execute: async ({ county }) => {
      const rates = await fetchLandRatesAPI(county);
      return rates;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching land rates for {args.county}...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🏛️</span> Land Rates: {result.county} County
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Annual Land Rate</p>
              <p className="text-xl font-bold text-slate-800">KES {result.annualRate.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 border border-slate-200 rounded">
                <p className="text-xs text-slate-500">Payment Deadline</p>
                <p className="font-semibold text-slate-700">{result.deadline}</p>
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <p className="text-xs text-slate-500">Late Penalty</p>
                <p className="font-semibold text-red-600">{result.penalty}%</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Payment Methods:</strong> {result.paymentMethods.join(', ')}
            </div>
          </div>
        </div>
      );
    },
  },

  getStampDuty: {
    description: "Calculate stamp duty for a property transaction in Kenya",
    parameters: z.object({
      propertyValue: z.number().describe("Property value in KES"),
      location: z.enum(["nairobi", "mombasa", "other_municipality", "rural"]).describe("Property location type"),
    }),
    execute: async ({ propertyValue, location }) => {
      const duty = calculateStampDutyAPI(propertyValue, location);
      return duty;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Calculating stamp duty...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💵</span> Stamp Duty Calculation
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Property Value</p>
              <p className="text-xl font-bold text-slate-800">KES {args.propertyValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600">Stamp Duty ({result.rate}%)</p>
              <p className="text-2xl font-bold text-green-600">KES {result.amount.toLocaleString()}</p>
            </div>
            <div className="text-xs text-slate-500">
              <p>📍 Location: {args.location}</p>
              <p>📋 Rate: {result.rate}% of property value</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Note:</strong> Stamp duty is payable within 30 days of the sale agreement. Late payment attracts a penalty of 5% per month.
            </div>
          </div>
        </div>
      );
    },
  },

  checkTitleStatus: {
    description: "Check the status and validity of a title deed in Kenya",
    parameters: z.object({
      titleNumber: z.string().describe("Title deed number"),
    }),
    execute: async ({ titleNumber }) => {
      const status = await checkTitleStatusAPI(titleNumber);
      return status;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Checking title status...</div>;
      return (
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📜</span> Title Status Check
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Title Number</p>
              <p className="font-semibold text-slate-800">{args.titleNumber}</p>
            </div>
            <div className={`p-3 rounded-lg ${result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm text-slate-600">Status</p>
              <p className={`text-lg font-bold ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {result.isValid ? '✓ Valid Title' : '✗ Issues Found'}
              </p>
            </div>
            {result.encumbrances && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Encumbrances</p>
                <p className="text-sm text-amber-700">{result.encumbrances}</p>
              </div>
            )}
            <div className="text-xs text-slate-500 space-y-1">
              <p>👤 Owner: {result.ownerName}</p>
              <p>📍 Location: {result.location}</p>
              <p>📐 Size: {result.size} acres</p>
              <p>📅 Last Updated: {result.lastUpdated}</p>
            </div>
          </div>
        </div>
      );
    },
  },
};

// ==================== API FUNCTIONS ====================

async function fetchWeatherAPI(location: string, unit: "celsius" | "fahrenheit") {
  const conditionsArray = ["sunny", "cloudy", "rainy", "stormy", "windy"];
  const randomCondition = conditionsArray[Math.floor(Math.random() * conditionsArray.length)];

  return {
    location: location,
    temperature: Math.floor(Math.random() * 20) + 15,
    conditions: randomCondition,
    unit: unit
  }
}

async function fetchLeadsAPI(location: string, leadType: "buyer" | "seller" | "investor") {
  const dummyLeads: Lead[] = [
    {
      name: "James Kamau",
      email: "james.kamau@email.com",
      phone: "+254 712 345 678",
      leadType: "buyer",
      budget: "KES 15M-25M",
      urgency: "high",
      notes: "Looking for 3BR in Kilimani, ready to move in 60 days"
    },
    {
      name: "Dennis Ndungu",
      email: "dennis.ndungu@email.com",
      phone: "+254 723 456 789",
      leadType: "seller",
      budget: "KES 8M-15M",
      urgency: "medium",
      notes: "Downsizing, flexible timeline, property in Westlands"
    },
    {
      name: "Annuar Ndungu",
      email: "annuar@email.com",
      phone: "+254 734 567 890",
      leadType: "investor",
      budget: "KES 50M+",
      urgency: "low",
      notes: "Multi-family portfolio expansion in Nairobi"
    },
    {
      name: "Dancan Angwenyi",
      email: "dancan.angwenyi@email.com",
      phone: "+254 745 678 901",
      leadType: "buyer",
      budget: "KES 5M-10M",
      urgency: "high",
      notes: "First-time homebuyer, pre-approved, looking in Syokimau"
    },
    {
      name: "Jennifer Williams",
      email: "j.williams@email.com",
      phone: "+254 756 789 012",
      leadType: "seller",
      budget: "KES 20M-30M",
      urgency: "high",
      notes: "Relocating abroad, needs quick sale in Karen"
    },
    {
      name: "Robert Davis",
      email: "rdavis@email.com",
      phone: "+254 767 890 123",
      leadType: "investor",
      budget: "KES 10M-20M",
      urgency: "medium",
      notes: "Looking for fix-and-flip opportunities in Eastlands"
    },
  ];

  const filteredLeads = dummyLeads.filter(lead => lead.leadType === leadType);

  return {
    location: location,
    leadType: leadType,
    leads: filteredLeads.length > 0 ? filteredLeads : dummyLeads.slice(0, 2)
  };
}

async function fetchPropertiesAPI(
  location: string,
  propertyType: string,
  priceRange: { min?: number; max?: number } | undefined,
  listingType: string,
  bedrooms: number | undefined,
  bathrooms: number | undefined,
  minSize: number | undefined,
  amenities: string[] | undefined,
  status: string,
  limit: number
): Promise<{ properties: Property[] }> {
  // Simulated property data for Kenya
  const allProperties: Property[] = [
    {
      id: "PROP001",
      title: "Modern 3BR Apartment with Garden View",
      location: "Kilimani",
      area: "Nairobi",
      price: 18500000,
      priceType: "sale",
      propertyType: "apartment",
      bedrooms: 3,
      bathrooms: 2,
      size: 1800,
      amenities: ["Parking", "Swimming Pool", "Gym", "24/7 Security", "Backup Generator"],
      status: "available",
      listedDate: "2024-01-15",
      description: "Spacious modern apartment in a secure gated community with panoramic views.",
      agentName: "Mary Wanjiku",
      agentPhone: "+254 712 345 678"
    },
    {
      id: "PROP002",
      title: "Luxury Villa in Gated Community",
      location: "Karen",
      area: "Nairobi",
      price: 65000000,
      priceType: "sale",
      propertyType: "villa",
      bedrooms: 5,
      bathrooms: 4,
      size: 5500,
      amenities: ["Private Garden", "Swimming Pool", "Staff Quarters", "Solar Heating", "Electric Fence"],
      status: "available",
      listedDate: "2024-02-01",
      description: "Stunning villa on half-acre plot with mature garden and modern finishes.",
      agentName: "John Kamau",
      agentPhone: "+254 723 456 789"
    },
    {
      id: "PROP003",
      title: "Commercial Space on Mombasa Road",
      location: "Mombasa Road",
      area: "Nairobi",
      price: 350000,
      priceType: "rent",
      propertyType: "commercial",
      size: 2500,
      amenities: ["Parking", "High Speed Internet", "Conference Room", "Reception Area"],
      status: "available",
      listedDate: "2024-01-20",
      description: "Prime commercial space ideal for corporate offices or showroom.",
      agentName: "Peter Ochieng",
      agentPhone: "+254 734 567 890"
    },
    {
      id: "PROP004",
      title: "Cozy 2BR Townhouse",
      location: "Westlands",
      area: "Nairobi",
      price: 12000000,
      priceType: "sale",
      propertyType: "townhouse",
      bedrooms: 2,
      bathrooms: 2,
      size: 1400,
      amenities: ["Parking", "Small Garden", "Security"],
      status: "available",
      listedDate: "2024-02-10",
      description: "Charming townhouse in a quiet cul-de-sac, perfect for young professionals.",
      agentName: "Sarah Njeri",
      agentPhone: "+254 745 678 901"
    },
    {
      id: "PROP005",
      title: "1/4 Acre Plot in Syokimau",
      location: "Syokimau",
      area: "Machakos",
      price: 4500000,
      priceType: "sale",
      propertyType: "land",
      size: 10890,
      amenities: ["Corner Plot", "Near Main Road", "Water & Electricity Available"],
      status: "available",
      listedDate: "2024-01-25",
      description: "Prime residential plot with ready title deed, ideal for development.",
      agentName: "Michael Mutua",
      agentPhone: "+254 756 789 012"
    },
    {
      id: "PROP006",
      title: "Executive 4BR House in Lavington",
      location: "Lavington",
      area: "Nairobi",
      price: 45000000,
      priceType: "sale",
      propertyType: "house",
      bedrooms: 4,
      bathrooms: 3,
      size: 4000,
      amenities: ["Ensuite Bedrooms", "Study", "DSQ", "Mature Garden", "Alarm System"],
      status: "available",
      listedDate: "2024-02-05",
      description: "Elegant family home in a secure neighborhood with excellent schools nearby.",
      agentName: "Elizabeth Muthoni",
      agentPhone: "+254 767 890 123"
    },
    {
      id: "PROP007",
      title: "Furnished Studio Apartment",
      location: "Kileleshwa",
      area: "Nairobi",
      price: 85000,
      priceType: "rent",
      propertyType: "apartment",
      bedrooms: 1,
      bathrooms: 1,
      size: 550,
      amenities: ["Fully Furnished", "WiFi", "Netflix", "Gym Access", "Rooftop Terrace"],
      status: "available",
      listedDate: "2024-02-15",
      description: "Modern furnished studio perfect for expats or young professionals.",
      agentName: "David Kimani",
      agentPhone: "+254 778 901 234"
    },
    {
      id: "PROP008",
      title: "Beachfront Villa in Diani",
      location: "Diani Beach",
      area: "Kwale",
      price: 85000000,
      priceType: "sale",
      propertyType: "villa",
      bedrooms: 4,
      bathrooms: 4,
      size: 4500,
      amenities: ["Direct Beach Access", "Infinity Pool", "Ocean View", "Staff Quarters", "Borehole"],
      status: "available",
      listedDate: "2024-01-30",
      description: "Luxurious beachfront property with stunning ocean views and private beach.",
      agentName: "Ahmed Hassan",
      agentPhone: "+254 789 012 345"
    }
  ];

  // Filter properties based on criteria
  let filtered = allProperties.filter(p => {
    if (location && !p.location.toLowerCase().includes(location.toLowerCase()) && 
        !p.area.toLowerCase().includes(location.toLowerCase())) return false;
    if (propertyType !== "any" && p.propertyType !== propertyType) return false;
    if (listingType !== "any" && p.priceType !== listingType) return false;
    if (bedrooms && p.bedrooms && p.bedrooms < bedrooms) return false;
    if (bathrooms && p.bathrooms && p.bathrooms < bathrooms) return false;
    if (minSize && p.size < minSize) return false;
    if (priceRange?.min && p.price < priceRange.min) return false;
    if (priceRange?.max && p.price > priceRange.max) return false;
    if (status !== "any" && p.status !== status) return false;
    return true;
  });

  return { properties: filtered.slice(0, limit) };
}

async function fetchPropertyDetailsAPI(propertyId: string): Promise<Property | null> {
  const properties = await fetchPropertiesAPI("", "any", undefined, "any", undefined, undefined, undefined, undefined, "any", 10);
  return properties.properties.find(p => p.id === propertyId) || null;
}

function calculateMortgageAPI(
  propertyPrice: number,
  downPaymentPercent: number,
  interestRate: number,
  loanTerm: number
) {
  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Monthly payment formula: M = P * [r(1+r)^n] / [(1+r)^n – 1]
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    principal: propertyPrice,
    downPayment,
    loanAmount,
    interestRate,
    loanTerm,
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    currency: "KES"
  };
}

function calculateAffordabilityAPI(
  monthlyIncome: number,
  monthlyDebts: number,
  downPayment: number,
  interestRate: number,
  loanTerm: number
) {
  // Kenyan banks typically use 40% debt-to-income ratio
  const maxDebtToIncome = 0.40;
  const maxMonthlyPayment = (monthlyIncome * maxDebtToIncome) - monthlyDebts;
  
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Reverse mortgage calculation to find max loan amount
  const maxLoanAmount = maxMonthlyPayment / 
    ((monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1));

  const maxPropertyPrice = maxLoanAmount + downPayment;
  const debtToIncomeRatio = ((monthlyDebts + maxMonthlyPayment) / monthlyIncome) * 100;

  return {
    maxPropertyPrice: Math.round(maxPropertyPrice),
    maxMonthlyPayment: Math.round(maxMonthlyPayment),
    maxLoanAmount: Math.round(maxLoanAmount),
    debtToIncomeRatio: Math.round(debtToIncomeRatio),
    loanAmount: Math.round(maxLoanAmount)
  };
}

async function fetchMarketAnalysisAPI(
  location: string,
  period: string,
  propertyType: string
): Promise<MarketData> {
  // Simulated market data
  return {
    location,
    period: period === "last_month" ? "January 2024" : period === "last_quarter" ? "Q4 2023" : "2023",
    averagePrice: 25000000,
    priceChange: 8.5,
    totalListings: 1250,
    listingsChange: 12,
    averageDaysOnMarket: 45,
    demandLevel: "high",
    supplyLevel: "medium",
    pricePerSqFt: 12500,
    rentalYield: 6.5,
    propertyTypeBreakdown: {
      apartments: 450,
      houses: 320,
      villas: 85,
      commercial: 180,
      land: 215
    },
    topNeighborhoods: [
      { name: "Kilimani", avgPrice: 28000000, trend: "up" },
      { name: "Westlands", avgPrice: 32000000, trend: "up" },
      { name: "Karen", avgPrice: 65000000, trend: "stable" },
      { name: "Lavington", avgPrice: 45000000, trend: "up" },
      { name: "Kileleshwa", avgPrice: 22000000, trend: "stable" }
    ]
  };
}

async function fetchPriceTrendsAPI(location: string, years: number) {
  const trends = [];
  let basePrice = 15000000;
  
  for (let i = years; i >= 0; i--) {
    const year = new Date().getFullYear() - i;
    const change = Math.random() * 15 - 2; // -2% to +13%
    basePrice = basePrice * (1 + change / 100);
    trends.push({
      year: year.toString(),
      avgPrice: Math.round(basePrice),
      change: Math.round(change * 10) / 10
    });
  }

  return {
    location,
    trends,
    avgAppreciation: Math.round((trends.reduce((sum, t) => sum + t.change, 0) / trends.length) * 10) / 10
  };
}

async function fetchNeighborhoodInfoAPI(neighborhood: string, area?: string): Promise<NeighborhoodInfo> {
  // Simulated neighborhood data
  const neighborhoods: Record<string, NeighborhoodInfo> = {
    "Kilimani": {
      name: "Kilimani",
      area: "Nairobi",
      description: "Upscale residential area popular with expats and young professionals. Known for modern apartments and proximity to shopping malls.",
      population: 45000,
      demographics: {
        incomeLevel: "upper-middle",
        ageGroup: "25-45",
        familyType: "Mixed (singles, young families)"
      },
      safety: {
        rating: 7,
        crimeLevel: "low",
        policeStations: 2
      },
      amenities: {
        schools: 8,
        hospitals: 4,
        shoppingMalls: 3,
        restaurants: 45,
        parks: 2,
        gyms: 12
      },
      transport: {
        matatuRoutes: ["44", "45", "46", "48"],
        busStops: 15,
        distanceToCBD: 5,
        trafficLevel: "moderate"
      },
      utilities: {
        waterSupply: "good",
        electricity: "good",
        internet: "excellent"
      },
      propertyTrends: {
        avgPrice: 28000000,
        priceChange: 12,
        demandLevel: "high"
      },
      nearbyLandmarks: ["Yaya Centre", "Prestige Plaza", "Kilimani Primary School", "Nairobi Hospital"],
      pros: ["Modern apartments", "Good security", "Close to malls", "International schools nearby"],
      cons: ["High traffic on Argwings Kodhek", "Expensive rent", "Limited parking in older buildings"]
    },
    "Westlands": {
      name: "Westlands",
      area: "Nairobi",
      description: "Vibrant commercial and residential hub with excellent nightlife, restaurants, and shopping options.",
      population: 35000,
      demographics: {
        incomeLevel: "high",
        ageGroup: "25-50",
        familyType: "Professionals and families"
      },
      safety: {
        rating: 7,
        crimeLevel: "low",
        policeStations: 3
      },
      amenities: {
        schools: 6,
        hospitals: 5,
        shoppingMalls: 4,
        restaurants: 80,
        parks: 1,
        gyms: 15
      },
      transport: {
        matatuRoutes: ["30", "32", "43", "44"],
        busStops: 20,
        distanceToCBD: 3,
        trafficLevel: "heavy"
      },
      utilities: {
        waterSupply: "good",
        electricity: "excellent",
        internet: "excellent"
      },
      propertyTrends: {
        avgPrice: 32000000,
        priceChange: 10,
        demandLevel: "high"
      },
      nearbyLandmarks: ["Sarit Centre", "Westgate Mall", "MP Shah Hospital", "University of Nairobi"],
      pros: ["Excellent nightlife", "Great restaurants", "Close to CBD", "Good infrastructure"],
      cons: ["Heavy traffic", "Noisy at night", "Expensive properties"]
    },
    "Karen": {
      name: "Karen",
      area: "Nairobi",
      description: "Affluent suburb with large properties, equestrian facilities, and a peaceful country feel.",
      population: 15000,
      demographics: {
        incomeLevel: "high",
        ageGroup: "35-65",
        familyType: "Established families"
      },
      safety: {
        rating: 9,
        crimeLevel: "low",
        policeStations: 2
      },
      amenities: {
        schools: 10,
        hospitals: 3,
        shoppingMalls: 2,
        restaurants: 25,
        parks: 3,
        gyms: 5
      },
      transport: {
        matatuRoutes: ["24", "24C"],
        busStops: 8,
        distanceToCBD: 15,
        trafficLevel: "light"
      },
      utilities: {
        waterSupply: "good",
        electricity: "good",
        internet: "good"
      },
      propertyTrends: {
        avgPrice: 65000000,
        priceChange: 8,
        demandLevel: "medium"
      },
      nearbyLandmarks: ["Karen Country Club", "Nairobi National Park", "Karen Blixen Museum", "The Hub"],
      pros: ["Large plots", "Quiet and peaceful", "Good schools", "Low crime"],
      cons: ["Far from CBD", "Limited public transport", "High property prices"]
    }
  };

  return neighborhoods[neighborhood] || {
    name: neighborhood,
    area: area || "Nairobi",
    description: `Information for ${neighborhood} is being compiled. Please contact our agents for detailed insights.`,
    population: 25000,
    demographics: {
      incomeLevel: "middle",
      ageGroup: "25-55",
      familyType: "Mixed"
    },
    safety: {
      rating: 6,
      crimeLevel: "moderate",
      policeStations: 1
    },
    amenities: {
      schools: 5,
      hospitals: 2,
      shoppingMalls: 1,
      restaurants: 20,
      parks: 1,
      gyms: 3
    },
    transport: {
      matatuRoutes: ["Various"],
      busStops: 10,
      distanceToCBD: 10,
      trafficLevel: "moderate"
    },
    utilities: {
      waterSupply: "fair",
      electricity: "good",
      internet: "good"
    },
    propertyTrends: {
      avgPrice: 15000000,
      priceChange: 5,
      demandLevel: "medium"
    },
    nearbyLandmarks: ["Local shopping centre", "Primary school", "Health centre"],
    pros: ["Affordable housing", "Growing infrastructure"],
    cons: ["Limited amenities", "Developing area"]
  };
}

async function fetchNeighborhoodComparisonAPI(neighborhoods: string[]) {
  const metrics = [
    { name: "Avg. Property Price", values: ["KES 28M", "KES 32M", "KES 65M", "KES 45M"] },
    { name: "Safety Rating", values: ["7/10", "7/10", "9/10", "8/10"] },
    { name: "Distance to CBD", values: ["5 km", "3 km", "15 km", "6 km"] },
    { name: "Schools Nearby", values: ["8", "6", "10", "7"] },
    { name: "Traffic Level", values: ["Moderate", "Heavy", "Light", "Moderate"] },
    { name: "Rental Yield", values: ["6.5%", "5.8%", "4.2%", "5.5%"] },
  ];

  return { neighborhoods, metrics };
}

async function fetchLegalInfoAPI(topic: string): Promise<LegalInfo> {
  const legalInfo: Record<string, LegalInfo> = {
    "buying_process": {
      topic: "Property Buying Process in Kenya",
      category: "buying",
      summary: "A comprehensive guide to purchasing property in Kenya, from search to title transfer.",
      details: [
        "Conduct a search at the Lands Registry to verify ownership and any encumbrances",
        "Obtain rates clearance certificate from the local county government",
        "Sign a sale agreement prepared by a lawyer (usually within 30 days)",
        "Pay stamp duty (4% of property value in Nairobi, 2% in rural areas)",
        "Apply for consent to transfer from the Lands Commission (if leasehold)",
        "Register the transfer at the Lands Registry",
        "Obtain a new title deed in your name"
      ],
      requirements: [
        "Valid Kenyan ID or passport (for foreigners)",
        "KRA PIN certificate",
        "Passport photos",
        "Proof of funds or mortgage pre-approval",
        "Legal representation (advocate)"
      ],
      fees: [
        { name: "Stamp Duty", amount: "2-4% of property value", description: "Based on location" },
        { name: "Legal Fees", amount: "1-2% of property value", description: "Advocate's fees" },
        { name: "Valuation Fees", amount: "KES 5,000 - 50,000", description: "Based on property value" },
        { name: "Search Fees", amount: "KES 500 - 1,000", description: "Per search" },
        { name: "Registration Fees", amount: "KES 1,000 - 5,000", description: "Fixed fee" }
      ],
      timeline: "30-90 days for complete transfer",
      warnings: [
        "Always verify the title deed is genuine at the Lands Registry",
        "Ensure all land rates and rent are paid up to date",
        "Be cautious of properties with caveats or court disputes",
        "Foreigners cannot own freehold agricultural land without presidential exemption"
      ],
      helpfulLinks: [
        { title: "Lands Registry Portal", url: "https://ardhisasa.lands.go.ke" },
        { title: "Kenya Law - Land Act", url: "https://kenyalaw.org" }
      ]
    },
    "property_taxes": {
      topic: "Property Taxes in Kenya",
      category: "taxes",
      summary: "Understanding the various taxes applicable to property ownership and transactions in Kenya.",
      details: [
        "Land Rates: Annual tax paid to county government for land services",
        "Stamp Duty: One-time tax on property transfer (2-4% of value)",
        "Capital Gains Tax: 5% on gains from property sale",
        "Rental Income Tax: 10% on gross rental income",
        "Land Rent: Annual payment for leasehold properties"
      ],
      requirements: [
        "KRA PIN for tax compliance",
        "Property identification number",
        "Title deed or lease document"
      ],
      fees: [
        { name: "Land Rates", amount: "Varies by county", description: "Annual payment" },
        { name: "Stamp Duty", amount: "2-4%", description: "On transfer" },
        { name: "Capital Gains Tax", amount: "5%", description: "On profit from sale" },
        { name: "Rental Income Tax", amount: "10%", description: "Monthly on rent collected" }
      ],
      timeline: "Land rates due annually, rental tax monthly",
      warnings: [
        "Late payment of land rates attracts penalties up to 100%",
        "Unpaid land rates can result in property auction",
        "Keep all payment receipts for future transactions"
      ],
      helpfulLinks: [
        { title: "KRA iTax Portal", url: "https://itax.kra.go.ke" },
        { title: "Nairobi County Land Rates", url: "https://epayments.nairobi.go.ke" }
      ]
    },
    "title_deed_transfer": {
      topic: "Title Deed Transfer Process",
      category: "title",
      summary: "Step-by-step process for transferring property ownership in Kenya.",
      details: [
        "Obtain consent from the National Land Commission (for leasehold)",
        "Prepare and execute transfer documents",
        "Pay stamp duty at the Lands Registry",
        "Submit documents for registration",
        "Collect the new title deed after processing"
      ],
      requirements: [
        "Original title deed",
        "Sale agreement",
        "Consent to transfer (if leasehold)",
        "Rates clearance certificate",
        "Land rent clearance certificate",
        "ID copies of both parties",
        "Passport photos",
        "KRA PIN certificates"
      ],
      fees: [
        { name: "Transfer Fee", amount: "KES 1,000", description: "Fixed" },
        { name: "Registration Fee", amount: "KES 500", description: "Fixed" },
        { name: "Consent Fee", amount: "KES 1,000", description: "If leasehold" }
      ],
      timeline: "14-30 days after stamp duty payment",
      warnings: [
        "Ensure all encumbrances are cleared before transfer",
        "Verify the seller is the registered owner",
        "Check for any pending court cases on the property"
      ],
      helpfulLinks: [
        { title: "Ardhisasa Portal", url: "https://ardhisasa.lands.go.ke" }
      ]
    },
    "stamp_duty": {
      topic: "Stamp Duty in Kenya",
      category: "taxes",
      summary: "Understanding stamp duty rates and payment for property transactions.",
      details: [
        "Stamp duty is a tax on legal documents including property transfers",
        "Rate is 4% of property value in Nairobi and Mombasa municipalities",
        "Rate is 2% for other municipalities and rural areas",
        "Must be paid within 30 days of signing the sale agreement",
        "Late payment attracts a penalty of 5% per month"
      ],
      requirements: [
        "Sale agreement",
        "Property valuation report",
        "KRA PIN",
        "Payment via KRA iTax system"
      ],
      fees: [
        { name: "Nairobi/Mombasa", amount: "4%", description: "Of property value" },
        { name: "Other Municipalities", amount: "2%", description: "Of property value" },
        { name: "Rural Areas", amount: "2%", description: "Of property value" },
        { name: "Late Penalty", amount: "5% per month", description: "On unpaid duty" }
      ],
      timeline: "Within 30 days of sale agreement",
      warnings: [
        "Undervaluing property to reduce duty is illegal",
        "KRA may conduct independent valuation",
        "Keep payment receipt for registration"
      ],
      helpfulLinks: [
        { title: "KRA Stamp Duty Guide", url: "https://kra.go.ke" }
      ]
    }
  };

  return legalInfo[topic] || {
    topic: topic.replace(/_/g, " ").toUpperCase(),
    category: "buying",
    summary: "Information about this topic is being compiled. Please consult with our legal team.",
    details: ["Contact our legal department for detailed information on this topic."],
    requirements: ["Valid identification", "Property documents"],
    fees: [{ name: "Consultation", amount: "Contact us", description: "For detailed advice" }],
    timeline: "Varies by case",
    warnings: ["Always seek professional legal advice for property matters"],
    helpfulLinks: []
  };
}

async function fetchDocumentChecklistAPI(transactionType: string, isForeignBuyer: boolean) {
  const checklists: Record<string, { transactionType: string; documents: { name: string; required: boolean; notes?: string }[] }> = {
    "buying_property": {
      transactionType: "Buying Property",
      documents: [
        { name: "Valid Kenyan ID / Passport", required: true, notes: "Original and copy" },
        { name: "KRA PIN Certificate", required: true },
        { name: "Passport Photos", required: true, notes: "4 recent photos" },
        { name: "Proof of Funds / Mortgage Pre-approval", required: true },
        { name: "Sale Agreement", required: true, notes: "Prepared by advocate" },
        { name: "Title Deed (Seller's)", required: true, notes: "For verification" },
        { name: "Land Rates Clearance", required: true },
        { name: "Land Rent Clearance", required: true, notes: "If leasehold" },
        { name: "Consent to Transfer", required: false, notes: "If leasehold property" },
        { name: "Spousal Consent", required: false, notes: "If married" },
        { name: "Search Certificate", required: true },
        ...(isForeignBuyer ? [
          { name: "Foreign National Registration", required: true, notes: "Alien ID or work permit" },
          { name: "Lands Commission Consent", required: true, notes: "For foreign ownership" }
        ] : [])
      ]
    },
    "mortgage_application": {
      transactionType: "Mortgage Application",
      documents: [
        { name: "ID / Passport", required: true },
        { name: "KRA PIN Certificate", required: true },
        { name: "Passport Photos", required: true, notes: "4 photos" },
        { name: "6 Months Bank Statements", required: true },
        { name: "3 Months Pay Slips", required: true, notes: "If employed" },
        { name: "Employment Letter", required: true, notes: "If employed" },
        { name: "Business Registration Certificate", required: false, notes: "If self-employed" },
        { name: "Audited Accounts (2 years)", required: false, notes: "If self-employed" },
        { name: "Sale Agreement", required: true },
        { name: "Title Deed", required: true },
        { name: "Property Valuation Report", required: true },
        { name: "CRB Clearance Certificate", required: true }
      ]
    }
  };

  return checklists[transactionType] || checklists["buying_property"];
}

async function fetchPropertyValuationAPI(
  address: string,
  propertyType: string,
  size: number,
  bedrooms?: number,
  bathrooms?: number,
  age?: number,
  features?: string[],
  condition?: string
): Promise<PropertyValuation> {
  // Simulated valuation calculation
  const basePricePerSqFt = {
    "apartment": 12000,
    "house": 15000,
    "villa": 20000,
    "townhouse": 13000,
    "land": 5000,
    "commercial": 18000
  };

  const locationMultiplier = address.toLowerCase().includes("karen") ? 1.5 :
    address.toLowerCase().includes("westlands") ? 1.3 :
    address.toLowerCase().includes("kilimani") ? 1.2 :
    address.toLowerCase().includes("lavington") ? 1.25 : 1.0;

  const conditionMultiplier = condition === "excellent" ? 1.1 :
    condition === "good" ? 1.0 :
    condition === "fair" ? 0.85 : 0.7;

  const baseValue = size * (basePricePerSqFt[propertyType as keyof typeof basePricePerSqFt] || 10000);
  const estimatedValue = Math.round(baseValue * locationMultiplier * conditionMultiplier);

  return {
    propertyAddress: address,
    valuationType: "sale",
    estimatedValue,
    valueRange: {
      low: Math.round(estimatedValue * 0.9),
      high: Math.round(estimatedValue * 1.1)
    },
    confidence: "medium",
    lastUpdated: new Date().toISOString().split('T')[0],
    factors: [
      { factor: "Location", impact: locationMultiplier > 1 ? "positive" as const : "neutral" as const, description: `Prime ${address} location` },
      { factor: "Property Size", impact: "positive" as const, description: `${size.toLocaleString()} sq ft of living space` },
      { factor: "Condition", impact: condition === "excellent" || condition === "good" ? "positive" as const : condition === "fair" ? "neutral" as const : "negative" as const, description: `Property in ${condition} condition` },
      ...(bedrooms ? [{ factor: "Bedrooms", impact: (bedrooms >= 3 ? "positive" : "neutral") as "positive" | "neutral", description: `${bedrooms} bedrooms` }] : []),
      ...(features?.length ? [{ factor: "Special Features", impact: "positive" as const, description: features.join(", ") }] : [])
    ],
    comparables: [
      { address: `${address} - Similar Property A`, price: Math.round(estimatedValue * 0.95), size: Math.round(size * 0.9), pricePerSqFt: Math.round(estimatedValue * 0.95 / size), soldDate: "Jan 2024" },
      { address: `${address} - Similar Property B`, price: Math.round(estimatedValue * 1.05), size: Math.round(size * 1.1), pricePerSqFt: Math.round(estimatedValue * 1.05 / (size * 1.1)), soldDate: "Dec 2023" },
      { address: `${address} - Similar Property C`, price: estimatedValue, size: size, pricePerSqFt: Math.round(estimatedValue / size), soldDate: "Nov 2023" }
    ],
    recommendations: [
      "Consider getting a professional valuation for accurate pricing",
      "Compare with recent sales in the area",
      "Factor in any needed repairs or renovations"
    ]
  };
}

function analyzeInvestmentAPI(
  purchasePrice: number,
  expectedRent: number,
  expenses?: { managementFee?: number; maintenance?: number; insurance?: number; propertyTax?: number },
  downPaymentPercent?: number,
  interestRate?: number,
  loanTerm?: number,
  appreciationRate?: number,
  holdingPeriod?: number
) {
  const annualRent = expectedRent * 12;
  const grossYield = (annualRent / purchasePrice) * 100;

  const monthlyExpenses = (expenses?.managementFee || 0) + 
    (expenses?.maintenance || 0) + 
    (expenses?.insurance || 0) + 
    ((expenses?.propertyTax || 0) / 12);

  const netAnnualIncome = annualRent - (monthlyExpenses * 12);
  const netYield = (netAnnualIncome / purchasePrice) * 100;

  // Calculate mortgage if applicable
  const downPayment = purchasePrice * ((downPaymentPercent || 20) / 100);
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = (interestRate || 14) / 100 / 12;
  const numberOfPayments = (loanTerm || 20) * 12;
  const monthlyMortgage = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const monthlyCashFlow = expectedRent - monthlyExpenses - monthlyMortgage;
  const cashOnCashReturn = ((monthlyCashFlow * 12) / downPayment) * 100;

  // 5-year projections
  const projectedValue = purchasePrice * Math.pow(1 + (appreciationRate || 5) / 100, holdingPeriod || 5);
  const totalRentalIncome = (monthlyCashFlow * 12) * (holdingPeriod || 5);
  const principalPaid = loanAmount * (1 - Math.pow(1 + monthlyRate, -((loanTerm || 20) - (holdingPeriod || 5)) * 12) / Math.pow(1 + monthlyRate, -numberOfPayments));
  const equityBuilt = projectedValue - (loanAmount - principalPaid);

  const fiveYearROI = ((totalRentalIncome + equityBuilt - downPayment) / downPayment) * 100;

  const rating = cashOnCashReturn > 15 && netYield > 6 ? "excellent" :
    cashOnCashReturn > 10 && netYield > 4 ? "good" :
    cashOnCashReturn > 5 && netYield > 2 ? "fair" : "poor";

  return {
    grossYield: Math.round(grossYield * 10) / 10,
    netYield: Math.round(netYield * 10) / 10,
    cashOnCashReturn: Math.round(cashOnCashReturn * 10) / 10,
    fiveYearROI: Math.round(fiveYearROI * 10) / 10,
    monthlyCashFlow: Math.round(monthlyCashFlow),
    projectedValue: Math.round(projectedValue),
    equityBuilt: Math.round(equityBuilt),
    totalRentalIncome: Math.round(totalRentalIncome),
    rating
  };
}

async function fetchAgentsAPI(location: string, specialization: string, rating?: number) {
  const agents = [
    { name: "Mary Wanjiku", company: "HassConsult", specialization: "Residential", rating: 4.8, phone: "+254 712 345 678", email: "mary@hassconsult.co.ke", listings: 45 },
    { name: "John Kamau", company: "Knight Frank Kenya", specialization: "Luxury", rating: 4.9, phone: "+254 723 456 789", email: "john@knightfrank.co.ke", listings: 32 },
    { name: "Peter Ochieng", company: "Cytonn Real Estate", specialization: "Commercial", rating: 4.6, phone: "+254 734 567 890", email: "peter@cytonn.com", listings: 28 },
    { name: "Sarah Njeri", company: "BuyRentKenya", specialization: "Residential", rating: 4.7, phone: "+254 745 678 901", email: "sarah@buyrentkenya.com", listings: 56 },
    { name: "Michael Mutua", company: "Property24 Kenya", specialization: "Land", rating: 4.5, phone: "+254 756 789 012", email: "michael@property24.co.ke", listings: 38 }
  ];

  return { location, agents: rating ? agents.filter(a => a.rating >= rating) : agents };
}

async function fetchLandRatesAPI(county: string) {
  return {
    county,
    annualRate: 15000,
    deadline: "December 31st",
    penalty: 5,
    paymentMethods: ["M-Pesa", "Bank Transfer", "County Portal", "In-Person"]
  };
}

function calculateStampDutyAPI(propertyValue: number, location: string) {
  const rates: Record<string, number> = {
    "nairobi": 4,
    "mombasa": 4,
    "other_municipality": 2,
    "rural": 2
  };

  const rate = rates[location] || 2;
  return {
    propertyValue,
    rate,
    amount: Math.round(propertyValue * rate / 100),
    location
  };
}

async function checkTitleStatusAPI(titleNumber: string) {
  // Simulated title check
  return {
    titleNumber,
    isValid: true,
    ownerName: "Registered Owner",
    location: "Nairobi",
    size: "0.25",
    lastUpdated: "2024-01-15",
    encumbrances: null
  };
}
