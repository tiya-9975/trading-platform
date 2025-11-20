import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#0ea5e9" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart;