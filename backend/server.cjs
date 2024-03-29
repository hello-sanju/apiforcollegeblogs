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
const requestIp = require('request-ip');
const Fingerprint2 = require('fingerprintjs2');
const useragent = require('express-useragent');
const mydb = mongoose.connection;

require('dotenv').config();

const app = express();
const allowedOrigins = [
  'https://sanjay-patidar.vercel.app',
    'https://eduxcel.vercel.app',

  'http://localhost:5173',
  'https://edu-back-j3mz.onrender.com/api/random-blog-titles',
    'https://edu-back-j3mz.onrender.com',

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
app.use(requestIp.mw());
app.use(useragent.express());

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

const ResumeDownloadCount = mongoose.model('resumeDownloadCount', {
  count: {
    type: Number,
    default: 0,
  },
});
const UserVisited = mongoose.model('uservisited', {
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  ip: {
    type: String,
    required: true,
  },
  fingerprint: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number],
  },
  userAgentDetails: {
    browser: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
     device: {
      type: String,
      required: true,
    },
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
});





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

  
  const Tools = mongoose.model('tools', {
    title: String,
    overview: [String],
    description: [String],
    keypoints: [String],
    imageURL: [String],
    videoURL: [String],
  });

  const Working = mongoose.model('working', {
    title: String,
    overview: [String],
    description: [String],
    keypoints: [String],
    imageURL: [String],
    videoURL: [String],
  });


  const College = mongoose.model('colleges', {
    title: String,
    overview: [String],
    description: [String],
    keypoints: [String],
    imageURL: [String],
    videoURL: [String],
  });

  const Choice = mongoose.model('choice', {
    title: String,
    overview: [String],
    description: [String],
    keypoints: [String],
    imageURL: [String],
    videoURL: [String],
  });


const ChandigarhUniversitySchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

// Define schema for CSS courses
const ChitkaraUniversitySchema = new mongoose.Schema({
  title: String,
  overview: [String],
  description: [String],
  keypoints: [String],
  imageURL: [String],
  videoURL: [String],
});

const ChandigarhUniversity = mongoose.model('chandigarh-university-articles', ChandigarhUniversitySchema);

const ChitkaraUniversity = mongoose.model('chitkara-university-articles', ChitkaraUniversitySchema);

// Export the models
module.exports = {
  ChandigarhUniversity,
  ChitkaraUniversity,
  
};



// Endpoint to get the current resume download count
app.get('/api/get-resume-click-count', async (req, res) => {
  try {
    // Fetch the download count from the database
    const countDoc = await ResumeDownloadCount.findOne({});
    const count = countDoc ? countDoc.count : 0;
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching resume download count:', error);
    res.status(500).json({ error: 'Error fetching resume download count' });
  }
});

app.get('/api/certifications', async (req, res) => {
    try {
      const certifications = await Certification.find();
      res.json(certifications);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      res.status(500).json({ error: 'Error fetching certifications' });
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
  
 //new api for talks
app.get('/api/:institute', async (req, res) => {
  const { institute } = req.params;
  try {
    let talkContent;
    // Fetch course content based on the provided vision
    switch (institute) {
      case 'chandigarh-university-articles':
        talkContent = await ChandigarhUniversity.find().lean();
        break;
      case 'chitkara-university-articles':
        talkContent = await ChitkaraUniversity.find().lean();
        break;
      default:
        // Check if the vision matches any library in the database
        const library = await mydb.collection(institute).find().toArray();
        if (library.length > 0) {
          talkContent = library;
        } else {
          return res.status(404).json({ error: 'Institute not found' });
        }
    }

    if (talkContent.length > 0) {
      return res.json(talkContent);
    } else {
      return res.status(404).json({ error: 'Institute not found' });
    }
  } catch (error) {
    console.error('Error fetching Institute content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/institute/:institute', async (req, res) => {
  try {
    const institute = req.params.institute;
    if (institute === 'all') {
      const college = await College.find();
      res.json(college);
    } else {
      const college = await College.find({ institute });
      res.json(college);
    }
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Error fetching college' });
  }
});



 app.get('/api/:collection', async (req, res) => {
    const collection = req.params.collection;
    try {
      let data;
      switch (collection) {
       
        case 'tools':
          data = await Tools.find().lean();
          break;
        case 'working':
          data = await Working.find().lean();
          break;
  
           case 'careers':
          data = await Careers.find().lean();
          break;
        case 'choice':
          data = await Choice.find().lean();
          break;
       
        default:
          return res.status(404).json({ error: 'Collection not found' });
      }
      console.log('Data fetched successfully from', collection, 'collection:', data);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching data from ${collection} collection:`, error);
      res.status(500).json({ error: `Error fetching data from ${collection} collection` });
    }
  });
  app.get('/api/blogs/:collection/:title', async (req, res) => {
    try {
      const { collection, title } = req.params;
      const decodedTitle = decodeURIComponent(title);

      // Ensure the function is declared as async
      const fetchContent = async () => {
        try {
          let content;
          // Fetch content based on the provided title and collection
          if (collection === 'careers') {
            content = await Careers.findOne({ title: decodedTitle });
          } else if (collection === 'tools') {
            content = await Tools.findOne({ title: decodedTitle });
          } else {
            content = await Working.findOne({ title: decodedTitle });
          }

          if (content) {
            const selectedContent = content.content.find(item => item.title === decodedTitle);
            return res.json(selectedContent);
          } else {
            return res.status(404).json({ error: 'Content not found' });
          }
        } catch (error) {
          console.error('Error fetching content:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };

      // Call the asynchronous function
      await fetchContent();
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Endpoint to increment the resume download count
app.post('/api/increment-resume-clicks', async (req, res) => {
  try {
    // Find the existing count document in the database
    let countDoc = await ResumeDownloadCount.findOne({});

    // If the document does not exist, create a new one
    if (!countDoc) {
      countDoc = new ResumeDownloadCount();
    }

    // Increment the count and save the document
    countDoc.count += 1;
    await countDoc.save();

    res.status(200).json({ message: 'Resume click count updated successfully', count: countDoc.count });
  } catch (error) {
    console.error('Error incrementing resume click count:', error);
    res.status(500).json({ error: 'Error incrementing resume click count' });
  }
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
      address: 'New Palasia, (Indore), India (452001)',
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


app.post('/api/store-visited-location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Extract the client's IP address
    const clientIp = req.clientIp;

    if (!clientIp) {
      return res.status(500).json({ error: 'Failed to extract IP address' });
    }

    // Generate a browser fingerprint
    const fingerprint = await generateFingerprint(req);

    // Extract additional device details from user agent
    const userAgentDetails = {
      browser: req.useragent.browser,
      version: req.useragent.version,
      os: req.useragent.os,
      platform: req.useragent.platform,
      source: req.headers['user-agent'],
            device: req.useragent.source 

    };

    // Combine fingerprint, IP, and device details
    const userDetails = {
      userId: `${clientIp}_${fingerprint}`,
      ip: clientIp,
      fingerprint,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      userAgentDetails,
    };

    // Find the last stored location for the user
    const lastVisitedLocation = await UserVisited.findOne({ userId: userDetails.userId }).sort({ visitedAt: -1 });

    // If there is a last location, calculate the distance
    if (lastVisitedLocation) {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        lastVisitedLocation.location.coordinates[1],
        lastVisitedLocation.location.coordinates[0]
      );

      // If the distance is less than 1 km, skip storing the new location
      if (distance < 1) {
        return res.status(200).json({ message: 'Location not stored (user did not move more than 1 km)' });
      }
    }

    // Save user's visited location to the database
    const newUserVisited = new UserVisited(userDetails);
    await newUserVisited.save();

    res.status(201).json({ message: 'Location stored successfully', userDetails });
  } catch (error) {
    console.error('Error storing location:', error);
    res.status(500).json({ error: 'Error storing location' });
  }
});

// Helper function to calculate distance between two sets of coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
// Helper function to generate a browser fingerprint using fingerprintjs2
function generateFingerprint(req) {
  return new Promise((resolve, reject) => {
    Fingerprint2.get({
      preprocessor: (key, value) => {
        // Exclude some information from fingerprinting
        if (key === 'userAgent') return undefined;
        return value;
      },
    }, (components) => {
      const values = components.map((component) => component.value);
      const fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
      resolve(fingerprint);
    });
  });
}



app.get('/api/uservisited', async (req, res) => {
  try {
    const userVisitedLocations = await UserVisited.find({}, { _id: 0, __v: 0 }); // Exclude _id and __v from the response
    res.json(userVisitedLocations);
  } catch (error) {
    console.error('Error fetching user visited locations:', error);
    res.status(500).json({ error: 'Error fetching user visited locations' });
  }
});

  app.post('/api/authenticate', (req, res) => {
  const { password } = req.body;
  // Replace 'yourSecretPassword' with your actual password
  if (password === 'Baba@940660') {
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
