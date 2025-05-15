FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["chat-backend.csproj", "./"]
RUN dotnet restore

# Copy the remaining source code and build the application
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ARG ASPNETCORE_URLS
ARG ASPNETCORE_ENVIRONMENT

# Set the environment variables
ENV ASPNETCORE_URLS=$ASPNETCORE_URLS
ENV ASPNETCORE_ENVIRONMENT=$ASPNETCORE_ENVIRONMENT

# Expose the port the app will run on
# Port 4000 is used by the application to handle HTTP requests.
EXPOSE 4000

# Start the application
ENTRYPOINT ["dotnet", "chat-backend.dll"]