FROM ubuntu:24.04

RUN apt-get update && apt-get install --no-install-recommends -y \
  curl=8.5.0-2ubuntu10.1 \
  ca-certificates=20240203 \
  unzip=6.0-28ubuntu4 \
  chromium-browser=2:1snap1-0ubuntu2 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -fsSL https://deno.land/install.sh | sh

RUN /root/.deno/bin/deno upgrade --version 1.44.4

WORKDIR /app

COPY . .

RUN /root/.deno/bin/deno compile -A --output dxeco-runner-v2 ./cli.ts

ENTRYPOINT ["./dxeco-runner-v2"]
