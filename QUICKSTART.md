# 🚀 Quick Start Guide

Get Dosewise backend up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v14+ installed (`node --version`)
- ✅ MongoDB v4.4+ installed and running
- ✅ Dorra API Key (from hackathon organizers)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/dosewise
JWT_SECRET=your_super_secret_jwt_key_change_this
DORRA_API_KEY=your_dorra_api_key_here
DORRA_API_BASE_URL=https://hackathon-api.aheadafrica.org/api
NODE_ENV=development
```

### 3. Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

**Or use Docker:**
```bash
docker run -d -p 27017:27017 --name dosewise-mongo mongo:latest
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥  DOSEWISE BACKEND SERVER                            ║
║                                                           ║
║   Server running on port 4000                            ║
║   Environment: development                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 5. Test the API

Open your browser or use curl:

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Quick Test Flow

### 1. Register a Patient

```bash
curl -X POST http://localhost:4000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1990-05-15"
  }'
```

Save the `token` from the response.

### 2. Get Patient Profile

```bash
curl http://localhost:4000/api/patient/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Register a Clinic

```bash
curl -X POST http://localhost:4000/api/auth/clinic/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "dr.smith@clinic.com",
    "password": "securepass123",
    "hospital": "City Hospital"
  }'
```

### 4. Check Drug Interactions

```bash
curl -X POST http://localhost:4000/api/drugs/interactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "medications": ["Aspirin", "Warfarin"]
  }'
```

## 📚 Next Steps

1. **Read the full API documentation**: [POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md)
2. **Import Postman Collection**: Use the examples to create a Postman collection
3. **Test Dorra Integration**: Make sure your Dorra API key is valid
4. **Build your frontend**: Connect your React/Vue/Angular app to these endpoints

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Make sure MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
- Check your `MONGO_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/dosewise` instead of `localhost`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
- Change `PORT` in `.env` to a different port (e.g., 5000)
- Or kill the process using port 4000:
  ```bash
  # macOS/Linux
  lsof -ti:4000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :4000
  taskkill /PID <PID> /F
  ```

### Dorra API Errors

**Error:** `Failed to fetch from Dorra EMR`

**Solution:**
- Verify your `DORRA_API_KEY` is correct
- Check internet connection
- Ensure Dorra API is accessible: `curl https://hackathon-api.aheadafrica.org/api`

### JWT Token Errors

**Error:** `Not authorized, token failed`

**Solution:**
- Make sure you're including the token in the header: `Authorization: Bearer <token>`
- Check that `JWT_SECRET` in `.env` hasn't changed
- Token might be expired (default: 30 days) - login again

## 🎯 Production Deployment

Before deploying to production:

1. **Change JWT_SECRET** to a strong random string
2. **Set NODE_ENV=production** in your environment
3. **Use a production MongoDB instance** (MongoDB Atlas, etc.)
4. **Enable HTTPS** using a reverse proxy (nginx, Apache)
5. **Set up monitoring** and logging
6. **Configure CORS** properly for your frontend domain

## 📞 Support

For issues or questions:
- Check [POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md) for API usage
- Review [README.md](README.md) for project structure
- Check MongoDB logs: `tail -f /usr/local/var/log/mongodb/mongo.log` (macOS)

---

**Happy Coding! 🏥💊**

