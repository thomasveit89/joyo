# i18n Implementation Guide

This guide explains how to use the multi-language support (English & German) in your Joyo application.

## Overview

The app now supports **English (en)** and **German (de)** using **next-intl**. All user-facing text has been extracted into translation files.

## What's Been Set Up

### 1. Core Configuration
- ✅ `next-intl` installed and configured
- ✅ Translation files: `/messages/en.json` and `/messages/de.json`
- ✅ i18n config: `/src/i18n/config.ts` and `/src/i18n/request.ts`
- ✅ Middleware for locale routing
- ✅ App directory restructured with `[locale]` routing
- ✅ Database migration for language support

### 2. Components Updated
- ✅ Login page (`/app/[locale]/auth/login/page.tsx`)
- ✅ Dashboard navigation (`/components/dashboard/nav.tsx`)
- ✅ Dashboard page (`/app/[locale]/dashboard/page.tsx`)
- ✅ Language switcher component (`/components/language-switcher.tsx`)

### 3. Database Changes
Run this migration to add language support:
```bash
# Apply the migration
supabase db push
```

The migration adds:
- `language` column to `projects` table (stores content language)
- `preferred_language` column to `profiles` table (stores user UI preference)

## How to Use Translations

### In Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export function MyComponent() {
  const t = useTranslations('dashboard'); // Use namespace from messages
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href={`/${locale}/dashboard`}>
        {t('myGifts')}
      </Link>
    </div>
  );
}
```

### In Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### Linking Between Pages

Always include the locale in your links:

```tsx
import { useParams } from 'next/navigation';
import Link from 'next/link';

export function MyComponent() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <Link href={`/${locale}/dashboard/projects/${id}`}>
      View Project
    </Link>
  );
}
```

### Using the Language Switcher

The language switcher is already added to the dashboard navigation. To add it elsewhere:

```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

export function MyNav() {
  return (
    <nav>
      <LanguageSwitcher />
    </nav>
  );
}
```

## Translation File Structure

All translations are organized by feature area:

```json
{
  "app": {
    "name": "joyo",
    "tagline": "Create beautiful, emotional gift journeys"
  },
  "auth": {
    "login": {
      "title": "Sign in to joyo",
      "emailLabel": "Email address",
      ...
    }
  },
  "dashboard": {
    "nav": {
      "myGifts": "My Gifts",
      "signOut": "Sign Out"
    },
    "title": "My Gifts",
    ...
  },
  ...
}
```

## Components Still To Update

Here's a checklist of remaining components that need translation updates:

### High Priority (User-Facing)

#### Chat Interface
- [ ] `/app/[locale]/dashboard/new/page.tsx` - Chat page wrapper
- [ ] `/components/chat/chat-interface.tsx` - Main chat UI
  - Update: title, subtitle, placeholder, button text
  - Update: All 12 example prompts with categories
  - Use translations: `chat.title`, `chat.examples.romantic1.title`, etc.

#### Flow Editor
- [ ] `/app/[locale]/dashboard/projects/[id]/page.tsx` - Editor page
- [ ] `/components/editor/flow-editor.tsx` - Main editor
  - Update: Headers, buttons, theme names
  - Use translations: `editor.header.screens`, `editor.toolbar.publish`, etc.

#### Node Editor
- [ ] `/components/editor/node-editor.tsx`
  - Update: All form labels, placeholders, buttons
  - Use translations: `editor.nodeEditor.labels.headline`, etc.

#### Publish Dialog
- [ ] `/components/editor/publish-dialog.tsx`
  - Update: Dialog titles, descriptions, buttons, toast messages
  - Use translations: `editor.publish.dialog.publishTitle`, etc.

#### Player Screens
- [ ] `/components/player/player.tsx` - Main player wrapper
- [ ] `/components/player/screens/hero-screen.tsx` - Continue button
- [ ] `/components/player/screens/choice-screen.tsx` - Continue button with count
- [ ] `/components/player/screens/text-input-screen.tsx` - Placeholder, character count
- [ ] `/components/player/screens/reveal-screen.tsx` - Continue button
- [ ] `/components/player/screens/media-screen.tsx` - Continue button
- [ ] `/components/player/screens/end-screen.tsx` - Any final text

Use translations like: `player.buttons.continue`, `player.textInput.placeholder`

### Medium Priority

#### Theme Selector
- [ ] Create/update theme selector dialog
  - Use translations: `editor.theme.names.playful-pastel`, `editor.theme.descriptions.*`

#### Delete Confirmation
- [ ] Find or create delete confirmation dialog
  - Use translations: `editor.deleteConfirm.title`, `editor.deleteConfirm.description`

### AI Flow Generator

The AI system prompt needs to be language-aware:

```typescript
// In /lib/ai/flow-generator.ts

export async function generateFlow(
  userPrompt: string,
  language: 'en' | 'de' = 'en'
) {
  const systemPrompt = language === 'de'
    ? `Du bist ein KI-Assistent... [German system prompt]`
    : `You are an AI assistant... [English system prompt]`;

  // Add language instruction
  const languageInstruction = language === 'de'
    ? '\n\nWICHTIG: Generiere alle Inhalte (Überschriften, Texte, Fragen) auf Deutsch.'
    : '\n\nIMPORTANT: Generate all content (headlines, text, questions) in English.';

  // ... rest of generation logic
}
```

**Steps to update:**
1. Add `language` parameter to `generateFlow` function
2. Update system prompt to include language instructions
3. Pass language from project creation form
4. Store language in `projects.language` database field

## Testing Checklist

- [ ] Visit `/en` and `/de` routes - both should work
- [ ] Language switcher changes URL and updates UI text
- [ ] Login page shows correct translations
- [ ] Dashboard shows correct translations
- [ ] All links include locale prefix (`/${locale}/...`)
- [ ] Creating a new project stores the language
- [ ] AI generates content in the selected language
- [ ] Player shows content in correct language

## Adding New Translations

1. Add the key to both `/messages/en.json` and `/messages/de.json`
2. Use the translation in your component with `useTranslations()` or `getTranslations()`
3. Test in both languages

## Common Patterns

### Dynamic Values

```tsx
// Character count with variables
{t('player.textInput.characterCount', {
  current: value.length,
  max: maxLength
})}

// Multiple selected items
{t('player.buttons.continueWithSelection', { count: selected.length })}
```

### Conditional Text

```tsx
{loading ? t('common.loading') : t('common.save')}
```

### Server vs Client

- **Client components** (`'use client'`): Use `useTranslations()`
- **Server components**: Use `await getTranslations()`
- Always get params for locale: `params.locale` in server, `useParams()` in client

## Example: Update a Component

Before:
```tsx
export function MyButton() {
  return <button>Create New Gift</button>;
}
```

After (Client Component):
```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyButton() {
  const t = useTranslations('dashboard');
  return <button>{t('createNew')}</button>;
}
```

After (Server Component):
```tsx
import { getTranslations } from 'next-intl/server';

export async function MyButton() {
  const t = await getTranslations('dashboard');
  return <button>{t('createNew')}</button>;
}
```

## Troubleshooting

### "Locale not found" error
Make sure all routes include the `[locale]` segment in the path.

### Translations not updating
Clear your browser cache and restart the dev server.

### Link gives 404
Check that you're including `/${locale}` in all internal links.

### Missing translation key
Check that the key exists in both `en.json` and `de.json`.

## Next Steps

1. Update remaining components (see checklist above)
2. Update AI flow generator to support language parameter
3. Add language selector to project creation flow
4. Test all flows in both languages
5. Consider adding more languages in the future

## Adding a New Language

To add a new language (e.g., French):

1. Add locale to `/src/i18n/config.ts`:
```ts
export const locales = ['en', 'de', 'fr'] as const;
export const localeNames = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};
```

2. Create `/messages/fr.json` with all translations

3. Update database migration to include 'fr' in CHECK constraints

4. Test thoroughly!

---

**Questions?** Check the [next-intl documentation](https://next-intl-docs.vercel.app/) for more details.
