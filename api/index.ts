import type { Request, Response } from 'express';
import app from '../server.ts';

/**
 * Vercel Serverless Function entry point.
 * Forwards incoming HTTP requests to the Express application instance.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
