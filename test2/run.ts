import Collection from './Collection.ts';

const Pools: Collection<string, Worker> = new Collection();

const Pool = {
	create: (name: string) => {
		const id = crypto.randomUUID()
		const worker = new Worker(new URL("./MapGen.ts", import.meta.url).href, {
			type: "module",
			deno: {
				namespace: true,
				permissions: {
					read: [
						"/",
						"./",
					],
				},
			},
		});
		worker.postMessage({
			type: "init",
			data : {
				id: id,
				name: name,
				time: Date.now()
			}
		});
		worker.onmessage = Pool.onMessage;
		worker.onerror = Pool.onError;
		worker.onmessageerror = Pool.onMessageError;
		Pools.set(name, worker);
		return worker;
	},
	delete: (name: string) => {
		if (Pools.has(name)) {
			const worker = Pools.get(name);
			if (worker) {
				console.log("Deleting worker", name);
				worker.terminate();
				Pools.delete(name);
			}
		}
	},
	onMessage: (message: MessageEvent) => {
		//
		console.log(`Message Recieved`)
	},
	onError: (error: ErrorEvent) => {
		//
		console.log(`Error Recieved`)
	},
	onMessageError: (message: MessageEvent) => {
		//
		console.log(`Message Error Recieved`)
	},
	join: (name: string, id?: string) => { 
		//
	},
	switch: (name: string, id?: string) => {
		//	
	}
}

const NewWorker = await Pool.create('test');
//set a timeout of 5 seconds and execute pool.delete test

// // const Pools = new Map<string, Pool>();



// const worker = new Worker(new URL("./MapGen.ts", import.meta.url).href, {
// 	type: "module",
// 	deno: {
// 		namespace: true,
// 	},
//   });

//   worker.postMessage({ name:"test" });