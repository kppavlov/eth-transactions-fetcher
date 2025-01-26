#!/bin/sh

API_PORT=3000
ETH_NODE_URL=https://ethereum-sepolia-rpc.publicnode.com
DB_CONNECTION_URL=postgres://lime:limepassword@postgres-db:5432/postgres
JWT_SECRET=your_jwt_secret

POSTGRES_USER=lime
POSTGRES_PASSWORD=limepassword
POSTGRES_DB=postgres
LIME_USER=lime
LIME_PASSWORD=limeuserpass
LIME_DB=postgres
POSTGRES_PORT=5432 # Custom internal port for PostgreSQL container

NETWORK_NAME=limeapi-bridge-network

# Create a custom bridge network if it doesn't exist
echo "Creating custom bridge network '$NETWORK_NAME'..."
docker network inspect $NETWORK_NAME >/dev/null 2>&1 || \
  docker network create --driver bridge $NETWORK_NAME

# Start PostgreSQL container
docker run -d \
  --name postgres-db \
  --network $NETWORK_NAME \
  --network-alias postgres-db \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -e POSTGRES_PORT=$POSTGRES_PORT \
  -p 2345:$POSTGRES_PORT\
  postgres:latest \
  -p $POSTGRES_PORT

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec postgres-db pg_isready -U $POSTGRES_USER; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Create lime user and assign ownership of the database
echo "Creating user '$LIME_USER' and assigning ownership of database '$LIME_DB'..."
docker exec -i postgres-db psql -U $POSTGRES_USER <<EOF
CREATE USER $LIME_USER WITH PASSWORD '$LIME_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $LIME_DB TO $LIME_USER;
ALTER DATABASE $LIME_DB OWNER TO $LIME_USER;
EOF
echo "User '$LIME_USER' and database '$LIME_DB' setup complete."

docker build -t limeapi ../
docker run -d \
  --name limeapi \
  --network $NETWORK_NAME \
  -e API_PORT=$API_PORT \
  -e ETH_NODE_URL=$ETH_NODE_URL \
  -e DB_CONNECTION_URL=$DB_CONNECTION_URL \
  -e JWT_SECRET=$JWT_SECRET \
  -p $API_PORT:$API_PORT \
  limeapi

echo "Both containers are running:"
echo "- Node.js API: http://localhost:$API_PORT"
echo "- PostgreSQL: postgres://$LIME_USER:$LIME_PASSWORD@postgres-db:$POSTGRES_PORT/$LIME_DB"