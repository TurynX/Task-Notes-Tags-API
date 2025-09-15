import fastify from "fastify";
import { appRoute } from "./route.js";

const app = fastify();

app.register(appRoute);

app.listen({ port: 3333 });
