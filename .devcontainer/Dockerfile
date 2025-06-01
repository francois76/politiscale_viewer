FROM mcr.microsoft.com/devcontainers/base:debian

# Install essential packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

USER vscode
# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/home/vscode/.bun/bin:${PATH}"

# Install global packages (typescript is included with Bun)
RUN bun install -g vite