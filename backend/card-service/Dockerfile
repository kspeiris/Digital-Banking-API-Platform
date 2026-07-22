FROM node:22-alpine

WORKDIR /usr/src/app

# Copy shared common library
COPY backend/shared-common ./backend/shared-common
RUN cd backend/shared-common && npm install && npm run build

# Copy card-service
COPY backend/card-service ./backend/card-service
RUN cd backend/card-service && npm install && npm run build

# Copy database for prisma schema
COPY database ./database
COPY package.json package-lock.json ./
RUN npm install && npx prisma generate --schema=database/prisma/schema.prisma

EXPOSE 3006

CMD ["node", "backend/card-service/dist/index.js"]
