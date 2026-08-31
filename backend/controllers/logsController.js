import supabase from '../config/supabaseClient.js';

// Get all logs
export const getLogs = async (req, res) => {
  try {
    console.log('Fetching logs from Supabase...');
    
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch logs',
        details: error.message 
      });
    }

    console.log(`Successfully fetched ${data.length} logs`);
    res.json({ logs: data });
  } catch (err) {
    console.error('Server error in getLogs:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};

// Add new log
export const addLog = async (req, res) => {
  try {
    console.log('Adding new log:', req.body);
    
    const logData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('logs')
      .insert([logData])
      .select();

    if (error) {
      console.error('Error adding log:', error);
      return res.status(500).json({ 
        error: 'Failed to add log',
        details: error.message 
      });
    }

    console.log('Successfully added log:', data[0]);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error in addLog:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};
