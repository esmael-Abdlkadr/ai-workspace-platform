import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { headers } from 'next/headers';
import { getWorkspaceByIdAndUser } from '@workspace/db';
import { ingest } from '@workspace/rag';
import { auth } from '@/lib/auth';
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return unauthorized();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspaceId') as string | null;
    const title = (formData.get('title') as string | null) ?? undefined;

    if (!file || !workspaceId) {
      return serverError('file and workspaceId are required');
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return serverError('Only PDF files are supported');
    }
    if (file.size > 20 * 1024 * 1024) {
      return serverError('File too large — max 20 MB');
    }

    const workspace = await getWorkspaceByIdAndUser(workspaceId, session.user.id);
    if (!workspace) return forbidden('Workspace not found or access denied');

    // Write to temp file
    const uploadDir = join(tmpdir(), 'rag-uploads');
    await mkdir(uploadDir, { recursive: true });
    const tempPath = join(uploadDir, `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, buffer);

    try {
      const result = await ingest({
        workspaceId,
        title: title ?? file.name.replace('.pdf', ''),
        type: 'pdf',
        filePath: tempPath,
      });
      return ok({ documentId: result.documentId, chunkCount: result.chunkCount, status: result.status });
    } finally {
      await unlink(tempPath).catch(() => undefined);
    }
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'PDF ingestion failed');
  }
}
