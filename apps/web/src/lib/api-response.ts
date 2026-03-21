import { NextResponse } from 'next/server';
import type { ZodIssue } from 'zod';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not found'): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(issues: ZodIssue[]): NextResponse {
  return NextResponse.json({ error: 'Validation failed', issues }, { status: 400 });
}

export function serverError(message = 'Internal server error'): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function serviceUnavailable(message = 'Service unavailable'): NextResponse {
  return NextResponse.json({ error: message }, { status: 503 });
}
