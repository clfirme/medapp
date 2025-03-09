import express from "express";
import bodyParser from "body-parser"; // Opcional em versões modernas do Express
import router from "./routes/router.js";
import db from "./database/database.js";
import cors from "cors"; // Adicione esta linha


const app = express();

// Adicione o middleware CORS antes de outros middlewares
app.use(cors()); // Adicione esta linha

// Resto do seu código...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/", router);

app.listen(3001, function(){
    console.log("Listening to port 3001");
});


process.on('SIGINT', () => {
    db.close(() => {
      console.log('Conexão MongoDB encerrada pela terminação da aplicação');
      process.exit(0);
    });
});


