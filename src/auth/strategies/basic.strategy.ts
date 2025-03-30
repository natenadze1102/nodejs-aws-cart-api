import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    try {
      console.log(`Attempting to validate user: ${username}`);

      // Accept any username with TEST_PASSWORD
      if (password === 'TEST_PASSWORD') {
        console.log('User validated with TEST_PASSWORD');

        // For test users, use a proper UUID
        // This is the ID of the cart that already exists in the database
        const testUserId = '0db732f6-e540-4b45-bc29-2b1652829dff';

        return {
          userId: testUserId, // Use UUID instead of number
          username,
        };
      }

      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      console.error('Authentication error:', error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
