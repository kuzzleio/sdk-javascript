FROM node:20-bookworm-slim

USER root

RUN mkdir -p /home/node/.cache/puppeteer

# Puppeteer Chrome headless dependencies
RUN apt-get update && apt-get install -y \
        ca-certificates \
        curl \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgbm1 \
        libgcc1 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        wget \
        xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Install all dependencies needed for both services
RUN npm install -g \
    puppeteer \
    eslint@8.38.0 \
    eslint-plugin-html \
    eslint-plugin-import \
    eslint-plugin-node \
    eslint-plugin-promise \
    eslint-plugin-standard \
    babel-loader \
    @babel/core \
    html-webpack-plugin \
    webpack \
    webpack-cli

RUN usermod -a -G video,audio node

# Create working directories for snippets
RUN mkdir -p /var/snippets/web && \
    mkdir -p /var/snippets/webpack

# Set proper permissions
RUN chown -R node:node /var/snippets/
RUN chown -R node:node /home/node/.cache/puppeteer

USER node

# Keep container running
CMD ["tail", "-f", "/dev/null"]
