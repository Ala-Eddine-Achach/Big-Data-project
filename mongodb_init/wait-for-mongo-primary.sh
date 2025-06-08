#!/bin/bash
# Start MongoDB in the background
mongod --replSet rs0 --bind_ip_all &

# Wait for MongoDB to be ready to accept connections
echo "Waiting for MongoDB to accept connections..."
until mongosh --host 127.0.0.1 --eval "print('Connection successful')" > /dev/null 2>&1; do
  sleep 1
done
echo "MongoDB is accepting connections."

# Initiate replica set if not already initiated
REPLICA_SET_STATUS=$(mongosh --host 127.0.0.1 --eval "rs.status().ok" --quiet)
if [ "$REPLICA_SET_STATUS" != "1" ]; then
  echo "Initiating MongoDB replica set..."
  mongosh --host 127.0.0.1 --eval "rs.initiate({_id: \"rs0\", members: [{_id: 0, host: \"mongodb:27017\"}]})"
else
  echo "MongoDB replica set already initiated."
fi

# Wait for the replica set to elect a primary
echo "Waiting for MongoDB replica set to elect a primary..."
until mongosh --host 127.0.0.1 --eval "rs.isMaster().ismaster" --quiet | grep -q "true"; do
  sleep 1
done
echo "MongoDB replica set is now primary."

# Keep the container running
wait 