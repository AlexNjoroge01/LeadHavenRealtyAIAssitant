import { useAui, Tools, type Toolkit } from "@assistant-ui/react";
import { z } from "zod";
import WeatherCard from "../ui/WeatherCard";
import LeadCard from "../ui/LeadCard";

// Define your toolkit
export const myToolkit: Toolkit = {
  getWeather: {
    description: "Get current weather for a location",
    parameters: z.object({
      location: z.string().describe("City name or zip code"),
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
    description: "Get qualified real estate leads for LeadHaven Realty",
    parameters: z.object({
      location: z.string().describe("City or neighborhood name"),
      leadType: z.enum(["buyer", "seller", "investor"]).default("buyer"),
      displayMode: z.enum(["table", "cards"]).default("table").describe("Display leads as table or individual cards"),
    }),
    execute: async ({ location, leadType }) => {
      const leads = await fetchLeadsAPI(location, leadType);
      return leads;
    },
    render: ({ args, result }) => {
      if (!result) return <div>Fetching leads for {args.location}...</div>;
      
      // For individual cards
      if (args.displayMode === "cards") {
        return (
          <div className="leads-container">
            {result.leads.map((lead, index) => (
              <LeadCard key={index} {...lead} />
            ))}
          </div>
        );
      }

      // For table display (default)
      return (
        <LeadCard 
          leads={result.leads} 
          location={args.location} 
          leadType={args.leadType} 
        />
      );
    },
  },
};

async function fetchWeatherAPI(location: string, unit: "celsius" | "fahrenheit") {
  const conditionsArray = ["sunny", "cloudy", "rainy", "stormy", "windy", "snowy"];
  const randomCondition = conditionsArray[Math.floor(Math.random() * conditionsArray.length)];

  return {
    location: location,
    temperature: Math.floor(Math.random() * 20),
    conditions: randomCondition,
    unit: unit
  }
}

async function fetchLeadsAPI(location: string, leadType: "buyer" | "seller" | "investor") {
  const dummyLeads = [
    {
      name: "James Kamau",
      email: "james.kamau@email.com",
      phone: "(555) 123-4567",
      leadType: "buyer",
      budget: "$500k-$1M",
      urgency: "high",
      notes: "Looking for 3BR in school district, ready to move in 60 days"
    },
    {
      name: "Dennis Ndungu",
      email: "mchen@email.com",
      phone: "(555) 234-5678",
      leadType: "seller",
      budget: "$300k-$500k",
      urgency: "medium",
      notes: "Downsizing, flexible timeline"
    },
    {
      name: "Annuar Ndungu",
      email: "annuar@email.com",
      phone: "(555) 345-6789",
      leadType: "investor",
      budget: "$1M+",
      urgency: "low",
      notes: "Multi-family portfolio expansion"
    },
    {
      name: "Dancan Angwenyi",
      email: "dancan.angwenyi@email.com",
      phone: "(555) 456-7890",
      leadType: "buyer",
      budget: "Under $300k",
      urgency: "high",
      notes: "First-time homebuyer, pre-approved"
    },
    {
      name: "Jennifer Williams",
      email: "j.williams@email.com",
      phone: "(555) 567-8901",
      leadType: "seller",
      budget: "$500k-$1M",
      urgency: "high",
      notes: "Relocating for job, needs quick sale"
    },
    {
      name: "Robert Davis",
      email: "rdavis@email.com",
      phone: "(555) 678-9012",
      leadType: "investor",
      budget: "$300k-$500k",
      urgency: "medium",
      notes: "Looking for fix-and-flip opportunities"
    },
  ];

  // Filter by leadType
  const filteredLeads = dummyLeads.filter(lead => lead.leadType === leadType);

  return {
    location: location,
    leadType: leadType,
    leads: filteredLeads.length > 0 ? filteredLeads : dummyLeads.slice(0, 2)
  };
}