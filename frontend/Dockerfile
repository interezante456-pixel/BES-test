FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY src ./src
COPY public ./public
COPY next.config.* ./
COPY tsconfig.json ./
COPY postcss.config.* ./
COPY tailwind.config.* ./

# Argumento de compilación para inyectar la URL del backend en la build estática de Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

USER node

EXPOSE 3000

CMD ["npm", "start"]
