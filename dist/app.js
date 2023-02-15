"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors = require("cors");
var path = require("path");
var fs = require("fs");
var app = (0, express_1.default)();
app.use(express_1.default.json());
var http = require("http");
var _a = require("@bot-whatsapp/bot"), createBot = _a.createBot, createProvider = _a.createProvider, createFlow = _a.createFlow, addKeyword = _a.addKeyword;
var WebWhatsappProvider = require("@bot-whatsapp/provider/baileys");
var MockAdapter = require("@bot-whatsapp/database/mock");
var admin = require("firebase-admin");
var serviceAccount = require("../ali");
var server = http.createServer(app);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
server.listen(8000);
var flowPrincipal = addKeyword(['como vamos en alimentacion packing'])
    .addAnswer(['nose yo']);
var db = admin.firestore();
function fecha_actual() {
    var date = new Date();
    return (String(date.getDate()).padStart(2, '0') +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        date.getFullYear());
}
var adapterDB = new MockAdapter();
var adapterFlow = createFlow([flowPrincipal]);
var adapterProvider = createProvider(WebWhatsappProvider);
var numeros_correos = [];
db.collection("Numeros de whatsapp").onSnapshot(function (resp) {
    var todo = [];
    resp.forEach(function (element) {
        todo.push(element.data());
    });
    console.log(todo);
    numeros_correos = todo;
});
adapterProvider.on("message", function (ctx) {
    console.log(1);
    console.log(ctx);
    if (ctx.body == "como vamos en alimentacion packing" || ctx.body == "como vamos en alimentacion packing?" || ctx.body == "Como vamos en alimentacion packing" || ctx.body == "Como vamos en alimentacion packing?") {
        console.log(1.5);
        numeros_correos.forEach(function (informacion) {
            var info = informacion.any;
            if (info.numero == ctx.from) {
                console.log(2);
                console.log("Usuarios web/" + info.correo + "/Locales-packing-2");
                db.collection("Usuarios web/" + info.correo + "/Locales-packing-2").get().then(function (locales) {
                    console.log(2.2);
                    var todo = [];
                    locales.forEach((function (local) {
                        todo.push(local.data());
                    }));
                    var array_locales = [];
                    var array_consecionarias = [];
                    var n = 0;
                    db.collection("Usuarios web/" + info.correo + "/Consecionarias-packing-2").get().then(function (conses) {
                        var todo_2 = [];
                        conses.forEach((function (conse) {
                            todo_2.push(conse.data());
                        }));
                        console.log("Consecionarias ", todo_2);
                        todo.forEach(function (local) {
                            var ar = {
                                local: local.any.nombre,
                                reservas: 0,
                                atenciones: 0
                            };
                            db.collection("Usuarios web/" + info.correo + "/Locales-packing-2/" + local.any.nombre + "/" + fecha_actual() + "/Reservas/DNI").get().then(function (dni) {
                                var array = [];
                                dni.forEach(function (item) {
                                    array.push(item.data());
                                });
                                ar.reservas = array.length;
                                db.collection("Usuarios web/" + info.correo + "/Locales-packing-2/" + local.any.nombre + "/" + fecha_actual() + "/Atendidos/DNI").get().then(function (dni) {
                                    var array = [];
                                    dni.forEach(function (item) {
                                        array.push(item.data());
                                    });
                                    ar.atenciones = array.length;
                                    array_locales.push(ar);
                                    n++;
                                    console.log(2.5);
                                    if (n == todo.length) {
                                        console.log(3);
                                        var n_2 = 0;
                                        todo_2.forEach(function (conse) {
                                            var ar = {
                                                conse: conse.any.nombre,
                                                reservas: 0,
                                                atenciones: 0
                                            };
                                            db.collection("Usuarios web/" + info.correo + "/Consecionarias-packing-2/" + conse.any.nombre + "/" + fecha_actual() + "/Reservas/DNI").get().then(function (dni) {
                                                var array = [];
                                                dni.forEach(function (item) {
                                                    array.push(item.data());
                                                });
                                                ar.reservas = array.length;
                                                db.collection("Usuarios web/" + info.correo + "/Consecionarias-packing-2/" + conse.any.nombre + "/" + fecha_actual() + "/Atendidos/DNI").get().then(function (dni) {
                                                    var array = [];
                                                    dni.forEach(function (item) {
                                                        array.push(item.data());
                                                    });
                                                    ar.atenciones = array.length;
                                                    array_consecionarias.push(ar);
                                                    n_2++;
                                                    console.log(n_2);
                                                    console.log(todo.length);
                                                    if (n_2 == todo_2.length) {
                                                        console.log(4);
                                                        var mensaje_local = "*Informacion de locales* \n ";
                                                        array_locales.forEach(function (item) {
                                                            mensaje_local += "*".concat(array_locales.indexOf(item) + 1 + '. ' + item.local, "* \n");
                                                            mensaje_local += "  - Reservas: ".concat(item.reservas, " \n");
                                                            mensaje_local += "  - Atenciones: ".concat(item.atenciones, " \n \n");
                                                        });
                                                        mensaje_local += "\n \n *Informacion de consecionarias* \n ";
                                                        array_consecionarias.forEach(function (item) {
                                                            mensaje_local += "*".concat(array_consecionarias.indexOf(item) + 1 + '. ' + item.conse, "* \n");
                                                            mensaje_local += "  - Reservas: ".concat(item.reservas, " \n");
                                                            mensaje_local += "  - Atenciones: ".concat(item.atenciones, " \n \n");
                                                        });
                                                        console.log(5);
                                                        var date = new Date();
                                                        var id = ctx.from + date + " " + Math.random();
                                                        var number = "+" + ctx.from;
                                                        console.log(number);
                                                        db.collection("cola_mensajes").doc(id).set({ id: id, numero: number, mensaje: mensaje_local }).then(function () {
                                                            if (cola_mensajes.length) {
                                                                cola_mensajes.push({ id: id, numero: number, mensaje: mensaje_local });
                                                            }
                                                            else {
                                                                cola_mensajes.push({ id: id, numero: number, mensaje: mensaje_local });
                                                                enviar_mensajes();
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            }
        });
    }
});
app.get("/autentificar", function (req, res) {
    console.log("autentificar");
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    res.send(true);
});
console.log(33);
var cola_mensajes = [];
var enviar_mensajes = function () {
    if (cola_mensajes.length) {
        var data = cola_mensajes[0];
        console.log(data);
        adapterProvider.vendor.sendMessage(data.numero.substring(1) + "@c.us", { text: data.mensaje }).then(function () {
            setTimeout(function () {
                db.collection("cola_mensajes").doc(data.id).delete().then(function () {
                    cola_mensajes.shift();
                    if (cola_mensajes.length) {
                        enviar_mensajes();
                    }
                });
            }, 10000);
        });
    }
};
app.get("/enviar_mensaje", function (req, res) {
    if (cola_mensajes.length) {
        cola_mensajes.push(req.body);
    }
    else {
        cola_mensajes.push(req.body);
        enviar_mensajes();
    }
    res.send(true);
});
