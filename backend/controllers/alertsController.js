import supabase from '../config/supabaseClient.js';

// Get all alerts
export const getAlerts = async (req, res) => {
  try {
    console.log('Fetching alerts from Supabase...');
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch alerts',
        details: error.message 
      });
    }

    console.log(`Successfully fetched ${data.length} alerts`);
    res.json({ alerts: data });
  } catch (err) {
    console.error('Server error in getAlerts:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};

// Add new alert
export const addAlert = async (req, res) => {
  try {
    console.log('Adding new alert:', req.body);
    
    const alertData = {
      ...req.body,
      timestamp: new Date().toISOString(),
      dismissed: false
    };

    const { data, error } = await supabase
      .from('alerts')
      .insert([alertData])
      .select();

    if (error) {
      console.error('Error adding alert:', error);
      return res.status(500).json({ 
        error: 'Failed to add alert',
        details: error.message 
      });
    }

    console.log('Successfully added alert:', data[0]);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error in addAlert:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};
