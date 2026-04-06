# SecureNet IDS - AI-Based Intrusion Detection System

A production-style, real-time Intrusion Detection System that combines machine learning with threat intelligence to detect network attacks and suspicious activities.

## 🚀 Features

### Core Capabilities
- **Real-time Packet Capture**: Live network traffic monitoring using PyShark/Scapy
- **Machine Learning Detection**: Trained RandomForest model for anomaly detection
- **Threat Intelligence Integration**: Multiple API sources (VirusTotal, AbuseIPDB, URLScan, OTX)
- **Risk Assessment**: Combined ML and threat intel scoring for accurate risk levels
- **Database Storage**: Supabase/PostgreSQL for logs, alerts, and statistics
- **REST API**: Complete FastAPI backend for frontend integration
- **Real-time Updates**: WebSocket support for live monitoring
- **Blacklist Management**: Dynamic IP blacklist system

### Advanced Features
- **Feature Engineering**: Sophisticated packet-to-ML-feature conversion
- **Rate Limiting**: Built-in API protection
- **Health Monitoring**: System health checks and statistics
- **Data Export**: CSV export for analysis
- **Modular Architecture**: Clean, maintainable codebase

## 📋 System Requirements

- Python 3.8+
- Administrative privileges (for packet capture)
- Network interface access
- Supabase account (for database)
- API keys for threat intelligence (optional but recommended)

## 🛠️ Installation

### 1. Clone and Setup Environment
```bash
git clone <repository-url>
cd SecureNet-IDS
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 4. Train the ML Model
```bash
# Train with synthetic data (for testing)
python train_model.py --synthetic --samples 10000

# Or train with NSL-KDD dataset
python train_model.py --data-path data/NSL-KDD/KDDTrain+.txt
```

### 5. Setup Database Tables
Create the following tables in your Supabase database:

```sql
-- Alerts table
CREATE TABLE ids_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_ip TEXT NOT NULL,
    destination_ip TEXT NOT NULL,
    protocol TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    attack_type TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    description TEXT,
    threat_intel_data JSONB,
    packet_data JSONB,
    prediction_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs table
CREATE TABLE ids_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    packet_data JSONB,
    alert_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats table
CREATE TABLE ids_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    total_packets INTEGER DEFAULT 0,
    malicious_packets INTEGER DEFAULT 0,
    normal_packets INTEGER DEFAULT 0,
    alerts_generated INTEGER DEFAULT 0,
    top_source_ips JSONB,
    top_destination_ips JSONB,
    protocol_distribution JSONB,
    attack_type_distribution JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blacklist table
CREATE TABLE ids_blacklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    added_at TIMESTAMPTZ NOT NULL,
    risk_level TEXT NOT NULL,
    source TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Running the System

### Start the Backend Server
```bash
cd backend
python main.py
```

The server will start on `http://localhost:8000`

### API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📡 API Endpoints

### Core Operations
- `POST /start-monitoring` - Start network monitoring
- `POST /stop-monitoring` - Stop network monitoring
- `GET /status` - Get current monitoring status
- `GET /health` - System health check

### Data Retrieval
- `GET /alerts` - Get alerts with filtering
- `GET /logs` - Get system logs
- `GET /stats` - Get system statistics
- `GET /blacklist` - Get IP blacklist

### Management
- `POST /blacklist` - Add IP to blacklist
- `DELETE /blacklist/{ip}` - Remove IP from blacklist
- `POST /check-ip/{ip}` - Check IP reputation
- `GET /export/alerts` - Export alerts to CSV

### Real-time
- `WebSocket /ws` - Real-time updates

## 🔧 Configuration

### Environment Variables (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Threat Intelligence API Keys
VIRUSTOTAL_API_KEY=your_virustotal_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
URLSCAN_API_KEY=your_urlscan_api_key
OTX_API_KEY=your_otx_api_key

# Application Settings
DEBUG=false
HOST=0.0.0.0
PORT=8000
NETWORK_INTERFACE=Wi-Fi

# Logging
LOG_LEVEL=INFO
LOG_FILE=ids.log
```

### Network Interface
Update `NETWORK_INTERFACE` in your `.env` file to match your system:
- Windows: `Wi-Fi`, `Ethernet`, etc.
- Linux: `eth0`, `wlan0`, etc.
- macOS: `en0`, `en1`, etc.

## 🧠 Model Training

### Using Synthetic Data (Quick Start)
```bash
python train_model.py --synthetic --samples 10000
```

### Using NSL-KDD Dataset
1. Download NSL-KDD dataset
2. Place in `data/NSL-KDD/` directory
3. Run training:
```bash
python train_model.py --data-path data/NSL-KDD/KDDTrain+.txt
```

### Model Evaluation
```bash
python train_model.py --evaluate
```

## 🎯 Usage Examples

### Start Monitoring
```bash
curl -X POST "http://localhost:8000/start-monitoring"
```

### Get Recent Alerts
```bash
curl "http://localhost:8000/alerts?limit=10&risk_level=high"
```

### Check IP Reputation
```bash
curl -X POST "http://localhost:8000/check-ip/192.168.1.1"
```

### Get System Status
```bash
curl "http://localhost:8000/status"
```

## 📊 Risk Levels

- **LOW**: Normal activity, low confidence
- **MEDIUM**: Suspicious activity, moderate confidence
- **HIGH**: Likely attack, high confidence
- **CRITICAL**: Confirmed malicious activity

## 🔍 Attack Detection

### Supported Attack Types
- **Normal**: Legitimate network traffic
- **Probe**: Network reconnaissance (port scans, etc.)
- **DoS**: Denial of Service attacks
- **U2R**: User to Root privilege escalation
- **R2L**: Remote to Local attacks

### Detection Methods
1. **Machine Learning**: Pattern recognition on packet features
2. **Threat Intelligence**: Cross-referencing with known malicious sources
3. **Behavioral Analysis**: Anomaly detection in traffic patterns

## 🛡️ Security Features

### Rate Limiting
- API endpoints protected with rate limiting
- Configurable limits per endpoint
- Protection against abuse

### Input Validation
- IP address validation
- Port number validation
- SQL injection protection
- XSS protection

### Authentication (Optional)
- API key support
- Role-based access control ready

## 📈 Monitoring & Analytics

### Real-time Statistics
- Packets processed per second
- Alert generation rate
- Protocol distribution
- Top source/destination IPs

### Historical Analysis
- Time-based alert trends
- Attack type distribution
- Geographic analysis (with threat intel)

### Export Capabilities
- CSV export for alerts and logs
- Configurable time ranges
- Filtered data export

## 🔄 WebSocket Integration

### Real-time Updates
- Live packet processing updates
- Instant alert notifications
- System status changes
- Statistics updates

### Connection Example
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};
```

## 🐛 Troubleshooting

### Common Issues

#### Packet Capture Fails
- **Cause**: Insufficient permissions
- **Solution**: Run with administrative privileges
- **Check**: Verify network interface name

#### Model Not Loading
- **Cause**: Model file missing or corrupted
- **Solution**: Train the model first
- **Command**: `python train_model.py --synthetic`

#### Database Connection Issues
- **Cause**: Incorrect Supabase configuration
- **Solution**: Verify URL and API keys
- **Check**: Network connectivity

#### Threat Intel Not Working
- **Cause**: Missing API keys or rate limits
- **Solution**: Add API keys to .env file
- **Check**: API key validity

### Debug Mode
Enable debug logging:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

## 🚀 Production Deployment

### Docker Support
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "backend/main.py"]
```

### Systemd Service
```ini
[Unit]
Description=SecureNet IDS
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/securenet-ids
ExecStart=/opt/securenet-ids/venv/bin/python backend/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📝 Logging

### Log Levels
- **INFO**: General system information
- **WARNING**: Suspicious activities
- **ERROR**: System errors
- **CRITICAL**: Critical failures

### Log Locations
- **File**: `ids.log` (configurable)
- **Console**: Real-time output
- **Database**: Stored in `ids_logs` table

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Create an issue with detailed information
4. Include system specs and error messages

## 🔮 Future Enhancements

- [ ] Web dashboard frontend
- [ ] Advanced ML models (LSTM, Autoencoders)
- [ ] Distributed deployment support
- [ ] Integration with SIEM systems
- [ ] Mobile app for alerts
- [ ] Machine learning pipeline automation
- [ ] Advanced threat hunting features
- [ ] Cloud deployment templates

---

**SecureNet IDS** - Protecting networks with AI-powered detection 🛡️
