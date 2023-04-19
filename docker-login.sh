#!/bin/bash

GITHUB_TOKEN=""

echo $(GH_ACCESS_TOKEN) | docker login ghcr.io -u hosting+github@becklyn.com --password-stdin

docker pull ghcr.io/fraym/streams/streams:$(streamsVersion)
docker pull ghcr.io/fraym/projections/projections:$(projectionsVersion)
docker pull ghcr.io/fraym/crud/crud:$(crudVersion)
docker pull ghcr.io/fraym/auth/auth:$(authVersion)
docker pull ghcr.io/fraym/admin-ui/adminui:$(adminuiVersion)

docker logout ghcr.io
