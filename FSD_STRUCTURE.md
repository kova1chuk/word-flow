# Feature-Sliced Design (FSD) Structure

This project has been restructured to follow the Feature-Sliced Design architecture with Redux Toolkit (RTK).

## Folder Structure

```
src/
├── app/                        # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   ├── store.ts               # Root RTK store config
│   └── providers/             # App-level providers
│       └── StoreProvider.tsx
├── shared/                     # Shared utils, constants, libs
│   ├── config/                 # App config
│   ├── types/                  # Global TS types
│   ├── ui/                     # Shared UI components
│   └── index.ts
├── entities/                   # Core domain models
│   ├── user/                   # User entity
│   └── word/                   # Word entity
├── features/                   # Feature-level logic
├── widgets/                    # Widgets
└── processes/                  # App-wide processes
```

## Key Changes

### 1. Redux Toolkit Integration
- Centralized state management with RTK
- Modular state slices for each entity
- Memoized selectors for efficient data access

### 2. Entity Layer
- **User Entity**: Authentication state management
- **Word Entity**: Word management with CRUD operations

### 3. Shared Layer
- **Config**: Centralized configuration management
- **Types**: Global TypeScript interfaces
- **UI**: Reusable UI components

## Migration Status

- ✅ **Store Setup**: RTK store configured
- ✅ **User Entity**: Auth slice and selectors implemented
- ✅ **Word Entity**: Word slice and selectors implemented
- ✅ **Shared Layer**: Config, types, and basic UI components
- 🔄 **Components Migration**: In progress 