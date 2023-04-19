# Becklyn DDD workshop

## Preparation

1. Copy `.env.template` to `.env.local`
2. Get a GitHub token with read access to Becklyn's private docker containers.
3. Add the token to the `GH_ACCESS_TOKEN` variable in your `.env.local` file
4. Make sure you have docker installed on your machine. [Docker Desktop](https://docs.docker.com/engine/install/) is recommended (but not required) for this workshop.

## Download and run our Fraym services

### MacOS / linux

The following command will:

1. download all Fraym docker containers
2. configure and run all Fraym docker containers

```sh
make docker
```

### Windows

@todo

## Start the dev server for the backend app

@todo
