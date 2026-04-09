import express, { Request, Response } from 'express';
import speciesRouter from './src/routes/speciesRoute'; 
import userRoutes from './src/routes/userRoute';
import sightingRouter from './src/routes/sightingRoute';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use(cors());
app.use(express.json());

app.use('/api/species', speciesRouter);
app.use('/api/users', userRoutes);
app.use('/api/sighting', sightingRouter);


app.get('/api/', (req: Request, res: Response) => {
  res.send('Homepage.');
});

app.listen(PORT, () => {
  console.log(`WildTrack is running on http://localhost:${PORT}`);
});
