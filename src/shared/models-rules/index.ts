import { AppRequest } from '../models';

export function getUserIdFromRequest(req: AppRequest): string {
  const user = req.user;
  console.log('User object in request:', JSON.stringify(user));

  if (!user || !user.id) {
    throw new Error('Authenticated user does not have an id.');
  }

  return user.id.toString();
}
