const stdout = Deno.stdout;
const stdin = Deno.stdin;
import { readLines } from "https://deno.land/std@0.116.0/io/mod.ts";

const readbleStream = new ReadableStream({
	async start(controller) {
    for await (const line of readLines(stdin)) {
      controller.enqueue(line);
      controller.close();
    }
  }
});

const writableStream = new WritableStream({
  write(chunk) {
    stdout.writeSync(chunk);
  }
});

const transformStream = new TransformStream({
  transform(chunk, controller: any) {
    const upperChunk = chunk.toUpperCase();
    controller.enqueue(upperChunk);
    controller.close();
  }
});
const write = writableStream.getWriter();

// await readbleStream.pipeTo(writableStream)
write.write(new TextEncoder().encode("Hello World1\r"));
//Clear the console
Deno.stdout.writeSync(new TextEncoder().encode("\x1B[2J\x1B[0f"));

