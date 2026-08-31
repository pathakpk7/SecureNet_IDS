import supabase from '../config/supabaseClient.js';

// Get all traffic data
export const getTraffic = async (req, res) => {
  try {
    console.log('Fetching traffic data from Supabase...');
    
    const { data, error } = await supabase
      .from('traffic')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100); // Limit to last 100 entries for performance

    if (error) {
      console.error('Error fetching traffic:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch traffic data',
        details: error.message 
      });
    }

    console.log(`Successfully fetched ${data.length} traffic entries`);
    res.json({ traffic: data });
  } catch (err) {
    console.error('Server error in getTraffic:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};

// Add new traffic entry
export const addTraffic = async (req, res) => {
  try {
    console.log('Adding new traffic entry:', req.body);
    
    const trafficData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('traffic')
      .insert([trafficData])
      .select();

    if (error) {
      console.error('Error adding traffic:', error);
      return res.status(500).json({ 
        error: 'Failed to add traffic entry',
        details: error.message 
      });
    }

    console.log('Successfully added traffic entry:', data[0]);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error in addTraffic:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};
