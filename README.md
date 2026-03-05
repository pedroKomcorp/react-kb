# React KB Frontend

## Run with Docker Compose (port 5173)

```bash
docker compose up --build
```

App URL: `http://localhost:5173`

## Run locally

```bash
npm ci
npm run dev
```

## Run GitHub Actions locally with `act`

This repository includes `.github/workflows/ci.yml` and `.actrc`.

Run CI job locally:

```bash
act -j build -W .github/workflows/ci.yml
```

Run all workflows locally:

```bash
act
```

## Local deploy with `act`

The deploy workflow pulls the latest `master` from `pedroKomcorp/react-kb`, builds Docker image, and recreates container exposing `0.0.0.0:5173`.

```bash
act workflow_dispatch -W .github/workflows/deploy.yml
```

If the repository is private, pass a token:

```bash
act workflow_dispatch -W .github/workflows/deploy.yml -s PULL_TOKEN=<github_token>
```
