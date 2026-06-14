-- Minimal seed so a fresh project isn't empty. The full demo dataset lives in
-- src/data/* and gets synced once the read layer is wired. Run after the
-- migration: `supabase db reset` applies migrations then this file.

insert into accounts (id, handle, name, niche, followers, gradient) values
  ('tenfoldmarc', '@tenfoldmarc', 'Marc — Tenfold', 'ai',       184200, array['#E2725B', '#9A3F2B']),
  ('marcbuilds',  '@marcbuilds',  'Marc Builds',    'business',  42800, array['#C9823B', '#7A4A1E']),
  ('clipsbymarc', '@clipsbymarc', 'Clips by Marc',  'marketing', 11500, array['#5B8FE2', '#2B4F9A']);

insert into hooks (id, account_id, text, hook_type, niche, original_creator, views, transcript, source, saved_at) values
  ('h-1', 'tenfoldmarc', 'Claude just killed prompt engineering', 'x-killed-y', 'ai', '@aimarketer', 2400000,
   'Claude just killed prompt engineering and nobody noticed. Here''s what changed this week...', 'competitor', now() - interval '2 days'),
  ('h-3', 'tenfoldmarc', '7 AI tools I wish I knew about a year ago', 'n-things', 'ai', '@toolfinder', 1650000,
   '7 AI tools I wish I knew about a year ago — number 4 replaced my whole editing stack.', 'manual', now() - interval '5 days');

insert into materials (id, account_id, title, type, niche, description, tags, usage_count, gradient, seed, added_at) values
  ('m-2', 'tenfoldmarc', '3-second problem → fix', 'reel-format', 'ai',
   'Open cold on the pain, name it in 3 seconds, then reveal the one-step fix.',
   array['hook', 'retention'], 41, array['#E2725B', '#9A3F2B'],
   '{"hook":"You''re still doing [X] by hand?","angle":"0-3s pain, 3-6s fix, then prove it.","cta":"Save this before you forget."}'::jsonb,
   now() - interval '9 days');

insert into competitor_reels (id, tracked_by_account_id, creator_handle, creator_followers, niche, posted_at, views, hook, on_screen_text, video_url, audio_title, hook_type) values
  ('c-1', 'tenfoldmarc', '@aimarketer', 642000, 'ai', now() - interval '3 days', 4100000,
   'Claude just killed prompt engineering', 'PROMPT ENGINEERING IS DEAD',
   'https://www.instagram.com/reel/C9Aimkt001/', 'original audio — aimarketer', 'x-killed-y');

insert into trend_items (id, title, source, source_type, url, summary, published_at, tag, niche, hook_angle) values
  ('t-1', 'Anthropic ships computer-use for Claude', 'Anthropic Blog', 'blog',
   'https://www.anthropic.com/news', 'Claude can now operate a desktop end to end.',
   now() - interval '1 day', 'hook-potential', 'ai', 'Show Claude doing your busywork while you sip coffee.');
