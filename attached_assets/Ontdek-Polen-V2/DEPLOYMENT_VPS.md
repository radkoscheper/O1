# VPS/Server Deployment Guide - Ontdek Polen
*Nederlandse en Europese Server Hosting*

## Overzicht
Voor volledige controle en Nederlandse hosting kun je je Polish Travel Platform deployen op een VPS (Virtual Private Server) of dedicated server.

**Populaire Nederlandse Providers:**
- **TransIP** - €5-15/maand VPS
- **Hostnet** - €8-20/maand VPS  
- **Byte** - €6-18/maand VPS
- **Serverion** - €4-12/maand VPS
- **DigitalOcean** - €4-12/maand (Europese datacenter)

## Server Vereisten

### Minimale Specificaties
- **OS:** Ubuntu 20.04+ of Debian 11+
- **RAM:** 1GB minimum, 2GB aanbevolen
- **Storage:** 20GB SSD minimum
- **CPU:** 1 vCPU (2 vCPU voor high traffic)
- **Bandwidth:** 1TB/maand

### Software Vereisten
- **Node.js:** v18 of hoger
- **npm:** v8 of hoger  
- **Git:** Voor code deployment
- **Nginx:** Reverse proxy en SSL
- **PM2:** Process management
- **PostgreSQL client:** Database connectie

## Stap-voor-stap Deployment

### 1. Server Setup
```bash
# Connect via SSH
ssh root@jouw-server-ip

# Update systeem
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install andere dependencies
apt install -y git nginx certbot python3-certbot-nginx
npm install -g pm2

# Verificeer installaties
node --version  # v20.x
npm --version   # 10.x
nginx -v        # nginx/1.18+
```

### 2. Code Deployment
```bash
# Maak deployment directory
mkdir -p /var/www/ontdek-polen
cd /var/www/ontdek-polen

# Clone repository (via GitHub)
git clone https://github.com/jouw-username/ontdek-polen.git .

# Of upload bestanden via SCP/SFTP
# scp -r local-project/* root@server-ip:/var/www/ontdek-polen/

# Set permissions
chown -R www-data:www-data /var/www/ontdek-polen
chmod -R 755 /var/www/ontdek-polen
```

### 3. Environment Setup
```bash
# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://username:password@ep-shrill-brook-a4kt6cjb.us-east-1.aws.neon.tech:5432/neondb
NODE_ENV=production
SESSION_SECRET=een-zeer-lange-willekeurige-string-voor-productie
PORT=5000
EOF

# Secure environment file
chmod 600 .env
chown www-data:www-data .env
```

### 4. Application Build
```bash
# Install dependencies
npm install

# Build applicatie
npm run build

# Test lokaal
npm start
# Test of server draait op localhost:5000
```

### 5. Nginx Configuration
```bash
# Create Nginx config
cat > /etc/nginx/sites-available/ontdek-polen << 'EOF'
server {
    listen 80;
    server_name jouw-domein.nl www.jouw-domein.nl;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files direct serve (optioneel)
    location /images/ {
        alias /var/www/ontdek-polen/client/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/ontdek-polen /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6. SSL Certificaat (Let's Encrypt)
```bash
# Automatic SSL setup
certbot --nginx -d jouw-domein.nl -d www.jouw-domein.nl

# Auto-renewal test
certbot renew --dry-run
```

### 7. PM2 Process Management
```bash
# Start applicatie met PM2
pm2 start server/index.js --name "ontdek-polen"

# Configure startup
pm2 startup systemd
pm2 save

# Monitoring commands
pm2 status
pm2 logs ontdek-polen
pm2 restart ontdek-polen
```

## Domain Setup

### DNS Configuratie
Bij je domain provider (bijv. TransIP):
```
Type    Name    Value                TTL
A       @       jouw-server-ip      3600
A       www     jouw-server-ip      3600
```

### Domain Providers Nederland
- **TransIP** - €7/jaar .nl domain
- **Hostnet** - €8/jaar .nl domain
- **Byte** - €6/jaar .nl domain

## Database Connection
Je houdt je huidige Neon PostgreSQL database:
```bash
# Test database connectie
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => console.log('Database connected!')).catch(console.error);
"
```

## Monitoring & Logging

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Logs bekijken
pm2 logs --lines 200

# Resource usage
pm2 show ontdek-polen
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs  
tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# Disk space
df -h

# Memory usage
free -h

# CPU usage
top

# Network connections
ss -tuln
```

## Backup Strategies

### Code Backup
```bash
# Git deployment
cd /var/www/ontdek-polen
git pull origin main
npm install
npm run build
pm2 restart ontdek-polen
```

### Database Backup
```bash
# Backup Neon database (via pg_dump)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Of via Neon Console UI
```

### File Backups
```bash
# Backup uploads/images
tar -czf images_backup_$(date +%Y%m%d).tar.gz client/public/images/

# Full site backup
tar -czf site_backup_$(date +%Y%m%d).tar.gz /var/www/ontdek-polen/
```

## Troubleshooting

### Application Issues
```bash
# Check PM2 status
pm2 status

# Restart app
pm2 restart ontdek-polen

# Check app logs
pm2 logs ontdek-polen --lines 50
```

### Nginx Issues
```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Check status
systemctl status nginx
```

### SSL Issues
```bash
# Renew SSL manually
certbot renew

# Check SSL status
openssl x509 -in /etc/letsencrypt/live/jouw-domein.nl/cert.pem -text -noout
```

## Performance Optimalisatie

### Nginx Caching
```nginx
# Add to Nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Gzip Compression
```nginx
# Add to nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### PM2 Clustering
```bash
# Use multiple processes
pm2 start server/index.js --name "ontdek-polen" -i max
```

## Voordelen VPS Hosting
✅ **Volledige controle** over server environment  
✅ **Nederlandse datacenter** (snelle loading)  
✅ **Custom configuratie** mogelijk  
✅ **Root access** voor alle wijzigingen  
✅ **Geen vendor lock-in**  
✅ **Voorspelbare kosten**  
✅ **Eigen SSL certificaten**  

## Nadelen VPS Hosting
❌ **Server management** vereist technische kennis  
❌ **Beveiliging** is jouw verantwoordelijkheid  
❌ **Monitoring** moet je zelf opzetten  
❌ **Backup** management vereist  
❌ **24/7 maintenance** bij problemen  

## Kostenoverzicht Nederland

### VPS Providers
- **TransIP VPS Blade X1:** €5/maand (1GB RAM, 25GB SSD)
- **Hostnet VPS Small:** €8/maand (2GB RAM, 40GB SSD)  
- **Byte VPS-1:** €6/maand (1GB RAM, 25GB SSD)
- **DigitalOcean Basic:** €4/maand (1GB RAM, 25GB SSD, Amsterdam)

### Additional Costs
- **Domain (.nl):** €6-8/jaar
- **SSL:** Gratis (Let's Encrypt)
- **Monitoring:** €5-10/maand (optioneel)

## Aanbeveling
VPS hosting is perfect als je:
- Technische ervaring hebt met Linux/servers
- Volledige controle wilt over je hosting
- Nederlandse hosting belangrijk vindt
- Budget hebt voor server management
- Schaalbaarheid op lange termijn wilt

Voor eenvoudigere deployment: gebruik **Vercel** of **Railway**.