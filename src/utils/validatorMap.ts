let validatorMap: Record<number, string> = {};

export const setValidatorMap = (validators: string[]) => {
  validatorMap = validators.reduce(
    (map, name, index) => {
      map[1 << index] = name; // Assign bit values dynamically
      return map;
    },
    {} as Record<number, string>,
  );
};

export const bitsToNames = (bitValue: number): string[] => {
  return Object.keys(validatorMap)
    .map((bit) => Number(bit))
    .filter((bit) => bitValue & bit)
    .map((bit) => validatorMap[bit])
    .filter((name): name is string => name !== undefined);
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
