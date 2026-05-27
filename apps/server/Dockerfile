FROM node:20 AS builder

WORKDIR /usr/src/app

# Install all dependencies (including dev) so we can run the Vite build
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build (this generates dist/dashboard)
COPY . .
RUN npm run build


FROM node:20 AS runner
WORKDIR /usr/src/app

# Install only production dependencies for the final image
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy built artifacts and static assets from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/static ./static

# Copy server source (needed if runtime requires files outside dist)
COPY --from=builder /usr/src/app/dist/index.js ./dist/index.js

# Default command to start the Vendure server
CMD ["node", "./dist/index.js"]
