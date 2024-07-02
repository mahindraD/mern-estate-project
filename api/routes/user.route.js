import express from 'express';
import { test } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/india", test);

export default router;