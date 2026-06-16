// ┌────────────────────────────────────────────────────────────────────┐
// │  Роут выдачи токена для Vercel Blob.                                  │
// │  1) npm i @vercel/blob                                                │
// │  2) переименуй этот файл:  route.ts.example  ->  route.ts             │
// │  3) в providers.tsx:  storage: vercelBlobStorageAdapter({ upload }))  │
// │     где  import { upload } from '@vercel/blob/client'                 │
// │  URL этого роута = /upload  (совпадает с handleUploadUrl)             │
// └────────────────────────────────────────────────────────────────────┘
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (/* pathname */) => {
        // TODO: проверь авторизацию (сессию/токен админа) перед выдачей токена.
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({ /* напр. userId */ }),
        };
      },
      onUploadCompleted: async ({ blob /*, tokenPayload */ }) => {
        // вызывается Vercel-ем после успешной загрузки (можно залогировать blob.url)
        console.log('blob uploaded:', blob.url);
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
