import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../common/utils/apiResponse";
import { getTenantUserId } from "../../common/context/tenant.context";
import { asyncHandler } from "../../common/utils/asyncHandler";

export class AuthController {
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { full_name, shop_name, email, password } = req.body;
    const { user, token, refreshToken } = await authService.signup({
      full_name,
      shop_name,
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(
      res,
      {
        token,
        refreshToken,
        user: {
          id: user.id,
          shopId: user.shopId,
          role: "owner",
          full_name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          language: user.language,
          permissions: { "*": true },
        },
      },
      "Registration successful",
      201
    );
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const { user, token, refreshToken } = await authService.login(
      { email, password },
      ipAddress,
      userAgent
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const permissions: Record<string, boolean> = {};
    if (user.role?.name === "owner") {
      permissions["*"] = true;
    } else if (user.role?.permissions) {
      user.role.permissions.forEach((rp) => {
        if (rp.permission?.code) {
          permissions[rp.permission.code] = true;
        }
      });
    }

    sendSuccess(
      res,
      {
        token,
        refreshToken,
        user: {
          id: user.id,
          shopId: user.shopId,
          role: user.role?.name || "worker",
          full_name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          language: user.language,
          permissions,
        },
      },
      "Login successful"
    );
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.clearCookie("refreshToken");

    sendSuccess(res, undefined, "Logout successful");
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const tokens = await authService.rotateTokens(refreshToken, ipAddress, userAgent);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, tokens, "Tokens rotated successfully");
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    await authService.forgotPassword(email);

    sendSuccess(
      res,
      undefined,
      "If the email matches an active account, a password reset link has been dispatched."
    );
  });

  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    sendSuccess(res, undefined, "Password has been reset successfully.");
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    await authService.verifyEmail(token);

    sendSuccess(res, undefined, "Email verified successfully.");
  });

  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const userId = getTenantUserId() || "";

    await authService.changePassword(userId, currentPassword, newPassword);

    sendSuccess(res, undefined, "Password changed successfully. Please log in again.");
  });
}

export const authController = new AuthController();
export default authController;
