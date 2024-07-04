FROM ubuntu:24.04

# RUN apt-get update && apt-cache policy unzip > /var/log/apt-cache-policy-curl.log

# CMD [ "cat", "/var/log/apt-cache-policy-curl.log" ]

RUN apt-get update && apt-get install --no-install-recommends -y \
  curl=8.5.0-2ubuntu10.1 \
  ca-certificates=20240203 \
  unzip=6.0-28ubuntu4 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -fsSL https://deno.land/install.sh | sh

RUN /root/.deno/bin/deno upgrade --version 1.44.4

WORKDIR /app

COPY . .

RUN /root/.deno/bin/deno compile -A ./cli.ts --output dxeco-runner-v2

CMD ["/app/dxeco-runner-v2"]
