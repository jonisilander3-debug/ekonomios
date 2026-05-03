# Ubuntu deploy for Ekonomi OS

Det här projektet körs som:

- `@ekonomi/web` på port `3000`
- `@ekonomi/api` på port `4000`
- PostgreSQL lokalt på servern
- Nginx framför båda apparna
- PM2 för processhantering
- publik domän: `os.jompalompa.com`

## 1. Installera grundpaket på Ubuntu

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
corepack enable
```

Verifiera:

```bash
node -v
npm -v
pm2 -v
pnpm -v
```

## 2. Peka domänen rätt

Skapa en DNS-post hos din DNS-leverantör:

- typ: `A`
- host: `os`
- value: `<din-server-ip>`

Det ska göra att:

- `os.jompalompa.com` pekar på din Ubuntu-server

## 3. Lägg projektet på servern

Exempelplats:

```bash
sudo mkdir -p /var/www/ekonomi-os
sudo chown -R $USER:$USER /var/www/ekonomi-os
cd /var/www/ekonomi-os
```

Antingen:

```bash
git clone <din-repo-url> /var/www/ekonomi-os
```

eller ladda upp projektfilerna manuellt till samma mapp.

## 4. Skapa PostgreSQL-databas

```bash
sudo -u postgres psql
```

Kör sedan:

```sql
CREATE DATABASE ekonomi_platform;
CREATE USER ekonomi_user WITH PASSWORD 'byt-detta-losenord';
GRANT ALL PRIVILEGES ON DATABASE ekonomi_platform TO ekonomi_user;
\q
```

## 5. Skapa produktionsmiljö

Kopiera:

```bash
cp deploy/ubuntu/.env.production.example .env
```

Uppdatera sedan `.env` med riktiga värden:

- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `EXPO_PUBLIC_API_URL`
- `PORT`

Rekommenderad start:

```env
DATABASE_URL="postgresql://ekonomi_user:byt-detta-losenord@localhost:5432/ekonomi_platform?schema=public"
NEXT_PUBLIC_API_URL="https://os.jompalompa.com"
EXPO_PUBLIC_API_URL="https://os.jompalompa.com"
PORT=4000
```

## 6. Installera beroenden

```bash
cd /var/www/ekonomi-os
pnpm install
```

## 7. Bygg databaslagret och kör migreringar

Viktigt: använd `prisma migrate deploy` i produktion, inte `migrate dev`.

```bash
pnpm --filter @ekonomi/db db:generate
pnpm --filter @ekonomi/db exec prisma migrate deploy
```

Om du vill ladda in visningsdata:

```bash
pnpm db:seed
```

## 8. Bygg apparna

```bash
pnpm build
```

## 9. Starta med PM2

```bash
pm2 start deploy/ubuntu/ecosystem.config.cjs
pm2 save
pm2 startup
```

Kontrollera status:

```bash
pm2 status
pm2 logs ekonomi-web
pm2 logs ekonomi-api
```

## 10. Konfigurera Nginx

Kopiera konfigen:

```bash
sudo cp deploy/ubuntu/nginx.ekonomi-os.conf /etc/nginx/sites-available/ekonomi-os
```

Aktivera sedan:

```bash
sudo ln -s /etc/nginx/sites-available/ekonomi-os /etc/nginx/sites-enabled/ekonomi-os
sudo nginx -t
sudo systemctl reload nginx
```

## 11. Lägg på SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d os.jompalompa.com
```

## 12. Hälsokontroller

Webb:

```bash
curl -I http://127.0.0.1:3000
```

API:

```bash
curl http://127.0.0.1:4000/api/health
```

Publik sida:

```bash
curl -I https://os.jompalompa.com/dashboard
```

## 13. Uppdateringsflöde vid ny release

```bash
cd /var/www/ekonomi-os
git pull
pnpm install
pnpm --filter @ekonomi/db db:generate
pnpm --filter @ekonomi/db exec prisma migrate deploy
pnpm build
pm2 restart ekonomi-api
pm2 restart ekonomi-web
```

## 14. Vanliga problem

### Webben laddar men API-anrop faller

Kontrollera:

- att `ekonomi-api` kör i PM2
- att Nginx proxar `/api/` till `127.0.0.1:4000`
- att `.env` finns i projektroten

### Prisma hittar inte databasen

Kontrollera:

- `DATABASE_URL`
- att PostgreSQL kör
- att användaren har rättigheter

### Next startar inte

Kontrollera:

```bash
pm2 logs ekonomi-web
```

och att `pnpm build` faktiskt gått klart innan `pm2 start`.
