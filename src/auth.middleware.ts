import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers.authorization;

    // Read the static token from an environment variable.
    const staticToken = process.env.API_STATIC_KEY;

    if (!authToken || authToken !== `Bearer ${staticToken}`) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    next();
  }
}
