import { type Request, type Response } from 'express';
import { AuthServiceInterface } from '@/services/interfaces/AuthServiceInterface.ts';
import { LoginDto } from '@/dtos/loginDto.ts';
import { SignupAdminDto } from '@/dtos/signupAdminDto.ts';
import { SignupDto } from '@/dtos/signupDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

export class AuthController {
  constructor(private readonly authService: AuthServiceInterface) {}

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

    const result = await this.authService.signup(validation.value);

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

    const result = await this.authService.signupAdmin(validation.value);

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

    const result = await this.authService.login(validation.value);

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
