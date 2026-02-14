import express from "express";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { authRoutes } from "./routes/auth.routes.js";
import { clientRoutes } from "./routes/client.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { invoiceRoutes } from "./routes/invoice.routes.js";
import { messagesRoutes } from "./routes/messages.routes.js";
import { projectRoutes } from "./routes/project.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(requestLogger);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/projects", projectRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/messages", messagesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
