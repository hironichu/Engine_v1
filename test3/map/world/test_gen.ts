const Chunks = [
	{
		id: 1,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 5),
			}
		]
	},
	{
		id: 2,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 5),
			}
		]
	},
	{
		id: 3,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 5),
			}
		]
	},
	{
		id: 4,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 6),
			}
		]
	},
	{
		id: 5,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 6),
			}
		]
	},
	{
		id: 6,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 6),
			}
		]
	},
	{
		id: 7,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 12 : 19),
			}
		]
	},
	{
		id: 8,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 12 : 2),
			}
		]
	},
	{
		id: 9,
		layers: [
			{
				tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 12 : 19),
			}
		]
	}
]

try {
	Deno.writeTextFileSync(`${Deno.cwd()}/map/world/data.fbm`, JSON.stringify(Chunks));
} catch (e) {
	console.error(e.message)
}
