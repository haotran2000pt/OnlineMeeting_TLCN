const readline = require('readline');
const mediasoup = require('mediasoup');
const colors = require('colors/safe');
const pidusage = require('pidusage');

// Maps to store all mediasoup objects.
const workers = new Map();
const routers = new Map();
const transports = new Map();
const producers = new Map();
const consumers = new Map();

class Interactive {
    constructor() {

        this._isTerminalOpen = false;
    }

    openCommandConsole() {
        const cmd = readline.createInterface(
            {
                input: process.stdin,
                output: process.stdout,
                terminal: true
            });

        cmd.on('close', () => {
            if (this._isTerminalOpen)
                return;

            this.log('\nexiting...');
        });

        const readStdin = () => {
            cmd.question('cmd> ', async (input) => {
                const params = input.split(/[\s\t]+/);
                const command = params.shift();

                switch (command) {
                    case '':
                        {
                            readStdin();
                            break;
                        }

                    case 'h':
                    case 'help':
                        {
                            this.log('');
                            this.log('available commands:');
                            this.log('- h,  help                    : show this message');
                            this.log('- usage                       : show CPU and memory usage of the Node.js and mediasoup-worker processes');
                            this.log('- logLevel level              : changes logLevel in all mediasoup Workers');
                            this.log('- logTags [tag] [tag]         : changes logTags in all mediasoup Workers (values separated by space)');
                            this.log('- dumpRooms                   : dump all rooms');
                            this.log('- dumpPeers                   : dump all peers');
                            this.log('- dw, dumpWorkers             : dump mediasoup Workers');
                            this.log('- dr, dumpRouter [id]         : dump mediasoup Router with given id (or the latest created one)');
                            this.log('- dt, dumpTransport [id]      : dump mediasoup Transport with given id (or the latest created one)');
                            this.log('- dp, dumpProducer [id]       : dump mediasoup Producer with given id (or the latest created one)');
                            this.log('- dc, dumpConsumer [id]       : dump mediasoup Consumer with given id (or the latest created one)');
                            this.log('- st, statsTransport [id]     : get stats for mediasoup Transport with given id (or the latest created one)');
                            this.log('- sp, statsProducer [id]      : get stats for mediasoup Producer with given id (or the latest created one)');
                            this.log('- sc, statsConsumer [id]      : get stats for mediasoup Consumer with given id (or the latest created one)');
                            this.log('');
                            readStdin();

                            break;
                        }

                    case 'u':
                    case 'usage':
                        {
                            let usage = await pidusage(process.pid);

                            this.log(`Node.js process [pid:${process.pid}]:\n${JSON.stringify(usage, null, '  ')}`);

                            for (const worker of workers.values()) {
                                usage = await pidusage(worker.pid);

                                this.log(`mediasoup-worker process [pid:${worker.pid}]:\n${JSON.stringify(usage, null, '  ')}`);
                            }

                            break;
                        }

                    case 'logLevel':
                        {
                            const level = params[0];
                            const promises = [];

                            for (const worker of workers.values()) {
                                promises.push(worker.updateSettings({ logLevel: level }));
                            }

                            try {
                                await Promise.all(promises);

                                this.log('done');
                            }
                            catch (error) {
                                this.error(String(error));
                            }

                            break;
                        }

                    case 'logTags':
                        {
                            const tags = params;
                            const promises = [];

                            for (const worker of workers.values()) {
                                promises.push(worker.updateSettings({ logTags: tags }));
                            }

                            try {
                                await Promise.all(promises);

                                this.log('done');
                            }
                            catch (error) {
                                this.error(String(error));
                            }

                            break;
                        }

                    case 'stats':
                        {
                            this.log(`rooms:${global.roomList.size}`);

                            break;
                        }

                    case 'dumpRooms':
                        {
                            for (const room of global.roomList.values()) {
                                try {
                                    const dump = await room.dump();

                                    this.log(`room.dump():\n${JSON.stringify(dump, null, '  ')}`);
                                }
                                catch (error) {
                                    this.error(`room.dump() failed: ${error}`);
                                }
                            }

                            break;
                        }

                    case 'dw':
                    case 'dumpWorkers':
                        {
                            for (const worker of workers.values()) {
                                try {
                                    const dump = await worker.dump();

                                    this.log(`worker.dump():\n${JSON.stringify(dump, null, '  ')}`);
                                }
                                catch (error) {
                                    this.error(`worker.dump() failed: ${error}`);
                                }
                            }

                            break;
                        }

                    case 'dr':
                    case 'dumpRouter':
                        {
                            const id = params[0] || Array.from(routers.keys()).pop();
                            const router = routers.get(id);

                            if (!router) {
                                this.error('Router not found');

                                break;
                            }

                            try {
                                const dump = await router.dump();

                                this.log(`router.dump():\n${JSON.stringify(dump, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`router.dump() failed: ${error}`);
                            }

                            break;
                        }

                    case 'dt':
                    case 'dumpTransport':
                        {
                            const id = params[0] || Array.from(transports.keys()).pop();
                            const transport = transports.get(id);

                            if (!transport) {
                                this.error('Transport not found');

                                break;
                            }

                            try {
                                const dump = await transport.dump();

                                this.log(`transport.dump():\n${JSON.stringify(dump, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`transport.dump() failed: ${error}`);
                            }

                            break;
                        }

                    case 'dp':
                    case 'dumpProducer':
                        {
                            const id = params[0] || Array.from(producers.keys()).pop();
                            const producer = producers.get(id);

                            if (!producer) {
                                this.error('Producer not found');

                                break;
                            }

                            try {
                                const dump = await producer.dump();

                                this.log(`producer.dump():\n${JSON.stringify(dump, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`producer.dump() failed: ${error}`);
                            }

                            break;
                        }

                    case 'dc':
                    case 'dumpConsumer':
                        {
                            const id = params[0] || Array.from(consumers.keys()).pop();
                            const consumer = consumers.get(id);

                            if (!consumer) {
                                this.error('Consumer not found');

                                break;
                            }

                            try {
                                const dump = await consumer.dump();

                                this.log(`consumer.dump():\n${JSON.stringify(dump, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`consumer.dump() failed: ${error}`);
                            }

                            break;
                        }

                    case 'st':
                    case 'statsTransport':
                        {
                            const id = params[0] || Array.from(transports.keys()).pop();
                            const transport = transports.get(id);

                            if (!transport) {
                                this.error('Transport not found');

                                break;
                            }

                            try {
                                const stats = await transport.getStats();

                                this.log(`transport.getStats():\n${JSON.stringify(stats, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`transport.getStats() failed: ${error}`);
                            }

                            break;
                        }

                    case 'sp':
                    case 'statsProducer':
                        {
                            const id = params[0] || Array.from(producers.keys()).pop();
                            const producer = producers.get(id);

                            if (!producer) {
                                this.error('Producer not found');

                                break;
                            }

                            try {
                                const stats = await producer.getStats();

                                this.log(`producer.getStats():\n${JSON.stringify(stats, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`producer.getStats() failed: ${error}`);
                            }

                            break;
                        }

                    case 'sc':
                    case 'statsConsumer':
                        {
                            const id = params[0] || Array.from(consumers.keys()).pop();
                            const consumer = consumers.get(id);

                            if (!consumer) {
                                this.error('Consumer not found');

                                break;
                            }

                            try {
                                const stats = await consumer.getStats();

                                this.log(`consumer.getStats():\n${JSON.stringify(stats, null, '  ')}`);
                            }
                            catch (error) {
                                this.error(`consumer.getStats() failed: ${error}`);
                            }

                            break;
                        }

                    default:
                        {
                            this.error(`unknown command '${command}'`);
                            this.log('press \'h\' or \'help\' to get the list of available commands');
                        }
                }

                readStdin();
            });
        };

        readStdin();
    }

    log(msg) {
        try {
            console.log(`${colors.green(msg)}\n`);
        }
        catch (error) { }
    }

    error(msg) {
        try {
            this._socket.write(`${colors.red.bold('ERROR: ')}${colors.red(msg)}\n`);
        }
        catch (error) { }
    }
}

function runMediasoupObserver() {
    mediasoup.observer.on('newworker', (worker) => {
        // Store the latest worker in a global variable.
        global.worker = worker;

        workers.set(worker.pid, worker);
        worker.observer.on('close', () => workers.delete(worker.pid));

        worker.observer.on('newrouter', (router) => {
            // Store the latest router in a global variable.
            global.router = router;

            routers.set(router.id, router);
            router.observer.on('close', () => routers.delete(router.id));

            router.observer.on('newtransport', (transport) => {
                // Store the latest transport in a global variable.
                global.transport = transport;

                transports.set(transport.id, transport);
                transport.observer.on('close', () => transports.delete(transport.id));

                transport.observer.on('newproducer', (producer) => {
                    // Store the latest producer in a global variable.
                    global.producer = producer;

                    producers.set(producer.id, producer);
                    producer.observer.on('close', () => producers.delete(producer.id));
                });

                transport.observer.on('newconsumer', (consumer) => {
                    // Store the latest consumer in a global variable.
                    global.consumer = consumer;

                    consumers.set(consumer.id, consumer);
                    consumer.observer.on('close', () => consumers.delete(consumer.id));
                });
            });
        });
    });
}

module.exports = async function (roomList) {
    try {
        // Run the mediasoup observer API.
        runMediasoupObserver();

        global.roomList = roomList;
        global.workers = workers;
        global.routers = routers;
        global.transports = transports;
        global.producers = producers;
        global.consumers = consumers;

        const interactive = new Interactive();

        interactive.openCommandConsole();
    }
    catch (error) { console.log(error) }
};
