# ---- Build stage: compile the SPA -----------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Public (VITE_) build-time config can be baked in here if desired, e.g.:
#   ARG VITE_SEASON
#   ENV VITE_SEASON=$VITE_SEASON
RUN npm run build

# ---- Runtime stage: serve dist/ + proxy -----------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only production deps (express) in the runtime image.
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server ./server

EXPOSE 3000
CMD ["node", "server/index.js"]
