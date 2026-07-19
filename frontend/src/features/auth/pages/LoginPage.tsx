// Re-export the existing LoginPage.jsx as the auth feature's page.
// This preserves the original implementation while placing it in the feature structure.
// Migrate to LoginPage.tsx when ready to add React Hook Form + Zod validation.
export { default } from '@/pages/LoginPage'
