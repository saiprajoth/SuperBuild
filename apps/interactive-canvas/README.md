# Interactive Canvas (A001 feature)

Here we are creating a base for the application; all other functionalities that will be built further will be assembled here.

Below is the **application progress** and the **architectural diagram** of the Interactive Canvas.

---

## Architecture Diagram

![A001 Interactive Canvas Architecture](./A001-architecture.png)

---

## Application Progress

<video src="./A001-application-progress.mp4" controls width="100%"></video>


## Scripts - these are for the developer's(me) readability. you can ignore it for now.

### Dev / Build
- `npm run dev`  
  Starts the Vite dev server (local development).

- `npm run build`  
  Builds the production bundle into `dist/`.

- `npm run preview`  
  Serves the `dist/` build locally to verify the production build.

### Code Quality
- `npm run lint`  
  Runs ESLint across the project to catch style + code issues.

### Unit Tests (Vitest)
- `npm run test`  
  Runs Vitest in watch mode (interactive while you code).

- `npm run test:unit`  
  Runs all unit tests once (best for CI).

- `npm run test:ui`  
  Opens Vitest UI to browse and run tests interactively.

### End-to-End Tests (Playwright)
- `npm run test:e2e`  
  Runs Playwright E2E tests headlessly (CI style).

- `npm run test:e2e:ui`  
  Runs Playwright with UI so you can watch, debug, and inspect.

### Full Test Suite
- `npm run test:all`  
  Runs both unit + E2E tests in sequence.

### Smoke Test (A001 Regression Guard)
- `npm run smoke:a001`  
  Runs a lightweight “does A001 still work?” script (undo/redo, selection, delete, etc. depending on your script).


