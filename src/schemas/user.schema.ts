import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  age: z
    .number()
    .int('Age must be an integer')
    .min(13, 'Age must be at least 13')
    .max(120, 'Age must not exceed 120'),
  gender: z.enum(['male', 'female', 'other']),
  accountId: z
    .number()
    .int('Account ID must be an integer')
    .positive('Account ID must be a positive number'),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .optional(),
  age: z
    .number()
    .int('Age must be an integer')
    .min(13, 'Age must be at least 13')
    .max(120, 'Age must not exceed 120')
    .optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
