import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByUsername, createUser } from '../services/database';


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';



router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Please provide both username and password' });
        }
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username is already taken' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserId = await createUser(username, hashedPassword);

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUserId
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});


router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user.UserID, username: user.Username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.UserID,
                username: user.Username
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    try {
        res.status(200).json({ 
            message: 'Logged out successfully. Please clear your local storage.' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during logout' });
    }
});

export default router;