import { database } from "infra/database";

export default async function status(request, response) {
  const databaseServerVersionResult = await database.query(
    "SHOW server_version;",
  );
  const databaseServerVersion =
    databaseServerVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SELECT current_setting('max_connections')::int AS max_connections;",
  );
  const databaseMaxConnections =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int AS opened_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnections =
    databaseOpenedConnectionsResult.rows[0].opened_connections;

  const updatedAt = new Date().toISOString();

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseServerVersion,
        max_connections: databaseMaxConnections,
        opened_connections: databaseOpenedConnections,
      },
    },
  });
}
