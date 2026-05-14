# 043 — Cron de publicação automática de posts sociais

**Tipo:** feature
**Severidade:** crítico
**Bloco:** C (Marketing)
**Dependências:** OAuth real Instagram/Facebook/LinkedIn (não no escopo desta issue, assumir tokens)
**Esforço estimado:** L (24-40h)
**Status:** todo

## Contexto

`/social/calendario` mostra posts agendados, mas nenhum cron job os publica. `scheduled_at` é ignorado.

## Critérios de aceite

- [ ] Cron `social_publish` roda a cada 5 min
- [ ] Busca posts com `status='scheduled'` e `scheduled_at <= now()`
- [ ] Para cada plataforma do post, chama API correspondente:
  - Instagram Graph API (Business account)
  - Facebook Graph API (Page)
  - LinkedIn UGC Posts API
  - TikTok Marketing API (se possível, senão deixar pending)
- [ ] Salva ID do post publicado em `social_posts.platform_post_ids`
- [ ] Em sucesso: `status='published'`, `published_at=now()`
- [ ] Em erro: `status='failed'`, `error_message` populado, retry policy
- [ ] Suporta múltiplas plataformas no mesmo post (publica em paralelo)
- [ ] Não publica em plataforma com token expirado (notifica usuário)

## Plan

1. Migração `supabase/migrations/00022_social_posts_tracking.sql`:
   ```sql
   ALTER TABLE social_posts
     ADD COLUMN IF NOT EXISTS platform_post_ids JSONB DEFAULT '{}', -- {instagram: 'xxx', facebook: 'yyy'}
     ADD COLUMN IF NOT EXISTS publish_attempts INT DEFAULT 0,
     ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
     ADD COLUMN IF NOT EXISTS error_message TEXT,
     ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
   ```

2. Criar clients por plataforma:
   - `src/lib/social/instagram.ts`:
     ```ts
     export async function publishToInstagram({ accessToken, igUserId, caption, mediaUrls }) {
       // 1. Create container: POST /v21.0/{ig-user-id}/media com image_url=...
       // 2. Publish: POST /v21.0/{ig-user-id}/media_publish com creation_id=...
       // Retorna: { id: 'media_id' }
     }
     ```
   - `src/lib/social/facebook.ts`: similar para Facebook Page
   - `src/lib/social/linkedin.ts`: UGC Posts endpoint

3. Criar `src/lib/social/publish.ts`:
   ```ts
   export async function publishSocialPost(admin, postId: string) {
     const { data: post } = await admin.from('social_posts')
       .select('*, accounts:social_accounts(*)').eq('id', postId).single();
     if (!post) return;
     
     await admin.from('social_posts').update({ 
       status: 'publishing', 
       last_attempt_at: new Date().toISOString(),
       publish_attempts: post.publish_attempts + 1 
     }).eq('id', postId);
     
     const results: Record<string, string | null> = {};
     const errors: Record<string, string> = {};
     
     for (const platform of post.platforms ?? []) {
       const account = post.accounts.find(a => a.platform === platform);
       if (!account || account.token_expired) {
         errors[platform] = 'token_missing_or_expired';
         continue;
       }
       try {
         const id = await publishToPlatform(platform, {
           account,
           caption: post.caption_per_platform?.[platform] ?? post.content_text,
           hashtags: post.hashtags ?? [],
           mediaUrls: post.media_urls ?? [],
         });
         results[platform] = id;
       } catch (e) {
         errors[platform] = String(e);
       }
     }
     
     const allOk = Object.keys(errors).length === 0;
     const someOk = Object.values(results).some(v => v != null);
     
     await admin.from('social_posts').update({
       status: allOk ? 'published' : (someOk ? 'partial' : 'failed'),
       published_at: someOk ? new Date().toISOString() : null,
       platform_post_ids: results,
       error_message: allOk ? null : JSON.stringify(errors),
     }).eq('id', postId);
   }
   ```

4. Adicionar task em [src/app/api/cron/run/route.ts](../src/app/api/cron/run/route.ts):
   ```ts
   if (task === 'social_publish' || task === 'all') {
     const { data: scheduled } = await admin.from('social_posts')
       .select('id, publish_attempts')
       .eq('status', 'scheduled')
       .lte('scheduled_at', new Date().toISOString())
       .lt('publish_attempts', 3)
       .limit(50);
     for (const p of scheduled ?? []) await publishSocialPost(admin, p.id);
   }
   ```

5. UI feedback:
   - Calendário mostra ícone de status (✓ publicado, ⚠ falhou, 🔄 publicando)
   - Falhou → mostra `error_message` em hover, botão "Tentar novamente"

## Arquivos afetados

- `supabase/migrations/00022_social_posts_tracking.sql` (novo)
- `src/lib/social/instagram.ts` (novo)
- `src/lib/social/facebook.ts` (novo)
- `src/lib/social/linkedin.ts` (novo)
- `src/lib/social/publish.ts` (novo)
- `src/app/api/cron/run/route.ts`
- `src/components/social/social-calendar.tsx` (status icons)

## Como testar

1. Conectar conta Instagram Business com token válido
2. Criar post com `scheduled_at` para próximo minuto
3. Trigger cron `?task=social_publish` (ou aguardar)
4. Post aparece no Instagram da conta
5. `social_posts.platform_post_ids.instagram` populado
6. Repetir com token expirado → status 'failed', error_message claro

## Notas

- Instagram exige Business account + Facebook Page vinculada
- Facebook só aceita posts de página, não pessoal
- LinkedIn limit: 500 posts/dia
- Para vídeos: upload assíncrono (Reels/Shorts), checagem de status
- Implementar retry exponencial: tentativa 1 imediata, 2 em 5min, 3 em 30min
