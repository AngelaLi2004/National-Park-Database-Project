import express, { Request, Response } from 'express';
import speciesRouter from './src/routes/speciesRoute'; 
import userRoutes from './src/routes/userRoute';
import sightingRouter from './src/routes/sightingRoute';

const app = express();
const PORT = 3007;

app.use(express.json());

// Mount your species router
app.use('/api/species', speciesRouter);
// Mount user router
app.use('/api/users', userRoutes);
app.use('/api/sighting', sightingRouter);

// Optional: root route
app.get('/api/', (req: Request, res: Response) => {
  res.send('Homepage.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`WildTrack is running on http://localhost:${PORT}`);
});


// sightings
// add delete update
// sightings by user
// sightings by species and park (optional)