import { expect, test } from "vitest";
import { createVariantUtility } from "./variant";

const variant = createVariantUtility((...classes) => {
	return classes.flat().filter(Boolean).join(" ") || undefined;
});

test("empty config", () => {
	const match = variant({ variations: {} });

	expect(match({})).toBe(undefined);
});

test("config with base class as string", () => {
	const match = variant({ base: "base-class", variations: {} });

	expect(match({})).toBe("base-class");
});

test("config with base class as array", () => {
	const match = variant({ base: ["base-class"], variations: {} });

	expect(match({})).toBe("base-class");
});

test("config with one variation", () => {
	const match = variant({
		variations: {
			size: {
				sm: "small",
				md: ["medium"],
				lg: "large",
			},
		},
	});

	expect(match({ size: "sm" })).toBe("small");
	expect(match({ size: "md" })).toBe("medium");
	expect(match({ size: "lg" })).toBe("large");
});

test("config with one variation with default", () => {
	const match = variant({
		variations: {
			size: {
				sm: "small",
				md: ["medium"],
				lg: "large",
			},
		},
		defaults: {
			size: "md",
		},
	});

	expect(match({})).toBe("medium");
	expect(match({ size: "sm" })).toBe("small");
	expect(match({ size: "md" })).toBe("medium");
	expect(match({ size: "lg" })).toBe("large");
});

test("config with one optional variation", () => {
	const match = variant({
		variations: {
			size: {
				sm: "small",
				md: ["medium"],
				lg: "large",
			},
		},
		optional: ["size"],
	});

	expect(match({})).toBe(undefined);
	expect(match({ size: "sm" })).toBe("small");
	expect(match({ size: "md" })).toBe("medium");
	expect(match({ size: "lg" })).toBe("large");
});

test("config with multiple variations", () => {
	const match = variant({
		variations: {
			size: {
				sm: "small",
				md: ["medium"],
				lg: "large",
			},
			theme: {
				neon: "text-neon",
				halloween: "text-halloween",
			},
		},
		defaults: {
			size: "md",
		},
	});

	expect(match({ theme: "neon" })).toBe("medium text-neon");
	expect(match({ size: "sm", theme: "neon" })).toBe("small text-neon");
	expect(match({ size: "md", theme: "neon" })).toBe("medium text-neon");
	expect(match({ size: "lg", theme: "neon" })).toBe("large text-neon");
	expect(match({ theme: "halloween" })).toBe("medium text-halloween");
	expect(match({ size: "sm", theme: "halloween" })).toBe("small text-halloween");
	expect(match({ size: "md", theme: "halloween" })).toBe("medium text-halloween");
	expect(match({ size: "lg", theme: "halloween" })).toBe("large text-halloween");
});

test("config with combined variations", () => {
	const match = variant({
		variations: {
			size: {
				sm: "small",
				md: ["medium"],
				lg: "large",
			},
			theme: {
				neon: "text-neon",
				halloween: "text-halloween",
			},
		},
		defaults: {
			size: "md",
		},
		combinations: [
			{
				match: { size: ["md", "lg"] },
				classes: ["multiple", "size"],
			},
			{
				match: { size: "md" },
				classes: "always-when-md",
			},
			{
				match: { size: "lg", theme: "halloween" },
				classes: "booooo",
			},
		],
	});

	expect(match({ theme: "neon" })).toBe("medium text-neon multiple size always-when-md");
	expect(match({ size: "sm", theme: "neon" })).toBe("small text-neon");
	expect(match({ size: "md", theme: "neon" })).toBe(
		"medium text-neon multiple size always-when-md",
	);
	expect(match({ size: "lg", theme: "neon" })).toBe("large text-neon multiple size");
	expect(match({ theme: "halloween" })).toBe("medium text-halloween multiple size always-when-md");
	expect(match({ size: "sm", theme: "halloween" })).toBe("small text-halloween");
	expect(match({ size: "md", theme: "halloween" })).toBe(
		"medium text-halloween multiple size always-when-md",
	);
	expect(match({ size: "lg", theme: "halloween" })).toBe(
		"large text-halloween multiple size booooo",
	);
});

test("config with non-string values", () => {
	const match = variant({
		variations: {
			compact: {
				true: "compact-layout",
				false: "wide-layout",
			},
			size: {
				1: "small",
				2: ["medium"],
				3: "large",
			},
			theme: {
				undefined: "undefined-theme",
				null: "null-theme",
				whatever: "theme",
			},
		},
		combinations: [
			{
				match: { compact: true, size: [1, 2, 3], theme: [null, undefined] },
				classes: "matched",
			},
		],
	});

	expect(match({ compact: true, size: 1, theme: undefined })).toBe(
		"compact-layout small undefined-theme matched",
	);
	expect(match({ compact: false, size: 2, theme: null })).toBe("wide-layout medium null-theme");
	expect(match({ compact: false, size: 3, theme: "whatever" })).toBe("wide-layout large theme");
});

test("config with everything", () => {
	const match = variant({
		base: "first-class",
		variations: {
			size: {
				sm: "small",
				md: ["medium"],
				lg: "large",
			},
			theme: {
				neon: "text-neon",
				halloween: "text-halloween",
			},
		},
		defaults: {
			size: "md",
		},
		optional: ["theme"],
		combinations: [
			{
				match: { size: ["md", "lg"] },
				classes: ["multiple", "size"],
			},
			{
				match: { size: "md" },
				classes: "always-when-md",
			},
			{
				match: { size: "lg", theme: "halloween" },
				classes: "booooo",
			},
		],
	});

	expect(match({})).toBe("first-class medium multiple size always-when-md");
	expect(match({ theme: "neon" })).toBe(
		"first-class medium text-neon multiple size always-when-md",
	);
	expect(match({ size: "sm", theme: "neon" })).toBe("first-class small text-neon");
	expect(match({ size: "md", theme: "neon" })).toBe(
		"first-class medium text-neon multiple size always-when-md",
	);
	expect(match({ size: "lg", theme: "neon" })).toBe("first-class large text-neon multiple size");
	expect(match({ theme: "halloween" })).toBe(
		"first-class medium text-halloween multiple size always-when-md",
	);
	expect(match({ size: "sm", theme: "halloween" })).toBe("first-class small text-halloween");
	expect(match({ size: "md", theme: "halloween" })).toBe(
		"first-class medium text-halloween multiple size always-when-md",
	);
	expect(match({ size: "lg", theme: "halloween" })).toBe(
		"first-class large text-halloween multiple size booooo",
	);
});
