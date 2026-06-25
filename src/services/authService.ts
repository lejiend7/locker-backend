import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../database/entities/User.js';

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthSuccess = {
  success: true;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};

type AuthFailure = {
  success: false;
  message: string;
};

export type AuthResult = AuthSuccess | AuthFailure;

export class AuthService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: jwt.SignOptions['expiresIn'] = '7d'
  ) {}

  async signup(input: { name?: string; email?: string; password?: string }): Promise<AuthResult> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!name || !email || !password) {
      return { success: false, message: 'name, email, and password are required' };
    }

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      return { success: false, message: 'Email address already registered' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, email, password: passwordHash });
    const saved = await this.userRepository.save(user);

    const accessToken = jwt.sign(
      { sub: String(saved.id), email: saved.email, name: saved.name },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    return {
      success: true,
      message: 'Account created successfully',
      data: {
        accessToken,
        user: { id: String(saved.id), email: saved.email, name: saved.name },
      },
    };
  }

  async login(input: { email?: string; password?: string }): Promise<AuthResult> {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      return { success: false, message: 'email and password are required' };
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    const accessToken = jwt.sign(
      { sub: String(user.id), email: user.email, name: user.name },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { id: String(user.id), email: user.email, name: user.name },
      },
    };
  }
}
