FROM oven/bun@sha256:1d22548f177f4ff38e0c15baa3c2c46c6c2060ba2d1bc573bb4720b407548f1d
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY scripts/bootstrap.ts scripts/toolchain.ts ./scripts/
RUN bun scripts/bootstrap.ts && .tools/stable/package/bin/bun install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD [".tools/stable/package/bin/bun", "apps/api/src/main.ts"]
