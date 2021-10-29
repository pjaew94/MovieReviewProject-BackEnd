import express, { Request, Response, NextFunction } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send('Well done!');
})

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})