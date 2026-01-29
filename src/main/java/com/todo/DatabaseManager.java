package com.todo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class DatabaseManager {
    private static final String DB_FOLDER = "data";
    private static final String DB_NAME = "todo.db";
    private static final String DB_PATH = DB_FOLDER + "/" + DB_NAME;
    private static final String URL = "jdbc:sqlite:" + DB_PATH;

    public static Connection getConnection() throws SQLException {
        ensureDatabaseFolderExists();
        return DriverManager.getConnection(URL);
    }

    private static void ensureDatabaseFolderExists() {
        try {
            Path folderPath = Paths.get(DB_FOLDER);
            if (!Files.exists(folderPath)) {
                Files.createDirectories(folderPath);
                System.out.println("Created database folder: " +
                        folderPath.toAbsolutePath());
            }

            Path dbPath = Paths.get(DB_PATH);
            if (!Files.exists(dbPath)) {
                System.out.println("Database will be created at: " +
                        dbPath.toAbsolutePath());
            } else {
                System.out.println("Using existing database at: " +
                        dbPath.toAbsolutePath());
            }
        } catch (Exception e) {
            System.err.println("Failed to setup database: " + e.getMessage());
        }
    }

    public static void initDatabase() {
        ensureDatabaseFolderExists();

        String sql = "CREATE TABLE IF NOT EXISTS tasks (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "title TEXT NOT NULL," +
                "description TEXT," +
                "completed BOOLEAN DEFAULT 0," +
                "created_at DATETIME DEFAULT CURRENT_TIMESTAMP)";

        try (Connection conn = getConnection();
             var stmt = conn.createStatement()) {
            stmt.execute(sql);
            System.out.println("Database initialized successfully");
        } catch (SQLException e) {
            System.err.println("Database initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static String getDatabaseInfo() {
        try {
            Path dbPath = Paths.get(DB_PATH);
            if (Files.exists(dbPath)) {
                long size = Files.size(dbPath);
                return String.format("Database: %s (%.2f KB)",
                        dbPath.toAbsolutePath(), size / 1024.0);
            }
            return "Database not created yet";
        } catch (Exception e) {
            return "Error getting database info: " + e.getMessage();
        }
    }
}