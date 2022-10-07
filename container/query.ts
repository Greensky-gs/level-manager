import { database } from "./levelManager";

export const query = <K = any>(search: string) => {
  return new Promise<K[]>((resolve, reject) => {
    database.query(search, (error: string, request: K[]) => {
      if (error) reject(error)
      else resolve(request);
    });
  });
};