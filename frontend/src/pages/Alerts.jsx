import { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { alertsAPI, stocksAPI } from '../services/api';
import { wsService } from '../services/websocket';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]); // Store triggered alerts for display
  const [formData, setFormData] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above'
  });
  
  // Use ref to always have latest alerts in WebSocket callback
  const alertsRef = useRef([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  useEffect(() => {
    loadData();
    
    // Request notification permission immediately
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
    
    // Connect to WebSocket for real-time price updates
    wsService.connect();
    wsService.addListener(handlePriceUpdate);
    
    return () => {
      wsService.removeListener(handlePriceUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [alertsRes, stocksRes] = await Promise.all([
        alertsAPI.get(),
        stocksAPI.getAll()
      ]);
      setAlerts(alertsRes.data);
      setStocks(stocksRes.data);
      
      // Initialize current prices
      const prices = {};
      stocksRes.data.forEach(stock => {
        prices[stock.symbol] = stock.price;
      });
      setCurrentPrices(prices);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure sound (pleasant notification tone)
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (alert, currentPrice) => {
    console.log('🔔 Attempting to show notification...', {
      available: 'Notification' in window,
      permission: Notification.permission,
      alert,
      currentPrice
    });

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification('🔔 Price Alert Triggered!', {
            body: `${alert.symbol} is now ${alert.condition === 'above' ? 'above' : 'below'} ${alert.targetPrice}. Current price: ${currentPrice.toFixed(2)}`,
            icon: '/favicon.ico',
            tag: alert._id,
            requireInteraction: true,
            silent: false
          });
          
          console.log('✅ Notification object created:', notification);
          
          notification.onshow = () => {
            console.log('✅ Notification displayed on screen');
          };
          
          notification.onerror = (error) => {
            console.error('❌ Notification error:', error);
          };
          
          notification.onclick = () => {
            console.log('Notification clicked');
            window.focus();
            notification.close();
          };
          
          notification.onclose = () => {
            console.log('Notification closed');
          };
        } catch (error) {
          console.error('❌ Failed to create notification:', error);
        }
      } else if (Notification.permission === 'default') {
        console.log('⚠️ Permission is default, requesting...');
        Notification.requestPermission().then(permission => {
          console.log('Permission response:', permission);
          if (permission === 'granted') {
            showBrowserNotification(alert, currentPrice);
          }
        });
      } else {
        console.error('❌ Notification permission denied');
        alert('Please enable notifications in your browser settings for this site!');
      }
    } else {
      console.error('❌ Notifications not supported in this browser');
    }
  };

  const handlePriceUpdate = (data) => {
    if (data.type === 'price_update' && data.data) {
      setCurrentPrices(prev => {
        const updated = { ...prev, ...data.data };
        
        // USE REF to get latest alerts!
        const currentAlerts = alertsRef.current;
        
        console.log('📊 Price update received:', updated);
        console.log('📋 Current alerts:', currentAlerts);
        console.log('🔢 Number of active alerts:', currentAlerts.filter(a => a.isActive && !a.triggered).length);
        
        // Check alerts using the ref
        currentAlerts.forEach(alert => {
          if (!alert.isActive || alert.triggered) {
            console.log(`⏭️ Skipping ${alert.symbol}: ${!alert.isActive ? 'inactive' : 'triggered'}`);
            return;
          }
          
          // FIX: Handle both formats - direct price or nested in object
          const priceData = updated[alert.symbol];
          const currentPrice = typeof priceData === 'number' 
            ? priceData 
            : priceData?.price;
          
          if (!currentPrice) {
            console.log(`❌ No price found for ${alert.symbol}`);
            return;
          }
          
          console.log(`🔍 Checking alert for ${alert.symbol}:`, {
            currentPrice,
            targetPrice: alert.targetPrice,
            condition: alert.condition,
            shouldTrigger: (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
                          (alert.condition === 'below' && currentPrice <= alert.targetPrice)
          });
          
          const shouldTrigger = 
            (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
            (alert.condition === 'below' && currentPrice <= alert.targetPrice);
          
          if (shouldTrigger) {
            console.log(`🔔 ALERT TRIGGERED for ${alert.symbol}!`);
            
            // Add to triggered alerts for display
            const alertNotification = {
              id: Date.now(),
              symbol: alert.symbol,
              name: alert.name,
              targetPrice: alert.targetPrice,
              currentPrice: currentPrice,
              condition: alert.condition,
              timestamp: new Date()
            };
            
            console.log('📢 Adding alert notification to display:', alertNotification);
            
            setTriggeredAlerts(prev => {
              const updated = [...prev, alertNotification];
              console.log('📢 Triggered alerts state:', updated);
              return updated;
            });
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
              setTriggeredAlerts(prev => prev.filter(a => a.id !== alertNotification.id));
            }, 10000);
            
            // Play sound
            playNotificationSound();
            
            // Show browser notification
            showBrowserNotification(alert, currentPrice);
            
            // Mark as triggered
            handleAlertTriggered(alert._id);
          }
        });
        
        return updated;
      });
    }
  };

  const handleAlertTriggered = async (alertId) => {
    try {
      await alertsAPI.update(alertId, { isActive: false });
      setAlerts(prev => prev.map(a => 
        a._id === alertId ? { ...a, triggered: true, isActive: false } : a
      ));
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    
    const stock = stocks.find(s => s.symbol === formData.symbol);
    if (!stock) return;

    try {
      await alertsAPI.create({
        symbol: formData.symbol,
        name: stock.name,
        targetPrice: parseFloat(formData.targetPrice),
        condition: formData.condition
      });
      
      setShowModal(false);
      setFormData({ symbol: '', targetPrice: '', condition: 'above' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertsAPI.delete(id);
      setAlerts(alerts.filter(a => a._id !== id));
    } catch (error) {
      alert('Failed to delete alert');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await alertsAPI.update(id, { isActive: !isActive });
      setAlerts(alerts.map(a => a._id === id ? { ...a, isActive: !isActive } : a));
    } catch (error) {
      alert('Failed to update alert');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Triggered Alerts Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {triggeredAlerts.map((alertNotif) => (
          <div
            key={alertNotif.id}
            className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-700 animate-bounce"
            style={{ animation: 'bounce 1s ease-in-out 3' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="animate-pulse" size={24} />
                  <h3 className="font-bold text-lg">🔔 Price Alert Triggered!</h3>
                </div>
                <p className="text-sm mb-1">
                  <strong>{alertNotif.symbol}</strong> {alertNotif.name}
                </p>
                <p className="text-sm">
                  Went {alertNotif.condition} <strong>${alertNotif.targetPrice}</strong>
                </p>
                <p className="text-sm font-bold mt-1">
                  Current Price: ${alertNotif.currentPrice.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setTriggeredAlerts(prev => prev.filter(a => a.id !== alertNotif.id))}
                className="text-white hover:text-red-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Price Alerts</h1>

        <div className="flex gap-2">
          <button
            onClick={() => {
              // Test red box display
              const testAlert = {
                id: Date.now(),
                symbol: 'TEST',
                name: 'Test Alert',
                targetPrice: 100,
                currentPrice: 105,
                condition: 'above',
                timestamp: new Date()
              };
              console.log('🧪 Testing red box with:', testAlert);
              setTriggeredAlerts(prev => [...prev, testAlert]);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📦 Test Box
          </button>
          <button
            onClick={() => {
              console.log('🧪 Testing notification...');
              console.log('Permission:', Notification.permission);
              playNotificationSound();
              if (Notification.permission === 'granted') {
                new Notification('🧪 Test Alert', {
                  body: 'If you see this, notifications are working!',
                  requireInteraction: true
                });
                console.log('✅ Test notification sent');
              } else {
                console.log('❌ Notification permission not granted');
                Notification.requestPermission().then(p => console.log('New permission:', p));
              }
            }}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🧪 Test
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create Alert
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Bell size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Alerts Set</h2>
          <p className="text-gray-600 mb-6">Get notified when stocks reach your target price</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => {
            // FIX: Handle both price formats when displaying
            const priceData = currentPrices[alert.symbol];
            const displayPrice = typeof priceData === 'number' 
              ? priceData 
              : priceData?.price;

            return (
              <div key={alert._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{alert.symbol}</h3>
                    <p className="text-sm text-gray-500">{alert.name}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {alert.condition === 'above' ? (
                    <TrendingUp size={20} className="text-green-600" />
                  ) : (
                    <TrendingDown size={20} className="text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    Alert when price goes {alert.condition}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500">Target Price</p>
                  <p className="text-2xl font-bold text-gray-900">${alert.targetPrice}</p>
                  {displayPrice && (
                    <p className="text-xs text-gray-600 mt-1">
                      Current: ${displayPrice.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.triggered 
                      ? 'bg-yellow-100 text-yellow-800'
                      : alert.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.triggered ? 'Triggered' : alert.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <button
                    onClick={() => handleToggleActive(alert._id, alert.isActive)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {alert.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Alert Modal */}
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-6">Create Price Alert</h2>
      

            
                <form onSubmit={handleCreateAlert} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stock
          </label>
          <select
            required
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-100"
          >
            <option value="" className="text-gray-100">Select a stock</option>
            {stocks.map(stock => (
              <option key={stock.symbol} value={stock.symbol} className="text-gray-100">
                {stock.symbol} - {stock.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Condition
          </label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-100"
          >
            <option value="above" className="text-gray-100">Price goes above</option>
            <option value="below" className="text-gray-100">Price goes below</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.targetPrice}
            onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-100"
            placeholder="0.00"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="flex-1 px-4 py-3 border-2 border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            ✓ Create Alert
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default Alerts;