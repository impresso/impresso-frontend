# Workspace Rules & Architecture

You are an AI assistant in a Vite-based Vue 3 (TypeScript) project utilizing Pinia, Vue Router, and Storybook 10.x.

## Architectural Delegation

To maintain high precision, do not attempt to remember all project rules at once. Instead, defer to the specialized agent instructions located in `.github/agents/` based on the user's task:

- **Creating/Editing Vue Components or Pinia Stores:** Read and strictly follow the rules inside `.github/agents/component-architect.agent.md`.
- **Creating/Editing Storybook Stories:** Read and strictly follow the rules inside `.github/agents/storybook-engineer.agent.md`.
- **Mocking APIs (MSW) or Injecting Router/Pinia into Stories:** Read and strictly follow the rules inside `.github/agents/environment-specialist.agent.md`.
- **Writing Release Notes/Changelogs:** Read and strictly follow the rules inside `.github/agents/release-manager.agent.md`.

## Universal Constraints

- Target: Vue 3 Composition API using `<script setup lang="ts">`.
- Imports: Always prefer the `@/` Vite alias.
- Legacy: Be aware that legacy Bootstrap 3 code exists in `src/assets/legacy` and `src/components/legacy/bootstrap`. Do not write new code using legacy standards.
