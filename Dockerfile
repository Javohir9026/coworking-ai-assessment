FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3001
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
