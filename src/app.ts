import express from "express";
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();
app.use(express.json());
var http = require("http");
const {createBot,createProvider,createFlow,addKeyword} = require("@bot-whatsapp/bot");
const WebWhatsappProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const QRPortalweb = require("@bot-whatsapp/portal")
var admin = require("firebase-admin");
var serviceAccount = require("../ali");
var server = http.createServer(app);
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
server.listen(8000);

const flowPrincipal = addKeyword(['como vamos en alimentacion packing'])
    .addAnswer(['nose yo']  )
let db = admin.firestore();

function fecha_actual() {
    var date = new Date();
    return (
      String(date.getDate()).padStart(2, '0') +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      date.getFullYear()
    );
  }

const adapterDB = new MockAdapter();
const adapterFlow = createFlow([flowPrincipal])
const adapterProvider = createProvider(WebWhatsappProvider);

var numeros_correos:any = []

db.collection("Numeros de whatsapp").onSnapshot((resp:any) => {
    var todo:any = []
    resp.forEach((element:any) => {
        todo.push(element.data())
    });

    console.log(todo);
    
    numeros_correos = todo

})


adapterProvider.on("message",(ctx:any)=>{
    console.log(1);
    console.log(ctx);
    
    if (ctx.body == "como vamos en alimentacion packing" || ctx.body == "como vamos en alimentacion packing?" || ctx.body == "Como vamos en alimentacion packing" || ctx.body == "Como vamos en alimentacion packing?") {
        console.log(1.5);
        
        numeros_correos.forEach((informacion:any) => {
        var info = informacion.any
        if (info.numero == ctx.from) {
            console.log(2);
            console.log("Usuarios web/" + info.correo + "/Locales-packing-2");
            
            db.collection("Usuarios web/" + info.correo + "/Locales-packing-2").get().then((locales:any)=>{
                console.log(2.2);
                
                var todo:any = []
                locales.forEach(((local:any)=>{
                    todo.push(local.data())
                }))

                var array_locales:any = []
                var array_consecionarias:any = []

                var n = 0 
                
                db.collection("Usuarios web/" + info.correo + "/Consecionarias-packing-2").get().then((conses:any)=>{
                    var todo_2:any = []
                    conses.forEach(((conse:any)=>{
                      todo_2.push(conse.data())
                    }))

                    console.log("Consecionarias ",todo_2);
                                

                    todo.forEach((local:any)=>{
                        var ar = {
                            local:local.any.nombre,
                            reservas:0,
                            atenciones:0
                        }
                        db.collection("Usuarios web/" + info.correo + "/Locales-packing-2/" + local.any.nombre + "/" + fecha_actual() + "/Reservas/DNI").get().then((dni:any)=>{
                            var array = []
                            dni.forEach((item:any)=>{
                                array.push(item.data())
                            })
                            ar.reservas = array.length
    
                            db.collection("Usuarios web/" + info.correo + "/Locales-packing-2/" + local.any.nombre + "/" + fecha_actual() + "/Atendidos/DNI").get().then((dni:any)=>{
                              var array = []
                              dni.forEach((item:any)=>{
                                array.push(item.data())
                              })
                              ar.atenciones = array.length
                              array_locales.push(ar)
                              n++
                              console.log(2.5);
                              
    
                              if (n == todo.length) {
                                console.log(3);

                                var n_2 = 0
                                
                                todo_2.forEach((conse:any)=>{
                                    var ar = {
                                        conse:conse.any.nombre,
                                        reservas:0,
                                        atenciones:0
                                    }
                                    db.collection("Usuarios web/" + info.correo + "/Consecionarias-packing-2/" + conse.any.nombre + "/" + fecha_actual() + "/Reservas/DNI").get().then((dni:any)=>{
                                        var array = []
                                        dni.forEach((item:any)=>{
                                            array.push(item.data())
                                        })

                                        ar.reservas = array.length
                                        db.collection("Usuarios web/" + info.correo + "/Consecionarias-packing-2/" + conse.any.nombre + "/" + fecha_actual() + "/Atendidos/DNI").get().then((dni:any)=>{
                                          var array = []
                                          dni.forEach((item:any)=>{
                                            array.push(item.data())
                                          })

                                          ar.atenciones = array.length
                                          array_consecionarias.push(ar)
                                          n_2++
                                          console.log(n_2);
                                          console.log(todo.length);
                                          
                                          

                                          if (n_2 == todo_2.length) {
                                            console.log(4);
                                            
                                            var mensaje_local = "*Informacion de locales* \n "
                                            
                                            array_locales.forEach((item:any)=>{
                                                mensaje_local += `*${array_locales.indexOf(item)+1 + '. ' + item.local}* \n`
                                                mensaje_local += `  - Reservas: ${item.reservas} \n`
                                                mensaje_local += `  - Atenciones: ${item.atenciones} \n \n`
                                            })

                                            mensaje_local += "\n \n *Informacion de consecionarias* \n "

                                            array_consecionarias.forEach((item:any)=>{
                                                mensaje_local += `*${array_consecionarias.indexOf(item)+1 + '. ' + item.conse}* \n`
                                                mensaje_local += `  - Reservas: ${item.reservas} \n`
                                                mensaje_local += `  - Atenciones: ${item.atenciones} \n \n`
                                            })
                                            console.log(5);
                                            
                                            var date = new Date()
                                            var id = ctx.from + date + " " +Math.random()

                                            var number = "+" + ctx.from
                                            console.log(number);
                                            
                                            db.collection("cola_mensajes").doc(id).set({id:id,numero:number,mensaje:mensaje_local}).then(()=>{
                                                if (cola_mensajes.length) {
                                                    cola_mensajes.push({id:id,numero:number,mensaje:mensaje_local})
                                                  }else{
                                                    cola_mensajes.push({id:id,numero:number,mensaje:mensaje_local})
                                                    enviar_mensajes()
                                                  }
                                            })
                                           

                                          }
                                            
                                        })
                                    })
                                })

                              }
                                
                            })
                        })
                    })


                })
                
            })
        }
        });
    }
})

app.get("/autentificar", (req,res) =>{
   console.log("autentificar");
   
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    QRPortalweb()
    res.send(true)

})

console.log(33);

var cola_mensajes:any = []

var enviar_mensajes = ()=>
{
    if (cola_mensajes.length) {
        var data = cola_mensajes[0]
        console.log(data);
        
        adapterProvider.vendor.sendMessage(data.numero.substring(1) + "@c.us", {text:data.mensaje}).then(()=>{

          setTimeout(() => {
            db.collection("cola_mensajes").doc(data.id).delete().then(()=>{
                cola_mensajes.shift();
                if (cola_mensajes.length) {
              
                   enviar_mensajes()
                   
                }
              })        
          }, 10000);

        })

    }
}


app.get("/enviar_mensaje",(req,res)=>{
  
    if (cola_mensajes.length) {
       cola_mensajes.push(req.body)
    }else{
       cola_mensajes.push(req.body)
       enviar_mensajes()
    }
        
    res.send(true)
    
})

