/**
 * Remove campos `undefined` de payloads antes de gravar no Firestore,
 * evitando exceções do SDK (`Unsupported field value: undefined`).
 */
export function sanitizarPayload<T>(dados: T): T {
  return JSON.parse(JSON.stringify(dados)) as T;
}

