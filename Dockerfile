#Test deployments panel
FROM node:20-alpine3.18 AS builder

WORKDIR /app

COPY apps/admin/package*.json ./apps/admin/

WORKDIR /app/apps/admin
RUN npm install --legacy-peer-deps

COPY apps/admin ./ 
RUN npm run build

FROM node:20-alpine3.18 AS runner

WORKDIR /app

COPY --from=builder /app/apps/admin/package*.json ./
COPY --from=builder /app/apps/admin/.next ./.next
COPY --from=builder /app/apps/admin/public ./public
COPY --from=builder /app/apps/admin/next.config.mjs ./

RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000
CMD ["npm", "run", "start"]
