const { z } = require('zod');
const validate = require('../../shared/middleware/validate');

const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email/Username/UserID is required'),
    password: z.string().min(1, 'Password is required'),
  })
});

const registerSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1, 'Username is required'),
    email: z.string().trim().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    full_name: z.string().trim().min(1, 'Full name is required'),
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  })
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Valid email is required'),
  })
});

module.exports = {
  validateLogin: validate(loginSchema),
  validateRegister: validate(registerSchema),
  validateChangePassword: validate(changePasswordSchema),
  validateResendVerification: validate(resendVerificationSchema),
};
