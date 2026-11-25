export function isHtmlResponseText(raw: string): boolean {
  const trimmed = raw.trimStart();
  if (!trimmed) return false;
  return /^<(?:!doctype|html|head|body|\?xml)/i.test(trimmed) || trimmed.startsWith('<');
}

export function stripMarkdownCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fencedMatch && fencedMatch[1] !== undefined) {
    return fencedMatch[1].trim();
  }
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export function extractApiErrorMessage(rawText: string, status: number): string {
  const statusPrefix = status > 0 ? `HTTP ${status}` : 'Erro na requisição';
  const trimmed = rawText.trim();

  if (!trimmed) {
    return `${statusPrefix}: resposta vazia do servidor.`;
  }

  if (isHtmlResponseText(trimmed)) {
    return `${statusPrefix}: resposta retornou HTML em vez de JSON (endpoint indisponível no ambiente estático).`;
  }

  try {
    const parsed = JSON.parse(stripMarkdownCodeFences(trimmed)) as {
      error?: { message?: string; code?: number; status?: string } | string;
      message?: string;
    };
    if (typeof parsed?.error === 'object' && parsed.error?.message) {
      const code = parsed.error.code || status;
      return code ? `HTTP ${code}: ${parsed.error.message}` : parsed.error.message;
    }
    if (typeof parsed?.error === 'string' && parsed.error.trim()) {
      return status ? `HTTP ${status}: ${parsed.error}` : parsed.error;
    }
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return status ? `HTTP ${status}: ${parsed.message}` : parsed.message;
    }
  } catch {
    // Plain text error body
  }

  const singleLine = trimmed.replace(/\s+/g, ' ').slice(0, 220);
  return `${statusPrefix}: ${singleLine}`;
}

export function parseSafeJsonText<T>(rawText: string, sourceLabel = 'API'): T {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error(`${sourceLabel}: resposta vazia recebida.`);
  }

  if (isHtmlResponseText(trimmed)) {
    throw new Error(
      `${sourceLabel}: a resposta retornou HTML em vez de JSON (verifique a URL ou chave da API).`
    );
  }

  const cleaned = stripMarkdownCodeFences(trimmed);
  if (!cleaned) {
    throw new Error(`${sourceLabel}: conteúdo JSON vazio após limpeza.`);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'JSON inválido';
    throw new Error(`${sourceLabel}: falha ao interpretar JSON (${msg}).`);
  }
}

export async function parseSafeJsonResponse<T>(
  res: Response,
  sourceLabel = 'API'
): Promise<T> {
  const rawText = await res.text();

  if (!res.ok) {
    throw new Error(extractApiErrorMessage(rawText, res.status));
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('text/html') || isHtmlResponseText(rawText)) {
    throw new Error(
      `${sourceLabel}: resposta retornou HTML (HTTP ${res.status}) em vez de JSON.`
    );
  }

  return parseSafeJsonText<T>(rawText, sourceLabel);
}
