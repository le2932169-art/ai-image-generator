import { Effect } from "@/backend/type/type";
import { getDb } from "../config/db";

export async function listByType(type: number): Promise<Effect[]> {
  const db = getDb();
  if (!db) {
    console.warn('Database not available, returning empty effect list');
    return [];
  }
  const res = await db.query(`SELECT * FROM effect WHERE type = $1`, [type]);
  return res.rows;
}


export async function getById(id: number): Promise<Effect | null> {
  const db = getDb();
  if (!db) {
    console.warn('Database not available, returning mock effect data');
    // 返回一个模拟的 effect 对象用于开发
    return {
      id: id,
      name: 'Text to Image',
      type: 1,
      des: 'AI-powered text to image generation',
      platform: 'replicate',
      link: 'https://replicate.com',
      api: 'text-to-image',
      is_open: 1,
      credit: 1,
      created_at: new Date(),
      link_name: 'text-to-image',
      model: 'black-forest-labs/flux-schnell',
      version: 'bf2f9ac02efec7d2ec9d3e95c6d6da8c7ad0d02f3e9b5b43e7b2b5a5b5a5b5a5',
      pre_prompt: ''
    };
  }
  const res = await db.query(`SELECT * FROM effect WHERE id = $1`, [id]);
  return res.rows[0] || null;
}
