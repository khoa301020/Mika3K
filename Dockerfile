## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json ./

# Update npm
RUN npm install -g npm@latest

# Install dependencies
RUN npm install

# Move source files
COPY src ./src
COPY nest-cli.json tsconfig.build.json tsconfig.json ./

# Build project
RUN npm run build

## production runner (Debian slim for Playwright/Chromium glibc compatibility)
FROM node:lts-slim as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json
COPY --from=build-runner /tmp/app/package.json ./

# Update npm
RUN npm install -g npm@latest

# Install dependencies
RUN npm install --omit=dev

# Move build files
COPY --from=build-runner /tmp/app/dist ./dist

# Start bot
CMD [ "node", "dist/main.js" ]

