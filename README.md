# impresso-frontend

Welcome to the _impresso_ app frontend website to search, explore and create personal collections from the 40 millions (and counting!) newspapers articles of the _impresso_ collection.

## Install for development

This is a website that uses vue3. To install the dependencies, run:

```sh
npm install
```

If required, cnfigure Vue proxy to `api` and `socket.io` in `.env.development`. Do not put any slash at the end of the env variables:

```sh
VITE_MIDDLELAYER_API="https://...."
VITE_MIDDLELAYER_API_PATH="/api"
VITE_MIDDLELAYER_API_SOCKET_PATH="/api/socket.io"
```

To use vue proxy while developing, add this env variable to your `.env.development.local` file:

```sh
VITE_USE_PROXY_MIDDLEWARE=true
```

Finally run with:

```
npm run dev
```

## AI Coding Assistant Configuration

This project includes configuration files for AI coding assistants to help maintain consistency and follow project conventions:

- **`.github/copilot-instructions.md`**: Instructions for GitHub Copilot
- **`.cursorrules`**: Instructions for Claude (Cursor IDE) and other AI assistants

These files contain important information about:
- Project structure and architecture
- Vue 3 composition API patterns
- TypeScript conventions
- Component development guidelines
- i18n usage patterns
- Storybook story conventions

When working with AI coding assistants, these configurations ensure generated code follows the project's established patterns and conventions.

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serve

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Project

The 'impresso - Media Monitoring of the Past' project is funded by the Swiss National Science Foundation (SNSF) under grant number [CRSII5_173719](http://p3.snf.ch/project-173719) (Sinergia program). The project aims at developing tools to process and explore large-scale collections of historical newspapers, and at studying the impact of this new tooling on historical research practices. More information at https://impresso-project.ch.

## License

Copyright (C) 2020 The _impresso_ team. Contributors to this program include: [Daniele Guido](https://github.com/danieleguido), [Thijs van Beek](https://github.com/tvanbeek), [Paul Schroeder](https://github.com/PaulSchroeder), [Roman Kalyakin](https://github.com/theorm).
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but without any warranty; without even the implied warranty of merchantability or fitness for a particular purpose. See the [GNU Affero General Public License](https://github.com/impresso/impresso-frontend/blob/master/LICENSE) for more details.
