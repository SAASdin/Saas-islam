/**
 * db.ts — Connexion PostgreSQL + requêtes sacrées
 * READ-ONLY sur la zone sacrée
 */

import { Pool } from 'pg';

// Pool de connexion singleton
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://islampc@localhost:5432/saas_islam',
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

async function query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// ─── COLLECTIONS ──────────────────────────────────────────

export async function getCollections() {
  return query(`
    SELECT 
      hc.*,
      COUNT(h.id)::int AS loaded_hadiths
    FROM sacred.hadith_collections hc
    LEFT JOIN sacred.hadiths h ON h.collection_id = hc.id
    GROUP BY hc.id
    ORDER BY 
      CASE hc.collection_key
        WHEN 'bukhari' THEN 1
        WHEN 'muslim' THEN 2
        WHEN 'nasai' THEN 3
        WHEN 'abudawud' THEN 4
        WHEN 'tirmidhi' THEN 5
        WHEN 'ibnmajah' THEN 6
        WHEN 'malik' THEN 7
        WHEN 'riyadussalihin' THEN 8
        WHEN 'nawawi40' THEN 9
        WHEN 'ahmad' THEN 10
        ELSE 99
      END
  `);
}

export async function getCollection(collectionKey: string) {
  const rows = await query(`
    SELECT * FROM sacred.hadith_collections
    WHERE collection_key = $1
  `, [collectionKey]);
  return rows[0] || null;
}

// ─── LIVRES ───────────────────────────────────────────────

export async function getBooks(collectionKey: string) {
  return query(`
    SELECT 
      hb.*,
      COUNT(h.id)::int AS hadith_count
    FROM sacred.hadith_books hb
    JOIN sacred.hadith_collections hc ON hc.id = hb.collection_id
    LEFT JOIN sacred.hadiths h ON h.book_id = hb.id
    WHERE hc.collection_key = $1
    GROUP BY hb.id
    ORDER BY hb.book_number::float NULLS LAST
  `, [collectionKey]);
}

export async function getBook(collectionKey: string, bookNumber: string) {
  const rows = await query(`
    SELECT hb.*
    FROM sacred.hadith_books hb
    JOIN sacred.hadith_collections hc ON hc.id = hb.collection_id
    WHERE hc.collection_key = $1 AND hb.book_number = $2
  `, [collectionKey, bookNumber]);
  return rows[0] || null;
}

// ─── CHAPITRES ────────────────────────────────────────────

export async function getChapters(collectionKey: string, bookNumber: string) {
  return query(`
    SELECT hch.*
    FROM sacred.hadith_chapters hch
    JOIN sacred.hadith_collections hc ON hc.id = hch.collection_id
    JOIN sacred.hadith_books hb ON hb.id = hch.book_id
    WHERE hc.collection_key = $1 AND hb.book_number = $2
    ORDER BY hch.chapter_number::float NULLS LAST
  `, [collectionKey, bookNumber]);
}

// ─── HADITHS ──────────────────────────────────────────────

export async function getHadiths(collectionKey: string, options: {
  page?: number;
  limit?: number;
  bookNumber?: string;
}) {
  const { page = 1, limit = 50, bookNumber } = options;
  const offset = (page - 1) * limit;

  const whereBook = bookNumber ? `AND hb.book_number = $3` : '';
  const params: unknown[] = [collectionKey, limit, offset];
  if (bookNumber) params.splice(2, 0, bookNumber);

  const rows = await query(`
    SELECT 
      h.*,
      hc.collection_key,
      hc.name_arabic AS collection_name_arabic,
      hc.name_english AS collection_name_english,
      hb.name_arabic AS book_name_arabic,
      hb.name_english AS book_name_english,
      hch.name_arabic AS chapter_name_arabic_full,
      hch.name_english AS chapter_name_english_full
    FROM sacred.hadiths h
    JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
    LEFT JOIN sacred.hadith_books hb ON hb.id = h.book_id
    LEFT JOIN sacred.hadith_books hb2 ON hb2.collection_id = hc.id AND hb2.book_number = h.book_number
    LEFT JOIN sacred.hadith_chapters hch ON hch.id = h.chapter_id
    WHERE hc.collection_key = $1
    ${whereBook}
    ORDER BY h.hadith_number::float NULLS LAST
    LIMIT $${bookNumber ? 4 : 2} OFFSET $${bookNumber ? 5 : 3}
  `, bookNumber ? [collectionKey, bookNumber, limit, offset] : [collectionKey, limit, offset]);

  const countRows = await query<{ count: string }>(`
    SELECT COUNT(*)::text AS count
    FROM sacred.hadiths h
    JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
    ${bookNumber ? 'LEFT JOIN sacred.hadith_books hb ON hb.id = h.book_id' : ''}
    WHERE hc.collection_key = $1
    ${bookNumber ? 'AND hb.book_number = $2' : ''}
  `, bookNumber ? [collectionKey, bookNumber] : [collectionKey]);

  const total = parseInt(countRows[0]?.count || '0');
  return { rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getHadith(collectionKey: string, hadithNumber: string) {
  const rows = await query(`
    SELECT 
      h.*,
      hc.collection_key,
      hc.name_arabic AS collection_name_arabic,
      hc.name_english AS collection_name_english,
      hb.name_arabic AS book_name_arabic,
      hb.name_english AS book_name_english,
      hch.name_arabic AS chapter_name_arabic_full,
      hch.name_english AS chapter_name_english_full
    FROM sacred.hadiths h
    JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
    LEFT JOIN sacred.hadith_books hb ON hb.id = h.book_id
    LEFT JOIN sacred.hadith_chapters hch ON hch.id = h.chapter_id
    WHERE hc.collection_key = $1 AND h.hadith_number = $2
  `, [collectionKey, hadithNumber]);
  return rows[0] || null;
}

export async function getAdjacentHadiths(collectionKey: string, hadithNumber: string) {
  const num = parseFloat(hadithNumber);
  const [prev, next] = await Promise.all([
    query(`
      SELECT hadith_number FROM sacred.hadiths h
      JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
      WHERE hc.collection_key = $1 AND h.hadith_number::float < $2
      ORDER BY h.hadith_number::float DESC LIMIT 1
    `, [collectionKey, num]),
    query(`
      SELECT hadith_number FROM sacred.hadiths h
      JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
      WHERE hc.collection_key = $1 AND h.hadith_number::float > $2
      ORDER BY h.hadith_number::float ASC LIMIT 1
    `, [collectionKey, num]),
  ]);
  return {
    prev: (prev[0] as Record<string, string>)?.hadith_number || null,
    next: (next[0] as Record<string, string>)?.hadith_number || null,
  };
}

// ─── RECHERCHE ────────────────────────────────────────────

export async function searchHadiths(query_str: string, options: {
  collection?: string;
  page?: number;
  limit?: number;
}) {
  const { collection, page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  const collectionFilter = collection ? `AND hc.collection_key = $3` : '';
  const params: unknown[] = [query_str, `%${query_str}%`, limit, offset];
  if (collection) params.splice(2, 0, collection);

  return query(`
    SELECT 
      h.*,
      hc.collection_key,
      hc.name_english AS collection_name_english,
      hb.name_english AS book_name_english,
      ts_rank(to_tsvector('english', COALESCE(h.text_english, '')), plainto_tsquery('english', $1)) AS rank
    FROM sacred.hadiths h
    JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
    LEFT JOIN sacred.hadith_books hb ON hb.id = h.book_id
    WHERE (
      to_tsvector('english', COALESCE(h.text_english, '')) @@ plainto_tsquery('english', $1)
      OR h.text_arabic ILIKE $2
      OR h.text_english ILIKE $2
    )
    ${collectionFilter}
    ORDER BY rank DESC
    LIMIT $${collection ? 4 : 3} OFFSET $${collection ? 5 : 4}
  `, params);
}

// ─── STATS ────────────────────────────────────────────────

export async function getRandomHadith(collectionKey?: string) {
  const rows = await query(`
    SELECT 
      h.*,
      hc.collection_key,
      hc.name_arabic AS collection_name_arabic,
      hc.name_english AS collection_name_english
    FROM sacred.hadiths h
    JOIN sacred.hadith_collections hc ON hc.id = h.collection_id
    WHERE h.text_english IS NOT NULL
    ${collectionKey ? `AND hc.collection_key = '${collectionKey}'` : ''}
    ORDER BY RANDOM()
    LIMIT 1
  `);
  return rows[0] || null;
}
