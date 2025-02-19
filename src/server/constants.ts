import { Options } from "@node-rs/argon2";

export const argonOptions: Options = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
};

export const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
