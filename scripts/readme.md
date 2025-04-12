### Migrate nuxt jo to directus

install

npm install @directus/sdk gray-matter form-data

create .env

```
DIRECTUS_EMAIL=admin@example.com # l'email que vous utilisez pour vous connecter à Directus
DIRECTUS_PASSWORD=votrepassword # le mot de passe que vous utilisez pour vous connecter à Directus
DIRECTUS_URL=https://cms.vie-publique.sn # l'URL de votre Directus
```

npm install

npm run migrate
