import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof Error) {
                let errorResponse: string[];

                try {
                    const parsedError = JSON.parse(error.message);

                    // Map through the error and format the message
                    errorResponse = parsedError.map((err: { message: string; path: string[] }) => {
                        if (err.message === 'Required') {
                            return `${err.path[1]} is Required`;
                        } else {
                            return `${err.message}`;
                        }
                    });
                } catch (e) {
                    errorResponse = [error.message];
                }

                res.status(400).json({ message: errorResponse });
                return;
            }

            res.status(500).json({ message: "Internal Server Error" });
        }
    };
};

export default validateRequest;
