```bash
dotnet tool install --global dotnet-ef
echo CREATE DATABASE calla | psql postgres://postgres:password@localhost:5432
dotnet user-secrets set ConnectionStrings:Calla "Server=127.0.0.1;Port=5432;Database=calla;User Id=postgres;Password=password;"
dotnet ef migrations add initial
dotnet ef database update
# dotnet ef migrations script
# dotnet ef dbcontext scaffold Name=ConnectionStrings:Calla Npgsql.EntityFrameworkCore.PostgreSQL -o Data/Calla --context CallaContext --force
# dotnet ef dbcontext scaffold "Server=127.0.0.1;Port=5432;Database=calla;User Id=postgres;Password=password;" Npgsql.EntityFrameworkCore.PostgreSQL -o Data/Calla --context CallaContext --force
npm install
npm run rebuild:all
```

Use VSCode run (F5) and navigate to http://localhost:5001/Game and http://localhost:5001/Admin
