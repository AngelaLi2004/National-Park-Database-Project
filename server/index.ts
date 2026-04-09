import express, { Request, Response } from 'express';
import speciesRouter from './src/routes/speciesRoute'; 

const app = express();
const PORT = 3007;

app.use(express.json());

// Mount your species router
app.use('/api/species', speciesRouter);

// Optional: root route
app.get('/api/', (req: Request, res: Response) => {
  res.send('Homepage.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`WildTrack is running on http://localhost:${PORT}`);
});

// search
// species common name / scientific name filter by category and park (optional) order by asc

// login
// signup
// signin

// sightings
// add delete update
// sightings by user
// sightings by species and park (optional)