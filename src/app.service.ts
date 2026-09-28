import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Money Mate API</title>
        </head>
        <body>
          <h1>Money Mate Backend</h1>
          <p>API is running successfully.</p>
        </body>
      </html>
    `;
  }
}
