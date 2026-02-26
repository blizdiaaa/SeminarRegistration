import "dotenv/config";
import express from "express";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import ExcelJS from "exceljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin Setup
const getFirebaseAdmin = () => {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID || "als-update-log-copy";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@als-update-log-copy.iam.gserviceaccount.com";
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
  } else {
    // Fallback for development if no env var is set
    privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDFgQEYFQhrT6VP\npaF5fsATvGfSurwWS/jdWWT5oWug/H2rKvOUFc/bud9jK76QBXg1XgooHFsyB3uo\n+GbaCS/+Wu3ZgO23mUvqHfQ29EY7XIaSFgYBJqr+ABAgGRHPT0T/rHsJN86xNK++\nbyi7H9nMREYtJ85KbjbbIf/9h28HhJjklfYUWl6ny/UHmMxRz17HjljTlhiRkZgH\nMuo0PO++f+fWcckS8PABXkXtymfw/WNTr/ff3e2o+1as/PmRxNKRj8joV4UuqOAD\nJmEB08F/Gv3eRR1qpo7NpP7K5Myl4WCwBv0+QxP/XWRp8Efg1dnBicFx2m7s9TP6\ngXmOTX13AgMBAAECggEAF5ki3tRAhcXl7B7PrNsaqyEDTLf4Gjfom9X/DR6e5ATX\nJRkEMojqpYfPa6OB6OZmZwX9863zrYYcXeOUMnAPlnYZ3jeb76h23BnJILnOHHCh\nOZo9DG0o2CF8y8EDEkCX726V4tOStDSl3PyeIsGa/d+YfPO5H8aMcmFdG1dPyld1\nHozhEcpsX88BU+sd+fKyCJjWwCabh4usKcayv0bcwyC5qPnwcglbyDkFnS+vpOZf\n9ekoCmwIBEoCe2HgzljzKXDr2dyzCIkCvbkutPMc9DDIBgjWdM7IXE9RT5dARtkK\nbq85WHi3MMY2ZRBV/D+rzkuWB/bKOy8AxFBO1dmEkQKBgQDzwYAUeJjsgsiB2q5T\ntBCKYDfcFGl7M4j8UhBA2oGsHr9IHUsMf/fwUWUCG6X5kXVfJOypb4uNEybv9Bm5\nZlx6xTbBsSujOAt0P0A0sxgDb5zYmLKchCgZl+RFKgItI51cqOYUheJnJSo73fkz\npEaHHbLsNQt82tvS1/41obfP8QKBgQDPbL37rN7Y+MjDGF7PvXOjHCHsJbxf9yjW\nHV06zRFTi7Il4yysQuHK+/EIHgMfc0K+wBxYs6I2/V3VGKH9a4rRLGE5eKMI1/bP\nX0YHwLjmvJORkoCvsfcjKihO0xEEsH/EzydQ2zndG2iWyzOboWlhlOb0xJpvTQUg\nwKk/1RmL5wKBgD5G6dpRFYEXyPKkVHW+Q5uXCa6I6Io5mH4e2Vg4e3jmQijCkzIW\nX9pecVggiD9DEqHEZVLE1PquMfyMeSYNKQOU73B9O5Dv+L0yi8zrFO+LzJ7qJHgo\nq7YeQIwLN5MgzkumO2Jy8m036ZpyFAFFr19GDziaNN0pbZBo7uH092mBAoGAeErR\nFv7XMi99hp9AhOuS/3oWNjRgPatB1IKtCafZr4DpbM2Fn9UdyzE3RITbPMcEY0lY\nZxyuK4PegfHKKATROaOqMsFCk6NjcDoJi/95e97LGfZDiSEFeTA+tg/z46tUPdgB\nLgQlV5RIoILxyATg74WCN1s5UOjy217ACNPV/+sCgYAJcE7BBnHc9XYUVurC4Cfp\nn/eRjY3PTHhErfq23E5TDT+5WZvTQcSklz87zour7MUc7md7CHUvJNcdzW4el+OT\n+OSx8oTKiWv84Kllf9TbUZBt5pyTelNNNZhbL5+0yMJh+2WcLbRPxvkYIfgDhap4\nbtJbrcis25zXgd5bmYePsw==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, "\n");
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      } as any),
      databaseURL: "https://als-update-log-copy-default-rtdb.firebaseio.com/"
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
};

const getDb = () => {
  const app = getFirebaseAdmin();
  return app ? app.database() : null;
};

// Mock storage if Firebase is not configured
let mockRegistrations: any[] = [];

const app = express();
app.use(express.json());

// Admin Auth Middleware (Simple Token)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
let activeSessions = new Set<string>();

// Registration Endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { name, semester, section, branch, degree } = req.body;

    if (!name || !semester || !section || !branch || !degree) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const registration = {
      name,
      semester,
      section,
      branch,
      degree,
      createdAt: new Date().toISOString(),
    };

    const db = getDb();
    if (db) {
      await db.ref("registrations").push(registration);
    } else {
      mockRegistrations.push({ id: Math.random().toString(36).substr(2, 9), ...registration });
    }

    res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to save registration" });
  }
});

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString("hex");
    activeSessions.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Admin: Get Registrations
app.get("/api/admin/registrations", async (req, res) => {
  const token = req.headers.authorization;
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const db = getDb();
    if (db) {
      const snapshot = await db.ref("registrations").once("value");
      const data = snapshot.val();
      const registrationsList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      res.json(registrationsList.reverse());
    } else {
      res.json([...mockRegistrations].reverse());
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// Admin: Delete Registration
app.delete("/api/admin/registrations/:id", async (req, res) => {
  const token = req.headers.authorization;
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  try {
    const db = getDb();
    if (db) {
      await db.ref(`registrations/${id}`).remove();
    } else {
      mockRegistrations = mockRegistrations.filter(r => r.id !== id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete registration" });
  }
});

// Admin: Download Excel
app.get("/api/admin/download", async (req, res) => {
  const token = req.query.token as string;
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    let registrationsList: any[] = [];
    const db = getDb();
    if (db) {
      const snapshot = await db.ref("registrations").once("value");
      const data = snapshot.val();
      registrationsList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    } else {
      registrationsList = [...mockRegistrations];
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registrations");

    worksheet.columns = [
      { header: "ID", key: "id", width: 25 },
      { header: "Name", key: "name", width: 30 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Section", key: "section", width: 10 },
      { header: "Branch", key: "branch", width: 25 },
      { header: "Degree", key: "degree", width: 20 },
      { header: "Registered At", key: "createdAt", width: 25 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    registrationsList.reverse().forEach(reg => {
      worksheet.addRow({
        ...reg,
        createdAt: new Date(reg.createdAt).toLocaleString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Webinar_Registrations.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to generate Excel file" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", firebase: !!getFirebaseAdmin() });
});

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // In production (but not Vercel), serve static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
