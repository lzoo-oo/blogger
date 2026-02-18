import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET?: string;
  PASSWORD_SALT?: string;
};

type UserPayload = {
  id: number;
  username: string;
  role: string;
};

type Variables = {
  user: UserPayload;
};

type ApiResult<T = unknown> = {
  code: number;
  message: string;
  data?: T;
};

type ArticleRow = {
  id: number;
  title: string;
  content: string;
  cover_img: string;
  summary: string;
  view_count: number;
  like_count: number;
  is_top: number;
  status: number;
  cate_id: number | null;
  created_at: string;
  updated_at: string;
  category_id: number | null;
  category_name: string | null;
  tag_pairs: string | null;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const ok = <T>(message: string, data?: T): ApiResult<T> => ({ code: 200, message, data });
const fail = (code: number, message: string): ApiResult => ({ code, message });

const getJwtSecret = (env: Bindings) => env.JWT_SECRET || 'blogger_jwt_secret';
const getPasswordSalt = (env: Bindings) => env.PASSWORD_SALT || 'blogger-salt';

const nowSql = () => new Date().toISOString();

const parsePage = (raw: string | null, fallback: number) => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

const toNumberOrNull = (value: unknown) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toBoolInt = (value: unknown) => {
  if (value === true || value === 1 || value === '1') return 1;
  return 0;
};

const parseTagIds = (body: Record<string, unknown>) => {
  const raw = body.tag_ids ?? body.tagIds;
  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
  }
  return null;
};

const hashPassword = async (password: string, salt: string) => {
  const bytes = new TextEncoder().encode(`${password}:${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const toBase64Url = (input: string | Uint8Array) => {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
};

const signJwt = async (payload: Record<string, unknown>, secret: string) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const content = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(content));
  return `${content}.${toBase64Url(new Uint8Array(signature))}`;
};

const verifyJwt = async (token: string, secret: string) => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('invalid token');

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const content = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(encodedSignature),
    new TextEncoder().encode(content)
  );

  if (!valid) throw new Error('bad signature');

  const payloadRaw = new TextDecoder().decode(fromBase64Url(encodedPayload));
  const payload = JSON.parse(payloadRaw) as Record<string, unknown>;
  const exp = Number(payload.exp || 0);
  if (!exp || exp <= Math.floor(Date.now() / 1000)) {
    throw new Error('expired');
  }

  return payload;
};

const parseTags = (tagPairs: string | null) => {
  if (!tagPairs) return [] as { id: number; name: string }[];
  return tagPairs
    .split('|')
    .map((pair) => {
      const [id, ...rest] = pair.split(':');
      const tagId = Number(id);
      return {
        id: tagId,
        name: rest.join(':')
      };
    })
    .filter((tag) => Number.isFinite(tag.id) && tag.name);
};

const auth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return c.json(fail(401, '未登录'), 401);
  }

  try {
    const payload = await verifyJwt(token, getJwtSecret(c.env));
    c.set('user', {
      id: Number(payload.id),
      username: String(payload.username || ''),
      role: String(payload.role || 'admin')
    });
    await next();
  } catch {
    return c.json(fail(401, '登录已过期'), 401);
  }
};

const mapArticleRow = (row: ArticleRow) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  cover_img: row.cover_img,
  summary: row.summary,
  view_count: row.view_count,
  like_count: row.like_count,
  is_top: row.is_top,
  status: row.status,
  cate_id: row.cate_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
  category: row.category_id
    ? {
        id: row.category_id,
        name: row.category_name || ''
      }
    : null,
  tags: parseTags(row.tag_pairs)
});

app.use('/api/*', cors());

app.get('/api/health', (c) => c.json(ok('服务运行正常')));

app.post('/api/login', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, string>;
  const username = (body.username || '').trim();
  const password = body.password || '';

  if (!username || !password) {
    return c.json(fail(400, '用户名和密码不能为空'));
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? LIMIT 1')
    .bind(username)
    .first<any>();

  if (!user) {
    return c.json(fail(400, '用户不存在'));
  }

  const hashed = await hashPassword(password, getPasswordSalt(c.env));
  if (user.password !== hashed) {
    return c.json(fail(400, '密码错误'));
  }

  const token = await signJwt(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
    },
    getJwtSecret(c.env)
  );

  return c.json(
    ok('登录成功', {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email
      }
    })
  );
});

app.get('/api/articles', async (c) => {
  const page = parsePage(c.req.query('page') || null, 1);
  const pageSize = parsePage(c.req.query('pageSize') || null, 10);
  const cateId = c.req.query('cate_id');
  const keyword = (c.req.query('keyword') || '').trim();
  const statusRaw = c.req.query('status');

  const where: string[] = [];
  const params: unknown[] = [];

  if (cateId) {
    where.push('a.cate_id = ?');
    params.push(Number(cateId));
  }

  if (keyword) {
    where.push('a.title LIKE ?');
    params.push(`%${keyword}%`);
  }

  if (statusRaw === undefined || statusRaw === null || statusRaw === '') {
    where.push('a.status = 1');
  } else {
    where.push('a.status = ?');
    params.push(Number(statusRaw));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRow = await c.env.DB.prepare(`SELECT COUNT(*) AS total FROM articles a ${whereSql}`)
    .bind(...params)
    .first<{ total: number }>();

  const listRows = await c.env.DB.prepare(
    `SELECT
      a.*,
      c.id AS category_id,
      c.name AS category_name,
      GROUP_CONCAT(t.id || ':' || t.name, '|') AS tag_pairs
     FROM articles a
     LEFT JOIN categories c ON c.id = a.cate_id
     LEFT JOIN article_tags at ON at.article_id = a.id
     LEFT JOIN tags t ON t.id = at.tag_id
     ${whereSql}
     GROUP BY a.id
     ORDER BY a.is_top DESC, a.created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(...params, pageSize, (page - 1) * pageSize)
    .all<ArticleRow>();

  const list = (listRows.results || []).map((row) => mapArticleRow(row));

  return c.json(
    ok('获取成功', {
      list,
      total: totalRow?.total || 0,
      page,
      pageSize
    })
  );
});

app.get('/api/articles/:id', async (c) => {
  const id = Number(c.req.param('id'));

  const row = await c.env.DB.prepare(
    `SELECT
      a.*,
      c.id AS category_id,
      c.name AS category_name,
      GROUP_CONCAT(t.id || ':' || t.name, '|') AS tag_pairs
     FROM articles a
     LEFT JOIN categories c ON c.id = a.cate_id
     LEFT JOIN article_tags at ON at.article_id = a.id
     LEFT JOIN tags t ON t.id = at.tag_id
     WHERE a.id = ?
     GROUP BY a.id`
  )
    .bind(id)
    .first<ArticleRow>();

  if (!row) {
    return c.json(fail(404, '文章不存在'));
  }

  await c.env.DB.prepare('UPDATE articles SET view_count = view_count + 1, updated_at = ? WHERE id = ?')
    .bind(nowSql(), id)
    .run();

  const article = mapArticleRow({ ...row, view_count: row.view_count + 1 });
  return c.json(ok('获取成功', article));
});

app.post('/api/my/articles/add', auth, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(body.title || '').trim();
  const content = String(body.content || '');

  if (!title || !content) {
    return c.json(fail(400, '标题和内容不能为空'));
  }

  const coverImg = String((body.cover_img ?? body.cover ?? '') || '');
  const summary = String(body.summary || '').trim() || title.slice(0, 80);
  const cateId = toNumberOrNull(body.cate_id);
  const status = body.status !== undefined ? Number(body.status) : 1;
  const isTop = toBoolInt(body.is_top);
  const now = nowSql();

  const result = await c.env.DB.prepare(
    `INSERT INTO articles (title, content, cover_img, summary, view_count, like_count, is_top, status, cate_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)`
  )
    .bind(title, content, coverImg, summary, isTop, status, cateId, now, now)
    .run();

  const articleId = Number(result.meta.last_row_id || 0);
  const tagIds = parseTagIds(body);
  if (tagIds && tagIds.length) {
    const stmts = tagIds.map((tagId) =>
      c.env.DB.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').bind(articleId, tagId)
    );
    await c.env.DB.batch(stmts);
  }

  return c.json(ok('发布成功', { id: articleId }));
});

app.put('/api/my/articles/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const exist = await c.env.DB.prepare('SELECT * FROM articles WHERE id = ? LIMIT 1').bind(id).first<any>();
  if (!exist) {
    return c.json(fail(404, '文章不存在'));
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  const setField = (field: string, key: string, transform?: (value: unknown) => unknown) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates.push(`${field} = ?`);
      values.push(transform ? transform(body[key]) : body[key]);
    }
  };

  setField('title', 'title', (v) => String(v || '').trim());
  setField('content', 'content', (v) => String(v || ''));
  if (Object.prototype.hasOwnProperty.call(body, 'cover_img') || Object.prototype.hasOwnProperty.call(body, 'cover')) {
    updates.push('cover_img = ?');
    values.push(String((body.cover_img ?? body.cover ?? '') || ''));
  }
  setField('summary', 'summary', (v) => String(v || '').trim());
  if (Object.prototype.hasOwnProperty.call(body, 'cate_id')) {
    updates.push('cate_id = ?');
    values.push(toNumberOrNull(body.cate_id));
  }
  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    updates.push('status = ?');
    values.push(Number(body.status));
  }
  if (Object.prototype.hasOwnProperty.call(body, 'is_top')) {
    updates.push('is_top = ?');
    values.push(toBoolInt(body.is_top));
  }

  updates.push('updated_at = ?');
  values.push(nowSql());

  if (updates.length) {
    await c.env.DB.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values, id)
      .run();
  }

  const tagIds = parseTagIds(body);
  if (tagIds) {
    const stmtList = [c.env.DB.prepare('DELETE FROM article_tags WHERE article_id = ?').bind(id), ...tagIds.map((tagId) => c.env.DB.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').bind(id, tagId))];
    await c.env.DB.batch(stmtList);
  }

  return c.json(ok('更新成功'));
});

app.delete('/api/my/articles/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));

  const exist = await c.env.DB.prepare('SELECT id FROM articles WHERE id = ?').bind(id).first();
  if (!exist) {
    return c.json(fail(404, '文章不存在'));
  }

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM article_tags WHERE article_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM comments WHERE article_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id)
  ]);

  return c.json(ok('删除成功'));
});

app.put('/api/my/articles/:id/top', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const article = await c.env.DB.prepare('SELECT id, is_top FROM articles WHERE id = ?').bind(id).first<any>();
  if (!article) {
    return c.json(fail(404, '文章不存在'));
  }

  const isTop = body.is_top === undefined ? (article.is_top ? 0 : 1) : toBoolInt(body.is_top);

  await c.env.DB.prepare('UPDATE articles SET is_top = ?, updated_at = ? WHERE id = ?')
    .bind(isTop, nowSql(), id)
    .run();

  return c.json(ok('操作成功'));
});

app.get('/api/categories', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM categories ORDER BY id ASC').all<any>();
  return c.json(ok('获取成功', rows.results || []));
});

app.get('/api/categories/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const category = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first<any>();
  if (!category) {
    return c.json(fail(404, '分类不存在'));
  }
  return c.json(ok('获取成功', category));
});

app.post('/api/my/categories', auth, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  const alias = String(body.alias || '').trim();

  if (!name) {
    return c.json(fail(400, '分类名称不能为空'));
  }

  const exist = await c.env.DB.prepare('SELECT id FROM categories WHERE name = ? LIMIT 1').bind(name).first();
  if (exist) {
    return c.json(fail(400, '分类已存在'));
  }

  const now = nowSql();
  const result = await c.env.DB.prepare(
    'INSERT INTO categories (name, alias, created_at, updated_at) VALUES (?, ?, ?, ?)'
  )
    .bind(name, alias, now, now)
    .run();

  const category = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();

  return c.json(ok('添加成功', category));
});

app.put('/api/my/categories/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const category = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first<any>();
  if (!category) {
    return c.json(fail(404, '分类不存在'));
  }

  const name = String(body.name || category.name).trim();
  const alias = String(body.alias ?? category.alias ?? '').trim();

  await c.env.DB.prepare('UPDATE categories SET name = ?, alias = ?, updated_at = ? WHERE id = ?')
    .bind(name, alias, nowSql(), id)
    .run();

  return c.json(ok('更新成功'));
});

app.delete('/api/my/categories/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const category = await c.env.DB.prepare('SELECT id FROM categories WHERE id = ?').bind(id).first();
  if (!category) {
    return c.json(fail(404, '分类不存在'));
  }

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE articles SET cate_id = NULL, updated_at = ? WHERE cate_id = ?').bind(nowSql(), id),
    c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id)
  ]);

  return c.json(ok('删除成功'));
});

app.get('/api/tags', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM tags ORDER BY id ASC').all<any>();
  return c.json(ok('获取成功', rows.results || []));
});

app.post('/api/my/tags', auth, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || '').trim();

  if (!name) {
    return c.json(fail(400, '标签名称不能为空'));
  }

  const exist = await c.env.DB.prepare('SELECT id FROM tags WHERE name = ? LIMIT 1').bind(name).first();
  if (exist) {
    return c.json(fail(400, '标签已存在'));
  }

  const now = nowSql();
  const result = await c.env.DB.prepare('INSERT INTO tags (name, created_at, updated_at) VALUES (?, ?, ?)')
    .bind(name, now, now)
    .run();

  const tag = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(result.meta.last_row_id).first();
  return c.json(ok('添加成功', tag));
});

app.put('/api/my/tags/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const tag = await c.env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(id).first<any>();

  if (!tag) {
    return c.json(fail(404, '标签不存在'));
  }

  const name = String(body.name || tag.name).trim();
  await c.env.DB.prepare('UPDATE tags SET name = ?, updated_at = ? WHERE id = ?')
    .bind(name, nowSql(), id)
    .run();

  return c.json(ok('更新成功'));
});

app.delete('/api/my/tags/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const tag = await c.env.DB.prepare('SELECT id FROM tags WHERE id = ?').bind(id).first<any>();

  if (!tag) {
    return c.json(fail(404, '标签不存在'));
  }

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM article_tags WHERE tag_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM tags WHERE id = ?').bind(id)
  ]);

  return c.json(ok('删除成功'));
});

app.post('/api/comments/add', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const nickname = String(body.nickname || '').trim();
  const email = String(body.email || '').trim();
  const content = String(body.content || '').trim();
  const articleId = Number(body.article_id);
  const parentId = toNumberOrNull(body.parent_id);

  if (!nickname || !content || !articleId) {
    return c.json(fail(400, '参数不完整'));
  }

  const article = await c.env.DB.prepare('SELECT id FROM articles WHERE id = ?').bind(articleId).first();
  if (!article) {
    return c.json(fail(404, '文章不存在'));
  }

  const now = nowSql();
  const result = await c.env.DB.prepare(
    `INSERT INTO comments (nickname, email, content, article_id, parent_id, is_admin, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`
  )
    .bind(nickname, email, content, articleId, parentId, now, now)
    .run();

  const comment = await c.env.DB.prepare('SELECT * FROM comments WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();

  return c.json(ok('评论成功', comment));
});

app.get('/api/comments/article/:id', async (c) => {
  const articleId = Number(c.req.param('id'));

  const rows = await c.env.DB.prepare('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC')
    .bind(articleId)
    .all<any>();

  const comments = rows.results || [];
  const byParent = new Map<number | null, any[]>();

  for (const item of comments) {
    const key = item.parent_id === null ? null : Number(item.parent_id);
    const arr = byParent.get(key) || [];
    arr.push({ ...item, replies: [] });
    byParent.set(key, arr);
  }

  const attach = (nodes: any[]) => {
    for (const node of nodes) {
      node.replies = byParent.get(Number(node.id)) || [];
      attach(node.replies);
    }
  };

  const tree = byParent.get(null) || [];
  attach(tree);

  return c.json(ok('获取成功', tree));
});

app.get('/api/my/comments', auth, async (c) => {
  const page = parsePage(c.req.query('page') || null, 1);
  const pageSize = parsePage(c.req.query('pageSize') || null, 10);

  const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS total FROM comments').first<{ total: number }>();
  const rows = await c.env.DB.prepare(
    `SELECT cm.*, a.id AS article_id_ref, a.title AS article_title
     FROM comments cm
     LEFT JOIN articles a ON a.id = cm.article_id
     ORDER BY cm.created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(pageSize, (page - 1) * pageSize)
    .all<any>();

  const list = (rows.results || []).map((item) => ({
    ...item,
    article: item.article_id_ref
      ? {
          id: item.article_id_ref,
          title: item.article_title
        }
      : null
  }));

  return c.json(
    ok('获取成功', {
      list,
      total: totalRow?.total || 0,
      page,
      pageSize
    })
  );
});

app.delete('/api/my/comments/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const comment = await c.env.DB.prepare('SELECT id FROM comments WHERE id = ?').bind(id).first();

  if (!comment) {
    return c.json(fail(404, '评论不存在'));
  }

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM comments WHERE parent_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id)
  ]);

  return c.json(ok('删除成功'));
});

app.post('/api/my/comments/reply', auth, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const articleId = Number(body.article_id);
  const parentId = toNumberOrNull(body.parent_id);
  const content = String(body.content || '').trim();

  if (!articleId || !content) {
    return c.json(fail(400, '参数不完整'));
  }

  const now = nowSql();
  const result = await c.env.DB.prepare(
    `INSERT INTO comments (nickname, email, content, article_id, parent_id, is_admin, created_at, updated_at)
     VALUES ('博主', '', ?, ?, ?, 1, ?, ?)`
  )
    .bind(content, articleId, parentId, now, now)
    .run();

  const comment = await c.env.DB.prepare('SELECT * FROM comments WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();

  return c.json(ok('回复成功', comment));
});

app.get('/api/friendlinks', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM friend_links ORDER BY id ASC').all<any>();
  return c.json(ok('获取成功', rows.results || []));
});

app.post('/api/my/friendlinks', auth, async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  const linkUrl = String(body.link_url || '').trim();
  const logoUrl = String(body.logo_url || '').trim();
  const description = String(body.description || '').trim();

  if (!name || !linkUrl) {
    return c.json(fail(400, '名称和链接不能为空'));
  }

  const now = nowSql();
  const result = await c.env.DB.prepare(
    `INSERT INTO friend_links (name, link_url, logo_url, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(name, linkUrl, logoUrl, description, now, now)
    .run();

  const link = await c.env.DB.prepare('SELECT * FROM friend_links WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first();

  return c.json(ok('添加成功', link));
});

app.put('/api/my/friendlinks/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const link = await c.env.DB.prepare('SELECT * FROM friend_links WHERE id = ?').bind(id).first<any>();
  if (!link) {
    return c.json(fail(404, '友链不存在'));
  }

  const name = String(body.name || link.name).trim();
  const linkUrl = String(body.link_url || link.link_url).trim();
  const logoUrl = String(body.logo_url ?? link.logo_url ?? '').trim();
  const description = String(body.description ?? link.description ?? '').trim();

  await c.env.DB.prepare(
    'UPDATE friend_links SET name = ?, link_url = ?, logo_url = ?, description = ?, updated_at = ? WHERE id = ?'
  )
    .bind(name, linkUrl, logoUrl, description, nowSql(), id)
    .run();

  return c.json(ok('更新成功'));
});

app.delete('/api/my/friendlinks/:id', auth, async (c) => {
  const id = Number(c.req.param('id'));
  const link = await c.env.DB.prepare('SELECT id FROM friend_links WHERE id = ?').bind(id).first();

  if (!link) {
    return c.json(fail(404, '友链不存在'));
  }

  await c.env.DB.prepare('DELETE FROM friend_links WHERE id = ?').bind(id).run();
  return c.json(ok('删除成功'));
});

app.post('/api/upload', auth, async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json(fail(400, '请选择文件'));
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return c.json(fail(400, '不支持的文件类型'));
  }

  if (file.size > 1024 * 1024 * 2) {
    return c.json(fail(400, '文件不能超过2MB'));
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const url = `data:${file.type};base64,${base64}`;

  return c.json(ok('上传成功', { url }));
});

app.get('/api/settings', async (c) => {
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1").first<any>();

  if (!user) {
    return c.json(fail(404, '博主信息不存在'));
  }

  return c.json(
    ok('获取成功', {
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email
    })
  );
});

app.get('/api/my/dashboard/stats', auth, async (c) => {
  const [articleRow, commentRow, viewRow, categoryRow] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM articles').first<{ count: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM comments').first<{ count: number }>(),
    c.env.DB.prepare('SELECT COALESCE(SUM(view_count), 0) AS count FROM articles').first<{ count: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM categories').first<{ count: number }>()
  ]);

  return c.json(
    ok('获取成功', {
      articleCount: articleRow?.count || 0,
      commentCount: commentRow?.count || 0,
      viewCount: viewRow?.count || 0,
      categoryCount: categoryRow?.count || 0
    })
  );
});

app.put('/api/my/settings', auth, async (c) => {
  const user = c.get('user');
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const current = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first<any>();

  if (!current) {
    return c.json(fail(404, '用户不存在'));
  }

  const nickname = String(body.nickname ?? current.nickname ?? '').trim();
  const avatar = String(body.avatar ?? current.avatar ?? '').trim();
  const email = String(body.email ?? current.email ?? '').trim();

  let password = current.password;
  const rawPassword = String(body.password || '').trim();
  if (rawPassword) {
    password = await hashPassword(rawPassword, getPasswordSalt(c.env));
  }

  await c.env.DB.prepare(
    'UPDATE users SET nickname = ?, avatar = ?, email = ?, password = ?, updated_at = ? WHERE id = ?'
  )
    .bind(nickname, avatar, email, password, nowSql(), user.id)
    .run();

  return c.json(ok('更新成功'));
});

app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json(fail(404, '接口不存在'), 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

app.onError((err, c) => {
  console.error(err);
  return c.json(fail(500, '服务器内部错误'), 500);
});

export default {
  fetch: app.fetch
};
