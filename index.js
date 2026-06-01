const puppeteer = require('puppeteer'); // importa puppeteer completo
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const express = require('express');

const SESSION_FILE_PATH = "/data/session.json";
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const client = new Client({
    session: sessionData,
    puppeteer: {
        executablePath: "/opt/render/.cache/puppeteer/chrome/linux-146.0.7680.31/chrome-linux64/chrome",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process"
        ]
    }
});

// ===============================
// ESTADOS DE USUARIOS
// ===============================
const usuarios = {};

// ===============================
// QR
// ===============================
client.on("qr", (qr) => {
    console.log("📱 Escanea este QR con WhatsApp Business");
    qrcode.generate(qr, { small: true });
});

// ===============================
// AUTENTICADO
// ===============================
client.on("authenticated", (session) => {
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session));
    console.log("🔑 Sesión guardada correctamente en /data/session.json");
});

// ===============================
// LISTO
// ===============================
client.on("ready", () => {
    console.log("✅ Bot Lizkarito conectado");
});

// ===============================
// MENSAJES
// ===============================
client.on("message", async (message) => {
    try {
        const from = message.from;
        if (from.includes("@g.us")) return;

        const texto = message.body ? message.body.toLowerCase().trim() : "";
        if (!texto) return;

        if (!usuarios[from]) {
            usuarios[from] = { estado: "inicio" };
        }

        let respuesta = "";
        const estado = usuarios[from].estado;

        // ===============================
        // REACTIVAR BOT
        // ===============================
        if (texto === ".bot" || texto === "volver al menu") {
            usuarios[from].estado = "menu";
            await client.sendMessage(from, `🤖 Asistente Virtual Reactivado

Escribe "hola" para desplegar el menú de opciones.`);
            return;
        }

        // ===============================
        // ESTADO HUMANO
        // ===============================
        if (estado === "humano") return;

        // ===============================
        // MENÚ INICIAL
        // ===============================
        if (
            estado === "inicio" ||
            texto.includes("hola") ||
            texto.includes("holaa") ||
            texto.includes("buenas") ||
            texto.includes("info") ||
            texto.includes("información")
        ) {
            usuarios[from].estado = "menu";
            respuesta = `✨ ¡Holaa! Qué gusto tenerte por aquí 💖

Estás comunicándote con Lizkarito👑 tu aliada en hacer crecer tu marca y cumplir tus objetivos comerciales 👀✨

Coméntame cómo puedo ayudarte hoy

1️⃣ Necesito un video publicitario para mi negocio

2️⃣ Necesito un paquete de videos publicitarios para mi negocio

3️⃣ Necesito conversar personalmente con un asesor para promocionar y hacer crecer mi negocio`;
        }

        // ===============================
        // OPCIÓN 1
        // ===============================
        else if (estado === "menu" && texto === "1") {
            usuarios[from].estado = "opcion1_paso1";
            respuesta = `Cuéntame un poquito de tu marca o negocio 🤍

¿Qué te gustaría impulsar en TikTok o Instagram?

Me encantaría conocerte y ver cómo podemos hacer que más personas descubran lo que haces 🚀`;
        }

        // ===============================
        // OPCIÓN 2
        // ===============================
        else if (estado === "menu" && texto === "2") {
            usuarios[from].estado = "opcion2_paso1";
            respuesta = `Cuéntame un poquito de tu marca o negocio 🤍

¿Qué te gustaría impulsar en TikTok o Instagram?

Me encantaría conocerte y ver cómo podemos hacer que más personas descubran lo que haces 🚀`;
        }

        // ===============================
        // OPCIÓN 3
        // ===============================
        else if (estado === "menu" && texto === "3") {
            usuarios[from].estado = "finalizado";
            respuesta = `Increíble ! 🙌🏼

En pocos minutos un asesor se pondrá en contacto contigo, o si prefieres y necesitas información inmediata puedes llamar sin problema a este número 😊📞📲

Escribe "finalizar" para continuar con un asesor.`;
        }

        // ===============================
        // OPCIÓN 1 PASO 1
        // ===============================
        else if (estado === "opcion1_paso1") {
            usuarios[from].estado = "opcion1_paso2";
            usuarios[from].infoNegocio = texto;
            respuesta = `¡Qué emocionante! 😍

Definitivamente las redes pueden ayudarte muchísimo a atraer más clientes y darle más visibilidad a tu negocio ✨

Para poder recomendarte la mejor estrategia, cuéntame un poquito más 👀👇

• ¿Qué tipo de negocio o emprendimiento tienes?
• ¿En qué ciudad estás ubicado?
• ¿Qué te gustaría lograr con la publicidad? (más ventas, más clientes, hacer conocida tu marca, lanzar algo nuevo, etc.)
• ¿Te interesa TikTok, Instagram o ambas plataformas?

Con eso ya puedo orientarte mucho mejor 🤍`;
        }

        // ===============================
        // OPCIÓN 1 PASO 2
        // ===============================
        else if (estado === "opcion1_paso2") {
            if (texto === "listo" || texto === "terminar") {
                usuarios[from].estado = "finalizado";
                respuesta = `¡Súper! ✨ Gracias por contarme más sobre tu negocio 🤍

Con lo que me comentas, sí veo muchísimo potencial para crear contenido que llame la atención y haga que más personas quieran visitarte/comprarte 👀🔥

En un momento te voy a compartir toda la información sobre paquetes, métricas y opciones de colaboración de mi Media kit para que podamos armar algo que realmente se adapte a lo que necesitas 💖

Estoy segura de que podemos hacer contenido súper viral para tu marca 🚀

Escribe "finalizar" para terminar y te atenderá directamente una persona real 📲`;
            } else {
                respuesta = `Perfecto, anotado 🤍

¿Quieres agregar algo más?

Si ya terminaste escribe:

"listo"`;
            }
        }

        // ===============================
        // OPCIÓN 2 FINAL
        // ===============================
        else if (estado === "opcion2_paso1") {
            usuarios[from].estado = "finalizado";
            respuesta = `¡Súper! ✨ Gracias por contarme más sobre tu negocio 🤍

Con lo que me comentas, sí veo muchísimo potencial para crear contenido que llame la atención y haga que más personas quieran visitarte/comprarte 👀🔥

En un momento te voy a compartir toda la información sobre paquetes, métricas y opciones de colaboración de mi Media kit para que podamos armar algo que realmente se adapte a lo que necesitas 💖

Estoy segura de que podemos hacer contenido súper viral para tu marca 🚀

Escribe "finalizar" para terminar y te atenderá directamente una persona real 📲`;
        }

        // ===============================
        // FINALIZACIÓN
        // ===============================
        else if (estado === "finalizado") {
            if (texto === "finalizar") {
                usuarios[from].estado = "humano";
                respuesta = `✅ Perfecto, gracias por su paciencia.

En breve un asesor se pondrá en contacto contigo para ayudarte a hacer crecer tu negocio 🚀

A partir de este momento te atenderá una persona real 📲`;
            } else {
                respuesta = `💖 La conversación anterior ya terminó.

Por favor escribe:

"finalizar"`;
            }
        }

        // ===============================
        // NO ENTENDIDO
        // ===============================
        else {
            respuesta = `💖 Perdón, no logré entender tu mensaje.

Por favor selecciona una opción escribiendo:

1️⃣ Video publicitario

2️⃣ Paquete de videos publicitarios

3️⃣ Hablar con un asesor`;
        }

        if (respuesta) {
            await client.sendMessage(from, respuesta);
        }
    } catch (error) {
        console.log("❌ Error:", error.message);
    }
});

// ===============================
// INICIAR BOT
// ===============================
client.initialize();

// ===============================
// EXPRESS PARA RENDER (PORT BINDING)
// ===============================
const app = express();
app.get("/", (req, res) => res.send("BotQR running"));
app.listen(process.env.PORT || 3000);
