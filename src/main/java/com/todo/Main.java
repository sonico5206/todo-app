package com.todo;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

public class Main {
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private static final TaskDAO taskDAO = new TaskDAO();

    public static void main(String[] args) throws IOException {
        // Инициализируем базу данных
        DatabaseManager.initDatabase();

        // Создаем HTTP сервер на порту 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Настраиваем маршруты
        server.createContext("/api/tasks", new TasksHandler());
        server.createContext("/", new StaticFileHandler());

        server.setExecutor(null);
        server.start();

        System.out.println("Server started on http://localhost:8080");
    }

    static class TasksHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();
            String response = "";
            int statusCode = 200;

            try {
                switch (method) {
                    case "GET":
                        List<Task> tasks = taskDAO.getAllTasks();
                        response = gson.toJson(tasks);
                        break;

                    case "POST":
                        InputStream is = exchange.getRequestBody();
                        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                        Task newTask = gson.fromJson(body, Task.class);
                        taskDAO.createTask(newTask);
                        response = "{\"message\": \"Task created successfully\"}";
                        break;

                    case "PUT":
                        is = exchange.getRequestBody();
                        body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                        Task updateTask = gson.fromJson(body, Task.class);
                        taskDAO.updateTask(updateTask);
                        response = "{\"message\": \"Task updated successfully\"}";
                        break;

                    case "DELETE":
                        String query = exchange.getRequestURI().getQuery();
                        int id = Integer.parseInt(query.split("=")[1]);
                        taskDAO.deleteTask(id);
                        response = "{\"message\": \"Task deleted successfully\"}";
                        break;
                }
            } catch (Exception e) {
                response = "{\"error\": \"" + e.getMessage() + "\"}";
                statusCode = 500;
            }

            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(statusCode, response.getBytes().length);

            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";

            // Простая раздача статических файлов
            try {
                InputStream is = getClass().getResourceAsStream("/webapp" + path);
                if (is == null) {
                    is = getClass().getResourceAsStream("/webapp/index.html");
                }

                byte[] response = is.readAllBytes();

                String contentType = "text/html";
                if (path.endsWith(".css")) contentType = "text/css";
                if (path.endsWith(".js")) contentType = "application/javascript";

                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, response.length);

                OutputStream os = exchange.getResponseBody();
                os.write(response);
                os.close();
            } catch (Exception e) {
                String response = "File not found";
                exchange.sendResponseHeaders(404, response.length());
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }
        }
    }
}