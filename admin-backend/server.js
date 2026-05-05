const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dns = require('dns');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ override: true });
const emailService = require('./src/services/emailService');
const emailRoutes = require('./src/routes/emailRoutes');

// Ensure uploads directory exists
// NOTE: Cloud Run filesystems are ephemeral. Static files in 'uploads' will be lost on restart.
// For persistent storage, consider Google Cloud Storage.
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Attempt to bypass local DNS filters that block SRV queries
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('🌐 NETWORK LAYER: Custom DNS Resolvers Active (8.8.8.8, 1.1.1.1)');
} catch (e) {
  console.warn('⚠️ NETWORK LAYER: Failed to set custom DNS servers. Using system default.');
}

const Contact = require('./models/Contact');
const Franchise = require('./models/Franchise');
const AppAccess = require('./models/AppAccess');
const Registration = require('./models/Registration');
const Notification = require('./models/Notification');
const Media = require('./models/Media');
const LegalContent = require('./models/LegalContent');
const AppVersion = require('./models/AppVersion');


const app = express();
const PORT = process.env.PORT || 5000;

// Trust Cloud Run / load-balancer proxy so req.protocol returns 'https' correctly
app.set('trust proxy', 1);

// Bulletproof CORS: Manually set headers to ensure they are present even during rejection
app.use((req, res, next) => {
  // We explicitly allow the Vercel origin and localhost
  const origin = req.headers.origin;
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('flyhub.info'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://flyhub-info.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});


app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Use the new email service routes
app.use('/api/mail', emailRoutes);

// ── MAIL CONFIGURATION ──
// Now handled by src/services/emailService.js


// Helper for sending alerts using the new Email Service
const sendSubmissionAlert = async (type, details) => {
  const mailOptions = {
    to: process.env.NOTIFY_EMAIL || 'flyhubapp@gmail.com',
    subject: `🚀 New ${type} Submission - ${details.name || details.fullName || 'Flyhub User'}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #e91e63;">Flyhub Lead Alert</h2>
        <p>A new <strong>${type}</strong> form was submitted on the website.</p>
        <hr/>
        <ul style="list-style: none; padding: 0;">
          ${Object.entries(details).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
        </ul>
        <hr/>
        <p style="font-size: 11px; color: #777;">View full details in the <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:5173'}">Flyhub Admin Panel</a>.</p>
      </div>
    `
  };

  try {
    await emailService.sendEmail(mailOptions);
  } catch (err) {
    console.error(`❌ Mail alert error for ${type}: ${err.message}`);
  }
};


// ── DATABASE CONNECTIVITY AND FALLBACK ──
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flyhub_admin';
let isDbConnected = false;

// Attempt initial connection
console.log(`📡 Probing Database Connectivity: ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    isDbConnected = true;
    console.log('✅ DATABASE LAYER: ONLINE (Connected to MongoDB)');
  })
  .catch(err => {
    console.error('❌ DATABASE LAYER: OFFLINE');
    console.warn('   Running in MEMORY FALLBACK MODE. Data will NOT persist after restart.');
    console.warn(`   Error: ${err.message}`);
  });

// Simple In-memory store for when MongoDB is down
const memoryStore = {
  contacts: [],
  franchise: [],
  appAccess: [],
  registration: [],
  media: [],
  legal: [],
  appVersion: []
};


// ── HEALTH MONITOR ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    db_connectivity: isDbConnected ? 'CONNECTED' : 'OFFLINE (Memory Fallback Active)',
    timestamp: new Date()
  });
});

// ── SUBMISSION HANDLERS ──

app.post('/api/contact', async (req, res) => {
  console.log('📬 NEW Contact received:', req.body.email);
  try {
    let entry;
    if (isDbConnected) {
      entry = new Contact(req.body);
      await entry.save();
      
      // Save internal notification
      const notif = new Notification({
        type: 'Contact',
        title: 'New Lead Inquiry',
        message: `${req.body.name} sent a message.`,
        link: '/contact'
      });
      await notif.save();
      
      sendSubmissionAlert('Contact Inquiry', req.body);
      emailService.sendConfirmationEmail(req.body.email, req.body.name, 'contact');
      return res.status(201).json({ success: true, data: entry });
    }
    const fakeEntry = { ...req.body, _id: Date.now().toString(), createdAt: new Date(), status: 'New' };
    memoryStore.contacts.push(fakeEntry);
    sendSubmissionAlert('Contact Inquiry (Memory)', req.body);
    res.status(201).json({ success: true, warning: 'Saved to memory only', data: fakeEntry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/franchise', async (req, res) => {
  console.log('🏢 NEW Franchise app received:', req.body.email);
  try {
    let entry;
    if (isDbConnected) {
      entry = new Franchise(req.body);
      await entry.save();
      
      // Save internal notification
      const notif = new Notification({
        type: 'Franchise',
        title: 'New Franchise Application',
        message: `${req.body.firstName} applied.`,
        link: '/franchise'
      });
      await notif.save();
      
      sendSubmissionAlert('Franchise Application', req.body);
      emailService.sendConfirmationEmail(req.body.email, `${req.body.firstName} ${req.body.lastName}`, 'franchise');
      return res.status(201).json({ success: true, data: entry });
    }
    const fakeEntry = { ...req.body, _id: Date.now().toString(), createdAt: new Date(), status: 'New' };
    memoryStore.franchise.push(fakeEntry);
    sendSubmissionAlert('Franchise App (Memory)', req.body);
    res.status(201).json({ success: true, warning: 'Saved to memory only', data: fakeEntry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/app-access', async (req, res) => {
  console.log('📲 NEW App Access request:', req.body.email);
  try {
    let entry;
    if (isDbConnected) {
      entry = new AppAccess(req.body);
      await entry.save();
      
      // Save internal notification
      const notif = new Notification({
        type: 'AppAccess',
        title: 'App Access Request',
        message: `${req.body.name} from ${req.body.companyName}`,
        link: '/request-access'
      });
      await notif.save();
      
      sendSubmissionAlert('App Access Request', req.body);
      emailService.sendConfirmationEmail(req.body.email, req.body.name, 'appAccess');
      return res.status(201).json({ success: true, data: entry });
    }
    const fakeEntry = { ...req.body, _id: Date.now().toString(), createdAt: new Date(), status: 'New' };
    memoryStore.appAccess.push(fakeEntry);
    sendSubmissionAlert('App Access (Memory)', req.body);
    res.status(201).json({ success: true, warning: 'Saved to memory only', data: fakeEntry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/registration', async (req, res) => {
  console.log(`👤 NEW ${req.body.role} Registration:`, req.body.email);
  try {
    let entry;
    if (isDbConnected) {
      entry = new Registration(req.body);
      await entry.save();
      
      // Save internal notification
      const notif = new Notification({
        type: 'Registration',
        title: 'New User Registration',
        message: `${req.body.fullName} (${req.body.role}) registered.`,
        link: '/registrations'
      });
      await notif.save();
      
      sendSubmissionAlert(`${req.body.role} Registration`, req.body);
      emailService.sendConfirmationEmail(req.body.email, req.body.fullName, 'registration', { role: req.body.role });
      return res.status(201).json({ success: true, data: entry });
    }
    const fakeEntry = { ...req.body, _id: Date.now().toString(), createdAt: new Date(), status: 'New' };
    memoryStore.registration.push(fakeEntry);
    sendSubmissionAlert(`Registration (Memory)`, req.body);
    res.status(201).json({ success: true, warning: 'Saved to memory only', data: fakeEntry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── MEDIA ASSET MANAGEMENT ──

app.post('/api/media/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  
  const host = req.get('host');
  const protocol = req.protocol;
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  const mediaData = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: fileUrl
  };

  try {
    if (isDbConnected) {
      const entry = new Media(mediaData);
      await entry.save();
      return res.status(201).json({ success: true, data: entry });
    }
    const fakeEntry = { ...mediaData, _id: Date.now().toString(), createdAt: new Date() };
    memoryStore.media.push(fakeEntry);
    res.status(201).json({ success: true, data: fakeEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/media', async (req, res) => {
  try {
    if (isDbConnected) {
      const list = await Media.find().sort({ createdAt: -1 });
      return res.json(list);
    }
    res.json([...memoryStore.media].reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/media/:id', async (req, res) => {
  try {
    let item;
    if (isDbConnected) {
      item = await Media.findByIdAndDelete(req.params.id);
    } else {
        const idx = memoryStore.media.findIndex(x => x._id === req.params.id);
        if (idx !== -1) {
            item = memoryStore.media[idx];
            memoryStore.media.splice(idx, 1);
        }
    }
    
    if (item && item.filename) {
        const fullPath = path.join(__dirname, 'uploads', item.filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    if (isDbConnected) {
      const list = await Notification.find().sort({ createdAt: -1 }).limit(10);
      return res.json(list);
    }
    res.json([]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    if (isDbConnected) {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return res.json({ success: true });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    if (isDbConnected) {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
      return res.json({ success: true });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── LEGAL CONTENT MANAGEMENT ──

app.get('/api/legal/:type', async (req, res) => {
  const { type } = req.params;
  try {
    if (isDbConnected) {
      let content = await LegalContent.findOne({ type });
      if (!content) {
        // Return blank if not found instead of error to allow first-time setup
        return res.json({ type, content: '' });
      }
      return res.json(content);
    }
    const memoryItem = memoryStore.legal.find(l => l.type === type);
    res.json(memoryItem || { type, content: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/legal/:type', async (req, res) => {
  const { type } = req.params;
  const { content } = req.body;
  try {
    if (isDbConnected) {
      const updated = await LegalContent.findOneAndUpdate(
        { type },
        { content, lastUpdated: Date.now() },
        { upsert: true, new: true }
      );
      return res.json({ success: true, data: updated });
    }
    
    let idx = memoryStore.legal.findIndex(l => l.type === type);
    const item = { type, content, lastUpdated: new Date() };
    if (idx !== -1) {
      memoryStore.legal[idx] = item;
    } else {
      memoryStore.legal.push(item);
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── APP RELEASE MANAGEMENT ──

// Publish new APK release (Firebase Storage URL)
app.post('/api/app-version/publish', async (req, res) => {
  const { version, releaseNotes, apkUrl, apkFilename, storagePath } = req.body;

  if (!version || !version.trim()) {
    return res.status(400).json({ error: 'Version is required' });
  }
  if (!apkUrl || !apkUrl.trim()) {
    return res.status(400).json({ error: 'APK download URL is required' });
  }

  const appData = {
    version: version.trim(),
    releaseNotes: (releaseNotes || '').trim(),
    apkFilename: (apkFilename || `FlyHub-v${version.trim()}.apk`).trim(),
    apkUrl: apkUrl.trim(),
    storagePath: (storagePath || '').trim(),
    isActive: true
  };

  try {
    if (isDbConnected) {
      await AppVersion.updateMany({}, { isActive: false });
      const entry = new AppVersion(appData);
      await entry.save();
      return res.status(201).json({ success: true, data: entry });
    }
    
    memoryStore.appVersion.forEach(a => a.isActive = false);
    const fakeEntry = { ...appData, _id: Date.now().toString(), createdAt: new Date() };
    memoryStore.appVersion.push(fakeEntry);
    res.status(201).json({ success: true, data: fakeEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Keep legacy upload route but return a helpful error
app.post('/api/app-version/upload', (req, res) => {
  res.status(410).json({
    error: 'File upload is no longer supported. Use POST /api/app-version/publish with a download URL instead.'
  });
});

// Get latest APK
app.get('/api/app-version/latest', async (req, res) => {
  try {
    if (isDbConnected) {
      const latest = await AppVersion.findOne({ isActive: true }).sort({ createdAt: -1 });
      if (!latest) {
        // Fallback to any version if none active
        const any = await AppVersion.findOne().sort({ createdAt: -1 });
        return res.json(any || { error: 'No APK available' });
      }
      return res.json(latest);
    }
    
    const active = memoryStore.appVersion.find(a => a.isActive) || memoryStore.appVersion[memoryStore.appVersion.length - 1];
    res.json(active || { error: 'No APK available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all APK versions
app.get('/api/app-version', async (req, res) => {
  try {
    if (isDbConnected) {
      const list = await AppVersion.find().sort({ createdAt: -1 });
      return res.json(list);
    }
    res.json([...memoryStore.appVersion].reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete APK version
app.delete('/api/app-version/:id', async (req, res) => {
  try {
    let item;
    if (isDbConnected) {
      item = await AppVersion.findByIdAndDelete(req.params.id);
    } else {
      const idx = memoryStore.appVersion.findIndex(x => x._id === req.params.id);
      if (idx !== -1) {
        item = memoryStore.appVersion[idx];
        memoryStore.appVersion.splice(idx, 1);
      }
    }
    
    if (item && item.apkFilename) {
      const fullPath = path.join(__dirname, 'uploads', item.apkFilename);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── RETRIEVAL HANDLERS ──

app.get('/api/leads', async (req, res) => {
  try {
    let c, f, a, r;
    if (isDbConnected) {
      [c, f, a, r] = await Promise.all([
        Contact.find(), Franchise.find(), AppAccess.find(), Registration.find()
      ]);
    } else {
      ({ contacts: c, franchise: f, appAccess: a, registration: r } = memoryStore);
    }

    const unified = [
      ...c.map(x => ({ ...x._doc || x, apiType: 'contact', type: 'Inquiry', name: x.name, phone: x.phone, subject: x.subject, companyName: 'Private' })),
      ...f.map(x => ({ ...x._doc || x, apiType: 'franchise', type: 'Franchise', name: `${x.firstName} ${x.lastName}`, companyName: 'Franchise App' })),
      ...a.map(x => ({ ...x._doc || x, apiType: 'app-access', type: 'App Access', name: x.name, companyName: x.companyName })),
      ...r.map(x => ({ ...x._doc || x, apiType: 'registration', type: x.role === 'buyer' ? 'Buyer Acc' : 'Seller Acc', name: x.fullName, companyName: x.company || 'Private' }))
    ];

    res.json(unified.sort((x, y) => {
      const tx = new Date(x.createdAt).getTime();
      const ty = new Date(y.createdAt).getTime();
      return ty - tx;
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const list = isDbConnected ? await Contact.find().sort({ createdAt: -1 }) : [...memoryStore.contacts].reverse();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/franchise', async (req, res) => {
  try {
    const list = isDbConnected ? await Franchise.find().sort({ createdAt: -1 }) : [...memoryStore.franchise].reverse();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/app-access', async (req, res) => {
  try {
    const list = isDbConnected ? await AppAccess.find().sort({ createdAt: -1 }) : [...memoryStore.appAccess].reverse();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin@flyhub') {
    return res.json({ success: true, token: 'flyhub-admin-token-2026' });
  }
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.get('/api/registration', async (req, res) => {
  try {
    const list = isDbConnected ? await Registration.find().sort({ createdAt: -1 }) : [...memoryStore.registration].reverse();
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CRUD OPERATIONS (EDIT & DELETE) ──

// 1. GENERIC DELETE ROUTE
app.delete('/api/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  console.log(`🗑️ Deleting ${type} record: ${id}`);

  try {
    let model;
    if (type === 'contact') model = Contact;
    else if (type === 'franchise') model = Franchise;
    else if (type === 'app-access') model = AppAccess;
    else if (type === 'registration') model = Registration;
    else return res.status(400).json({ error: 'Invalid record type' });

    if (isDbConnected) {
      const deleted = await model.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Record not found' });
      return res.json({ success: true, message: 'Record deleted from Cloud' });
    }

    // Memory Path
    const plural = type === 'app-access' ? 'appAccess' : (type === 'contact' ? 'contacts' : type);
    const initialLen = memoryStore[plural].length;
    memoryStore[plural] = memoryStore[plural].filter(x => x._id !== id);
    if (memoryStore[plural].length === initialLen) return res.status(404).json({ error: 'Record not found in memory' });

    res.json({ success: true, message: 'Record removed from memory' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GENERIC EDIT ROUTE (Status change / Details update)
app.put('/api/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  console.log(`📝 Updating ${type} record: ${id}`);

  try {
    let model;
    if (type === 'contact') model = Contact;
    else if (type === 'franchise') model = Franchise;
    else if (type === 'app-access') model = AppAccess;
    else if (type === 'registration') model = Registration;
    else return res.status(400).json({ error: 'Invalid record type' });

    if (isDbConnected) {
      const updated = await model.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Record not found' });
      return res.json({ success: true, data: updated });
    }

    // Memory Path
    const plural = type === 'app-access' ? 'appAccess' : (type === 'contact' ? 'contacts' : type);
    const idx = memoryStore[plural].findIndex(x => x._id === id);
    if (idx === -1) return res.status(404).json({ error: 'Record not found in memory' });

    memoryStore[plural][idx] = { ...memoryStore[plural][idx], ...req.body };
    res.json({ success: true, data: memoryStore[plural][idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 MISSION CONTROL CORE ACTIVE ON PORT ${PORT}`);
});
