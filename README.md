wanda

## Development

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

### Environment (optional Supabase)

Create a `.env` file at the project root with:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If not set, the app will fallback to localStorage only.

### Data seeding

Dummy data seeding has been removed. Clear existing local data via the Reset button on the Dashboard, or run in devtools:

```js
localStorage.removeItem('twist-data')
```
