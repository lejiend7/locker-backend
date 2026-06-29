import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthServiceInterface, AuthResult } from '@/services/interfaces/AuthServiceInterface.ts';
import { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';

export class AuthService implements AuthServiceInterface {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: jwt.SignOptions['expiresIn'] = '7d'
  ) {}

  private isValidRole(role?: string): role is 'customer' | 'delivery_agent' {
    return role === 'customer' || role === 'delivery_agent';
  }

  async signup(input: { name?: string; email?: string; password?: string; role?: string }): Promise<AuthResult> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const requestedRole = input.role?.trim().toLowerCase();

    if (!name || !email || !password) {
      return { success: false, message: 'name, email, and password are required' };
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return { success: false, message: 'Email address already registered' };
    }

    if (requestedRole && !this.isValidRole(requestedRole)) {
      return { success: false, message: 'role must be customer or delivery_agent' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = requestedRole ?? 'customer';
    const saved = await this.userRepository.create({ name, email, password: passwordHash, role });

    const accessToken = jwt.sign(
      { sub: String(saved.id), email: saved.email, name: saved.name, role: saved.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    return {
      success: true,
      message: 'Account created successfully',
      data: {
        accessToken,
        user: {
          id: String(saved.id),
          email: saved.email,
          name: saved.name,
          role: saved.role,
        },
      },
    };
  }

  async signupAdmin(input: { name?: string; email?: string; password?: string }): Promise<AuthResult> {
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!name || !email || !password) {
      return { success: false, message: 'name, email, and password are required' };
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return { success: false, message: 'Email address already registered' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const saved = await this.userRepository.create({ name, email, password: passwordHash, role: 'admin' });

    const accessToken = jwt.sign(
      { sub: String(saved.id), email: saved.email, name: saved.name, role: saved.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    return {
      success: true,
      message: 'Admin account created successfully',
      data: {
        accessToken,
        user: {
          id: String(saved.id),
          email: saved.email,
          name: saved.name,
          role: saved.role,
        },
      },
    };
  }

  async login(input: { email?: string; password?: string }): Promise<AuthResult> {
    const auth = await this.authenticateCredentials(input);

    if (!auth.success) {
      return auth;
    }

    const user = auth.user;
    const accessToken = jwt.sign(
      { sub: String(user.id), email: user.email, name: user.name, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { id: String(user.id), email: user.email, name: user.name, role: user.role },
      },
    };
  }

  async loginAdmin(input: { email?: string; password?: string }): Promise<AuthResult> {
    const auth = await this.authenticateCredentials(input);

    if (!auth.success) {
      return auth;
    }

    const user = auth.user;

    if (user.role !== 'admin') {
      return { success: false, message: 'Admin credentials required' };
    }

    const accessToken = jwt.sign(
      { sub: String(user.id), email: user.email, name: user.name, role: user.role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { id: String(user.id), email: user.email, name: user.name, role: user.role },
      },
    };
  }

  private async authenticateCredentials(input: { email?: string; password?: string }): Promise<
    | { success: true; user: { id: number; email: string; name: string; role: 'customer' | 'delivery_agent' | 'admin'; password: string } }
    | { success: false; message: string }
  > {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) {
      return { success: false, message: 'email and password are required' };
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        password: user.password,
      },
    };
  }
}
