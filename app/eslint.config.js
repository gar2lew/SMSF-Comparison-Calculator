import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.*',
      'supabase/**',
      'src/components/crm/**',
      'src/hooks/useAuth.ts',
      'src/pages/ClientDetailPage.tsx',
      'src/pages/ClientsPage.tsx',
      'src/pages/ProjectionWorkspace.tsx',
      'src/pages/ProjectionsPage.tsx',
      'src/pages/ReportsPage.tsx',
      'src/pages/SettingsPage.tsx',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
)
