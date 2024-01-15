/* eslint-disable no-undef */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { ObjectId } = require('mongoose').Types;
const helmet = require('helmet'); // Add Helmet for security headers
const rateLimit = require('express-rate-limit'); // Add rate limiting
const morgan = require('morgan'); // Add request logging
const xss = require('xss'); // Add XSS protection
const session = require('express-session'); // Add session management (if needed)
const { Schema } = mongoose;

require('dotenv').config();

const app = express();
const allowedOrigins = [
  'https://sanjay-patidar.vercel.app',
  'http://localhost:5173',
  // Add more domains if needed
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Implement rate limiting (100 requests per hour)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Set security headers with Helmet
app.use(helmet());

// Log requests
app.use(morgan('combined'));

// Enable XSS protection
app.use((req, res, next) => {
  req.body = sanitizeRequestBody(req.body);
  next();
});

// Implement session management (if needed)
// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true } // Enable secure cookies if using HTTPS
// }));

const port = process.env.PORT || 5000;
const mongoURIMyDB = process.env.MONGODB_URI_MYDB;

mongoose
  .connect(mongoURIMyDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB (mydb)');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB (mydb):', error);
  });
const UserVisitedSchema = new Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserVisited = mongoose.model('uservisited', UserVisitedSchema);

  const Feedback = mongoose.model('feedback', {
    name: String,
    email: String,
    feedback: String,
  });
  const Query = mongoose.model('query', { name: String, email: String, query: String });
  const Certification = mongoose.model('certification', { title: String, imageUrl: [String] });
  const Project = mongoose.model('project', {
    category: String,
    title: String,
    description: [String],
    additionalDetails: [String],
    // Add more fields as needed
  });
const UserDetail = mongoose.model('userdetails', {
  fullName: String,
  wantToCollaborate: Boolean,
  contactNumber: String,
});
  const UserProfile = mongoose.model('userprofiles', {
  email: String,
  username: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
  lastSignInAt: Date,
});

// Add a new endpoint to fetch all user profiles
app.get('/api/userprofiles', async (req, res) => {
  try {
    const userProfiles = await UserProfile.find();
    res.json(userProfiles);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({ error: 'Error fetching user profiles' });
  }
});

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  app.get('/api/certifications', async (req, res) => {
    try {
      const certifications = await Certification.find();
      res.json(certifications);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      res.status(500).json({ error: 'Error fetching certifications' });
    }
  });
  app.post('/api/submit-contact', async (req, res) => {
  try {
    const { fullName, wantToCollaborate, contactNumber } = req.body;

    // Save user details to the database
    const newUserDetail = new UserDetail({ fullName, wantToCollaborate, contactNumber });
    await newUserDetail.save();

    // Display admin information to the user
    const adminInfo = {
      admin: 'Sanjay Patidar',
      contactNumber: '9131743250',
      address: 'Indore, India (458220)',
    };
    res.status(201).json({ message: 'Contact submitted successfully', adminInfo });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting contact' });
  }
});

app.get('/api/userdetails', async (req, res) => {
  try {
    const userDetails = await UserDetail.find();
    res.json(userDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Error fetching user details' });
  }
});
app.get('/api/uservisited/last', async (req, res) => {
  try {
    const lastVisited = await UserVisited.findOne({}, {}, { sort: { visitedAt: -1 } });
    res.json(lastVisited); // Return JSON response
  } catch (error) {
    console.error('Error fetching last user visit:', error);
    res.status(500).json({ error: 'Error fetching last user visit' });
  }
});



app.post('/api/uservisited', async (req, res) => {
  try {
    const { location } = req.body;
    
    // Create a new UserVisited record
    const newUserVisited = new UserVisited({ location, visitedAt: new Date() });
    
    // Save the record to the database
    await newUserVisited.save();

    res.json({ message: 'User location saved successfully' }); // Return JSON response
  } catch (error) {
    console.error('Error saving user location:', error);
    res.status(500).json({ error: 'Error saving user location' });
  }
});


  app.get('/api/certifications/:title', async (req, res) => {
    try {
      const title = req.params.title;
      // Query your MongoDB collection to find the certification by title
      const certification = await Certification.findOne({ title });
      if (!certification) {
        return res.status(404).json({ error: 'Certification not found' });
      }
      // Return the certification details as JSON
      res.json(certification);
    } catch (error) {
      console.error('Error fetching certification details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  app.post('/api/authenticate', (req, res) => {
  const { password } = req.body;
  // Replace 'yourSecretPassword' with your actual password
  if (password === 'Sanjay@940660') {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});
// Fetch feedbacks and queries after successful authentication
app.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Error fetching feedbacks' });
  }
});

app.get('/api/queries', async (req, res) => {
  try {
    const queries = await Query.find();
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: 'Error fetching queries' });
  }
});

  app.get('/api/projects/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      if (category === 'all') {
        const projects = await Project.find();
        res.json(projects);
      } else {
        const projects = await Project.find({ category });
        res.json(projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Error fetching projects' });
    }
  });
  
  app.get('/api/projects/details/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      console.log('Received request for project with ID:', id); // Log the ID received
  
      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid project ID:', id); // Log invalid ID
        return res.status(400).json({ error: 'Invalid project ID' });
      }
  
      // Use findById to query the project by its ObjectId
      const project = await Project.findById(id);
  
      console.log('Project data retrieved:', project); // Log the project data retrieved
  
      if (!project) {
        console.log('Project not found'); // Log if project not found
        return res.status(404).json({ error: 'Project not found' });
      }
  
      res.json(project);
    } catch (error) {
      console.error('Error fetching project details:', error);
      res.status(500).json({ error: 'Error fetching project details' });
    }
  });
  
  
  
  
  
  
  
  
  app.post('/api/submit-feedback', async (req, res) => {
    try {
      const { name, email, feedback } = req.body;
      const newFeedback = new Feedback({ name, email, feedback });
      await newFeedback.save();
      res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error submitting feedback' });
    }
  });
  
  app.post('/api/submit-query', async (req, res) => {
    try {
      const { name, email, query } = req.body;
      const newQuery = new Query({ name, email, query });
      await newQuery.save();
      res.status(201).json({ message: 'Query submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error submitting query' });
    }
  });
  
  const blogsRouter = require('./blogs');
  app.use(blogsRouter);
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.get('/', (req, res) => {
  res.send('Welcome to My API');
});

app.listen(port, () => {
  console.log(`Server is running on :${port}`);
});

// Helper function to sanitize request body against XSS attacks
function sanitizeRequestBody(body) {
  const sanitizedBody = {};
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      sanitizedBody[key] = xss(body[key]);
    }
  }
  return sanitizedBody;
}
