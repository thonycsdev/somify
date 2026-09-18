import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/infra/error-handler';
import { type AuthenticatedRequest, withAuth } from '@/infra/with-auth';
import { category } from '@/models/category';
import { CategoryCreateRequestSchema } from '@/schemas/category';

const handlePOST = async (req: AuthenticatedRequest): Promise<NextResponse> => {
  const requestBody = await req.json();
  const payload = CategoryCreateRequestSchema.parse(requestBody);
  const result = await category.createOne(payload);
  return NextResponse.json(result, { status: 201 });
};
const handleGET = async (req: AuthenticatedRequest): Promise<NextResponse> => {
  const result = await category.getManyByUserId(req.user.id);
  return NextResponse.json(result, { status: 200 });
};
export const GET = withErrorHandling(withAuth(handleGET));
export const POST = withErrorHandling(withAuth(handlePOST));
