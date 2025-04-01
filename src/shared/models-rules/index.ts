import { AppRequest } from '../models';

export function getUserIdFromRequest(req: AppRequest): string {
  const user = req.user;

  // Debug the user object
  console.log('User object in request:', JSON.stringify(user));

  // First try to get userId (which should be UUID for test users)
  if (user?.id) {
    return user.id.toString();
  }

  // Fallback to id
  if (user?.id) {
    return user.id.toString();
  }

  console.warn('No user ID found in request. Using default ID.');
  // Default UUID for anonymous users
  return '0db732f6-e540-4b45-bc29-2b1652829dff';
}
