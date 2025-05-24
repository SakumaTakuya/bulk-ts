# Coding Conventions

This document outlines the coding conventions and best practices to be followed in this project. It covers TypeScript, Next.js, and React, along with general formatting and naming guidelines.

## Table of Contents

1.  [General Formatting](#general-formatting)
2.  [Naming Conventions](#naming-conventions)
3.  [TypeScript Specifics](#typescript-specifics)
4.  [React Specifics](#react-specifics)
5.  [Next.js Specifics](#nextjs-specifics)
6.  [Comments and Documentation](#comments-and-documentation)
7.  [Error Handling](#error-handling)
8.  [Modularity and Code Structure](#modularity-and-code-structure)
9.  [Tooling](#tooling)

## 1. General Formatting

- **Indentation:** Use 2 spaces for indentation. Do not use tabs.
- **Line Length:** Aim for a maximum line length of 80-100 characters for better readability.
- **Semicolons:** Always use semicolons at the end of statements. Do not rely on Automatic Semicolon Insertion (ASI).
- **Quotes:** Use single quotes (`'`) for strings. Use template literals (`` ` ``) for strings with interpolation or multi-line strings.
- **Whitespace:**
  - Use ASCII horizontal space (0x20) as the only whitespace character. Other whitespace in strings must be escaped.
  - Avoid trailing whitespace.
  - Use single blank lines to separate logical blocks of code.
- **Braces:** Always use braces (`{}`) for control flow statements (`if`, `else`, `for`, `while`, `do`), even if the body contains only a single statement. The opening brace should be on the same line as the statement, and the closing brace on a new line.
- **File Encoding:** UTF-8.

## 2. Naming Conventions

- **General:**
  - Use descriptive and clear names.
  - Avoid abbreviations that are ambiguous or unfamiliar.
  - Do not use leading or trailing underscores (e.g., `_privateMember`).
  - Treat acronyms as whole words in camelCase (e.g., `loadHttpUrl`, not `loadHTTPURL`).
- **Variables and Functions:**
  - Use `lowerCamelCase` (e.g., `myVariable`, `calculateValue`).
- **Constants:**
  - Use `CONSTANT_CASE` (all uppercase with underscores) for values intended to be immutable and are globally accessible (module-level, static class fields, enum values). (e.g., `MAX_USERS`, `API_KEY`).
  - For local constants within a function or class instances that don't change, `lowerCamelCase` is acceptable if preferred, but `CONSTANT_CASE` can also be used if the value is truly fixed.
- **Classes, Interfaces, Types, Enums:**
  - Use `UpperCamelCase` (e.g., `UserService`, `HttpResponse`, `StatusType`, `UserRole`).
  - Do not prefix interfaces with `I` (e.g., use `User` not `IUser`).
- **Type Parameters (Generics):**
  - Use a single uppercase letter (e.g., `T`, `U`, `K`, `V`) or `UpperCamelCase` for descriptive names (e.g., `TResponse`, `TError`).
- **Files and Folders:**
  - Use `kebab-case` for file and folder names (e.g., `user-service.ts`, `auth-components`).
  - Component files in Next.js/React should be `UpperCamelCase.tsx` (e.g., `UserProfile.tsx`).
  - Next.js specific files follow their conventions (e.g., `page.tsx`, `layout.tsx`, `route.ts`).
- **Module Namespace Imports:**
  - Use `lowerCamelCase` (e.g., `import * as userService from './user-service';`).

## 3. TypeScript Specifics

- **`any` Type:**
  - **Avoid using `any`**. It undermines the benefits of TypeScript.
  - Prefer specific types, `unknown` (and then perform type checking/narrowing), or generics.
  - If `any` is absolutely necessary (e.g., mocking in tests, dealing with truly dynamic data from external un-typed sources), document the reason clearly with a comment and consider suppressing lint warnings locally if appropriate.
- **Type Definitions:**
  - Prefer `interface` over `type` aliases for defining object shapes, as interfaces are more extensible.
  - Use `type` for primitives, unions, tuples, or other complex types that `interface` cannot represent.
  - Do not include `|null` or `|undefined` in type aliases directly. Add these where the type is actually used to make nullability explicit at the point of use.
  - Prefer optional properties/parameters (`foo?: string`) over union with `undefined` (`foo: string | undefined`).
- **Enums:**
  - Use plain `enum`. Do not use `const enum` (as it can have inlining behavior that makes debugging harder and is not standard JavaScript).
  - Enum values should be `UpperCamelCase` or `CONSTANT_CASE` depending on team preference, but be consistent.
  - Do not convert enum values to booleans directly (e.g., `if (myEnum)`). Compare them explicitly (e.g., `if (myEnum === MyEnum.ValueA)`), especially since the first enum value defaults to `0` which is falsy.
- **Type Inference:**
  - Rely on type inference where it's clear and doesn't sacrifice readability.
  - Provide explicit type annotations for complex types, function return types (especially for exported functions), or when initializing generics with no values (e.g., `const items: MyType[] = [];`).
- **Type Assertions:**
  - Avoid type assertions (`value as MyType` or `<MyType>value`). They are unsafe as they don't perform runtime checks.
  - If an assertion is unavoidable, ensure the reasoning is clear via comments.
  - Use the `as` syntax (`value as MyType`).
  - For object literals, use type annotations (`const obj: MyType = {...}`) instead of assertions (`{...} as MyType`).
- **Visibility Modifiers:**
  - Limit symbol visibility as much as possible.
  - Do not use the `public` modifier unless necessary (e.g., for non-`readonly` parameter properties in constructors). Properties are public by default.
  - Use `private` or `protected` appropriately.
  - Do not use `#private` fields (private identifiers). Use TypeScript's `private` keyword.
- **`readonly` Modifier:**
  - Use `readonly` for properties that are never reassigned outside the constructor.
- **Parameter Properties:**
  - Use parameter properties in constructors for conciseness (e.g., `constructor(private readonly userService: UserService)`).
- **Non-null Assertion Operator (`!`):**
  - Avoid using the non-null assertion operator (e.g., `value!`). It's unsafe and silences compiler checks.
  - Prefer explicit null/undefined checks or type guards.
- **Modules:**
  - Use ES6 modules (`import`/`export`).
  - Do not use TypeScript `namespace` keyword for internal organization. Use files/modules.
  - Prefer named exports. **Do not use default exports.**
  - Use `import type {...}` for type-only imports and `export type {...}` for type re-exports.
- **Strictness Flags:**
  - Enable `strictNullChecks`, `noImplicitAny`, and other `strict` mode flags in `tsconfig.json`.

## 4. React Specifics

- **Component Definition:**
  - Prefer functional components with Hooks over class components.
  - Component names must be `UpperCamelCase`.
- **JSX:**
  - Component names in JSX must start with a capital letter. HTML tags must be lowercase.
  - Always close tags (e.g., `<br />`).
  - Components must return a single root element (use `<div>` or fragments `<>...</>`).
  - Use `className` instead of `class` for CSS classes.
  - Embed JavaScript expressions in JSX using curly braces `{}`.
- **Props:**
  - Define prop types using TypeScript interfaces or types.
  - Destructure props for clarity: `function MyComponent({ userId, name }: MyComponentProps)`.
- **State Management:**
  - Use the `useState` Hook for component-level state.
  - For complex state logic, consider `useReducer`.
  - For sharing state between distant components, use `Context` API or a dedicated state management library (e.g., Zustand, Redux) if the application complexity warrants it.
  - Lift state up to the nearest common ancestor when multiple components need to share or react to the same state.
- **Hooks:**
  - Only call Hooks at the top level of functional components or custom Hooks.
  - Do not call Hooks inside loops, conditions, or nested functions.
  - Custom Hooks should start with `use` (e.g., `useUserData`).
- **Event Handling:**
  - Pass event handler functions directly (e.g., `onClick={handleClick}`), not as a function call (`onClick={handleClick()}`).
- **Conditional Rendering:**
  - Use JavaScript expressions: ternary operator (`condition ? <A /> : <B />`), logical AND (`condition && <A />`), or `if` statements outside JSX.
- **Rendering Lists:**
  - Use the `map()` method to render lists of components.
  - Always provide a unique `key` prop for each item in a list, preferably a stable ID from your data.
- **Purity:**
  - Components should be pure with respect to their props. Given the same props, they should always render the same output and not cause side effects during rendering.

## 5. Next.js Specifics

- **App Router vs. Pages Router:** This project uses the App Router. Conventions below apply to the App Router.
- **File-System Routing:**
  - Adhere to Next.js file-system routing conventions (`page.tsx`, `layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`).
  - Organize routes logically within the `app` directory.
- **Server Components and Client Components:**
  - By default, components inside the `app` directory are Server Components.
  - Use Server Components whenever possible for better performance (run on the server, zero client-side JavaScript).
  - Use the `"use client"` directive at the top of a file to mark it and its imported children as Client Components. Client Components are needed for interactivity, event listeners, state, lifecycle effects (`useState`, `useEffect`), and browser-only APIs.
  - Minimize the amount of code marked as Client Components. If possible, pass Server Components as children to Client Components.
- **Data Fetching:**
  - Fetch data in Server Components using `async/await`.
  - Next.js extends `fetch` for automatic request deduping, caching, and revalidation.
  - For mutations or data updates, use Server Actions. Define them in Server Components or in separate files with `"use server"`.
  - Type your fetched data. With Server Components, data doesn't need to be serialized, so types like `Date`, `Map`, `Set` can be used directly.
- **Typed Links:**
  - Enable `experimental.typedRoutes: true` in `next.config.js` for statically typed links with `<Link href="...">`.
  - For dynamic non-literal strings, manually cast the `href` with `as Route` (e.g., `<Link href={(\`/blog/\${slug}\`) as Route} />`).
- **`next.config.js` / `next.config.ts`:**
  - Use `next.config.ts` for type safety in your Next.js configuration.
- **Custom Type Declarations:**
  - If you need to extend Next.js's default types or add global types, create a new `.d.ts` file (e.g., `additional.d.ts`) and include it in your `tsconfig.json`. Do not modify `next-env.d.ts`.
- **IDE Plugin:**
  - Enable the Next.js TypeScript plugin in VS Code ("Use Workspace Version") for advanced type-checking and autocompletion specific to Next.js features.

## 6. Comments and Documentation

- **JSDoc:**
  - Use JSDoc (`/** ... */`) for documenting exported functions, classes, methods, types, and interfaces.
  - Use clear and concise language. Describe what the code does, its parameters, and its return values.
  - Do not use JSDoc type annotations (e.g., `@param {string} name`) in TypeScript code; use TypeScript's type annotations instead.
  - Use `@param`, `@returns`, `@deprecated` as needed.
  - JSDoc should precede decorators.
- **Implementation Comments:**
  - Use single-line comments (`//`) for explaining complex or non-obvious parts of the implementation.
  - Avoid redundant comments that merely restate the code.
  - Keep comments up-to-date with code changes.
- **`@fileoverview`:**
  - A file may have a top-level JSDoc comment with `@fileoverview` to describe its purpose.

## 7. Error Handling

- **Throw `Error` Objects:** Always throw instances of `Error` (or subclasses) for exceptions. Do not throw strings or other plain objects. This ensures stack traces are available.
- **Catch Specific Errors:** When possible, catch specific error types rather than generic `Error` or `any`.
- **Handle Promise Rejections:** Always handle promise rejections, typically with `.catch()` or `try/catch` with `async/await`.
- **User-Facing Errors:** Provide clear and user-friendly error messages for errors that propagate to the UI.
- **Next.js Error Handling:** Utilize `error.tsx` files to define error UI boundaries for specific route segments. Use `try/catch` in Server Components and Server Actions.

## 8. Modularity and Code Structure

- **Single Responsibility Principle:** Functions, classes, and modules should ideally have a single responsibility.
- **File Structure:**
  - Organize files and folders logically by feature or domain.
  - Colocate components with their styles and tests where appropriate.
- **Reusability:** Create reusable components and utility functions to avoid code duplication.
- **Barrel Files (`index.ts`):**
  - Use `index.ts` files to re-export modules from a directory for cleaner imports.
  - Example: `import { UserService, ProductService } from './services';` instead of multiple import lines.
- **Avoid Circular Dependencies:** Structure code to prevent circular dependencies between modules.

## 9. Tooling

- **TypeScript Compiler (tsc):**
  - All code must pass type checking.
  - Enable strict compiler options in `tsconfig.json` (e.g., `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
  - Do not use `@ts-ignore`, `@ts-expect-error` (except potentially in tests with extreme caution and clear justification), or `@ts-nocheck`.
- **ESLint & Prettier:**
  - This project should be configured with ESLint for code quality and Prettier for consistent formatting.
  - Adhere to the configured linting and formatting rules. Run formatters before committing.
- **Next.js TypeScript Plugin:**
  - Ensure this is enabled in your IDE (VS Code) for better development experience.

This document serves as a living guide. Conventions may evolve, and suggestions for improvement are welcome.
