export default (schema: any) => {
	return {
		...schema,
		servers: [
			{
				url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
			},
		],
	};
};
