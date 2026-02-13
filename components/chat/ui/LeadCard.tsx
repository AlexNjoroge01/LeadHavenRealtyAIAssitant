import { RiUser3Fill, RiMailFill, RiPhoneFill, RiPriceTag3Fill, RiTimeFill, RiFileTextFill } from '@remixicon/react';

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "high":
      return "bg-red-100 text-red-700 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getLeadTypeIcon = (leadType: string) => {
  switch (leadType) {
    case "buyer":
      return <RiUser3Fill className="text-blue-500 w-10 h-10" />;
    case "seller":
      return <RiPriceTag3Fill className="text-green-500 w-10 h-10" />;
    case "investor":
      return <RiFileTextFill className="text-purple-500 w-10 h-10" />;
    default:
      return <RiUser3Fill className="text-blue-500 w-10 h-10" />;
  }
};

// Single Lead Card Component
const SingleLeadCard = ({ 
  name, 
  email, 
  phone, 
  leadType, 
  budget, 
  urgency, 
  notes 
}: { 
  name: string; 
  email: string; 
  phone: string; 
  leadType: string; 
  budget: string; 
  urgency: string; 
  notes: string;
}) => {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 border-2 border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getLeadTypeIcon(leadType)}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500 capitalize">{leadType}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(urgency)}`}>
          {urgency.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <RiMailFill className="w-5 h-5 text-gray-400" />
          <span className="text-sm">{email}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <RiPhoneFill className="w-5 h-5 text-gray-400" />
          <span className="text-sm">{phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <RiPriceTag3Fill className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">{budget}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-600 italic">{notes}</p>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium">
          Contact
        </button>
        <button className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

// Table View Component
const LeadsTable = ({ 
  leads, 
  location, 
  leadType 
}: { 
  leads: Array<{
    name: string;
    email: string;
    phone: string;
    leadType: string;
    budget: string;
    urgency: string;
    notes: string;
  }>;
  location: string;
  leadType: string;
}) => {
  return (
    <div className="leads-table-container max-w-6xl mx-auto">
      <div className="mb-4">
        <h3 className="text-2xl font-bold">Leads in {location}</h3>
        <p className="text-gray-600">Type: <span className="capitalize font-semibold">{leadType}</span> | Total: {leads.length}</p>
      </div>
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{lead.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="capitalize px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {lead.leadType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {lead.budget}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    lead.urgency === 'high' ? 'bg-red-100 text-red-800' :
                    lead.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {lead.urgency.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  <div className="truncate">{lead.notes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">Contact</button>
                  <button className="text-gray-600 hover:text-gray-800 font-medium">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main LeadCard component that handles both cases
const LeadCard = (props: any) => {
  // If it's an array of leads (table view)
  if (props.leads && Array.isArray(props.leads)) {
    return <LeadsTable leads={props.leads} location={props.location} leadType={props.leadType} />;
  }
  
  // If it's a single lead (card view)
  return <SingleLeadCard {...props} />;
};

export default LeadCard;