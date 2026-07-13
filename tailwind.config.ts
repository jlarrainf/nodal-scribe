import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
		"./types/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				ink: "#111111",
				paper: "#f5f0e8",
				sand: "#d9c8b0",
				clay: "#a66a4a",
				forest: "#23423a",
			},
			boxShadow: {
				soft: "0 24px 60px rgba(17, 17, 17, 0.12)",
			},
			backgroundImage: {
				"hero-grid":
					"radial-gradient(circle at top left, rgba(166, 106, 74, 0.18), transparent 30%), radial-gradient(circle at top right, rgba(35, 66, 58, 0.16), transparent 28%), linear-gradient(180deg, #f9f4eb 0%, #efe6d8 100%)",
			},
		},
	},
	plugins: [],
};

export default config;
