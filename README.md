# 📚 Kurumi [![Build Status](<https://ci.danielraybone.com/app/rest/builds/buildType:(id:Notes_LintBuild)/statusIcon>)](https://ci.danielraybone.com/buildConfiguration/Notes_LintBuild?mode=branches&guest=1)

A simple note taking web app built with NextJS, Monaco (VSCode Editor), MySQL, tRPC and more cool shit.

## Development

Install dependencies

```bash
yarn install
```

Start dev server

```bash
yarn dev
```

## Deployment

Build files

```
yarn build
```

Start NextJS server

```
yarn start
```

## Features

-   [x] Auto saving
-   [x] Auto syncing between clients (Current impl is bad, but this does work)
-   [x] Multiple notes
-   [x] Dark & light mode
-   [x] Update notes via API
-   [x] Private notes
-   [ ] Public notes
-   [ ] Multi user (with profiles)
-   [ ] Note Templates
-   [ ] Archived notes
-   [ ] Revision system
-   [ ] Search notes
-   [ ] Language selector
-   [ ] Note categories
