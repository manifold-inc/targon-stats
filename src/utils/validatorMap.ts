const validatorMap: Record<number, string> = {
  0b001: "Manifold",
  0b010: "Openτensor Foundaτion",
  0b100: "All Validators",
};

export const bitsToNames = (bitValue: number): string[] => {
  return Object.keys(validatorMap)
    .map((bit) => Number(bit))
    .filter((bit) => bitValue & bit)
    .map((bit) => validatorMap[bit])
    .filter((name): name is string => name !== undefined); // Filter out undefined values
};

export const namesToBits = (names: string[]): number => {
  return names
    .map((name) => {
      const bit = Object.entries(validatorMap).find(
        ([, validatorName]) => validatorName === name,
      )?.[0];
      return bit ? Number(bit) : 0;
    })
    .reduce((acc, bit) => acc | bit, 0);
};

export default validatorMap;
