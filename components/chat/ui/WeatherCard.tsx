import { RiSunFill, RiCloudyFill, RiRainyFill, RiThunderstormsFill, RiWindyFill, RiSnowyFill } from '@remixicon/react';

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case "sunny":
      return <RiSunFill className="text-yellow-500 w-12 h-12" />;
    case "cloudy":
      return <RiCloudyFill className="text-gray-400 w-12 h-12" />;
    case "rainy":
      return <RiRainyFill className="text-blue-500 w-12 h-12" />;
    case "stormy":
      return <RiThunderstormsFill className="text-gray-700 w-12 h-12" />;
    case "windy":
      return <RiWindyFill className="text-teal-500 w-12 h-12" />;
    case "snowy":
      return <RiSnowyFill className="text-white w-12 h-12" />;
    default:
      return <RiSunFill className="text-yellow-500 w-12 h-12" />;
  }
};

const WeatherCard = ({ location, temperature, unit, conditions }: { location: string; temperature: number; unit: "celsius" | "fahrenheit"; conditions: string }) => {
  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-xl p-6 flex flex-col items-center space-y-4 border-2 border-gray-200">
      <h3 className="text-2xl font-semibold text-gray-800">{location}</h3>
      <div className="flex items-center space-x-4">
        {getWeatherIcon(conditions)}
        <p className="text-4xl font-bold text-gray-900">{temperature}° {unit === 'celsius' ? 'C' : 'F'}</p>
      </div>
      <p className="text-xl text-gray-600 capitalize">{conditions}</p>
      <div className="flex space-x-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">Details</button>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Refresh</button>
      </div>
    </div>
  );
};

export default WeatherCard;