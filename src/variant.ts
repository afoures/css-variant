import type { SetOptional } from "type-fest";

type StringToPrimitive<T> = T extends "true" | "false"
	? boolean
	: T extends "null"
	? null
	: T extends "undefined"
	? undefined
	: T;
type NonEmptyArray<T> = [T, ...T[]];

type AcceptedCSSClasses = string | Array<string>;

export type Config<
	Variations extends Record<string, Record<string, AcceptedCSSClasses>>,
	Defaults extends keyof Variations,
	Optionals extends keyof Variations,
> = {
	base?: AcceptedCSSClasses;
	variations: Variations;
	defaults?: { [Key in Defaults]?: StringToPrimitive<keyof Variations[Key]> };
	optional?: Array<Optionals>;
	combinations?: Array<{
		classes: AcceptedCSSClasses;
		match: {
			[Key in keyof Variations]?:
				| StringToPrimitive<keyof Variations[Key]>
				| NonEmptyArray<StringToPrimitive<keyof Variations[Key]>>
				| (Optionals extends Key ? undefined : never);
		};
	}>;
};

export type PropsFromConfig<T> = T extends Config<infer Variations, infer Defaults, infer Optionals>
	? SetOptional<
			{ [Key in keyof Variations]: StringToPrimitive<keyof Variations[Key]> },
			Defaults | Optionals
	  >
	: never;

export type VariantProps<VariantFn extends (...args: any) => any> = Parameters<VariantFn>[0];

export function createVariantUtility(
	cx: (...classes: Array<string | Array<string> | undefined>) => string | undefined,
) {
	function variant<
		Variations extends Record<string, Record<string, AcceptedCSSClasses>>,
		Defaults extends keyof Variations = never,
		Optionals extends keyof Variations = never,
	>(config: Config<Variations, Defaults, Optionals>) {
		const required = Object.keys(config.variations).filter(
			(key) => !config.optional?.includes(key as any),
		);

		function match(
			props: PropsFromConfig<Config<Variations, Defaults, Optionals>>,
		): string | undefined {
			const input = {
				...config.defaults,
				...props,
			} as unknown as { [Key in keyof Variations]?: StringToPrimitive<keyof Variations[Key]> };

			const missing = required.filter((key) => !(key in input));
			if (missing.length > 0) {
				throw new Error(
					`required variations "${missing.join('", "')}" are missing. please provide those.`,
				);
			}

			const classnames: Array<AcceptedCSSClasses> = [];
			const { variations, combinations = [] } = config;

			for (const variation of Object.keys(variations) as Array<keyof typeof variations>) {
				if (variation in input) {
					const value = input[variation];
					classnames.push(variations[variation][String(value)]);
				}
			}

			for (const { match, classes } of combinations) {
				if (
					Object.keys(match).every((variation: keyof Variations) => {
						const value = input[variation];
						const matching = match[variation];
						return Array.isArray(matching) ? matching.includes(value!) : value === matching;
					})
				) {
					classnames.push(classes);
				}
			}

			return cx(config.base, ...classnames);
		}

		return match;
	}

	return variant;
}
