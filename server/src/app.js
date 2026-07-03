import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin && corsOrigin !== "*" 
    ? corsOrigin.split(",").map(origin => origin.trim()) 
    : "*";

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import 
import userRoutes from "./routes/user.routes.js"
import companyRoutes from "./routes/company.routes.js"
import ledgerRoutes from "./routes/ledger.routes.js"
import stockGroupRoutes from "./routes/stockGroup.routes.js"
import unitRoutes from "./routes/unit.routes.js"
import stockItemRoutes from "./routes/stockItem.routes.js"
import salesVoucherRoutes from "./routes/salesVoucher.routes.js"
import purchaseVoucherRoutes from "./routes/purchaseVoucher.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"

//Routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/ledgers", ledgerRoutes);
app.use("/api/v1/stock-groups", stockGroupRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/items", stockItemRoutes);
app.use("/api/v1/sales-vouchers", salesVoucherRoutes);
app.use("/api/v1/purchase-vouchers", purchaseVoucherRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);


export { app };