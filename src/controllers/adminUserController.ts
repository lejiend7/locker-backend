import { type Request, type Response } from 'express';
import { AdminUserServiceInterface } from '@/services/interfaces/AdminUserServiceInterface.ts';
import { ResetUserPasswordDto } from '@/dtos/resetUserPasswordDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserServiceInterface) {}

  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));
  resetPassword = asyncHandler((req: Request, res: Response) => this.handleResetPassword(req, res));

  private async handleList(_req: Request, res: Response) {
    const users = await this.adminUserService.listUsers();

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Users fetched successfully',
        data: users,
      }),
    );
  }

  private async handleResetPassword(req: Request, res: Response) {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Invalid user id',
          data: [],
          errors: ['Invalid user id'],
        }),
      );
    }

    const validation = ResetUserPasswordDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        }),
      );
    }

    const updatedUser = await this.adminUserService.resetPassword(userId, validation.value.password);

    if (!updatedUser) {
      return res.status(404).json(
        buildApiResponse({
          success: false,
          statusCode: 404,
          message: 'User not found',
          data: [],
          errors: ['User not found'],
        }),
      );
    }

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Password reset successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      }),
    );
  }
}
