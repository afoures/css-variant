import { createVariantUtility } from "./variant";
export type { VariantProps } from "./variant";

export const variant = createVariantUtility((...classes) => {
	return classes.flat().filter(Boolean).join(" ") || undefined;
});

export { createVariantUtility };
