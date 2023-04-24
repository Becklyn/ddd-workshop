# Becklyn DDD workshop

## Preparation

1. Copy `.env.template` to `.env.local`
2. Get a GitHub token with read access to Becklyn's private docker containers.
3. Add the token to the `GH_ACCESS_TOKEN` variable in your `.env.local` file
4. Make sure you have docker installed on your machine. [Docker Desktop](https://docs.docker.com/engine/install/) is recommended (but not required) for this workshop.
5. If you are using windows: [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

## Download and run our Fraym services

### MacOS / linux

The following command will:

1. download all Fraym docker containers
2. configure and run all Fraym docker containers

```sh
make docker
```

### Windows

Use WSL and then use the linux guide.

## Start the dev server for the backend app

Before you start the dev server the first time, please make sure to build all dpendency modules:

```sh
npm run build:backend
```

Run the dev server:

```sh
npm run dev
```

## Documentation of our Fraym libraries

- [@fraym/streams](https://github.com/fraym/streams-nodejs)
- [@fraym/projections](https://github.com/fraym/projections-nodejs)
- [@fraym/crud](https://github.com/fraym/crud-nodejs)
- [@fraym/auth](https://github.com/fraym/auth-nodejs)
