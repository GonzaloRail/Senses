# Backend_project_centroPsicologico_Pisw2025


## Getting started

### For non-backend users 

1. Clone the project
2. Run `git checkout dev`
3. Create `.env.release` file on root directory (You must request the content from the backend team)
4. Run `docker compose -f docker-compose.release.yml up --build`
5. Wait to see `Server is running on port 5000` to start using

> **Note:** If error, be sure you have 2 applications running in backend_project_centropsicologico_pisw2025 container. Otherwise, contact the backend team.



### For backend users

1. Clone the project
2. Run `git checkout dev`
3. Run `npm install` to install dependencies
4. Run `docker compose up -d` to run database service
5. Run `npx prisma generate` to generate prisma client 
6. Run prisma migrations `npx prisma migrate dev`
7. Create `.env` file (You must request the content backend leader)
8. Run `npm run dev`

### Users roles mock data

#### Admin
```
email: admin@gmail.com
password: sensespass
```
#### Admission
```
email: admission@gmail.com
password: sensespass
```
#### Psychologist
```
email: psychologist@gmail.com
password: sensespass
```
#### Internal
```
email: internal@gmail.com
password: sensespass
```
