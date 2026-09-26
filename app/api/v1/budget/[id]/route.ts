import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/infra/error-handler';
import { type AuthenticatedRequest, withAuth } from '@/infra/with-auth';
import budget from '@/models/budget';
import { BudgetUpdateRequestSchema } from '@/schemas/budget';

type RouteContext = { params: Promise<{ id: string }> };

const handlePATCH = async (
  req: AuthenticatedRequest,
  { params }: RouteContext,
): Promise<NextResponse> => {
  const { id } = await params;
  const requestBody = await req.json();
  const payload = BudgetUpdateRequestSchema.parse(requestBody);
  const result = await budget.updateUserBudgetOneById(
    id,
    req.user.id,
    payload,
  );
  return NextResponse.json(result, { status: 200 });
};

const handleDELETE = async (
  req: AuthenticatedRequest,
  { params }: RouteContext,
): Promise<NextResponse> => {
  const { id } = await params;
  await budget.deleteOne(id, req.user.id);
  return NextResponse.json({}, { status: 200 });
};

export const PATCH = withErrorHandling(withAuth(handlePATCH));
export const DELETE = withErrorHandling(withAuth(handleDELETE));
