import { type Request, type Response } from 'express';
import { AppDataSource } from '@/database/data-source.ts';
import { User } from '@/database/entities/User.ts';
import { AuthService } from '@/services/authService.ts';
import { LoginDto } from '@/dtos/LoginDto.ts';
import { SignupAdminDto } from '@/dtos/SignupAdminDto.ts';
import { SignupDto } from '@/dtos/SignupDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

const jwtSecret = process.env.JWT_SECRET || '';
const authService = new AuthService(AppDataSource.getRepository(User), jwtSecret);

export class AuthController {
  signup = asyncHandler((req: Request, res: Response) => this.handleSignup(req, res));

  signupAdmin = asyncHandler((req: Request, res: Response) => this.handleSignupAdmin(req, res));

  login = asyncHandler((req: Request, res: Response) => this.handleLogin(req, res));

  session = asyncHandler((req: Request, res: Response) => this.handleSession(req, res));

  private async handleSignup(req: Request, res: Response) {
    const validation = SignupDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    const result = await authService.signup(validation.value);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  }

  private async handleSignupAdmin(req: Request, res: Response) {
    const validation = SignupAdminDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    const result = await authService.signupAdmin(validation.value);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  }

  private async handleLogin(req: Request, res: Response) {
    const validation = LoginDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    const result = await authService.login(validation.value);

    if (!result.success) {
      const status = result.message === 'Invalid email or password' ? 401 : 400;
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  }

  private async handleSession(req: Request, res: Response) {
    if (!req.authUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Session restored',
      data: {
        user: {
          id: req.authUser.sub,
          email: req.authUser.email,
          name: req.authUser.name,
          role: req.authUser.role,
        },
        accessToken: '',
      },
    });
  }
}

export const authController = new AuthController();
