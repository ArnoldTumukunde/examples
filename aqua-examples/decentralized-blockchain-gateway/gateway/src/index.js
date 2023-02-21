#!/usr/bin/env node

"use strict";

import express from "express";
import bodyParser from "body-parser";
import {JSONRPCServer} from "json-rpc-2.0";
import {Fluence} from '@fluencelabs/js-client.api';
import "@fluencelabs/js-client.node"
import {randomLoadBalancingEth, registerCounter, registerLogger, roundRobinEth} from "../aqua-compiled/rpc.js";
import {readArguments} from "./arguments.js";
import {readConfig} from "./config.js";
import {methods} from "./methods.js";

const args = readArguments(process.argv.slice(2));

if (args.errors.length > 0) {
    console.log(args.help);
    args.errors.forEach((err) => console.log(err));
    process.exit(1);
}

const {config, errors, help} = readConfig(args.configPath);

if (errors.length > 0) {
    errors.forEach((err) => console.log(err));
    console.log(help);
    process.exit(1);
}

console.log("Running server...");

const route = "/";

const server = new JSONRPCServer();

// initialize fluence client
await Fluence.connect(config.relay);
const peerId = (await Fluence.getClient()).getPeerId()

// handler for logger
registerLogger({
    log: s => {
        console.log("log: " + s);
    },
    logCall: s => {
        console.log("Call will be to : " + s);
    },
})

let counter = 0;
registerCounter("counter", {
    incrementAndReturn: () => {
        counter++;
        console.log("Counter: " + counter)
        return counter;
    }
})

const counterServiceId = config.counterServiceId  || 'counter'
const counterPeerId = config.counterPeerId || peerId

async function methodHandler(req, method) {
    console.log(`Receiving request '${method}'`);
    let result;
    if (!config.mode || config.mode === "random") {
        result = await randomLoadBalancingEth(config.providers, method, req.map((s) => JSON.stringify(s)), config.serviceId);
    } else if (config.mode === "round-robin") {
        console.log("peerId: " + peerId)
        result = await roundRobinEth(config.providers, method, req.map((s) => JSON.stringify(s)), config.serviceId, counterServiceId, counterPeerId,
            config.serviceId);
    }


    return JSON.parse(result.value);

}

function addMethod(op) {
    server.addMethod(op, async (req) => methodHandler(req, op));
}

// register all eth methods
methods.forEach((m) => {
    addMethod(m);
})

const app = express();
app.use(bodyParser.json());

// register JSON-RPC handler
app.post(route, (req, res) => {
    const jsonRPCRequest = req.body;
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            res.sendStatus(204);
        }
    });
});

app.listen(config.port);

console.log("Server was started on port " + config.port);