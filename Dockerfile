## build runner
FROM oven/bun:latest as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Update npm
RUN bun upgrade

# Install dependencies
RUN bun install

# Move source files
COPY src ./src
COPY tsconfig.json   .

# Build project
RUN bun run build

# Start bot
CMD [ "bun", "run", "start" ]